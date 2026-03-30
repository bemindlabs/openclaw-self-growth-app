---
description: API — design, routes, validation, auth, testing, docs, and versioning
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [design|routes|validate|auth|test|docs|version|debug] [action]
---

# API

Unified command for API design, route management, validation, authentication, testing, documentation, and versioning.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `design [action]` — API design and architecture
- `routes [action]` — Route management and scaffolding
- `validate [action]` — Request/response validation
- `auth [action]` — Authentication and authorization
- `test [action]` — API testing
- `docs [action]` — API documentation (OpenAPI/Swagger)
- `version [action]` — API versioning
- `debug [action]` — API debugging and troubleshooting
- No arguments — Show API overview

---

## Overview (default, no arguments)

Show API project status:

```bash
# Detect framework
grep -E "next|hono|express|fastify|elysia|nestjs" package.json 2>/dev/null

# Find API routes
find . -path "*/api/*" -name "*.ts" ! -path "*/node_modules/*" | head -20

# Count endpoints
find . -path "*/api/*" -name "route.ts" ! -path "*/node_modules/*" | wc -l
```

Display format:
```
API Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework:   Next.js Route Handlers
Base URL:    /api
Endpoints:   24
Auth:        JWT (Supabase)
Validation:  Zod

Routes:
  GET    /api/users          List users
  POST   /api/users          Create user
  GET    /api/users/[id]     Get user
  PATCH  /api/users/[id]     Update user
  DELETE /api/users/[id]     Delete user
  ...

Quick Actions:
  /api routes               List all routes
  /api design resource      Design new resource
  /api test                 Run API tests
  /api docs                 Generate docs
```

---

## Design — API Design

### `design` — API design review

Review API against REST best practices:

**Naming Conventions:**
- [ ] Plural nouns for resources (`/users` not `/user`)
- [ ] Kebab-case for multi-word (`/user-profiles`)
- [ ] No verbs in URLs (`POST /users` not `/createUser`)
- [ ] Nested resources for relationships (`/users/:id/posts`)
- [ ] Query params for filtering (`/users?role=admin`)

**HTTP Methods:**
| Method | Usage | Idempotent |
|--------|-------|-----------|
| GET | Read resource(s) | Yes |
| POST | Create resource | No |
| PUT | Full replace | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

**Status Codes:**
| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (no/invalid auth) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

**Response Format:**
```typescript
// Success
{ "data": { ... } }
{ "data": [...], "meta": { "total": 100, "page": 1, "limit": 20 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### `design resource <name>` — Design a new resource API

Generate CRUD endpoints for a resource:

```
Resource: users

  GET    /api/users              List (paginated, filterable)
  POST   /api/users              Create
  GET    /api/users/:id          Get by ID
  PATCH  /api/users/:id          Update
  DELETE /api/users/:id          Delete

Query params:
  ?page=1&limit=20              Pagination
  ?sort=created_at&order=desc   Sorting
  ?search=john                  Search
  ?role=admin                   Filter

Relations:
  GET    /api/users/:id/posts    User's posts
```

### `design pagination` — Pagination patterns

**Offset-based:**
```typescript
// Request
GET /api/posts?page=2&limit=20

// Response
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Cursor-based:**
```typescript
// Request
GET /api/posts?cursor=abc123&limit=20

// Response
{
  "data": [...],
  "meta": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

### `design errors` — Error handling design

```typescript
// Consistent error response
interface ApiError {
  error: {
    code: string        // Machine-readable: "VALIDATION_ERROR"
    message: string     // Human-readable: "Invalid email format"
    details?: unknown[] // Field-level errors
    requestId?: string  // For debugging
  }
}

// Error codes
const ErrorCodes = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const
```

---

## Routes — Route Management

### `routes` or `routes ls` — List all routes

```bash
find . -path "*/api/*" -name "route.ts" ! -path "*/node_modules/*" | sort
```

### `routes create <resource>` — Scaffold route handlers

**Next.js Route Handler:**
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { total: count, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors }
    }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
```

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('users')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 })

  return NextResponse.json(null, { status: 204 })
}
```

### `routes middleware` — Middleware patterns

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting header
  const response = NextResponse.next()
  response.headers.set('X-Request-Id', crypto.randomUUID())
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## Validate — Request Validation

### `validate` — Validation setup

### `validate schemas` — Common Zod schemas

```typescript
// lib/validations/user.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
})

export const updateUserSchema = createUserSchema.partial()

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'name', 'email']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersQuery = z.infer<typeof listUsersSchema>
```

### `validate helper` — Validation helper

```typescript
// lib/api/validate.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export async function validateBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  const body = await request.json().catch(() => null)
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: result.error.flatten().fieldErrors,
      }
    }, { status: 400 })
  }

  return result.data
}

export function validateQuery<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> | NextResponse {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const result = schema.safeParse(params)

  if (!result.success) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: result.error.flatten().fieldErrors,
      }
    }, { status: 400 })
  }

  return result.data
}
```

---

## Auth — Authentication

### `auth` — Auth overview

### `auth middleware` — Auth middleware

```typescript
// lib/api/auth.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: User) => Promise<NextResponse>
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  return handler(request, user)
}

// Usage
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // user is authenticated
    return NextResponse.json({ data: user })
  })
}
```

### `auth api-key` — API key authentication

```typescript
export function withApiKey(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
      { status: 401 }
    )
  }

  return handler(request)
}
```

### `auth rate-limit` — Rate limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    )
  }

  return handler(request)
}
```

---

## Test — API Testing

### `test` — Run API tests

```bash
npx vitest run tests/api/
```

### `test endpoint` — Test specific endpoint

```typescript
// tests/api/users.test.ts
import { describe, it, expect } from 'vitest'

describe('GET /api/users', () => {
  it('returns paginated users', async () => {
    const res = await fetch('http://localhost:3000/api/users?page=1&limit=10')
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toBeInstanceOf(Array)
    expect(json.meta).toHaveProperty('total')
    expect(json.meta).toHaveProperty('page', 1)
  })

  it('returns 401 without auth', async () => {
    const res = await fetch('http://localhost:3000/api/users')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/users', () => {
  it('creates user with valid data', async () => {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com' }),
    })
    expect(res.status).toBe(201)
  })

  it('returns 400 with invalid data', async () => {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })
})
```

### `test load` — Load testing

```bash
# autocannon
npx autocannon -c 100 -d 30 -p 10 http://localhost:3000/api/users

# k6
k6 run --vus 50 --duration 30s loadtest.js

# wrk
wrk -t4 -c100 -d30s http://localhost:3000/api/users
```

### `test contract` — Contract testing

Validate API responses match expected schema.

---

## Docs — API Documentation

### `docs` — Generate API docs

### `docs openapi` — Generate OpenAPI spec

```typescript
// lib/openapi.ts
import { createDocument } from 'zod-openapi'

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development' },
    { url: 'https://api.myapp.com', description: 'Production' },
  ],
})
```

### `docs swagger` — Swagger UI setup

```bash
npm install swagger-ui-react
```

### `docs postman` — Export Postman collection

### `docs review` — Review API documentation completeness

- [ ] All endpoints documented
- [ ] Request/response examples
- [ ] Error responses documented
- [ ] Authentication described
- [ ] Rate limits documented
- [ ] Pagination explained
- [ ] Versioning explained

---

## Version — API Versioning

### `version` — Current versioning strategy

### `version strategies` — Versioning approaches

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| URL path | `/api/v1/users` | Clear, easy to route | URL changes |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Hidden |
| Query param | `/api/users?version=1` | Simple | Easy to miss |

**Recommended: URL path**
```
/api/v1/users    → Current stable
/api/v2/users    → Next version
```

---

## Debug — API Debugging

### `debug` — Debug API issues

### `debug request` — Debug specific request

```bash
# Verbose curl
curl -v http://localhost:3000/api/users

# With timing
curl -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" \
  -o /dev/null -s http://localhost:3000/api/users

# With headers
curl -i http://localhost:3000/api/users
```

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check middleware CORS headers |
| 401 on valid token | Check token expiry, refresh flow |
| 500 on valid request | Check server logs, DB connection |
| Slow response | Profile DB queries, add indexes |
| Request too large | Check body size limits |
| Rate limited | Check rate limit config |

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show API overview
  - `design` / `design resource <name>` / `design pagination` / `design errors`
  - `routes` / `routes ls` / `routes create <name>` / `routes middleware`
  - `validate` / `validate schemas` / `validate helper`
  - `auth` / `auth middleware` / `auth api-key` / `auth rate-limit`
  - `test` / `test endpoint` / `test load` / `test contract`
  - `docs` / `docs openapi` / `docs swagger` / `docs postman` / `docs review`
  - `version` / `version strategies`
  - `debug` / `debug request`

## Output

API management across design, routes, validation, authentication, testing, documentation, and versioning.
