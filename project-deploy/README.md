# Prefight - Deployment

> Note: This version allow multiple instances of the app to be deployed on the same VM.

## Get started

- Make `.env` from `.env.example` (Make necessary changes.)
- Take care of `./_entrypoint/init.sh`
  - Windows: Make sure that you save with LF option.
  - Mac: `chmod +x ./\_entrypoint/init.sh`
- `docker compose up -d --force-recreate`

## Deployment Note:

### The Problem (Before Version)

In the **Before** configuration, the backend depends on the database using a basic list format:

```yaml
backend:
  depends_on:
    - db
```

#### Why This Fails (The Race Condition Lifecycle)

1. **Container Start vs. Service Ready:** By default, `depends_on` only checks if the `db` container has **started** (i.e., the engine process has launched). It does not know if the database software inside is actually ready to accept connections.
2. **The Postgres Initialization Trap:** On first startup, the PostgreSQL image goes through a multi-stage boot sequence:

- It starts a temporary local database instance.
- It runs scripts inside `/docker-entrypoint-initdb.d/` (such as your `./_entrypoint/init.sh` to set up custom users and permissions).
- It shuts down the temporary instance.
- It starts the real database server on port `5432` to accept external connections.

3. **The Clash:** While PostgreSQL is running its temporary setup/init scripts, the `backend` container is already running. The backend immediately attempts to execute `pnpm run db:migrate`.
4. **The Failure:** The migration script attempts to connect using the application credentials (`POSTGRES_APP_USER`), but fails because:

- The port is not open yet, or
- The database is in the middle of a shutdown/restart cycle, or
- The initialization script has not finished creating the application user yet.

---

### The Solution (After Version)

The **After** configuration solves this by moving from a status of **"container running"** to **"database ready to handle queries"** before letting the backend start.

```yaml
# 1. Added Healthcheck to DB
db:
  ...
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} && PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c 'SELECT 1;'"]
    interval: 5s
    timeout: 5s
    retries: 20

# 2. Bound Backend to Service Health
backend:
  depends_on:
    db:
      condition: service_healthy

```

#### Why This Works

1. **`pg_isready` Check:** Verifies that the PostgreSQL server is accepting connections on the network port.
2. **`psql ... -c 'SELECT 1;'` Verification:** By logging in as the superuser (`POSTGRES_USER`) with `PGPASSWORD` and running a dummy query, we guarantee that the temporary setup phase is **completely finished**, the init scripts have run, and the database engine is fully active and capable of parsing queries.
3. **Strict Gatekeeping:** The backend container will now wait, holding back its `post_start` migration hook, until the database successfully passes this health check.

---

### Key Comparison

| Feature                | Before                                                        | After                                                                                |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Dependency Rule**    | `db` container process has started.                           | `db` is fully initialized and responding to SQL queries (`service_healthy`).         |
| **Database Readiness** | Blind guess. Often starts migrations too early on slower VMs. | Verified. Guarantees that `/docker-entrypoint-initdb.d/` scripts are fully executed. |
| **Reliability**        | Intermittent failures on first deploy or slow hardware.       | 100% deterministic boot order.                                                       |
