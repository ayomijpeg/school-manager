# Features & Fixes – How to See Them Work

This guide shows **what was fixed or added** and **how to verify** each one in the app.

---

## 1. Student profile page (new)

**What:** A dedicated page for each student so admins and parents can view one ward/student in one place.

**How to see it work:**
1. Log in as **Admin**.
2. Go to **Students** → click a student name (if you add links on the list) or go to **Parents** → open a parent → under **Linked Wards** click a ward.
3. You should land on **Student profile**: name, level, outstanding balance, recent invoices, links to “View all invoices” and “Report card”.
4. Log in as a **Parent** linked to a student: open **My Children** (or Billing) and use any link that goes to a ward; it should open that student’s profile. Parents only see their linked wards.

**File:** `src/app/dashboard/students/[id]/page.tsx`

---

## 2. Parent ward link → student profile

**What:** From a parent’s detail page, clicking a ward now opens that **student’s profile** instead of a non‑existent page.

**How to see it work:**
1. **Dashboard** → **Parents** → open any parent with linked wards.
2. Under **Linked Wards**, click a ward card.
3. You should see the **student profile** for that ward (name, level, invoices, etc.).

---

## 3. Admin dashboard links

**What:** All quick‑action links on the admin dashboard now go to existing pages.

**How to see it work:**
1. Log in as **Admin** and open **Dashboard**.
2. In **Registrar’s Office**, click:
   - **Add Teachers** → goes to `/dashboard/teachers`.
   - **Generate Invoice** → goes to `/dashboard/finance` (Create Invoice is there).
   - **Record Attendance** → goes to `/dashboard/teachers/attendance`.
   - **System Settings** → goes to `/dashboard/settings`.

---

## 4. Password reset redirect

**What:** When a user must change password, they are sent to the **new‑password** page that actually exists.

**How to see it work:**
1. In the database, set a user’s `passwordResetRequired` to `true` (or use your auth flow that does this).
2. Log in as that user.
3. You should be redirected to **`/auth/new-password`** to set a new password, not to a broken link.

---

## 5. Invoice duplicates and totals

**What:** Bulk invoice creation **skips** students who already have an invoice for the **same due date**, so you don’t get duplicate invoices per student and totals stay correct.

**How to see it work:**
1. **Finance** → **Create Invoice** → choose a level (e.g. JSS1), due date, and items → **Generate**.
2. Run the same again (same level, same due date).
3. You should see a message like: “Created 0 invoices. X students already had an invoice for this due date and were skipped.” No duplicate names; totals stay correct.

---

## 6. Void / delete invoice

**What:** You can **void (delete)** an invoice from the ledger from the list or the detail page.

**How to see it work:**
1. **Finance** → in the table, click the **⋮** on a row → **Void / Delete** → confirm.
2. Or open an invoice (**View invoice**) → click **Void / Delete invoice** → confirm.
3. The invoice disappears from the list and you’re back on the Finance Ledger.

---

## 7. Invoice validation (no empty or zero items)

**What:** You cannot create bulk invoices with empty descriptions or zero amounts. The UI and API both enforce at least one valid line item.

**How to see it work:**
1. **Finance** → **Create Invoice** → leave description or amount empty (or set amount to 0) → **Generate**.
2. You should see: “Add at least one line item with a description and amount greater than 0.”
3. Add a real item (e.g. “Tuition”, 50000) and generate again; it should succeed.

---

## 8. Finance restricted to admins

**What:** Only **Admin** can open the Finance Ledger and invoice pages. Teachers/parents are redirected to the dashboard.

**How to see it work:**
1. Log in as **Teacher** or **Parent**.
2. Manually go to **`/dashboard/finance`** or **`/dashboard/finance/[some-invoice-id]`**.
3. You should be redirected to **`/dashboard`** and not see finance data.

---

## 9. Teacher dashboard and sidebar links

**What:** Teacher dashboard and sidebar use the correct **`/dashboard/teachers/...`** routes so Attendance, Results, and Events open the right pages.

**How to see it work:**
1. Log in as **Teacher**.
2. On the dashboard, click **View All** (My Classes) or a class card **Attendance** / **Results**.
3. You should land on the teachers’ **classes**, **attendance**, or **results** pages (no 404).
4. In the sidebar, **Events** should open the calendar.

---

## 10. Parent timetable link (WardCard)

**What:** On the parent dashboard, the **Schedule** button for a ward goes to the parent timetable page.

**How to see it work:**
1. Log in as **Parent**.
2. On the dashboard (or Billing/My Children), find a **Schedule** (or “timetable”) link for a child.
3. It should go to **`/dashboard/parents/timetable`**, matching the sidebar.

---

## 11. JWT secret (no default)

**What:** The app no longer falls back to a default JWT secret; it **refuses to verify** if `JWT_SECRET` is missing (and logs a message).

**How to see it work:**
1. In `.env`, **remove** or comment out `JWT_SECRET`.
2. Restart the app and try to log in or open a protected page.
3. Auth should fail (no silent use of a weak default). Set `JWT_SECRET` again to fix.

---

## 12. Levels API typo

**What:** The levels API error message was corrected from “Invalieed input” to **“Invalid input”**.

**How to see it work:**
1. Call **POST /api/levels** with invalid body (e.g. empty name).
2. The response `error` field should say **“Invalid input”**.

---

## Quick checklist

| # | What to check | Where to go |
|---|----------------|-------------|
| 1 | Student profile exists | Parents → open parent → click a ward |
| 2 | Ward opens student page | Same as above |
| 3 | Dashboard links work | Dashboard (admin) → click each quick action |
| 4 | No duplicate invoices | Finance → Create Invoice twice (same level + due date) |
| 5 | Void invoice | Finance → ⋮ on row → Void / Delete |
| 6 | Invoice validation | Finance → Create Invoice with empty/zero item |
| 7 | Finance admin-only | Log in as teacher → open /dashboard/finance |
| 8 | Teacher links work | Log in as teacher → dashboard class links |
| 9 | Parent Schedule link | Log in as parent → Schedule on a ward card |

---

For more detail on code changes, see the file list in the earlier summary (AdminDashboard, ProtectedRoute, auth, finance API and pages, InvoiceGenerator, parents/wards, levels API).
