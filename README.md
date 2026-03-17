# Family Expense Logger

A production-ready web app for families to log daily expenses, view history, and import/export CSV in a fixed format.

## Features

- **Expense CRUD**: Create, read, update, delete expenses (TIME, TYPE, AMOUNT, CATEGORY, ACCOUNT, NOTES).
- **Daily entry**: Fast form at `/expenses/new`.
- **List & filters**: By date range, category, account at `/expenses`.
- **Dashboard**: Top categories, monthly trend, account split (Recharts).
- **CSV import**: Upload CSV, validate headers (`TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES`), preview, import with error reporting.
- **CSV export**: Download all expenses in the same format; TIME as `MMM DD, YYYY h:mm AM/PM`.
- **Auth**: Email + password, secure sessions; optional invite link to add family members to the same dataset.

## Tech stack

- Next.js 14 (App Router), TypeScript, TailwindCSS
- Prisma ORM (SQLite dev / Postgres production)
- NextAuth.js (credentials)
- Recharts for dashboard

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL="file:./dev.db"` for SQLite
   - `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - `NEXTAUTH_URL="http://localhost:3000"`

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Register to create a family; use the invite link on the dashboard to add family members.

## Scripts

- `npm run dev` — development server
- `npm run build` — build for production (`prisma generate` + Next.js build)
- `npm run start` — start production server
- `npm run lint` / `npm run typecheck` — lint and TypeScript check
- `npm run test` — run tests (CSV parsing, API contract)
- `npm run db:push` — sync schema to DB (dev)
- `npm run db:migrate` — run migrations (production)
- `npm run db:studio` — open Prisma Studio

## CSV format

- **Headers (exact order):** `TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES`
- **TIME:** `Mar 01, 2025 9:45 AM` (MMM DD, YYYY h:mm AM/PM)
- **TYPE:** `(-) Expense` (constant)
- **AMOUNT:** number (INR), positive
- **CATEGORY:** string, required
- **ACCOUNT:** `Savings` | `Card` | `Cash`
- **NOTES:** string, optional

## Deployment (free)

The app can be hosted **at no cost** on free tiers. See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions:

- **Vercel** (free Hobby plan) for the Next.js app
- **Neon** or **Supabase** (free tier) for Postgres

No credit card required for this setup.

## Quality

- Input validation (amount > 0, category required, account enum)
- Auth and family-scoped data only
- Tests for CSV parsing and API contract
- ESLint + Prettier
