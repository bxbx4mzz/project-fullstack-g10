# Preflight - Database

## Setup

- `pnpm install`
- Create `.env` from `.env.example`
- DB container
  - `pnpm run eol` to set the correct line endings (Windows)
  - `chmod +x ./scripts/*.sh` to make scripts executable (Linux/Mac)
  - `docker compose up -d` to start the database

## Usage

- `pnpm run db:push`
- `pnpm run db:generate`
- `pnpm run db:migrate`
- `pnpm run db:prototype`

## Two-tsconfig Setup

Right now the `drizzle.config.ts` file will be included in the `dist` folder when building the app, which is not ideal. To fix this, we have two `tsconfig` files:

- `tsconfig.json (type-check / IDE)`

```
{
  "extends": [
    "@tsconfig/node-lts/tsconfig.json",
    "@tsconfig/node-ts/tsconfig.json"
  ],
  "compilerOptions": {
    "types": ["node"],
    "rootDir": ".",
    "outDir": "./dist",
    "paths": {
      "@db/*": ["./db/*"]
    }
  },
  "include": ["./db/**/*", "./drizzle.config.ts"]
}
```

- `tsconfig.build.json (emit only app code)`

```
{
  "extends": "./tsconfig.json",
  "exclude": ["./drizzle.config.ts"]
}
```
