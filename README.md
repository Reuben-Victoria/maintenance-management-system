# University Maintenance Request System

A full-stack web application for submitting, tracking, and managing campus maintenance requests. Students and staff raise tickets; maintenance officers action them; admins oversee the whole operation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Running the App](#running-the-app)
5. [Running Tests](#running-tests)
6. [Building for Production](#building-for-production)
7. [Project Structure](#project-structure)
8. [User Roles](#user-roles)
9. [API Overview](#api-overview)

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

Copy the example below into a file called `.env` inside `artifacts/api-server/`:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

If `.env.example` does not exist, create `artifacts/api-server/.env` manually (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

Run the migration to create all tables:

```bash
pnpm --filter @workspace/db db:push
```

This uses [Drizzle ORM](https://orm.drizzle.team) to apply the schema to your PostgreSQL database.

---

## Environment Variables

Create `artifacts/api-server/.env` with the following:

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
Interactive API docs (Swagger UI): `http://localhost:8080/api/docs`

### Terminal 2 — Web App (frontend)

```bash
pnpm --filter @workspace/maintenance-app run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

> **Tip:** Both servers support hot-reload — changes to source files are reflected immediately without restarting.

---

## Running Tests

### Run all tests

```bash
pnpm test
```

### Backend tests only

```bash
pnpm --filter @workspace/api-server test
```

### Frontend tests only

```bash
pnpm --filter @workspace/maintenance-app test
```

### Watch mode (re-runs on file save)

```bash
pnpm --filter @workspace/maintenance-app test -- --watch
pnpm --filter @workspace/api-server test -- --watch
```

Tests use [Vitest](https://vitest.dev). The backend suite uses a chainable mock database (no real DB connection needed). The frontend suite uses [React Testing Library](https://testing-library.com) with jsdom.

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

### Default accounts (after seeding)

No seed script is included — register a new account via the `/register` page. The first admin account must be promoted directly in the database:

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
