# Preflight Frontend

## Setup

- `pnpm install`
- `pnpm run dev`

# Containerization and test

- Make `.env.test` from `.env.test.example`
- `docker compose --env-file ./.env.test up -d --force-recreate --build`

# Just building (no running)

- `docker build -t preflight-frontend:latest .`

# Push to dockerhub

- `docker tag preflight-frontend [DOCKERHUB_ACCOUNT]/preflight-frontend:latest`
- `docker push [DOCKERHUB_ACCOUNT]/preflight-frontend:latest`
