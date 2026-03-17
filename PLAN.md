# Family Expense Logger — Implementation Plan

## 1. Architecture Overview

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + TailwindCSS
- **Backend**: Next.js API routes (serverless) + Prisma ORM
- **Database**: SQLite for local/dev; Postgres for production (Neon/Supabase) — switch via `DATABASE_URL`
- **Auth**: NextAuth.js (Credentials provider) with secure sessions; family = shared `familyId` so all members see same expenses
- **Charts**: Recharts for dashboard
- **Deployment**: Vercel + Neon Postgres (primary); optional Azure instructions

Data flow: All expense APIs check session → resolve user's `familyId` → CRUD scoped to that family. Single shared dataset per family.

---

## 2. Data Model (Prisma Schema)

```prisma
// Core entities
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  familyId      String?
  family        Family?   @relation(fields: [familyId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Family {
  id        String   @id @default(cuid())
  name      String   @default("My Family")
  users     User[]
  expenses  Expense[]
}

model Expense {
  id         String   @id @default(cuid())
  time       DateTime
  type       String   @default("(-) Expense")
  amount     Float
  category   String
  account    String   // Savings | Card | Cash
  notes      String?
  familyId   String
  family     Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([familyId, time])
  @@index([familyId, category])
  @@index([familyId, account])
}
```

---

## 3. Routes / Pages / Components

| Route | Purpose |
|-------|--------|
| `/` | Redirect to dashboard or login |
| `/login` | Email/password login |
| `/register` | Register (create family or join) |
| `/dashboard` | Analytics: top categories, monthly trend, account split (Recharts) |
| `/expenses` | List + filters (date range, category, account), delete/edit |
| `/expenses/new` | Fast daily expense form |
| `/expenses/[id]/edit` | Edit expense |
| `/import` | CSV upload, validate, preview, import |
| `/export` | Export CSV (same format) |

**API routes**: `POST/GET /api/expenses`, `GET/PATCH/DELETE /api/expenses/[id]`, `POST /api/expenses/import`, `GET /api/expenses/export`, `POST /api/auth/register`, NextAuth routes for login/session.

**Key components**: `ExpenseForm`, `ExpenseList`, `ExpenseFilters`, `DashboardCharts`, `CsvImportWizard`, `Layout` (nav + auth state).

---

## 4. CSV Import/Export Approach

**Required format (exact):**  
`TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES`

- **TIME**: Human-readable `"MMM DD, YYYY h:mm AM/PM"` (e.g. "Mar 01, 2025 9:45 AM")
- **TYPE**: Constant `"(-) Expense"`
- **AMOUNT**: Number (INR)
- **CATEGORY**: String (required)
- **ACCOUNT**: One of `Savings | Card | Cash`
- **NOTES**: String (optional)

**Import**:
1. Parse CSV (e.g. `papaparse`), validate headers exactly.
2. Validate each row: amount > 0, category non-empty, account in enum.
3. Parse TIME with a parser that accepts "MMM DD, YYYY h:mm AM/PM".
4. Show preview table + error list; user confirms → bulk insert for family.

**Export**:
1. Fetch all family expenses ordered by `time`.
2. Format TIME with `date-fns` (e.g. `format(date, 'MMM dd, yyyy h:mm a')`).
3. Emit CSV with exact headers; TYPE always `"(-) Expense"`.

---

## 5. Deployment Approach

- **Vercel**: Connect repo → set `DATABASE_URL` (Neon), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Prisma migrate on deploy (postinstall script or CI).
- **Database**: Neon Postgres free tier; run `prisma migrate deploy` in build.
- **Secrets**: All in env; never committed. Document in DEPLOYMENT.md.

Optional: Azure App Service / Static Web Apps + Azure DB instructions as second option.

---

## 6. Milestones

| # | Milestone | Outcomes |
|---|-----------|----------|
| 1 | Scaffold + tooling | Next.js, TS, Tailwind, Prisma, ESLint/Prettier, SQLite dev |
| 2 | Auth | Register, login, session, familyId; protect routes |
| 3 | Expense CRUD | API + daily form, list, filters, edit/delete |
| 4 | Dashboard | Recharts: top categories, monthly trend, account split |
| 5 | CSV | Import (validate, preview, import) + Export (exact format) |
| 6 | Tests + polish | CSV parse tests, API tests, lint/format, DEPLOYMENT.md |

---

## 7. Validation Rules

- **Amount**: Positive number, required.
- **Category**: Non-empty string.
- **Account**: Exactly one of `Savings`, `Card`, `Cash`.
- **TIME**: Valid date parse.
- **TYPE**: Stored as constant `"(-) Expense"` (not user-editable in export).

---

## 8. Security

- Passwords hashed with bcrypt (via NextAuth or manual).
- All expense APIs require session and scope by `familyId`.
- No public access; middleware redirect unauthenticated to `/login`.
