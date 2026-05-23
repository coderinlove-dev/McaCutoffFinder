# Migration Guide: SQLite to Supabase/Postgres

This application is designed to be easily migrated from local SQLite to a production Postgres database like Supabase.

## 1. Database Schema
The schema in `database/mca_cutoffs.db` is standard SQL. You can export the SQLite schema and data to Postgres using tools like `pgloader` or by generating a SQL dump and adjusting types (e.g., `AUTOINCREMENT` to `SERIAL`).

## 2. Environment Variables
Update your deployment environment (e.g., Vercel) with:
- `DATABASE_URL`: Your Supabase connection string.

## 3. Code Changes
In `webapp/src/lib/db.ts`:
Replace `better-sqlite3` with a Postgres client like `pg` or an ORM like `Prisma` / `Drizzle`.

Example with `pg`:
```typescript
import { Pool } from 'pg';
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

In `webapp/src/actions/search.ts`:
Update the query syntax if necessary (SQLite and Postgres are largely compatible for simple `SELECT` and `JOIN` queries).

## 4. Deployment
Next.js Server Actions work perfectly on Vercel. Ensure your Postgres database allows connections from Vercel's IP ranges or use the Supabase Connection Pooling feature.
