# Technical Documentation Report
## University Maintenance Request System (UMRS)
**Course:** MIT 8333 — Advanced Web Application Development  
**Date:** July 2026

---

## 1. Project Overview

The **University Maintenance Request System (UMRS)** is a full-stack web application that digitises the end-to-end lifecycle of campus maintenance requests. Students and staff submit issues (broken equipment, plumbing faults, electrical problems, etc.), administrators assign them to maintenance officers, and officers update progress until resolution.

### Core Problems Solved
| Before UMRS | After UMRS |
|---|---|
| Requests submitted via email/paper | Structured digital submission with priority tagging |
| No visibility into request status | Real-time status tracking for every stakeholder |
| Manual assignment by phone/email | One-click admin assignment with officer notification |
| No audit trail | Immutable status-change log on every request |
| No reporting | Filterable CSV export for facilities management |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│              React 18 + Vite  (/  preview path)             │
│   React Query (server state) │ Wouter (client routing)      │
└──────────────────┬──────────────────────────────────────────┘
                   │  HTTP/REST  (JWT Bearer token)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Server (Express 5)                    │
│              Node.js  (/api  preview path, port 8080)       │
│  Auth MW → Role Guard → Route Handlers → Drizzle ORM       │
└──────────────────┬──────────────────────────────────────────┘
                   │  SQL (pg driver)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│   6 tables: users · categories · service_requests          │
│             assignments · status_logs · (sessions)         │
└─────────────────────────────────────────────────────────────┘
```

**Monorepo layout (pnpm workspaces):**
```
workspace/
├── artifacts/
│   ├── api-server/        Express API + routes + middleware
│   └── maintenance-app/   React + Vite frontend
├── lib/
│   ├── db/                Drizzle schema + client (shared)
│   └── api-client-react/  Auto-generated React Query hooks (Orval)
└── lib/api-spec/
    └── openapi.yaml       Single source of truth for the API contract
```

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | Component-based UI |
| Vite | 5 | Dev server, bundler, HMR |
| TypeScript | 5 | Type safety across the stack |
| Tailwind CSS | 3 | Utility-first styling |
| shadcn/ui | latest | Accessible, composable UI components |
| Ionic Icons | 7.4 | Consistent icon system (web components) |
| Wouter | 3 | Lightweight client-side routing |
| TanStack React Query | 5 | Server state, caching, mutation lifecycle |
| Recharts | 2 | Dashboard bar chart and pie chart |
| Orval | latest | OpenAPI → React Query hooks codegen |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 5 | HTTP server, routing, middleware |
| TypeScript | 5 | Type-safe server code |
| Drizzle ORM | latest | Type-safe SQL query builder |
| Zod | 3 | Request body validation |
| jsonwebtoken | 9 | JWT creation and verification |
| bcryptjs | 2 | Password hashing (salt rounds: 10) |
| multer | 1 | Multipart file upload handling |
| swagger-ui-express | 5 | API documentation UI |
| js-yaml | 4 | YAML → JSON for OpenAPI spec parsing |

### Infrastructure
| Component | Provider |
|---|---|
| Hosting | Cloud (managed containers) |
| Database | PostgreSQL |
| File storage | Local `/uploads` directory served statically |
| CI/Source control | GitHub (`Reuben-Victoria/maintenance-management-system`) |

---

## 4. Database Design

### Entity-Relationship Overview

```
users ──────────< service_requests (submitted_by)
users ──────────< assignments (assigned_by, officer_id)
users ──────────< status_logs (changed_by)
categories ─────< service_requests (category_id)
service_requests< assignments (request_id)
service_requests< status_logs (request_id)
```

### Schema Details

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL |
| role | enum | student \| staff \| maintenance_officer \| admin |
| department | varchar(255) | nullable |
| phone | varchar(50) | nullable |
| staff_id | varchar(100) | nullable |
| is_active | boolean | DEFAULT true |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now() |

#### `categories`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| name | varchar(255) | UNIQUE, NOT NULL |
| description | text | nullable |
| created_at | timestamp | DEFAULT now() |

#### `service_requests`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| title | varchar(500) | NOT NULL |
| description | text | NOT NULL |
| status | enum | pending \| assigned \| in_progress \| completed \| rejected |
| priority | enum | low \| medium \| high \| urgent |
| category_id | integer | FK → categories |
| submitted_by | integer | FK → users |
| assigned_to | integer | FK → users (nullable) |
| location | varchar(500) | nullable |
| evidence_url | text | nullable |
| created_at | timestamp | DEFAULT now() |
| updated_at | timestamp | DEFAULT now() |

#### `assignments`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| request_id | integer | FK → service_requests |
| officer_id | integer | FK → users |
| assigned_by | integer | FK → users |
| notes | text | nullable |
| assigned_at | timestamp | DEFAULT now() |

#### `status_logs`
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| request_id | integer | FK → service_requests |
| changed_by | integer | FK → users |
| old_status | enum | nullable (null = initial creation) |
| new_status | enum | NOT NULL |
| note | text | nullable |
| created_at | timestamp | DEFAULT now() |

---

## 5. API Design

### Base URL
- Development: `https://<dev-domain>/api`
- Production: `https://<deployment-domain>/api`
- Swagger UI: `GET /api/docs`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```
Token payload: `{ userId: number, role: string, iat: number, exp: number }`  
Token lifetime: **7 days**

### Endpoint Summary

#### Auth  (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | ✗ | Create account, returns JWT |
| POST | /auth/login | ✗ | Authenticate, returns JWT |
| POST | /auth/logout | ✓ | Invalidate client token |
| GET | /auth/me | ✓ | Get current user profile |

#### Users (`/api/users`)
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | /users | admin | List all users (paginated, searchable) |
| GET | /users/:id | admin \| self | Get user by ID |
| PATCH | /users/:id | admin \| self | Update user (role change: admin only) |
| DELETE | /users/:id | admin | Delete user |
| GET | /users/officers | admin \| officer | List maintenance officers |

#### Categories (`/api/categories`)
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | /categories | any | List all categories |
| POST | /categories | admin | Create category |
| PATCH | /categories/:id | admin | Update category |
| DELETE | /categories/:id | admin | Delete category |

#### Service Requests (`/api/requests`)
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | /requests | any | List requests (role-filtered, paginated) |
| POST | /requests | student \| staff | Submit new request |
| GET | /requests/:id | any | Get request detail + assignment |
| PATCH | /requests/:id | admin \| submitter | Update request metadata |
| DELETE | /requests/:id | admin | Delete request |
| POST | /requests/:id/assign | admin | Assign/reassign officer |
| PATCH | /requests/:id/status | admin \| assigned officer | Update request status |
| GET | /requests/:id/logs | any | Get status change history |

#### Dashboard & Reports
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | /dashboard/summary | any | Role-aware stats (totals, counts) |
| GET | /dashboard/recent | any | Recent activity feed |
| GET | /reports/export | admin | Download CSV of requests |

#### Upload
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /upload | ✓ | Upload image/PDF (max 10 MB), returns URL |

### Role-Based Request Visibility
| Role | Sees |
|---|---|
| student / staff | Only their own submitted requests |
| maintenance_officer | Only requests assigned to them |
| admin | All requests |

---

## 6. Authentication & Security

### Authentication Flow
1. User submits credentials → server validates password with `bcrypt.compare()`
2. Server signs JWT with `jsonwebtoken.sign()` using `SESSION_SECRET` env var
3. Token stored in browser `localStorage`
4. Every API request attaches token via `Authorization: Bearer` header
5. `requireAuth` middleware verifies token on every protected route
6. `requireRole(...roles)` middleware enforces role access

### Security Measures
- **Passwords** hashed with bcrypt (salt rounds = 10; never stored in plaintext)
- **JWT** signed with a secret stored as an environment secret (`SESSION_SECRET`)
- **Role enforcement** at the API layer — frontend UI gating is supplementary, not trusted
- **CORS** restricted to same-origin in production via `cors()` middleware
- **Input validation** with Zod schemas on all mutation endpoints
- **File upload** restricted by MIME type (images + PDF only) and 10 MB size limit via multer
- **SQL injection** impossible — all queries use Drizzle ORM's parameterised query builder

---

## 7. User Roles & Access Control Matrix

| Feature | Student | Staff | Officer | Admin |
|---|---|---|---|---|
| Submit request | ✅ | ✅ | ✗ | ✅ |
| View own requests | ✅ | ✅ | — | ✅ |
| View assigned requests | — | — | ✅ | ✅ |
| View all requests | ✗ | ✗ | ✗ | ✅ |
| Update request status | ✗ | ✗ | ✅ (assigned only) | ✅ |
| Assign officer | ✗ | ✗ | ✗ | ✅ |
| Manage users | ✗ | ✗ | ✗ | ✅ |
| Manage categories | ✗ | ✗ | ✗ | ✅ |
| Export reports (CSV) | ✗ | ✗ | ✗ | ✅ |
| Delete requests | ✗ | ✗ | ✗ | ✅ |
| View dashboard stats | ✅ | ✅ | ✅ | ✅ |

---

## 8. Key Feature Implementation Notes

### Search, Filter & Pagination
Requests and users lists support server-side pagination (default page size: 10), keyword search (SQL `ILIKE`), and multi-field filtering (status, priority, role). The frontend debounces search input by 500 ms before sending the query.

### Status Workflow
```
pending → assigned → in_progress → completed
                                 → rejected
pending → in_progress (skip assignment)
pending → rejected
```
Every transition is recorded as an immutable row in `status_logs` with the actor's ID, timestamp, and an optional note.

### Assignment Guard
The API enforces that only the assigned officer (matched by `officer_id` in the `assignments` table) can update a request's status. The frontend hides the Update Status card for officers not assigned to the request (verified client-side by comparing `request.assignment.officerId === user.id`).

### File Upload
Files are uploaded via `POST /api/upload` (multipart/form-data) before the request form is submitted. The returned URL is then stored as `evidence_url` on the request. Files are stored in `artifacts/api-server/uploads/` and served statically at `/api/uploads/<filename>`.

### CSV Export
The `/reports/export` endpoint streams a CSV using the Node.js built-in response write. Columns: ID, Title, Status, Priority, Category, Submitter, Officer, Location, Created At, Updated At. The frontend triggers a download by creating a temporary `<a>` element with an object URL.

### API Codegen
`lib/api-spec/openapi.yaml` is the single source of truth. Running `pnpm --filter @workspace/api-client-react build` invokes Orval, which reads the YAML and emits fully-typed React Query hooks into `lib/api-client-react/src/`. This ensures the frontend is always in sync with the API contract at build time.

---

## 9. Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@university.edu | password123 |
| Maintenance Officer | officer1@university.edu | password123 |
| Maintenance Officer | officer2@university.edu | password123 |
| Student | student1@university.edu | password123 |
| Staff | staff1@university.edu | password123 |

---

## 10. Setup & Installation

### Prerequisites
- Node.js 20+
- pnpm 8+
- A PostgreSQL database

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/Reuben-Victoria/maintenance-management-system.git
cd maintenance-management-system

# 2. Install dependencies
pnpm install

# 3. Set environment variables
# DATABASE_URL=<your_postgres_connection_string>
# SESSION_SECRET=<random_secret_string>

# 4. Push the database schema
pnpm --filter @workspace/db run push

# 5. Seed demo data (optional)
pnpm --filter @workspace/db run seed

# 6. Regenerate API client (if openapi.yaml changed)
pnpm --filter @workspace/api-client-react run build

# 7. Start the API server
pnpm --filter @workspace/api-server run dev

# 8. Start the frontend (in a separate terminal)
pnpm --filter @workspace/maintenance-app run dev
```

---

## 11. Deployment

The application is deployed on managed cloud infrastructure:

- **Frontend:** served as a static Vite build behind an HTTPS proxy
- **Backend:** Express server running as a persistent workflow on port 8080
- **Database:** PostgreSQL — automatically provisioned and backed up

Production URL: available after publishing via the deployment panel.

To redeploy after code changes:
1. Commit and push to GitHub (`main` branch)
2. Click **Publish** in the workspace

---

## 12. Challenges & Solutions

| Challenge | Solution |
|---|---|
| Type mismatch when comparing JWT `userId` (string) vs DB `id` (number) | Wrapped both sides with `Number()` in all guard comparisons |
| Orval generating OpenAPI v4 `format: email` syntax incompatible with Zod v3 | Removed `format: email` from YAML spec; added Zod `email()` refinements only in server code |
| `js-yaml` v5 no longer exports a default | Changed `import yaml from 'js-yaml'` → `import * as yaml from 'js-yaml'` |
| Design subagent generating illegal async React hook calls | Replaced all `import("react").then(React => { React.useEffect(...) })` patterns with standard `import { useEffect } from 'react'` |
| Maintenance officer seeing Update Status card on unassigned requests | Added `assignment.officerId === user.id` check in `canUpdateStatus` condition |

---

## 13. Future Improvements

1. **Email notifications** — send emails on assignment and status change via SendGrid or Nodemailer
2. **Real-time updates** — WebSocket or SSE push for live status changes without polling
3. **Mobile app** — Expo React Native client using the same REST API
4. **Photo compression** — client-side image resizing before upload (browser Canvas API)
5. **SLA tracking** — flag overdue requests based on priority thresholds
6. **Multi-campus support** — tenant isolation for universities with multiple campuses
7. **OAuth login** — Google/Microsoft SSO for university SSO integration

---

## 14. Repository

**GitHub:** https://github.com/Reuben-Victoria/maintenance-management-system  
**Branch:** `main`  
**API Docs (dev):** `/api/docs` (Swagger UI)
