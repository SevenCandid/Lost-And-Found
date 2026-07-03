# Supabase Migrations

This directory follows the [Supabase local development](https://supabase.com/docs/guides/cli/local-development) migration format.

## Files

| File | Description |
|------|-------------|
| `20240101000000_initial_schema.sql` | Initial production schema — tables, enums, indexes, triggers, RLS, storage buckets, seed data |

## How to Run

### Option A: Supabase SQL Editor (recommended for hosted projects)
1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file and paste it in
4. Click **Run**

### Option B: Supabase CLI (local development)
```bash
supabase db push
```

### Verifying the Migration
After running, uncomment and execute the queries in **Section 11** of the migration file to confirm all tables, triggers, functions, and indexes were created correctly.

## Schema Overview

```
institutions  ──┬── users ──┬── items ──── claims
                │            │              │
                │            └── notifications (via triggers)
                │
                └── activity_logs (auto-populated via triggers)
```

## Re-Running (Idempotency)
The migration script is fully idempotent. Section 1 performs a clean teardown before recreating everything. You can safely re-run it at any time during development.
