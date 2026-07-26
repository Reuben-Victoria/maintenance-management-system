# University Maintenance Request System

A full-stack web application for submitting, tracking, and managing campus maintenance requests. Students and staff raise tickets; maintenance officers action them; admins oversee the whole operation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Running the App](#running-the-app)
5. [API Documentation (Swagger)](#api-documentation-swagger)
6. [Running Tests](#running-tests)
7. [Building for Production](#building-for-production)
8. [Project Structure](#project-structure)
9. [User Roles](#user-roles)
10. [API Overview](#api-overview)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org) | 18 or later | LTS recommended |
| [pnpm](https://pnpm.io) | 8 or later | `npm install -g pnpm` |
| [PostgreSQL](https://www.postgresql.org) | 14 or later | Local install or managed instance |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```bash
pnpm install
```

> **Note:** This project uses pnpm workspaces. Running `pnpm install` at the root installs dependencies for all packages at once. Do **not** use `npm install` or `yarn`.

### 3. Set up environment variables

Create `artifacts/api-server/.env` with the following content:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/maintenance_db

# Secret used to sign JWT tokens — change this in production
SESSION_SECRET=your-super-secret-key-change-me

# Server port (defaults to 8080 if not set)
PORT=8080

# Node environment
NODE_ENV=development
```

### 4. Set up the database

Run the migration to create all tables:

```bash
pnpm --filter @workspace/db db:push
```

This uses [Drizzle ORM](https://orm.drizzle.team) to apply the schema to your PostgreSQL database.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | Full PostgreSQL connection string |
| `SESSION_SECRET` | ✅ Yes | Secret key for signing JWTs |
| `PORT` | No | API server port (default: `8080`) |
| `NODE_ENV` | No | `development` or `production` |

---

## Running the App

The app has two servers that must both be running:

### Terminal 1 — API Server (backend)

```bash
pnpm --filter @workspace/api-server run dev
```

The API will be available at `http://localhost:8080/api`.

### Terminal 2 — Web App (frontend)

```bash
pnpm --filter @workspace/maintenance-app run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

> **Tip:** Both servers support hot-reload — changes to source files are reflected immediately without restarting.

---

## API Documentation (Swagger)

Interactive API documentation is served automatically when the API server is running.

**Open in your browser:**

```
http://localhost:8080/api/docs
```

The Swagger UI lists every endpoint with full request/response schemas. You can authorise with a JWT token and test calls directly from the browser:

1. Start the API server (`pnpm --filter @workspace/api-server run dev`)
2. Navigate to `http://localhost:8080/api/docs`
3. Click **Authorize** (top-right lock icon)
4. Enter your JWT token in the format: `Bearer <token>`
5. You can obtain a token by calling `POST /api/auth/login` from the Swagger UI itself or via the app login page

The raw OpenAPI spec is also available as JSON at:

```
http://localhost:8080/api/openapi.json
```

---

## Running Tests

No additional setup is required — tests run against a mock database and do not need a live PostgreSQL connection.

### Run all tests (both packages)

```bash
pnpm test
```

### Backend tests only

```bash
pnpm --filter @workspace/api-server test
```

Covers:
- JWT auth middleware (`src/__tests__/auth.middleware.test.ts`) — 13 tests
- Auth routes — register, login, logout, `/me` (`src/__tests__/auth.routes.test.ts`) — 17 tests
- Request status and assignment permission rules (`src/__tests__/requests.routes.test.ts`) — 12 tests

### Frontend tests only

```bash
pnpm --filter @workspace/maintenance-app test
```

Covers:
- Utility functions — `cn`, `formatDate`, `formatDateTime`, `getInitials` (`src/__tests__/utils.test.ts`) — 16 tests
- Badge components — `StatusBadge`, `PriorityBadge`, `RoleBadge` (`src/__tests__/badges.test.tsx`) — 21 tests
- Shared UI components — `Spinner`, `IonIcon`, `EmptyState` (`src/__tests__/components.test.tsx`) — 16 tests

### Watch mode (re-runs on every file save)

```bash
# Frontend
pnpm --filter @workspace/maintenance-app test -- --watch

# Backend
pnpm --filter @workspace/api-server test -- --watch
```

### Type checking

```bash
pnpm run typecheck
```

---

## Building for Production

```bash
pnpm run build
```

This runs a full typecheck and then builds all packages. The frontend build output lands in `artifacts/maintenance-app/dist/`.

To start the compiled API server:

```bash
pnpm --filter @workspace/api-server run start
```

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/            # Express 5 REST API (TypeScript)
│   │   └── src/
│   │       ├── routes/        # Auth, requests, users, categories, dashboard
│   │       ├── middlewares/   # JWT auth middleware
│   │       └── app.ts         # Express app setup
│   │
│   └── maintenance-app/       # React + Vite frontend (TypeScript)
│       └── src/
│           ├── pages/         # Route-level page components
│           ├── components/    # Reusable UI components
│           ├── hooks/         # Custom React hooks (auth, toast)
│           └── lib/           # Utilities
│
└── lib/
    ├── db/                    # Drizzle ORM schema + migrations
    ├── api-spec/              # OpenAPI YAML specification
    ├── api-client-react/      # Auto-generated React Query hooks (Orval)
    └── api-zod/               # Auto-generated Zod validation schemas
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Student / Staff** | Submit requests, view own requests, update profile |
| **Maintenance Officer** | View assigned requests, update status (in-progress → completed / rejected) |
| **Admin** | All of the above + manage users, assign officers to requests, manage categories, view dashboard analytics |

### Promoting a user to admin

Register a new account via the `/register` page, then run the following SQL directly on your database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/requests` | List requests (filtered by role) |
| `POST` | `/api/requests` | Submit a new request |
| `GET` | `/api/requests/:id` | Get a single request |
| `POST` | `/api/requests/:id/status` | Update request status (officer only) |
| `POST` | `/api/requests/:id/assign` | Assign an officer (admin only) |
| `GET` | `/api/users` | List users (admin only) |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/dashboard/summary` | Stats overview (admin/officer) |

Full interactive documentation is served at `/api/docs` when the API server is running.
