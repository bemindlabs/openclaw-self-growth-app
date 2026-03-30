---
description: Prisma ORM — schema, migrations, database, client, seed, studio, and troubleshooting
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [schema|migrate|db|generate|seed|studio|debug] [action]
---

# Prisma ORM

Unified command for Prisma schema management, migrations, database operations, client generation, and troubleshooting.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `schema [action]` — Schema management (init, validate, format, review)
- `migrate [action]` — Migration management (create, apply, reset, status)
- `db [action]` — Database operations (push, pull, seed, studio)
- `generate` — Generate Prisma Client
- `seed [action]` — Seed data management
- `studio` — Launch Prisma Studio
- `debug [action]` — Troubleshooting and diagnostics
- No arguments — Show Prisma project overview

---

## Overview (default, no arguments)

Show Prisma project status:

```bash
# Check Prisma version
npx prisma --version

# Validate schema
npx prisma validate

# Migration status
npx prisma migrate status
```

Display format:
```
Prisma Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Version:     prisma x.x.x
Schema:      prisma/schema.prisma
Provider:    postgresql | mysql | sqlite | mongodb | sqlserver | cockroachdb
Database:    connected
Migrations:  3 applied, 0 pending

Models:      User, Post, Comment (3 total)
Enums:       Role, Status (2 total)
Relations:   5 defined

Quick Actions:
  /prisma schema       Review schema
  /prisma migrate dev  Create migration
  /prisma generate     Generate client
  /prisma studio       Open Studio
```

---

## Schema — Schema Management

### `schema` or `schema review` — Review current schema

1. **Read Schema**
   ```bash
   cat prisma/schema.prisma
   ```

2. **Review Checklist**

   **Data Modeling:**
   - [ ] Models have appropriate fields and types
   - [ ] Primary keys defined (`@id`)
   - [ ] Unique constraints where needed (`@unique`, `@@unique`)
   - [ ] Default values set (`@default`)
   - [ ] Optional fields marked (`?`)

   **Relations:**
   - [ ] Relations properly defined (1:1, 1:N, M:N)
   - [ ] Foreign keys with `@relation`
   - [ ] Referential actions set (`onDelete`, `onUpdate`)
   - [ ] No circular dependencies

   **Indexes:**
   - [ ] Indexes on frequently queried fields (`@@index`)
   - [ ] Composite indexes where needed
   - [ ] Full-text search indexes if applicable

   **Naming:**
   - [ ] PascalCase model names
   - [ ] camelCase field names
   - [ ] `@map` / `@@map` for database naming conventions

   **Security:**
   - [ ] Sensitive fields identified
   - [ ] No secrets in schema
   - [ ] Proper field-level access patterns

### `schema init` — Initialize Prisma in project

```bash
npx prisma init
# or with specific provider:
npx prisma init --datasource-provider postgresql
npx prisma init --datasource-provider mysql
npx prisma init --datasource-provider sqlite
npx prisma init --datasource-provider mongodb
```

Creates:
- `prisma/schema.prisma` — Schema file
- `.env` — DATABASE_URL placeholder

### `schema validate` — Validate schema

```bash
npx prisma validate
```

### `schema format` — Format schema file

```bash
npx prisma format
```

### `schema visualize` — Show schema structure

Read and summarize the schema:
- List all models with field counts
- List all enums
- Map all relations
- Identify indexes

### Schema Best Practices

| Practice | Example |
|----------|---------|
| Use `@id` with `@default` | `id String @id @default(cuid())` |
| Timestamps | `createdAt DateTime @default(now())` |
| Soft delete | `deletedAt DateTime?` |
| Map to snake_case | `@@map("user_profiles")` |
| Composite unique | `@@unique([email, tenantId])` |
| Index for queries | `@@index([status, createdAt])` |

### Common Field Patterns

```prisma
// Primary key patterns
id        String   @id @default(cuid())
id        String   @id @default(uuid())
id        Int      @id @default(autoincrement())

// Timestamps
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Soft delete
deletedAt DateTime?

// JSON data
metadata  Json     @default("{}")

// Enum field
role      Role     @default(USER)
```

---

## Migrate — Migration Management

### `migrate dev` — Create and apply migration (development)

```bash
npx prisma migrate dev --name <migration-name>
```

Naming conventions:
```bash
npx prisma migrate dev --name init
npx prisma migrate dev --name add_user_email_index
npx prisma migrate dev --name create_posts_table
npx prisma migrate dev --name add_role_enum
npx prisma migrate dev --name remove_legacy_fields
```

### `migrate deploy` — Apply pending migrations (production)

```bash
npx prisma migrate deploy
```

### `migrate status` — Check migration status

```bash
npx prisma migrate status
```

### `migrate reset` — Reset database (development only)

```bash
npx prisma migrate reset
# Drops database, recreates, applies all migrations, runs seed
```

### `migrate resolve` — Resolve failed migration

```bash
# Mark as applied
npx prisma migrate resolve --applied <migration-name>

# Mark as rolled back
npx prisma migrate resolve --rolled-back <migration-name>
```

### `migrate diff` — Show schema diff

```bash
# Diff between schema and database
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma

# Diff between migrations and schema
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma
```

### Migration Workflow

```
1. Edit schema.prisma
2. npx prisma migrate dev --name descriptive_name
3. Review generated SQL in prisma/migrations/
4. Test with npx prisma migrate reset
5. Commit migration files
6. Deploy with npx prisma migrate deploy
```

### Migration Naming Convention

| Change | Name |
|--------|------|
| Initial | `init` |
| Add table | `create_<table>_table` |
| Add column | `add_<column>_to_<table>` |
| Remove column | `remove_<column>_from_<table>` |
| Add index | `add_<table>_<columns>_index` |
| Add enum | `add_<enum>_enum` |
| Rename | `rename_<old>_to_<new>` |
| Add relation | `add_<table>_<relation>_relation` |

---

## DB — Database Operations

### `db push` — Push schema to database (no migration)

```bash
npx prisma db push
```

Use for:
- Prototyping
- Schema iterations without migration history
- MongoDB (no migrations support)

### `db pull` — Introspect database into schema

```bash
npx prisma db pull
```

Use for:
- Importing existing database
- Syncing schema from database changes
- Brownfield projects

### `db seed` — Run seed script

```bash
npx prisma db seed
```

Requires `prisma.seed` in `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### `db execute` — Execute raw SQL

```bash
npx prisma db execute --file prisma/script.sql --schema prisma/schema.prisma
```

---

## Generate — Generate Prisma Client

### `generate` — Generate client from schema

```bash
npx prisma generate
```

After generation:
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

### Client Best Practices

**Singleton pattern:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Logging:**
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

---

## Seed — Seed Data Management

### `seed` — Run seed script

```bash
npx prisma db seed
```

### `seed create` — Create seed file template

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Create seed data
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      posts: {
        create: [
          { title: 'First Post', content: 'Hello World' },
        ],
      },
    },
  })

  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### `seed reset` — Reset and reseed

```bash
npx prisma migrate reset
# Automatically runs seed after reset
```

---

## Studio — Prisma Studio

### `studio` — Launch Prisma Studio

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### `studio --port` — Custom port

```bash
npx prisma studio --port 5556
```

---

## Debug — Troubleshooting

### `debug` — Run diagnostics

1. **Check Installation**
   ```bash
   npx prisma --version
   node --version
   ```

2. **Validate Schema**
   ```bash
   npx prisma validate
   ```

3. **Check Database Connection**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1"
   ```

4. **Migration Status**
   ```bash
   npx prisma migrate status
   ```

5. **Check Generated Client**
   ```bash
   ls node_modules/.prisma/client/
   ```

### `debug connection` — Test database connection

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# Validate schema against database
npx prisma validate
```

### `debug engine` — Check Prisma engines

```bash
npx prisma --version
ls node_modules/@prisma/engines/
ls node_modules/.prisma/client/
```

### `debug reset` — Full reset (development)

```bash
# Remove generated files
rm -rf node_modules/.prisma

# Regenerate
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Schema validation error | `npx prisma validate` — fix reported errors |
| Client out of sync | `npx prisma generate` after schema changes |
| Migration drift | `npx prisma migrate dev` to reconcile |
| Connection refused | Check DATABASE_URL in `.env` |
| Engine not found | `npm install @prisma/client` |
| Type errors after change | `npx prisma generate` to regenerate types |
| Shadow database error | Grant CREATE DATABASE permission |
| Migration failed | `npx prisma migrate resolve` to mark status |
| Slow queries | Add `@@index` to schema, enable query logging |
| Timeout errors | Increase `connect_timeout` in connection string |

### Environment Variables

```bash
# Connection string
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?schema=public"

# Direct URL (for migrations with connection pooling)
DIRECT_URL="postgresql://user:pass@localhost:5432/mydb?schema=public"

# Debug logging
DEBUG="prisma:*"

# Engine type
PRISMA_CLIENT_ENGINE_TYPE="binary"  # or "library"
```

### Connection String Formats

```bash
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# MySQL
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"

# SQLite
DATABASE_URL="file:./dev.db"

# MongoDB
DATABASE_URL="mongodb+srv://USER:PASSWORD@HOST/DATABASE"

# SQL Server
DATABASE_URL="sqlserver://HOST:1433;database=DATABASE;user=USER;password=PASSWORD"

# CockroachDB
DATABASE_URL="postgresql://USER:PASSWORD@HOST:26257/DATABASE?sslmode=verify-full"
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Prisma overview
  - `schema` / `schema init` / `schema validate` / `schema format` / `schema review` / `schema visualize`
  - `migrate dev --name <name>` / `migrate deploy` / `migrate status` / `migrate reset` / `migrate resolve` / `migrate diff`
  - `db push` / `db pull` / `db seed` / `db execute`
  - `generate` — Generate Prisma Client
  - `seed` / `seed create` / `seed reset`
  - `studio` / `studio --port 5556`
  - `debug` / `debug connection` / `debug engine` / `debug reset`

## Output

Prisma ORM management across schema, migrations, database operations, client generation, seeding, and troubleshooting.
