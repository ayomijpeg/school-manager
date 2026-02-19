# Changelog – Updates You Can See Now

Summary of all changes made to the school manager app. Restart the dev server (`npm run dev`) and hard-refresh the browser (Ctrl+Shift+R or Cmd+Shift+R) to see everything.

---

## 1. **Environment & login**
- **`.env`** – Created with your `DATABASE_URL` (Neon) and `JWT_SECRET` so login works locally.
- **`.env.example`** – Updated with short notes; copy to `.env` and fill values (e.g. from Vercel).
- **`src/lib/auth.ts`** – No default JWT secret; app refuses to verify if `JWT_SECRET` is missing.

**See it:** Run `npm run dev`, open `/auth/login`, sign in with your credentials.

---

## 2. **Invoices**
- **Duplicate prevention** – Bulk invoice creation skips students who already have an invoice for the same due date. No more duplicate names or wrong totals.
- **Void/delete** – From Finance Ledger: row menu (⋮) → “Void / Delete”, or on invoice detail page: “Void / Delete invoice” with confirmation.
- **Validation** – At least one line item with description and amount > 0 (client + server). Clear error messages.
- **Finance restricted to admins** – Only ADMIN can open `/dashboard/finance` and invoice detail; others redirect to dashboard.
- **API** – Bulk and single-invoice APIs require ADMIN; PATCH validates amount/date; DELETE returns 404 when invoice not found.

**See it:** Dashboard → Invoices → Create Invoice (try same level + due date twice to see “skipped” message). Use ⋮ on a row or open an invoice to void/delete.

---

## 3. **Admin dashboard**
- **Real counts** – Students, teachers, classes, and **pending revenue** (unpaid invoice balance) from the database.
- **Welcome** – “Good morning/afternoon/evening” and current date.
- **Quick links** – All actions point to real routes: Add Teachers → `/dashboard/teachers`, Generate Invoice → `/dashboard/finance`, Attendance → `/dashboard/teachers/attendance`, Settings → `/dashboard/settings`.
- **Sidebar** – Quick links (Student directory, Parents, Events) and “Recent enrolments” with link to directory.

**See it:** Log in as Admin → Dashboard. Check metric cards and click each quick action.

---

## 4. **Teacher dashboard**
- **Theme** – Emerald/slate to match the rest of the app.
- **Welcome** – “Teacher portal” with name, date, staff ID.
- **My classes** – Cards with Attendance and Results; “Schedule” link to My Schedule; “View all” to `/dashboard/teachers/classes`.
- **Events** – Upcoming events in sidebar with “View full calendar”.
- **Links** – All use `/dashboard/teachers/...` (plural).

**See it:** Log in as Teacher → Dashboard. Use class cards and sidebar links.

---

## 5. **Student dashboard**
- **Schema** – Uses `fullName`, `level`, `enrollments`, `results`, `studentAttendance`, `invoices` (no `firstName`/`lastName`).
- **Stats** – Attendance %, balance due, recent results count with link to report card.
- **Recent results** – List with course, exam, grade, total; link to full report card.
- **Pending invoices** – Shown when any; link to billing.
- **Quick links** – Report card, My invoices, Timetable.

**See it:** Log in as Student → Dashboard.

---

## 6. **Parent dashboard**
- **Greeting** – “Good morning/afternoon/evening” and first name.
- **Today’s schedule** – **Dynamic**: from timetable slots for wards’ classes for today’s weekday. No more hardcoded “08:00 Mathematics”.
- **Academic summary** – When no results: “No academic data yet”, “Results will appear when teachers upload scores”, and “View report cards” link.
- **School updates** – **Dynamic**: shows next upcoming event (title, description, “View calendar”) or “Check the events page” with link. No fake newsletter PDF.
- **Ward cards** – “Profile” button links to student profile page.

**See it:** Log in as Parent → Dashboard. Check “Today’s Schedule”, “Recent Performance”, and “School updates”.

---

## 7. **Student profile page (new)**
- **Route** – `/dashboard/students/[id]`.
- **Admins** – Full profile, balance, recent invoices, linked guardians, links to Finance and Report card.
- **Parents** – Can open only their linked wards (same URL, restricted by link).
- **From list** – Students list: student name links to this profile.
- **From parents** – Parent detail → Linked Wards → click a ward → student profile.

**See it:** Dashboard → Students → click a name; or Parents → open a parent → click a ward.

---

## 8. **Routes & 404 fixes**
- **Middleware redirects** – Old/wrong URLs now redirect instead of 404:
  - `/dashboard/teacher/*` → `/dashboard/teachers/*`
  - `/dashboard/attendance` → `/dashboard/teachers/attendance`
  - `/dashboard/finance/invoice` → `/dashboard/finance`
  - `/settings` → `/dashboard/settings`
  - `/dashboard/admin/teachers` → `/dashboard/teachers`
- **Password reset** – “Change password” redirect uses `/auth/new-password`.
- **WardCard** – Schedule link uses `/dashboard/parents/timetable`.
- **Parent ward link** – Wards link to `/dashboard/students/[id]` (student profile).

**See it:** Visit `https://portal.yosolaschools.com/dashboard/teacher/classes` → should redirect to teachers/classes. Same for other old links.

---

## 9. **Other fixes**
- **Levels API** – Typo “Invalieed” → “Invalid”.
- **Delete invoice** – After delete, refresh runs after navigation (no double refresh).
- **Teacher sidebar** – “Events” link added for teachers.
- **FEATURES_AND_FIXES.md** – Step-by-step guide to verify each fix.

---

## How to see everything now

1. **Restart dev server**
   ```bash
   npm run dev
   ```
2. **Hard refresh the browser**  
   Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).
3. **Test by role**
   - **Admin:** Dashboard (counts, quick links), Invoices (create, void, list), Students (click name → profile), Parents (click ward → profile).
   - **Teacher:** Dashboard (classes, schedule, events), then open `/dashboard/teachers/classes` (or use old `/dashboard/teacher/classes` – should redirect).
   - **Parent:** Dashboard (dynamic schedule, academic summary, school updates), ward cards (Profile, Result, Schedule).
   - **Student:** Dashboard (stats, results, invoices, quick links).

If you use Vercel, deploy the latest branch and the same changes (including 404 redirects and dynamic parent dashboard) will apply in production.
