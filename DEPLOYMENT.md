# Family Expense Logger — Deployment (free hosting)

This app can be hosted **at no cost** using free tiers only. The recommended stack is below.

---

## Free hosting stack (recommended)

| Component   | Service   | Free tier |
|------------|-----------|-----------|
| **App**    | Vercel    | Hobby plan: free for personal use, unlimited deployments |
| **Database** | Neon or Supabase | Free tier: enough for a small family (e.g. 0.5 GB / 500 MB) |

You will not be charged if you stay within these free tiers.

---

## Option A: Vercel + Neon (recommended, 100% free)

### 1. Database — Neon (free)

1. Go to [Neon](https://neon.tech) and sign up (free).
2. Create a new project and copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
3. Use this as `DATABASE_URL`. Neon’s free tier is sufficient for family expense data.

### 2. Prisma for Postgres

The project uses SQLite by default. For production:

1. In `prisma/schema.prisma`, set:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. With `DATABASE_URL` pointing to your Neon DB, run:
   ```bash
   npx prisma migrate dev --name init
   npx prisma migrate deploy
   ```
   Or use `npx prisma db push` for a quick schema sync.

### 3. Vercel (free)

1. Push your code to GitHub (or GitLab/Bitbucket).
2. Go to [Vercel](https://vercel.com) → **Add New Project** → Import your repo. Use the **Hobby** (free) plan.
3. Set **Environment Variables** (Production and Preview):
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your app URL, e.g. `https://your-app.vercel.app`
4. Build command: use default, or set to `npm run vercel-build` if you add a script that runs `prisma migrate deploy && next build` (so migrations run on deploy).
5. Deploy. If you didn’t run migrations in the build, run once from your machine: `npx prisma migrate deploy` with `DATABASE_URL` set to the production URL.

### 4. After deploy

- Open your app URL and register the first user (this creates the family).
- On the dashboard, use **Invite family members** to copy the invite link and share it so others can join the same family.

---

## Option B: Vercel + Supabase (also 100% free)

If you prefer Supabase instead of Neon:

1. Create a project at [Supabase](https://supabase.com) (free tier).
2. In **Project Settings → Database**, copy the **Connection string** (URI). Use it as `DATABASE_URL`.
3. Use the same Prisma and Vercel steps as in Option A (Postgres provider, migrations, env vars, deploy).

Supabase free tier includes a small Postgres database suitable for this app.

---

## Environment variables

| Variable          | Description |
|------------------|-------------|
| `DATABASE_URL`   | Postgres connection string from Neon or Supabase. |
| `NEXTAUTH_SECRET`| Random secret (e.g. `openssl rand -base64 32`). |
| `NEXTAUTH_URL`   | Full app URL (e.g. `https://your-app.vercel.app`). |

Do not commit `.env` or production secrets; set these in Vercel’s project settings.

---

## Staying free

- **Vercel**: Use the Hobby plan for personal/non-commercial use; stay within their fair-use limits.
- **Neon / Supabase**: Stay within the free tier (storage and compute limits). For a few users and moderate expense rows, you will not need to pay.

If you later need more capacity, you can upgrade only the database or move to another host; the app stays the same.
