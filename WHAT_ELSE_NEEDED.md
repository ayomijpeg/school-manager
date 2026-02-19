# What Else Should Be Done – School Manager

A practical checklist of recommended next steps. **Items below have been implemented** unless marked (Optional).

---

## 1. **Apply database migration (if not done)**

The **General / Class Teacher** feature requires `courseId` to be optional on `ClassAssignment`.

- Run: `npx prisma migrate deploy` (or `npx prisma migrate dev` in development).
- If you created the migration manually, ensure the partial unique index exists so one teacher can have only one “general” assignment per class.

Without this, assigning a teacher as “General / Class Teacher” will keep failing with a server error.

---

## 2. **Error boundaries (better crash handling)** ✅ Done

- **Added** `src/app/error.tsx` – friendly message, “Try again” and “Go to dashboard”.
- **Added** `src/app/global-error.tsx` – root-level failures with minimal layout.

---

## 3. **README and setup docs** ✅ Done

- **Updated** `README.md` with requirements, setup steps, env vars, roles table, scripts, API health, and deploy (Vercel + Neon).

---

## 4. **Remove or guard debug code** ✅ Done

- **Cleaned** `src/lib/auth.ts` – removed debug comment; JWT errors only logged in development.
- **Cleaned** `src/app/api/auth/update-password/route.ts` – removed debugging logs; errors logged only in development.
- **Guarded** login and other auth API `console.error` with `NODE_ENV === 'development'`.

---

## 5. **Testing** ✅ Done

- **Added** Vitest: `vitest.config.ts`, `npm run test` / `npm run test:watch`.
- **Added** `src/lib/rateLimit.test.ts` – rate limiter behaviour.
- **Added** `src/app/api/health/route.test.ts` – health endpoint returns 200 when DB ok, 503 when DB fails (mocked Prisma).
- Run: `npm install` then `npm run test`.

---

## 6. **Loading and empty states** ✅ Done

- **Finance:** Empty state with icon, title, and contextual message (search vs no data); dark mode styles.
- **Teachers:** Empty state with icon, “No teachers found”, and hint; added RefreshButton; dark mode.
- **Students / Parents:** Already had good empty states; left as is.

---

## 7. **Security and hardening** ✅ Done

- **Rate limiting:** Added `src/lib/rateLimit.ts` (in-memory, 10 requests per minute per IP). Applied to `POST /api/auth/login`, `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password`. Returns 429 with optional `Retry-After` when exceeded.
- **Secrets:** Debug logs removed or guarded; no secrets in logs.
- **Update password:** Successful change now sets `passwordResetRequired: false` so users are not stuck in a reset loop.

---

## 8. **Accessibility (a11y)** ✅ Done

- **Header user menu:** Focus trap inside dropdown (Tab wraps first/last); Escape closes menu; `aria-expanded`, `aria-haspopup` on trigger; `role="menu"` and `aria-label` on menu panel; first focusable element focused on open.
- **Icon buttons:** Refresh and theme toggle already use `aria-label` / `title`.

---

## 9. **Deployment and health check** ✅ Done

- **README** includes Vercel + Neon deployment steps.
- **Health endpoint:** `GET /api/health` – returns `{ status, database, timestamp }`; 200 when DB is reachable, 503 when not. No auth required; path allowed in middleware.

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
