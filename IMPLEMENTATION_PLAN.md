# TFS Living Catalogue Management System

## Architecture

The repository is a pnpm workspace split into `frontend/` (React/Next.js, catalogue manifest, page components and preview) and `backend/` (Express API, Prisma/PostgreSQL, imports and persistence). The system is split into five explicit layers: PostgreSQL/Supabase data, domain services, a deterministic catalogue manifest, reusable A4 page components, and preview/PDF adapters. The manifest is the only pagination source of truth.

## Delivery phases

1. Foundation: Next.js 16, TypeScript, admin shell, Prisma schema, role model and brand settings.
2. Products: product/collection management, filtering, ordering and media metadata.
3. Imports: Excel parse/validate/preview/upsert pipeline with transactional import logs.
4. Catalogue engine: collection pagination, highlight insertion, automatic index and stable folios.
5. Catalogue design: seven print page templates derived from `Reference.pdf`.
6. Export: shared preview renderer, Playwright PDF endpoint and export history.
7. Hardening: Supabase auth/storage wiring, row-level permissions, overflow checks, integration tests and deployment.

## Reference design notes

- Portrait A4, full bleed, near-black cover with isolated furniture photography.
- Orange (`#f45124`) and white editorial system with oversized bold sans-serif headings.
- Index uses a ruled tabular list; about and collection pages use a deep concave lower edge.
- Collection opener contains the first two products; later pages use a fixed 2 x 2 grid.
- Highlight pages are full-bleed photography with white overlay typography.
- Folios are small, low-contrast running furniture-brand labels with orange page numbers.
- Back cover divides a lifestyle image and orange contact panel with a curved boundary.

## Production boundaries

Supabase credentials, storage buckets and a PostgreSQL connection are environment-owned. The repository includes typed adapters, schema and deterministic demo data so the complete catalogue workflow can run locally; production persistence is activated by supplying `.env.local` from `.env.example`.
