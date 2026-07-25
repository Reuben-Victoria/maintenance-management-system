# Project Report — Point F: Technical Documentation
## University Maintenance Request System (UMRS)
**Course:** MIT 8333 — Advanced Web Application Development

---

## 1. Introduction and Problem Statement

### Introduction
The University Maintenance Request System (UMRS) is a full-stack web application built to digitise and streamline the process of reporting, tracking, and resolving physical maintenance issues across a university campus. The system serves four categories of users — students, staff, maintenance officers, and administrators — each with a clearly defined role in the maintenance workflow.

### Problem Statement
University campuses routinely face maintenance challenges: broken equipment, plumbing faults, electrical failures, structural issues, and HVAC problems. Traditionally, reporting these issues relied on informal channels — verbal reports, phone calls, emails, or paper forms — which created significant operational problems:

- **No centralised record**: Requests were scattered across email inboxes and physical forms, making it impossible to track progress or measure response times.
- **Poor accountability**: There was no audit trail linking a reported issue to the person who fixed it, when they fixed it, and what steps were taken.
- **Delayed responses**: Without a priority system, urgent safety hazards were treated the same as minor inconveniences.
- **No visibility for reporters**: Students and staff who submitted issues had no way to know whether their request had been received, assigned, or resolved.
- **No data for planning**: Facilities management had no structured data to identify recurring problems, peak periods, or underperforming areas of campus infrastructure.

UMRS was built to solve all of these problems in a single, role-aware platform.

---

## 2. System Objectives

The system was designed to achieve the following objectives:

1. **Centralise request management** — Provide a single point of entry for all campus maintenance requests, replacing fragmented email/phone workflows.

2. **Enforce accountability through role-based access** — Students and staff submit requests; maintenance officers are assigned to resolve them; administrators oversee the full workflow and manage users and categories.

3. **Maintain a complete audit trail** — Every status change on every request is recorded with a timestamp, the identity of the person who made the change, and an optional note explaining the reason.

4. **Prioritise effectively** — Requests are tagged with a priority level (Low, Medium, High, Urgent) so maintenance teams can triage their workload appropriately.

5. **Provide real-time visibility** — All stakeholders can see the current status of any request they have access to, and a dashboard provides at-a-glance metrics on the state of maintenance operations.

6. **Support data-driven decision-making** — An admin-only CSV export enables facilities management to analyse request patterns, measure resolution times, and plan resources.

7. **Allow evidence submission** — Submitters can upload photos or PDF documents alongside their request to help maintenance officers understand the issue before arriving on site.

8. **Be fully deployed and accessible** — The application is hosted on a public URL so it can be used from any device on or off campus.

---

## 3. Requirement Analysis

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Users must be able to register and log in with email and password | High |
| FR-02 | The system must support four roles: Student, Staff, Maintenance Officer, Administrator | High |
| FR-03 | Students and staff must be able to submit maintenance requests with title, description, category, priority, location, and optional photo/PDF | High |
| FR-04 | Administrators must be able to assign requests to maintenance officers | High |
| FR-05 | Maintenance officers must be able to update the status of requests assigned to them | High |
| FR-06 | Every status change must be logged with actor identity, timestamp, and optional note | High |
| FR-07 | Requests must be searchable and filterable by status and priority | Medium |
| FR-08 | A dashboard must show role-appropriate statistics and recent activity | Medium |
| FR-09 | Administrators must be able to manage users (view, change role, deactivate, delete) | Medium |
| FR-10 | Administrators must be able to manage maintenance categories (create, update, delete) | Medium |
| FR-11 | Administrators must be able to export request data as a CSV file, filtered by status and date range | Medium |
| FR-12 | Users must be able to update their own profile information | Low |
| FR-13 | API endpoints must be documented via Swagger UI | Low |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The application must be accessible from any modern web browser without installation |
| NFR-02 | All API endpoints must be secured — authentication is required; role checks are enforced server-side |
| NFR-03 | Passwords must never be stored in plain text |
| NFR-04 | The application must be responsive and usable on both desktop and mobile devices |
| NFR-05 | The deployed application must connect to a persistent production database |
| NFR-06 | API response times should be under 500 ms for standard read operations |

---

## 4. Frontend Technologies Used

| Technology | Version | Role |
|---|---|---|
| **React** | 18 | Core UI library — component-based architecture, virtual DOM, declarative rendering |
| **Vite** | 5 | Build tool and development server — fast HMR, optimised production bundles |
| **TypeScript** | 5 | Static typing for all frontend code, eliminating a class of runtime errors |
| **Tailwind CSS** | 3 | Utility-first CSS framework — all styling is done via class names, no custom CSS files |
| **shadcn/ui** | latest | Pre-built, accessible component library (Cards, Buttons, Inputs, Tables, Toasts, etc.) built on Radix UI primitives |
| **Ionic Icons** | 7.4 | Icon system loaded as web components via CDN — consistent, intuitive iconography throughout the app |
| **Wouter** | 3 | Lightweight client-side router (~2KB) — handles all page navigation without a full-page reload |
| **TanStack React Query** | 5 | Server state management — handles data fetching, caching, background refetching, and mutation lifecycle |
| **Recharts** | 2 | Chart library for the admin dashboard — renders bar charts (requests by category) and pie charts (priority breakdown) |
| **Orval** | latest | OpenAPI-to-TypeScript codegen tool — auto-generates fully-typed React Query hooks from the OpenAPI spec |

**Key Frontend Patterns:**
- **Auto-generated API client**: The `lib/api-client-react` package is generated by Orval from `openapi.yaml`. The frontend never writes raw `fetch` calls — it uses generated hooks like `useGetRequest(id)` or `useUpdateRequestStatus()`. This ensures the frontend stays in sync with the API contract.
- **JWT in localStorage**: On login, the JWT is stored in `localStorage` and attached to every API request via a global `setAuthTokenGetter` callback registered by the auth context.
- **Role-based UI gating**: Components check `user.role` to conditionally render controls (e.g. the "Assign Officer" form only appears for admins; "Update Status" only appears for the assigned officer).

---

## 5. Backend Technologies Used

| Technology | Version | Role |
|---|---|---|
| **Node.js** | 20 | JavaScript runtime for the server |
| **Express** | 5 | HTTP server framework — handles routing, middleware chains, and request/response lifecycle |
| **TypeScript** | 5 | Static typing for all server code |
| **Drizzle ORM** | latest | Type-safe SQL query builder — schema defined in TypeScript, queries are fully typed and compiled to safe parameterised SQL |
| **Zod** | 3 | Runtime input validation — all request bodies are validated against Zod schemas before processing |
| **jsonwebtoken** | 9 | JWT creation (`sign`) and verification (`verify`) for stateless authentication |
| **bcryptjs** | 2 | Password hashing — all passwords are hashed with 10 salt rounds before storage |
| **multer** | 1 | Multipart form data parser for file uploads — enforces MIME type and size limits |
| **swagger-ui-express** | 5 | Serves the Swagger UI at `/api/docs`, parsing the OpenAPI YAML file |
| **js-yaml** | 4 | YAML parser used to load `openapi.yaml` at server startup |
| **pino** | built-in | Structured JSON request logging via Express integration |

**Key Backend Patterns:**
- **Middleware pipeline**: Every protected route passes through `requireAuth` (validates JWT) and optionally `requireRole(...roles)` (checks the user's role against an allowlist).
- **Role-filtered queries**: The request list endpoint (`GET /api/requests`) applies a `WHERE` clause based on the authenticated user's role — students/staff see only their own requests, officers see only assigned requests, admins see all.
- **Immutable status log**: Every call to `PATCH /api/requests/:id/status` inserts a row into `status_logs` before updating the request — the log is append-only and cannot be modified via the API.
- **Assignment guard**: The status update endpoint verifies that `req.user.userId` matches the `officer_id` in the `assignments` table for that request, preventing officers from updating requests they are not assigned to.

---

## 6. Database: Type and Relationships

### Database System
**PostgreSQL** (managed Replit instance) — a relational database management system (RDBMS) chosen for its:
- Strong ACID compliance (critical for audit log integrity)
- Rich support for enums (status and priority values)
- Foreign key constraints (enforcing referential integrity between tables)
- Efficient `ILIKE` full-text search for the search/filter feature

### Relationship Types Used

**One-to-Many (1:N)**
The most common relationship type in the schema:

| Parent | Child | Description |
|---|---|---|
| `users` | `service_requests` | One user submits many requests (`submitted_by FK`) |
| `users` | `assignments` | One user (admin) creates many assignments (`assigned_by FK`) |
| `users` | `assignments` | One officer is assigned to many requests (`officer_id FK`) |
| `users` | `status_logs` | One user changes status many times (`changed_by FK`) |
| `categories` | `service_requests` | One category applies to many requests (`category_id FK`) |
| `service_requests` | `status_logs` | One request has many status log entries (`request_id FK`) |

**One-to-One (1:1) — enforced by application logic**
Each `service_request` has at most one active `assignment` record. When a request is reassigned, the existing assignment row is deleted and a new one is inserted (replacing rather than accumulating assignment history).

### Entity-Relationship Diagram (textual)

```
users (id PK)
  ├──< service_requests.submitted_by
  ├──< assignments.officer_id
  ├──< assignments.assigned_by
  └──< status_logs.changed_by

categories (id PK)
  └──< service_requests.category_id

service_requests (id PK)
  ├──< assignments.request_id   [at most one active]
  └──< status_logs.request_id   [append-only log]
```

---

## 7. API Documentation

The full interactive API documentation is available at:  
**`/api/docs`** — Swagger UI, served directly from the running API server.

The API is defined in a single OpenAPI 3.0 YAML file (`lib/api-spec/openapi.yaml`) which is the authoritative contract between the frontend and backend.

### Authentication
All protected endpoints require an `Authorization: Bearer <jwt_token>` header.  
Tokens are obtained from `POST /api/auth/register` or `POST /api/auth/login`.  
Token lifetime: **7 days**. Token payload: `{ userId, role }`.

### Endpoint Groups

#### Auth — `/api/auth`
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user account; returns JWT |
| `POST` | `/auth/login` | No | Authenticate with email + password; returns JWT |
| `POST` | `/auth/logout` | Yes | Invalidate client-side token |
| `GET` | `/auth/me` | Yes | Get profile of the currently authenticated user |

#### Users — `/api/users`
| Method | Path | Required Role | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List all users (paginated, with search and role filter) |
| `GET` | `/users/:id` | Admin or Self | Get a user by ID |
| `PATCH` | `/users/:id` | Admin or Self | Update user (role changes: admin only) |
| `DELETE` | `/users/:id` | Admin | Permanently delete a user |
| `GET` | `/users/officers` | Admin, Officer | List maintenance officers (for assignment dropdown) |

#### Categories — `/api/categories`
| Method | Path | Required Role | Description |
|---|---|---|---|
| `GET` | `/categories` | Any authenticated | List all maintenance categories |
| `POST` | `/categories` | Admin | Create a new category |
| `PATCH` | `/categories/:id` | Admin | Update category name or description |
| `DELETE` | `/categories/:id` | Admin | Delete a category |

#### Service Requests — `/api/requests`
| Method | Path | Required Role | Description |
|---|---|---|---|
| `GET` | `/requests` | Any authenticated | List requests (role-filtered, paginated, searchable) |
| `POST` | `/requests` | Student, Staff | Submit a new maintenance request |
| `GET` | `/requests/:id` | Any authenticated | Get full request detail including assignment info |
| `PATCH` | `/requests/:id` | Admin or Submitter | Update request title, description, priority, or location |
| `DELETE` | `/requests/:id` | Admin | Permanently delete a request |
| `POST` | `/requests/:id/assign` | Admin | Assign or reassign a maintenance officer |
| `PATCH` | `/requests/:id/status` | Assigned Officer only | Update request status with a note |
| `GET` | `/requests/:id/logs` | Any authenticated | Retrieve the full status change history |

#### Dashboard & Reports
| Method | Path | Required Role | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Any authenticated | Role-filtered statistics (totals, counts by status and priority) |
| `GET` | `/dashboard/recent` | Any authenticated | Recent activity feed (last N events) |
| `GET` | `/reports/export` | Admin | Download a CSV of all requests, with optional status and date filters |

#### File Upload
| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/upload` | Yes | Upload an image (JPEG, PNG, GIF, WebP) or PDF (max 10 MB); returns a public URL |

---

## 8. Screenshots of Major Interfaces

> The following interfaces are available in the live deployed application:

| Interface | Path | Notes |
|---|---|---|
| Login page | `/` (redirects) → `/login` | Blue rounded logo with maintenance icon; email + password form |
| Register page | `/register` | Role selection (Student, Staff, Officer, Admin); conditional Staff ID / Department fields |
| Dashboard | `/dashboard` | Role-aware stats cards, bar chart, pie chart, recent activity feed |
| Requests List | `/requests` | Searchable, filterable table with pagination; role-appropriate empty states |
| New Request Form | `/requests/new` | Title, description, category, priority, location, drag-and-drop evidence upload |
| Request Detail | `/requests/:id` | Status badge, assignment panel, scrollable status history timeline |
| Admin — Users | `/admin/users` | Searchable table; inline role change dropdown; active/inactive toggle |
| Admin — Categories | `/admin/categories` | Inline edit form; add/delete categories |
| Admin — Reports | `/admin/reports` | CSV export with status and date range filters |
| Profile | `/profile` | Editable name, department, phone; read-only email and Staff ID |
| API Docs | `/api/docs` | Swagger UI with all endpoints, schemas, and try-it-out functionality |

---

## 9. Testing Evidence

### Frontend Component Testing
Major frontend components were tested by interacting with the deployed application as each user role:

**Authentication flows:**
- Registered a new account for each role type (Student, Staff, Officer, Admin) ✅
- Logged in with valid credentials → redirected to Dashboard ✅
- Attempted login with invalid password → error toast displayed ✅
- Logged out → session cleared, redirected to Login ✅

**Student / Staff workflow:**
- Submitted a new request with all fields including a file upload ✅
- Viewed own requests list; confirmed other users' requests are not shown ✅
- Viewed request detail; confirmed "Update Status" and "Assign Officer" panels are not visible ✅

**Maintenance Officer workflow:**
- Logged in as `officer1@university.edu` ✅
- Viewed requests list; confirmed only assigned requests are shown ✅
- On an assigned request, confirmed "Update Status" card is visible ✅
- On a request assigned to a different officer, confirmed "Update Status" card is hidden ✅
- Updated status from `assigned` → `in_progress` → `completed` with notes; confirmed each change appears in the Status History timeline ✅

**Admin workflow:**
- Viewed full requests list (all requests from all users) ✅
- Assigned a request to Officer 1; confirmed status changed to `assigned` ✅
- Reassigned the same request to Officer 2; confirmed assignment updated ✅
- Confirmed admin does NOT see the "Update Status" card (status updates are officer-only) ✅
- Changed a user's role via the inline dropdown on the Users page ✅
- Deactivated a user; confirmed toggle state updated ✅
- Created, edited, and deleted a category ✅
- Exported a CSV filtered by status `completed`; confirmed file downloaded ✅

**Search and filter:**
- Searched by request title keyword; confirmed debounced results ✅
- Filtered by status `in_progress`; confirmed only matching rows shown ✅
- Filtered by priority `urgent`; confirmed correct subset returned ✅
- Combined search and status filter; confirmed compound filtering works ✅
- Cleared filters; confirmed all requests return ✅

**Pagination:**
- With more than 10 requests, confirmed Prev/Next navigation functions correctly ✅
- Confirmed page counter updates with each navigation ✅

### Backend API Testing
All API endpoints were tested using the Swagger UI at `/api/docs` and via direct HTTP requests:

**Auth endpoints:**
- `POST /auth/register` with valid payload → 201, JWT returned ✅
- `POST /auth/login` with correct credentials → 200, JWT returned ✅
- `POST /auth/login` with wrong password → 401 Unauthorized ✅
- `GET /auth/me` with valid token → 200, user object returned ✅
- `GET /auth/me` without token → 401 Unauthorized ✅

**Request endpoints:**
- `GET /requests` as student → returns only own requests ✅
- `GET /requests` as officer → returns only assigned requests ✅
- `GET /requests` as admin → returns all requests ✅
- `POST /requests` as student → 201, request created ✅
- `POST /requests` as officer → 403 Forbidden ✅
- `PATCH /requests/:id/status` as assigned officer → 200, status updated, log created ✅
- `PATCH /requests/:id/status` as non-assigned officer → 403 Forbidden ✅
- `PATCH /requests/:id/status` as admin → 403 Forbidden ✅
- `POST /requests/:id/assign` as admin → 200, assignment created ✅
- `POST /requests/:id/assign` as student → 403 Forbidden ✅
- `DELETE /requests/:id` as admin → 204, request deleted ✅
- `DELETE /requests/:id` as student → 403 Forbidden ✅

**File upload:**
- `POST /upload` with a valid image → 200, URL returned ✅
- `POST /upload` with an oversized file (>10MB) → 400 error ✅

---

## 10. Challenges Encountered and Solutions

### Challenge 1: JWT userId Type Mismatch
**Problem:** The JWT payload stores `userId` as a string (JSON serialises numbers as strings in some contexts), but the database schema stores user IDs as integers. Comparisons such as `assignment.officerId === req.user.userId` failed silently because `3 === "3"` is `false` in JavaScript.  
**Solution:** Wrapped both sides of all ID comparisons with `Number()` — e.g. `Number(assignment.officerId) === Number(req.user.userId)` — throughout the API route handlers.

### Challenge 2: Zod v3 and Orval Incompatibility
**Problem:** The OpenAPI specification initially used `format: email` on email fields (standard OpenAPI). However, Orval generates Zod v4 syntax (`z.email()`) when it sees this format. The project uses Zod v3, which does not have `.email()` as a standalone validator.  
**Solution:** Removed `format: email` from the OpenAPI YAML spec entirely. Email validation is handled by Zod's `.email()` refinement in the server-side validation schemas, which are written separately from the generated client code.

### Challenge 3: js-yaml v5 Module Import Breaking Change
**Problem:** The Swagger UI setup required loading the OpenAPI YAML file at server startup. `js-yaml` v5 removed the CommonJS default export, causing `import yaml from 'js-yaml'` to fail with a runtime error.  
**Solution:** Changed the import to `import * as yaml from 'js-yaml'`, which correctly accesses the named exports of the v5 package.

### Challenge 4: Illegal Async Hook Calls from AI Code Generation
**Problem:** The design subagent generated code patterns such as `import("react").then(React => { React.useEffect(...) })` in several page files. React does not permit calling hooks inside async callbacks, and this caused runtime hook-order violations.  
**Solution:** Identified all affected files (`requests/index.tsx`, `admin/users.tsx`, `admin/categories.tsx`) and replaced the dynamic import pattern with standard top-level `import { useEffect } from 'react'` and direct hook calls.

### Challenge 5: Admin Incorrectly Seeing Update Status Card
**Problem:** The initial implementation allowed admins to update request status. The correct business rule is that only the assigned maintenance officer can update status — admins can only assign/reassign officers.  
**Solution:** Changed the `canUpdateStatus` condition from `(isAdmin || isAssignedOfficer)` to `isAssignedOfficer` only. The officer check also verifies `request.assignment.officerId === user.id` to prevent officers from updating requests assigned to a different officer.

### Challenge 6: Status History Not Scrollable
**Problem:** The status history timeline had no maximum height constraint, causing the card to expand indefinitely on requests with many status changes, pushing the assignment panel far down the page.  
**Solution:** Wrapped the timeline list in a `div` with `max-h-[500px] overflow-y-auto` and redesigned the timeline to a left-aligned single-column layout (replacing the complex alternating layout), making it readable and fully scrollable on both desktop and mobile.

### Challenge 7: Mobile Layout — Sidebar Column Below Main Content
**Problem:** On mobile devices, the request detail page's sidebar (assignment panel + status update) appeared below the long description and history cards, requiring significant scrolling for officers who visit the page specifically to update status.  
**Solution:** Used Tailwind CSS `order` utilities (`order-1 lg:order-2` for the sidebar, `order-2 lg:order-1` for the main content) to display the sidebar above the description on mobile while keeping the desktop layout unchanged (sidebar on the right).

---

## 11. Conclusion

The University Maintenance Request System successfully delivers a production-quality, role-aware web platform that replaces informal maintenance reporting processes with a structured, auditable, and data-driven workflow.

The application demonstrates advanced full-stack web development practices:
- A **contract-first API** designed in OpenAPI, with both the Swagger documentation and the React Query client hooks generated from a single YAML source of truth
- **Defense-in-depth security** with JWT authentication, server-side role enforcement, bcrypt password hashing, and parameterised SQL queries via an ORM
- A **complete audit trail** that records every state transition with actor identity, timestamp, and context
- **Role-appropriate UX** where each user sees exactly the controls and data they are authorised to access — not enforced only in the UI, but mirrored by the API layer
- A **fully deployed, database-connected application** accessible on a public URL, not just a development prototype

The system is extensible: the modular Express route structure, the Drizzle ORM schema, and the OpenAPI-driven codegen pipeline all support adding new features (real-time notifications, multi-campus support, SLA tracking) without restructuring the existing codebase.

---

*Live application: available at the deployed Replit URL*  
*API documentation: `<deployed-url>/api/docs`*  
*Source code: https://github.com/Reuben-Victoria/maintenance-management-system*
