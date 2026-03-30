---
description: Refine — refactor, optimize, simplify, extract, rename, and modernize code
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [refactor|optimize|simplify|extract|rename|modernize|dead-code] [target]
---

# Refine

Unified command for code refactoring, optimization, simplification, extraction, renaming, modernization, and dead code removal.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `refactor [target]` — Structural refactoring (patterns, architecture)
- `optimize [target]` — Performance optimization
- `simplify [target]` — Reduce complexity
- `extract [target]` — Extract functions, components, modules
- `rename [target]` — Rename for clarity
- `modernize [target]` — Upgrade to modern patterns/syntax
- `dead-code [target]` — Find and remove dead code
- No arguments — Analyze codebase for refinement opportunities

---

## Overview (default, no arguments)

Analyze the codebase for refinement opportunities:

1. **Scan for Code Smells**
   - Long functions (>50 lines)
   - Large files (>300 lines)
   - Deep nesting (>3 levels)
   - Duplicated code
   - Complex conditionals
   - Unused exports/imports

2. **Generate Refinement Report**

```
Refinement Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files Scanned:  42
Issues Found:   15

| Category     | Count | Severity |
|--------------|-------|----------|
| Long funcs   | 4     | Medium   |
| Large files  | 2     | Medium   |
| Deep nesting | 3     | Low      |
| Duplication  | 2     | Medium   |
| Dead code    | 4     | Low      |

Top Priorities:
1. src/services/orderService.ts — 280 lines, 3 long functions
2. src/utils/helpers.ts — duplicated logic with src/lib/format.ts
3. src/components/Dashboard.tsx — deeply nested conditionals

Quick Actions:
  /refine simplify src/services/orderService.ts
  /refine extract src/components/Dashboard.tsx
  /refine dead-code
```

---

## Refactor — Structural Refactoring

### `refactor` — Analyze and suggest refactorings

Read the target file/directory and identify:
- Single Responsibility violations
- God objects/functions
- Feature envy
- Primitive obsession
- Shotgun surgery patterns
- Inappropriate intimacy

### `refactor <file>` — Refactor specific file

1. **Read the file**
2. **Identify issues:**
   - Functions doing too much
   - Mixed abstraction levels
   - Poor separation of concerns
   - Tight coupling
3. **Apply refactorings:**
   - Extract method/function
   - Move method to appropriate module
   - Replace conditional with polymorphism
   - Introduce parameter object
   - Replace magic numbers with constants
4. **Verify** — Ensure tests still pass

### `refactor patterns` — Apply design patterns

Common refactoring patterns:

**Extract Strategy:**
```typescript
// Before: switch/if-else chain
function processPayment(type: string, amount: number) {
  if (type === 'credit') { /* ... */ }
  else if (type === 'debit') { /* ... */ }
  else if (type === 'crypto') { /* ... */ }
}

// After: strategy pattern
const paymentStrategies = {
  credit: processCreditPayment,
  debit: processDebitPayment,
  crypto: processCryptoPayment,
} as const

function processPayment(type: PaymentType, amount: number) {
  return paymentStrategies[type](amount)
}
```

**Replace Temp with Query:**
```typescript
// Before
const basePrice = quantity * itemPrice
const discount = Math.max(0, quantity - 500) * itemPrice * 0.05
const finalPrice = basePrice - discount

// After
function getBasePrice() { return quantity * itemPrice }
function getDiscount() { return Math.max(0, quantity - 500) * itemPrice * 0.05 }
function getFinalPrice() { return getBasePrice() - getDiscount() }
```

**Introduce Parameter Object:**
```typescript
// Before
function createUser(name: string, email: string, age: number, role: string) {}

// After
interface CreateUserInput { name: string; email: string; age: number; role: string }
function createUser(input: CreateUserInput) {}
```

### `refactor dry` — Remove duplication

1. Find duplicated code blocks
2. Extract shared logic into reusable functions
3. Replace duplicates with calls to shared function
4. Verify behavior unchanged

---

## Optimize — Performance Optimization

### `optimize` — Find optimization opportunities

Analyze for:
- N+1 queries
- Unnecessary re-renders (React)
- Missing memoization
- Inefficient loops/iterations
- Large bundle imports
- Missing indexes (database)
- Unnecessary API calls

### `optimize <file>` — Optimize specific file

### `optimize queries` — Database query optimization

Look for:
- N+1 query patterns → batch/join
- Missing `select` specificity → select only needed columns
- Missing pagination → add limit/offset
- Unindexed filters → suggest indexes
- Sequential queries → parallelize with `Promise.all`

```typescript
// Before: N+1
const users = await db.user.findMany()
for (const user of users) {
  user.posts = await db.post.findMany({ where: { userId: user.id } })
}

// After: eager load
const users = await db.user.findMany({
  include: { posts: true }
})
```

### `optimize react` — React performance

Look for:
- Missing `React.memo` on expensive components
- Missing `useMemo`/`useCallback` for expensive computations
- Unnecessary state (derived values)
- Props drilling → context or composition
- Large component re-renders → split components
- Missing `key` prop or wrong keys
- Bundle size (dynamic imports)

```typescript
// Before: recalculates every render
function ProductList({ products, filter }) {
  const filtered = products.filter(p => p.category === filter)
  return filtered.map(p => <ProductCard product={p} />)
}

// After: memoized
function ProductList({ products, filter }) {
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  )
  return filtered.map(p => <ProductCard key={p.id} product={p} />)
}
```

### `optimize bundle` — Bundle size optimization

```bash
# Analyze bundle
npx next build --analyze        # Next.js
npx vite-bundle-visualizer      # Vite
npx webpack-bundle-analyzer     # Webpack
```

Look for:
- Large dependencies (moment → dayjs, lodash → lodash-es)
- Missing tree-shaking (import * → named imports)
- Missing dynamic imports for routes/modals
- Uncompressed assets
- Missing code splitting

### `optimize api` — API performance

Look for:
- Missing caching headers
- Over-fetching data
- Sequential API calls → parallelize
- Missing pagination
- Large payload responses
- Missing compression

---

## Simplify — Reduce Complexity

### `simplify` — Find complexity to reduce

### `simplify <file>` — Simplify specific file

Look for and fix:
- Deep nesting → early returns / guard clauses
- Complex conditionals → extract to named functions
- Long parameter lists → parameter objects
- Boolean parameters → separate functions
- Nested ternaries → if/else or lookup
- Over-engineered abstractions → inline

### `simplify nesting` — Flatten nested code

```typescript
// Before: deeply nested
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        if (order.payment) {
          // actual logic here
        }
      }
    }
  }
}

// After: guard clauses
function processOrder(order) {
  if (!order) return
  if (order.items.length === 0) return
  if (order.status !== 'pending') return
  if (!order.payment) return

  // actual logic here
}
```

### `simplify conditionals` — Simplify boolean logic

```typescript
// Before
if (user !== null && user !== undefined) {
  if (user.role === 'admin' || user.role === 'superadmin') {
    if (user.isActive === true) {
      return true
    }
  }
}
return false

// After
const adminRoles = ['admin', 'superadmin'] as const
return user != null && adminRoles.includes(user.role) && user.isActive
```

### `simplify types` — Simplify TypeScript types

```typescript
// Before: overly complex
type Response<T> = {
  data: T extends Array<infer U> ? U[] : T extends object ? Partial<T> : T
  error: T extends never ? string : string | null
  loading: boolean
}

// After: straightforward
type Response<T> = {
  data: T | null
  error: string | null
  loading: boolean
}
```

---

## Extract — Extract Code

### `extract` — Analyze extraction opportunities

### `extract function <file>` — Extract functions from file

Identify code blocks that:
- Have a clear single purpose
- Are repeated
- Are deeply nested
- Can be named meaningfully
- Are testable in isolation

### `extract component <file>` — Extract React components

Identify JSX blocks that:
- Are reused across components
- Have independent state
- Represent a UI concept (card, list item, form field)
- Are making the parent too large

```typescript
// Before: monolithic component
function Dashboard() {
  return (
    <div>
      <div className="stats">
        <div>{totalRevenue}</div>
        <div>{totalOrders}</div>
        <div>{totalUsers}</div>
      </div>
      <div className="chart">
        {/* 50 lines of chart code */}
      </div>
      <div className="table">
        {/* 80 lines of table code */}
      </div>
    </div>
  )
}

// After: extracted components
function Dashboard() {
  return (
    <div>
      <StatsOverview revenue={totalRevenue} orders={totalOrders} users={totalUsers} />
      <RevenueChart data={chartData} />
      <OrdersTable orders={orders} />
    </div>
  )
}
```

### `extract hook <file>` — Extract custom hooks

Identify logic that:
- Uses multiple useState/useEffect together
- Is shared between components
- Manages a specific concern (form, fetch, pagination)

```typescript
// Before: inline in component
function UserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])
}

// After: extracted hook
function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  return { user, loading, error }
}
```

### `extract module <file>` — Extract module/service

Identify code that:
- Groups related functions
- Has shared dependencies
- Represents a domain concept
- Can be imported independently

### `extract constant <file>` — Extract constants and config

Find and extract:
- Magic numbers → named constants
- Hardcoded strings → constants/enums
- Inline config → configuration objects
- Repeated values → shared constants

---

## Rename — Rename for Clarity

### `rename` — Find naming issues

Scan for:
- Single-letter variables (outside loops)
- Abbreviations that aren't obvious
- Generic names (data, info, result, temp, val)
- Misleading names
- Inconsistent naming conventions

### `rename <file>` — Improve names in file

### `rename conventions` — Check naming conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userName` |
| Functions | camelCase (verb) | `getUserById` |
| Classes | PascalCase | `UserService` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Enums | PascalCase | `OrderStatus` |
| Files (components) | PascalCase | `UserCard.tsx` |
| Files (utils) | camelCase/kebab | `formatDate.ts` |
| CSS classes | kebab-case | `user-card` |
| DB tables | snake_case | `user_profiles` |
| API endpoints | kebab-case | `/api/user-profiles` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |

### Naming Guidelines

**Functions — use verbs:**
```typescript
// Bad                    // Good
userData()                getUser()
check()                   validateEmail()
list()                    fetchOrders()
make()                    createInvoice()
```

**Booleans — use is/has/can/should:**
```typescript
// Bad                    // Good
active                    isActive
permission                hasPermission
edit                      canEdit
notify                    shouldNotify
```

**Collections — use plural:**
```typescript
// Bad                    // Good
item                      items
userList                  users
orderArray                orders
```

---

## Modernize — Upgrade Patterns

### `modernize` — Find modernization opportunities

### `modernize <file>` — Modernize specific file

### `modernize typescript` — TypeScript modernization

```typescript
// Old: type assertions
const el = document.getElementById('app') as HTMLElement

// Modern: non-null assertion or type guard
const el = document.getElementById('app')!
// or: if (!el) throw new Error('Element not found')

// Old: enum
enum Status { Active, Inactive }

// Modern: const object
const Status = { Active: 'active', Inactive: 'inactive' } as const
type Status = typeof Status[keyof typeof Status]

// Old: namespace imports for side effects
import * as _ from 'lodash'

// Modern: named imports
import { debounce, throttle } from 'lodash-es'

// Old: Promise chains
fetchUser(id).then(user => fetchPosts(user.id)).then(posts => render(posts))

// Modern: async/await
const user = await fetchUser(id)
const posts = await fetchPosts(user.id)
render(posts)

// Old: manual type guards
if (typeof value === 'string') {}

// Modern: satisfies, template literals, conditional types
const config = { port: 3000 } satisfies Config
```

### `modernize react` — React modernization

```typescript
// Old: class components → function components
// Old: HOCs → hooks
// Old: render props → hooks
// Old: componentDidMount → useEffect
// Old: setState → useState
// Old: context consumer → useContext
// Old: forwardRef + useImperativeHandle → ref callbacks
// Old: React.FC → plain functions with typed props

// Modern patterns:
// - Server Components (Next.js App Router)
// - Suspense boundaries
// - Error boundaries
// - React.use() for promises
// - useOptimistic for optimistic updates
// - useFormStatus for form states
// - Server Actions
```

### `modernize nextjs` — Next.js modernization

```
Pages Router → App Router:
- pages/ → app/
- getServerSideProps → Server Components
- getStaticProps → Server Components + generateStaticParams
- _app.tsx → layout.tsx
- _document.tsx → layout.tsx (html/body)
- next/router → next/navigation
- next/head → Metadata API
- API routes → Route Handlers
```

### `modernize node` — Node.js modernization

```typescript
// Old: CommonJS
const fs = require('fs')
module.exports = { myFunc }

// Modern: ESM
import fs from 'node:fs'
export { myFunc }

// Old: callbacks
fs.readFile('file.txt', (err, data) => {})

// Modern: promises
const data = await fs.promises.readFile('file.txt', 'utf-8')

// Old: express
// Modern: Hono, Elysia, Fastify

// Old: dotenv
// Modern: --env-file flag (Node 20.6+)

// Old: node-fetch
// Modern: built-in fetch (Node 18+)

// Old: jest
// Modern: vitest, node:test
```

### `modernize css` — CSS modernization

```css
/* Old: media queries for responsive */
/* Modern: container queries */
@container (min-width: 400px) { .card { grid-template-columns: 1fr 1fr; } }

/* Old: calc for spacing */
/* Modern: CSS custom properties + logical properties */
.box { margin-inline: var(--space-4); padding-block: var(--space-2); }

/* Old: flexbox hacks */
/* Modern: gap */
.flex { display: flex; gap: 1rem; }

/* Old: z-index wars */
/* Modern: CSS layers */
@layer base, components, utilities;

/* Old: -webkit prefixes */
/* Modern: most prefixes unnecessary */
```

---

## Dead Code — Remove Unused Code

### `dead-code` — Find all dead code

1. **Unused exports**
   ```bash
   # TypeScript — find unused exports
   npx ts-prune
   # or: npx knip
   ```

2. **Unused dependencies**
   ```bash
   npx depcheck
   # or: npx knip
   ```

3. **Unused files**
   ```bash
   npx knip
   # or: npx unimported
   ```

4. **Unused variables/imports**
   ```bash
   npx eslint . --rule '{"no-unused-vars": "error"}'
   # or: npx biome check --rule noUnusedVariables
   ```

### `dead-code <file>` — Check specific file

### `dead-code remove` — Remove confirmed dead code

1. Identify dead code
2. Verify nothing depends on it
3. Remove it
4. Run tests to confirm nothing breaks

### `dead-code deps` — Remove unused dependencies

```bash
npx depcheck

# Then remove:
npm uninstall <unused-package>
```

### Dead Code Checklist

- [ ] No unused imports
- [ ] No unused variables
- [ ] No unused functions/methods
- [ ] No unused components
- [ ] No unused types/interfaces
- [ ] No commented-out code blocks
- [ ] No unreachable code (after return/throw)
- [ ] No unused dependencies in package.json
- [ ] No unused files
- [ ] No unused CSS classes
- [ ] No unused environment variables
- [ ] No TODO/FIXME without tracking

---

## Arguments

- `$ARGUMENTS` — Subcommand and target. Examples:
  - _(empty)_ — Analyze codebase for refinement opportunities
  - `refactor` / `refactor <file>` / `refactor patterns` / `refactor dry`
  - `optimize` / `optimize <file>` / `optimize queries` / `optimize react` / `optimize bundle` / `optimize api`
  - `simplify` / `simplify <file>` / `simplify nesting` / `simplify conditionals` / `simplify types`
  - `extract` / `extract function <file>` / `extract component <file>` / `extract hook <file>` / `extract module <file>` / `extract constant <file>`
  - `rename` / `rename <file>` / `rename conventions`
  - `modernize` / `modernize <file>` / `modernize typescript` / `modernize react` / `modernize nextjs` / `modernize node` / `modernize css`
  - `dead-code` / `dead-code <file>` / `dead-code remove` / `dead-code deps`

## Output

Code refinement across refactoring, optimization, simplification, extraction, renaming, modernization, and dead code removal.
