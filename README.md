# TFS Living Catalogue Studio

React/Next.js catalogue frontend with a separate Node/Express/Prisma backend.

## Structure

- `frontend/` - Next.js 16 and React 19 admin UI, manifest engine, A4 page templates, preview and frontend tests.
- `backend/` - Express API, Prisma PostgreSQL schema, environment validation and future import/export services.
- `Reference.pdf` - supplied visual reference.

## Development

```bash
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:4000`. Copy `.env.example` to `.env` and supply database/Supabase credentials for persistence.

Individual commands:

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm typecheck
pnpm test
pnpm build
```

## Reliable hosting

The production site is packaged as one self-contained container. The separate
Express service is not required by the current UI, so hosts only need to run the
frontend container.

```bash
docker compose up --build -d
```

The site is served on port `3000` and exposes `/api/health` for automatic health
checks. On a managed container host, deploy the repository root with `Dockerfile`;
no custom build or start command is required.
