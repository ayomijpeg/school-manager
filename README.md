# Yosola School Management System

A comprehensive school management solution for Nigerian schools (Basic and Higher Education). Built with Next.js 16, Prisma, PostgreSQL, and Tailwind CSS.

## Features

- **Roles:** Admin, Teacher, Student, Parent — each with tailored dashboards and permissions
- **Academic:** Levels, classes, subjects, enrollments, results, attendance, timetable, exams
- **Finance:** Invoices, bulk generation, payment verification, billing for parents
- **Staff:** Teachers, class/subject assignments (including General / Class Teacher)
- **Parents:** Linked wards, report cards, timetable, billing
- **Auth:** Login, forgot password, reset password, forced password change for new users
- **UI:** Dark/light theme toggle, refresh buttons on key pages, responsive layout

## Requirements

- **Node.js** 18+
- **PostgreSQL** (e.g. [Neon](https://neon.tech), Vercel Postgres, or any Postgres host)
- **npm** or yarn/pnpm

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd school-manager
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable        | Description                                      |
|-----------------|--------------------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string (e.g. from Neon)   |
| `JWT_SECRET`    | Long random string (≥32 chars) for JWT signing  |

Never commit `.env` to git.

### 3. Database

```bash
npx prisma generate
npx prisma migrate deploy
```

Optional seed (if you have a seed script):

```bash
npm run db-seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Login** to sign in.

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start dev server (Next.js)     |
| `npm run build`   | Build for production           |
| `npm run start`   | Start production server        |
| `npm run lint`    | Run ESLint                     |
| `npm run db-seed` | Seed database (if configured)   |

## Roles and access

| Role     | Access summary                                                |
|----------|----------------------------------------------------------------|
| **Admin**   | Dashboard, students, teachers, parents, classes, subjects, exams, result entry, broadsheet, timetable, events, finance (invoices, verification), settings |
| **Teacher**| Dashboard, my classes, attendance, enter results, my schedule, events |
| **Student**| Dashboard, report card, timetable, invoices (own)            |
| **Parent** | Dashboard, my children, timetable, report cards, billing     |

Finance (invoices, verification) is restricted to Admin only.

## API

- **Auth:** `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, etc.
- **Health:** `GET /api/health` — returns `{ status, database }` for monitoring (no auth required).

## Deploy (e.g. Vercel + Neon)

1. **Neon:** Create a project and copy the `DATABASE_URL`.
2. **Vercel:** Import the repo, add environment variables:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (generate a long random string)
3. **Build:** Vercel runs `prisma generate` and `next build`. Ensure migrations are applied:
   - Either run `npx prisma migrate deploy` in a build step or run it once from your machine pointing at production DB.
4. **Health check:** Use `GET /api/health` as a readiness/liveness endpoint if needed.

## Project structure (high level)

- `src/app/` — Next.js App Router (pages, layouts, API routes)
- `src/components/` — React components (dashboard, layout, finance, etc.)
- `src/lib/` — Auth, Prisma client, rate limit, utils
- `src/context/` — Auth context
- `prisma/` — Schema and migrations

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
