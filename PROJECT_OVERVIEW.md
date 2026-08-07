# School Manager Project Overview

This repository is a Next.js school management platform built for Nigerian school operations, with support for admin, teacher, student, and parent workflows. It combines a role-based dashboard, Prisma + PostgreSQL data layer, server-side auth, and a set of educational-management modules like classes, results, payments, timetable, attendance, and school configuration.

The project is structured like a production SaaS app, but with a few practical patterns that an AI or junior developer should understand before changing anything.

---

## 1. High-level purpose

The app is meant to manage a school ecosystem end-to-end:

- Admin configures school setup
- Staff manage academic and attendance records
- Students view results, timetable, invoices, and profile info
- Parents monitor their children’s academic progress and payment status
- Finance and billing flows are integrated into the system

This is a school ERP and not just a simple website.

---

## 2. Core technology stack

### Framework and frontend

- Next.js 16
- React 19
- App Router architecture (`src/app`)
- Tailwind CSS for styling
- Client-side state via Zustand
- Lucide icons and light UI patterns

### Backend and data layer

- Prisma ORM
- PostgreSQL database
- JWT-based auth via `jose`
- bcrypt password hashing
- Zod validation for API request schemas

### Dev and tools

- Vitest for testing
- ESLint for linting
- Prisma migrations and seeded data

---

## 3. Runtime architecture

The application follows a clear server/client split:

### Server-side layer

- Pages and API routes live in `src/app`
- Server components fetch data directly from Prisma
- Sensitive auth checks happen on the server via session and JWT verification
- Database operations are kept in Prisma calls

### Client-side layer

- Interactive dashboard widgets and UI elements live in client components
- State is managed through Zustand store (`src/store/useAuthStore.ts`)
- Components use `use client` when needed for browser interactions

### Middleware layer

- `src/middleware.ts` intercepts requests before a page loads
- It checks cookies, validates JWTs, and redirects unauthenticated users to `/auth/login`
- It also handles old route redirects and public-path allowances

This is the main gatekeeper for protected pages.

---

## 4. How the app boots and works

### 4.1 Landing page

The landing page is in `src/app/page.tsx`.

It acts like a public marketing/front-door page for the school and includes:

- hero section
- school identity and mission/vision
- portal feature cards
- login CTA

This page is intentionally public and not behind authentication.

### 4.2 Setup flow

The first major app workflow is school setup.

- Route: `src/app/api/setup/school/route.ts`
- Initial setup page: likely under `src/app/setup/page.tsx`
- This creates the school configuration and bootstraps academic structure

The setup route creates:

- `SchoolConfig`
- `AcademicSession`
- departments/faculties/levels depending on school type
- default academic hierarchy

It runs inside a Prisma transaction for atomic setup, which is important because the app creates multiple related records at once.

### 4.3 Auth flow

Core auth files:

- `src/app/api/auth/login/route.ts`
- `src/lib/auth.ts`
- `src/lib/session.ts`
- `src/middleware.ts`
- `src/store/useAuthStore.ts`

#### Login flow

1. User sends email and password to `/api/auth/login`
2. The route validates input using Zod
3. It looks up the user in Prisma and compares the provided password to `passwordHash` using `bcryptjs`
4. If valid, it creates a JWT using `jose`
5. It stores the token in a secure HTTP-only cookie called `token`
6. It returns user metadata and redirect target

#### JWT verification

`src/lib/auth.ts` defines `verifyJwt(token)`. It:

- reads `JWT_SECRET`
- encodes it with `new TextEncoder()`
- calls `jwtVerify`
- returns payload or `null` if invalid

#### Session retrieval

`src/lib/session.ts` reads the token from cookies and calls `getCurrentUser()`, which then resolves the currently logged-in user.

This is used on server-rendered pages like the dashboard.

---

## 5. Route protection model

Protected pages are controlled by `src/middleware.ts`.

### What middleware does

It checks every request and allows only public paths such as:

- `/`
- `/auth/login`
- `/setup`
- `/api/health`
- other public auth routes

For everything else, it:

- reads the cookie token
- verifies token through `verifyJwt`
- redirects to `/auth/login` if invalid or missing

This means the system relies on server-side route gating, with the dashboard acting as a protected application shell.

---

## 6. Main app layout and dashboard flow

### 6.1 Dashboard shell

The dashboard uses a shared shell:

- `src/app/dashboard/layout.tsx`
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`

The layout does three important things:

1. fetches school config for the header/sidebar context
2. wraps children in `ProtectedRoute`
3. renders the main layout shell with top navigation and sidebar

### 6.2 Dashboard route entry

`src/app/dashboard/page.tsx` is the central dashboard entry. It:

- gets the current authenticated user via `getCurrentUser()`
- fetches the school config
- checks if setup is complete
- redirects if no auth or setup not done
- renders different dashboard UIs based on role

Role-based switching:

- `ADMIN` -> `DashboardClient`
- `TEACHER` -> `DashboardClient`
- `STUDENT` -> `StudentDashboard`
- `PARENT` -> `ParentDashboard`

This is a crucial architectural pattern: role-specific pages are routed to specialized dashboard components rather than one giant monolith.

---

## 7. Data model and Prisma schema structure

The main database schema is defined in `prisma/schema.prisma`.

### Key domain groups

#### A. School configuration

- `SchoolConfig`
- `AcademicSession`

These control the operating context of the school: academic year, term, school type, and setup status.

#### B. User and role models

- `User`
- `Student`
- `Teacher`
- `Parent`

Users are the system identity layer. Student/Teacher/Parent records are personal profiles attached to a base user record.

This is a classic multi-role RBAC design.

#### C. Academic structure

- `Faculty`
- `Department`
- `Level`
- `Class`
- `Course`
- `Enrollment`
- `Subject` / course assignment patterns

This is the “school hierarchy” layer. It supports both basic and tertiary school formats.

#### D. Academic operations

- `Result`
- `Attendance`
- `Exam`
- `ExamSchedule`
- `TimetableSlot`

These represent day-to-day school processes.

#### E. Finance and billing

- `Invoice`
- `Payment`
- `FeeTemplate`
- `PaymentSettings`

This is the billing side, which is integrated with the student and parent experience.

#### F. Communication and notifications

- `Notification`
- `Event`

This layer covers school announcements and calendar events.

---

## 8. Folder structure and what each section does

### `src/app/`

This is the Next.js App Router

It contains:

- page routes like `/dashboard`, `/setup`, `/auth/login`
- API routes like `/api/students`, `/api/teachers`, `/api/results`, `/api/finance`
- route groups and route-level layout behavior

This folder is the central feature map of the app.

### `src/components/`

UI components grouped by domain:

- `components/layout/` -> shell and navigation components
- `components/dashboard/` -> role dashboards
- `components/finance/` -> invoice/payment UI
- `components/students/` -> student management forms and views
- `components/teachers/` -> teacher/curriculum/admin UI
- `components/results/` -> results and broadsheet logic

This is where the app’s presentation logic is kept.

### `src/lib/`

Shared backend utilities:

- `auth.ts` -> JWT validation
- `prisma.ts` -> singleton DB client
- `session.ts` -> current-user resolver
- `rateLimit.ts` -> API abuse protection
- `schoolConfig.ts` -> setup config checks
- `utils.ts` -> general shared helpers

This folder contains the application’s infrastructure utilities.

### `src/context/` and `src/store/`

- `AuthContext.tsx` wraps auth context
- `useAuthStore.ts` stores app user state in Zustand

This is the client auth state layer.

### `src/hooks/`

Reusable hooks like:

- `useAuth.ts`
- `useDebounce.ts`
- `useDataFetch.ts`
- `useLocalStorage.ts`
- `useUser.ts`

### `prisma/`

Contains database schema and migration history.

This is the source of truth for the data model.

---

## 9. What “works” in this project

This project is not just a front-end mock. It has real operational logic for:

### Authentication and authorization

- secure password verification
- JWT cookie auth
- route middleware protection
- role-specific dashboards

### School configuration

- config wizard for school setup
- dynamic values like school type, academic year, term, GPA settings

### Academic management

- classes and levels
- enrollment and student assignments
- exams and results
- attendance tracking
- timetable generation

### Finance management

- invoice generation
- payment verification
- revenue tracking
- parent billing views

### Parent/student experience

- linked parents to children
- student-specific timetable and results APIs
- invoice and academic data retrieval

---

## 10. Important design patterns and conventions

### 10.1 Prisma transaction for setup

The setup route uses `prisma.$transaction` to bundle many related writes together. This is a good pattern for multi-table setup where you need all-or-nothing consistency.

### 10.2 Validation with Zod

Most API routes validate incoming payloads with `z.object(...)` and `.parse(...)`. This is best practice for backend safety.

### 10.3 JWT in HTTP-only cookie

Auth is stored in cookies rather than localStorage, which is a stronger default for session-like authentication.

### 10.4 Role-based routing

The dashboard chooses UI by `user.role`. This is better than having one giant dashboard with many conditional blocks.

### 10.5 App Router server components

This project makes heavy use of Next.js server components for secure data fetches and page-level logic.

---

## 11. Typical request flow for a new feature

When you add a feature, the likely pattern is:

1. Add or update Prisma model in `prisma/schema.prisma`
2. Create migration if needed
3. Add API route in `src/app/api/.../route.ts`
4. Validate input with Zod
5. Use Prisma to query or mutate data
6. Return JSON or redirect as needed
7. Add a UI page or component in `src/app` or `src/components`
8. Attach the UI to the correct role/dashboard entry

This is the main operating pattern for this codebase.

---

## 12. What to watch out for as a senior developer

This project is solid, but there are some implementation realities you should be aware of:

### A. Role checks are not centralized

Auth is present, but permission logic is spread across routes and components. If you add a new role-specific feature, you may need to manually check role conditions in several places.

### B. Middleware and route redirects are a little “pragmatic”

The middleware contains several redirect aliases for old or wrong dashboard paths. This is useful but means the URL structure is a little inconsistent in places.

### C. Setup is singleton-based

The school configuration is treated as a single config object, using `id: 'singleton-config-id'`. That is intentionally simple but may be limiting if you later need multi-school, multi-tenant, or multiple campus support.

### D. Some flows are feature-dense and not all are generalized

Finance, timetable, and results modules look substantial and are likely feature-rich rather than abstracted into a single reusable framework. This is normal for real education ERPs but means new changes should be made carefully.

### E. Auth state is split

There are both server-side auth (`verifyJwt`, `getCurrentUser`) and client-side auth (`useAuthStore`). This is fine, but you should avoid mixing them inconsistently when implementing new features.

---

## 13. Recommended change strategy for an AI agent or new developer

If you are going to make changes smoothly, this is the best workflow:

### Before changing code

- Identify the domain: auth, setup, students, teachers, finance, timetable, results
- Check the Prisma model first
- Find the API route responsible
- Check the dashboard or page that renders the feature
- Verify route protection and role gating

### When implementing a feature

1. Confirm the data model in Prisma
2. Add or adjust the API route
3. Validate with Zod
4. Update server-side or client-side rendering
5. Verify the access rules
6. Test with real data and role flows

### Good rule of thumb

Prefer server-side data fetching for protected data. Prefer client-side state only for interactive UI behaviors.

---

## 14. Suggested “entry points” for future development

If you want to change or extend app behavior, these are the most important files to read first:

- `src/app/dashboard/page.tsx` — main role routing
- `src/middleware.ts` — auth gating and redirect logic
- `src/lib/session.ts` — current user resolution
- `src/app/api/auth/login/route.ts` — login implementation
- `src/app/api/setup/school/route.ts` — initialization and school config
- `prisma/schema.prisma` — authoritative schema
- `src/components/layout/MainLayout.tsx` — dashboard shell

---

## 15. Mental model for the project

A good way to think about the app is this:

- The database defines the school system
- Prisma is the data access layer
- API routes are the business endpoints
- The dashboard shell is the app frame
- Role-specific components are the product experience
- Middleware is the security layer

This project is a fairly complete school management system built with modern Next.js conventions, but its business logic is distributed across routes and domain modules rather than fully centralized into domain services.

That is normal for a real-world app and is exactly why this overview matters before making large modifications.

---

## 16. Quick start summary

```bash
npm install
npm run dev
```

Requires:

- PostgreSQL connection via `DATABASE_URL`
- `JWT_SECRET` configured
- Prisma generated and migrations applied

Typical dev workflow:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

---

## 17. Final takeaway

This project is built around a real-world school ERP workflow. The strongest architectural idea is that it separates:

- identity and auth
- school setup and academic configuration
- role-specific dashboards
- transactional domain operations
- shared infrastructure

If you understand those layers, it becomes much easier to change, extend, and safely ship new features.
