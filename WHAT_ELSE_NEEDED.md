# What Else Should Be Done – School Manager

A practical checklist of recommended next steps, ordered by impact and effort.

---

## 1. **Apply database migration (if not done)**

The **General / Class Teacher** feature requires `courseId` to be optional on `ClassAssignment`.

- Run: `npx prisma migrate deploy` (or `npx prisma migrate dev` in development).
- If you created the migration manually, ensure the partial unique index exists so one teacher can have only one “general” assignment per class.

Without this, assigning a teacher as “General / Class Teacher” will keep failing with a server error.

---

## 2. **Error boundaries (better crash handling)**

There are no `error.tsx` or `global-error.tsx` in the app. When a page or layout throws, users see a generic Next.js error.

**Suggested:**

- Add `src/app/error.tsx` – show a friendly message and “Try again” / “Go to dashboard”.
- Optionally add `src/app/global-error.tsx` – for root-level failures (with its own minimal layout).

This gives users a clear recovery path instead of a blank or dev-style error screen.

---

## 3. **README and setup docs**

The README is still the default Next.js one. Updating it will help you and anyone else running the project.

**Suggested content:**

- **Requirements:** Node 18+, PostgreSQL (e.g. Neon).
- **Setup:**  
  - `cp .env.example .env`  
  - Fill `DATABASE_URL` and `JWT_SECRET`  
  - `npm install`  
  - `npx prisma migrate deploy`  
  - `npm run dev`
- **Roles:** ADMIN, TEACHER, STUDENT, PARENT and what each can do.
- **Optional:** Seed data (`npm run db-seed`), deployment (e.g. Vercel + Neon).

---

## 4. **Remove or guard debug code**

There are a few debug-style comments that could leak info or confuse future changes:

- `src/lib/auth.ts` – comment about uncommenting to see JWT secret (remove or replace with “do not log secret”).
- `src/app/api/auth/update-password/route.ts` – “DEBUGGING LOGS” (remove in production or guard with `NODE_ENV`).

Keeping production code free of secret-related and verbose debug logs is a good practice.

---

## 5. **Testing**

There are no test files (e.g. `*.test.ts`, `*.spec.tsx`). Adding tests will help refactors and deployments.

**Suggested order:**

- **API routes:** Login, forgot-password, reset-password, and one or two critical routes (e.g. students list, invoice create) with a test DB or mocks.
- **Auth flow:** Protected routes redirect when no token; role-based redirects (e.g. finance only for ADMIN).
- **Key UI:** Optional; start with critical forms (login, forgot-password, new-password) if you add component tests.

Use Jest + React Testing Library (or Vitest) and, for API tests, either in-process Next or `fetch` against a test server.

---

## 6. **Loading and empty states**

Many pages already have loading/empty handling; a quick pass can make behavior consistent.

- **Lists (students, teachers, finance, etc.):** Skeleton or spinner while loading; clear “No results” when the list is empty (with a short hint, e.g. “Add a student”).
- **Dashboard:** Already has loading; ensure “no classes / no events” messages are clear and actionable.

---

## 7. **Security and hardening**

- **Rate limiting:** Consider rate limiting on `/api/auth/login`, `/api/auth/forgot-password`, and `/api/auth/reset-password` to reduce brute-force and abuse (e.g. Vercel, Upstash, or custom middleware).
- **CORS / headers:** If you add a separate frontend or mobile app later, configure CORS and security headers (e.g. CSP) in Next config or middleware.
- **Secrets:** Confirm no `JWT_SECRET` or `DATABASE_URL` in code or logs; `.env` in `.gitignore` is already correct.

---

## 8. **Accessibility (a11y)**

- **Focus:** Modals and dropdowns (e.g. theme toggle, user menu) – trap focus and restore it on close.
- **Labels:** Buttons that are icon-only (e.g. refresh, theme toggle) already have `aria-label` or `title` in many places; ensure every such control has a text alternative.
- **Contrast:** Dark mode already uses readable contrast; a quick pass on form errors and disabled states will keep a11y solid.

---

## 9. **Deployment and health check**

- **Vercel + Neon:** Document in README: connect repo, set `DATABASE_URL` and `JWT_SECRET`, run migrations in build or release step.
- **Health/readiness:** Optional – a simple route (e.g. `/api/health`) that returns 200 and optionally checks DB connectivity. Useful for zero-downtime deploys and monitoring.

---

## 10. **Optional improvements**

- **Logging / monitoring:** e.g. Sentry (or similar) for frontend and API errors in production.
- **Audit trail:** If required by policy, log sensitive actions (e.g. void invoice, bulk create invoices, password reset) with user id and timestamp.
- **Backup:** Automated DB backups (Neon and other providers often offer this).
- **Notifications:** You have notification models; wiring in-app or email notifications for key events (e.g. invoice issued, result published) would complete the loop.

---

## Quick reference

| Priority | Item                         | Effort  |
|----------|------------------------------|---------|
| High     | Apply ClassAssignment migration | Low     |
| High     | Add `error.tsx` (and optionally `global-error.tsx`) | Low     |
| High     | Update README with env + setup + roles | Medium  |
| Medium   | Remove/guard debug comments  | Low     |
| Medium   | Add tests for auth + 1–2 APIs | Medium  |
| Medium   | Consistent loading/empty states | Low–Med |
| Lower    | Rate limiting on auth APIs   | Medium  |
| Lower    | a11y (focus, labels)         | Low     |
| Lower    | Health endpoint + deploy docs | Low    |

Focusing on **migration**, **error boundaries**, and **README** will give the biggest benefit for relatively little effort. After that, tests and security (rate limiting, no debug in prod) will make the app more maintainable and safe.
