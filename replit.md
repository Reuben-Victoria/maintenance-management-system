# University Maintenance Request System

A full-stack platform where students and staff submit campus maintenance complaints (electricity, plumbing, furniture, internet, etc.), and administrators and maintenance officers manage, assign, and resolve them.

## Run & Operate

- `pnpm --filter @workspace/maintenance-app run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Swagger / API Docs

Visit `/api/docs` to browse the full Swagger UI.
Raw JSON spec at `/api/openapi.json`.

## Demo Accounts (password: `password123`)

| Role | Email |
|------|-------|
| Admin | admin@university.edu |
| Maintenance Officer | officer1@university.edu |
| Maintenance Officer | officer2@university.edu |
| Student | student1@university.edu |
| Student | student2@university.edu |
| Staff | staff1@university.edu |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, Recharts, wouter
- API: Express 5, JWT auth (bcryptjs + jsonwebtoken)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v3), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- API Docs: Swagger UI (swagger-ui-express)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, categories, service_requests, assignments, status_logs)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, categories, requests, dashboard)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware + role guards
- `artifacts/maintenance-app/src/` — React frontend
- `artifacts/maintenance-app/src/hooks/use-auth.tsx` — auth context + token management
- `artifacts/maintenance-app/src/Router.tsx` — route definitions with role-based protection

## Architecture decisions

- JWT stored in localStorage, attached via `setAuthTokenGetter` in the custom-fetch layer
- Role-based access enforced both in API middleware and frontend route guards
- Status changes always create an audit entry in `status_logs` for a full activity trail
- CSV export is a direct server-side query with streaming response (no temp files)
- Swagger spec is served from the actual `lib/api-spec/openapi.yaml` source file at runtime

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing the OpenAPI spec, always run `pnpm --filter @workspace/api-spec run codegen`
- Zod v3 is in use — do not use `zod.email()` (v4 syntax) in the spec; use plain `type: string` for email fields
- `js-yaml` v5 requires `import * as yaml` (named export), not `import yaml` (default)
