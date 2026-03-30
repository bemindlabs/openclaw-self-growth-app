---
description: Performance — profile, audit, optimize, benchmark, monitor, and budget
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [profile|audit|optimize|benchmark|monitor|budget] [target]
---

# Performance

Unified command for performance profiling, auditing, optimization, benchmarking, monitoring, and budgets.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `profile [target]` — Runtime profiling and flame graphs
- `audit [target]` — Performance audits (Lighthouse, Web Vitals, bundle)
- `optimize [target]` — Apply performance optimizations
- `benchmark [target]` — Run benchmarks and comparisons
- `monitor [target]` — Performance monitoring and alerting
- `budget [action]` — Performance budgets and enforcement
- No arguments — Show performance overview

---

## Overview (default, no arguments)

Quick performance health check:

```bash
# Bundle size
du -sh .next 2>/dev/null || du -sh dist 2>/dev/null || du -sh build 2>/dev/null

# Dependencies count & size
wc -l package-lock.json 2>/dev/null
npx cost-of-modules --no-install 2>/dev/null | head -15

# Check for heavy deps
cat package.json | grep -E "moment|lodash[^-]|faker|@aws-sdk\"" 2>/dev/null
```

Display format:
```
Performance Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework:    Next.js 15
Build Size:   4.2 MB (.next)
Dependencies: 142 packages

Bundle Analysis:
  JS Total:    320 KB (gzipped)
  CSS Total:   28 KB (gzipped)
  Largest:     react-dom (42 KB), chart.js (38 KB)

Web Vitals (estimated):
  LCP:   < 2.5s    ✓ Good
  FID:   < 100ms   ✓ Good
  CLS:   < 0.1     ✓ Good
  TTFB:  < 800ms   ✓ Good

Quick Actions:
  /perf audit          Run Lighthouse audit
  /perf profile        Profile runtime
  /perf optimize       Apply optimizations
  /perf benchmark      Run benchmarks
```

---

## Profile — Runtime Profiling

### `profile` — Profile application

### `profile server` — Server-side profiling

**Node.js:**
```bash
# CPU profiling
node --prof server.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshot
node --inspect server.js
# Then connect Chrome DevTools

# Built-in profiler
node --cpu-prof --cpu-prof-dir=./profiles server.js

# Clinic.js
npx clinic doctor -- node server.js
npx clinic flame -- node server.js
npx clinic bubbleprof -- node server.js
```

**Identify:**
- Slow middleware
- Database query bottlenecks
- Memory leaks
- Event loop blocking
- CPU-intensive operations

### `profile client` — Client-side profiling

**React Profiler:**
```typescript
import { Profiler } from 'react'

function onRender(id, phase, actualDuration, baseDuration) {
  console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`)
}

<Profiler id="Dashboard" onRender={onRender}>
  <Dashboard />
</Profiler>
```

**React DevTools profiler:**
- Record renders
- Identify unnecessary re-renders
- Find slow components
- Check commit durations

**Why Did You Render:**
```bash
npm install @welldone-software/why-did-you-render --save-dev
```

### `profile api` — API endpoint profiling

```bash
# Response time testing
curl -w "@curl-format.txt" -o /dev/null -s https://api.example.com/endpoint

# Load testing with wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/endpoint

# Load testing with autocannon
npx autocannon -c 100 -d 30 http://localhost:3000/api/endpoint

# k6 load test
k6 run loadtest.js
```

### `profile db` — Database profiling

```sql
-- PostgreSQL: slow query log
SET log_min_duration_statement = 100;  -- log queries > 100ms

-- EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT * FROM users WHERE email = 'test@example.com';

-- pg_stat_statements
SELECT query, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

**Prisma query logging:**
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query (${e.duration}ms): ${e.query}`)
  }
})
```

### `profile memory` — Memory profiling

```bash
# Node.js heap snapshot
node --inspect --max-old-space-size=4096 server.js

# Track memory usage
node -e "setInterval(() => {
  const m = process.memoryUsage()
  console.log('RSS:', (m.rss/1024/1024).toFixed(1), 'MB',
    'Heap:', (m.heapUsed/1024/1024).toFixed(1), '/',
    (m.heapTotal/1024/1024).toFixed(1), 'MB')
}, 5000)"
```

**Memory leak detection:**
- Growing heap over time
- Unreleased event listeners
- Closures holding references
- Global variable accumulation
- Unclosed database connections

---

## Audit — Performance Audits

### `audit` — Full performance audit

### `audit lighthouse` — Lighthouse audit

```bash
# CLI
npx lighthouse http://localhost:3000 --output json --output html --output-path ./lighthouse-report

# Specific categories
npx lighthouse http://localhost:3000 --only-categories=performance

# Mobile
npx lighthouse http://localhost:3000 --preset=perf --emulated-form-factor=mobile

# Desktop
npx lighthouse http://localhost:3000 --preset=desktop
```

### `audit vitals` — Core Web Vitals audit

| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | < 800ms | 800-1800ms | > 1800ms |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8-3.0s | > 3.0s |

**Measure in code:**
```typescript
import { onLCP, onINP, onCLS, onTTFB, onFCP } from 'web-vitals'

onLCP(console.log)
onINP(console.log)
onCLS(console.log)
onTTFB(console.log)
onFCP(console.log)
```

### `audit bundle` — Bundle size audit

```bash
# Next.js
ANALYZE=true npx next build
# Requires @next/bundle-analyzer

# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer stats.json

# Package size check
npx bundlephobia <package-name>

# Import cost
npx import-cost
```

**Bundle report:**
```
Bundle Size Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total JS:     320 KB (gzipped)
Total CSS:    28 KB (gzipped)

Top 10 Modules:
| Module          | Size (gz) | % of Total |
|-----------------|-----------|------------|
| react-dom       | 42 KB     | 13.1%      |
| chart.js        | 38 KB     | 11.9%      |
| date-fns        | 22 KB     | 6.9%       |
| @radix-ui       | 18 KB     | 5.6%       |
| framer-motion   | 15 KB     | 4.7%       |

Route Sizes:
| Route           | JS (gz) | First Load |
|-----------------|---------|------------|
| /               | 12 KB   | 85 KB      |
| /dashboard      | 45 KB   | 118 KB     |
| /settings       | 8 KB    | 81 KB      |
```

### `audit images` — Image optimization audit

Scan for:
- [ ] Unoptimized images (no next/image or equivalent)
- [ ] Missing width/height (causes CLS)
- [ ] Large images served to small viewports
- [ ] Missing lazy loading for below-fold images
- [ ] No WebP/AVIF format
- [ ] Missing responsive srcset
- [ ] Missing blur placeholder
- [ ] SVGs that should be inlined

### `audit fonts` — Font loading audit

Check:
- [ ] `font-display: swap` or `optional`
- [ ] Preloaded critical fonts
- [ ] Subset fonts (only needed characters)
- [ ] Self-hosted vs CDN
- [ ] Variable fonts instead of multiple weights
- [ ] No FOIT (flash of invisible text)
- [ ] No FOUT (flash of unstyled text) if critical

### `audit network` — Network performance audit

```bash
# Check response headers
curl -I https://example.com

# Check compression
curl -H "Accept-Encoding: gzip,br" -I https://example.com

# Check caching
curl -I https://example.com/static/main.js | grep -i cache
```

Check:
- [ ] Gzip/Brotli compression enabled
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Appropriate cache headers
- [ ] CDN for static assets
- [ ] Preconnect to critical origins
- [ ] DNS prefetch for third-party origins
- [ ] No render-blocking resources

---

## Optimize — Apply Optimizations

### `optimize` — Suggest and apply optimizations

### `optimize images` — Optimize images

```bash
# Convert to WebP
npx sharp-cli -i src/images/*.{png,jpg} -o dist/images/ --format webp --quality 80

# Optimize SVGs
npx svgo -f src/icons/ -o dist/icons/
```

**Next.js Image component:**
```typescript
import Image from 'next/image'

// Before
<img src="/photo.jpg" />

// After
<Image
  src="/photo.jpg"
  width={800}
  height={600}
  alt="Description"
  placeholder="blur"
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isAboveFold}
/>
```

### `optimize bundle` — Reduce bundle size

**Dynamic imports:**
```typescript
// Before: loaded on every page
import { HeavyChart } from '@/components/HeavyChart'

// After: loaded on demand
import dynamic from 'next/dynamic'
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

**Tree-shakeable imports:**
```typescript
// Bad: imports entire library
import _ from 'lodash'
_.debounce(fn, 300)

// Good: imports only what's needed
import debounce from 'lodash-es/debounce'
debounce(fn, 300)
```

**Replace heavy deps:**
| Heavy | Lighter Alternative | Savings |
|-------|-------------------|---------|
| moment | dayjs | ~95% |
| lodash | lodash-es (tree-shake) or native | ~90% |
| faker | @faker-js/faker (dev only) | 100% prod |
| axios | fetch (native) | ~15KB |
| uuid | crypto.randomUUID() | ~3KB |
| classnames | clsx | ~1KB |

### `optimize react` — React rendering optimization

```typescript
// Memoize expensive components
const MemoizedList = React.memo(ItemList)

// Memoize expensive computations
const filtered = useMemo(() =>
  items.filter(i => i.status === filter),
  [items, filter]
)

// Stable callback references
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual'

// Debounce search input
const debouncedSearch = useDeferredValue(searchTerm)

// Suspense for data loading
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>

// Transition for non-urgent updates
const [isPending, startTransition] = useTransition()
startTransition(() => setFilter(newFilter))
```

### `optimize css` — CSS optimization

```bash
# Purge unused CSS (Tailwind)
# Already handled by Tailwind JIT

# Critical CSS extraction
npx critical http://localhost:3000 --base dist --inline

# CSS minification (usually handled by build tools)
```

**Reduce layout shifts:**
```css
/* Reserve space for dynamic content */
.image-container { aspect-ratio: 16 / 9; }
.ad-slot { min-height: 250px; }

/* Prevent font swap shifts */
@font-face {
  font-family: 'CustomFont';
  font-display: optional;
  size-adjust: 100%;
}

/* Contain layout reflow */
.card { contain: layout style; }
```

### `optimize api` — API optimization

```typescript
// Parallel requests
const [users, posts, stats] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchStats()
])

// Response caching
export async function GET(request: Request) {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}

// Pagination
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at')  // Only needed fields
  .range(offset, offset + limit - 1)
  .order('created_at', { ascending: false })

// Database indexing
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);
```

### `optimize nextjs` — Next.js specific optimizations

```typescript
// next.config.js
module.exports = {
  // Compress responses
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },

  // Optimize packages
  experimental: {
    optimizePackageImports: ['@radix-ui', 'lucide-react', 'date-fns'],
  },

  // Headers
  async headers() {
    return [{
      source: '/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }]
  }
}
```

**Server Components (default in App Router):**
```typescript
// Server Component — zero client JS
async function PostList() {
  const posts = await db.post.findMany()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

// Client Component — only when needed
'use client'
function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>Like</button>
}
```

### `optimize db` — Database optimization

```sql
-- Missing indexes
SELECT schemaname, relname, seq_scan, idx_scan,
  CASE WHEN seq_scan > 0 THEN round(idx_scan::numeric / seq_scan, 2) ELSE 0 END AS ratio
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC;

-- Unused indexes (remove for write performance)
SELECT indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%pkey%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Table bloat
SELECT schemaname, relname, n_dead_tup, n_live_tup,
  round(n_dead_tup::numeric / GREATEST(n_live_tup, 1) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Connection pooling
-- Use PgBouncer or Supabase connection pooler
```

---

## Benchmark — Benchmarking

### `benchmark` — Run benchmarks

### `benchmark api` — API endpoint benchmarks

```bash
# wrk
wrk -t4 -c100 -d10s http://localhost:3000/api/endpoint

# autocannon
npx autocannon -c 100 -d 10 -p 10 http://localhost:3000/api/endpoint

# k6
k6 run --vus 50 --duration 30s benchmark.js

# hey
hey -n 1000 -c 50 http://localhost:3000/api/endpoint
```

**Benchmark report:**
```
API Benchmark Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint: GET /api/users
Duration: 10s, Connections: 100

| Metric      | Value     |
|-------------|-----------|
| Requests/s  | 2,450     |
| Avg Latency | 41ms      |
| P50         | 38ms      |
| P95         | 85ms      |
| P99         | 142ms     |
| Max         | 320ms     |
| Errors      | 0 (0%)    |
| Throughput  | 12.4 MB/s |
```

### `benchmark function` — Function benchmarks

```typescript
// Using tinybench
import { Bench } from 'tinybench'

const bench = new Bench({ time: 1000 })

bench
  .add('JSON.parse', () => JSON.parse('{"key":"value"}'))
  .add('structuredClone', () => structuredClone({ key: 'value' }))

await bench.run()
console.table(bench.table())
```

### `benchmark build` — Build time benchmark

```bash
# Next.js build
time npx next build

# Measure with hyperfine
hyperfine --warmup 1 'npx next build'
```

### `benchmark compare` — Before/after comparison

```
Performance Comparison
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Metric          | Before  | After   | Change  |
|-----------------|---------|---------|---------|
| Bundle (gz)     | 380 KB  | 320 KB  | -15.8%  |
| LCP             | 3.2s    | 2.1s    | -34.4%  |
| INP             | 250ms   | 120ms   | -52.0%  |
| Build time      | 45s     | 32s     | -28.9%  |
| API p95         | 120ms   | 85ms    | -29.2%  |
| Memory (RSS)    | 210 MB  | 165 MB  | -21.4%  |
```

---

## Monitor — Performance Monitoring

### `monitor` — Setup monitoring

### `monitor vitals` — Core Web Vitals monitoring

```typescript
// Report to analytics
import { onLCP, onINP, onCLS } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  })
  navigator.sendBeacon('/api/vitals', body)
}

onLCP(sendToAnalytics)
onINP(sendToAnalytics)
onCLS(sendToAnalytics)
```

### `monitor errors` — Error rate monitoring

```typescript
// Track error rates
window.addEventListener('error', (event) => {
  reportError({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    stack: event.error?.stack,
  })
})

window.addEventListener('unhandledrejection', (event) => {
  reportError({
    message: event.reason?.message || 'Unhandled rejection',
    stack: event.reason?.stack,
  })
})
```

### `monitor api` — API latency monitoring

```typescript
// Middleware for API timing
export function withTiming(handler) {
  return async (req, res) => {
    const start = performance.now()
    const result = await handler(req, res)
    const duration = performance.now() - start

    res.headers.set('Server-Timing', `total;dur=${duration.toFixed(2)}`)

    if (duration > 1000) {
      console.warn(`Slow API: ${req.url} took ${duration.toFixed(0)}ms`)
    }

    return result
  }
}
```

### `monitor resources` — Resource monitoring

```bash
# Memory usage over time
watch -n 5 'ps aux | grep node | grep -v grep'

# Docker container stats
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### `monitor alerts` — Performance alerting

Define alert thresholds:
```json
{
  "alerts": {
    "lcp": { "warning": 2500, "critical": 4000 },
    "inp": { "warning": 200, "critical": 500 },
    "cls": { "warning": 0.1, "critical": 0.25 },
    "apiP95": { "warning": 500, "critical": 2000 },
    "errorRate": { "warning": 1, "critical": 5 },
    "memoryMB": { "warning": 512, "critical": 1024 }
  }
}
```

---

## Budget — Performance Budgets

### `budget` — Check performance budgets

### `budget set` — Define budgets

Create `.perf-budget.json`:
```json
{
  "budgets": {
    "bundle": {
      "js": "350 KB",
      "css": "50 KB",
      "total": "400 KB",
      "perRoute": "130 KB"
    },
    "vitals": {
      "lcp": "2.5s",
      "inp": "200ms",
      "cls": 0.1,
      "ttfb": "800ms",
      "fcp": "1.8s"
    },
    "api": {
      "p50": "100ms",
      "p95": "500ms",
      "p99": "1000ms"
    },
    "build": {
      "time": "60s",
      "imageSize": "500 MB"
    },
    "dependencies": {
      "count": 150,
      "maxSingleSize": "50 KB"
    }
  }
}
```

### `budget check` — Validate against budgets

```
Performance Budget Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Category   | Metric     | Budget  | Actual  | Status  |
|------------|-----------|---------|---------|---------|
| Bundle     | JS (gz)   | 350 KB  | 320 KB  | ✓ PASS  |
| Bundle     | CSS (gz)  | 50 KB   | 28 KB   | ✓ PASS  |
| Bundle     | Per route | 130 KB  | 118 KB  | ✓ PASS  |
| Vitals     | LCP       | 2.5s    | 2.1s    | ✓ PASS  |
| Vitals     | INP       | 200ms   | 120ms   | ✓ PASS  |
| Vitals     | CLS       | 0.1     | 0.05    | ✓ PASS  |
| API        | p95       | 500ms   | 85ms    | ✓ PASS  |
| Build      | Time      | 60s     | 45s     | ✓ PASS  |
| Deps       | Count     | 150     | 142     | ✓ PASS  |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ALL BUDGETS MET
```

### `budget ci` — CI integration

```yaml
# GitHub Actions
- name: Performance Budget Check
  run: |
    npx next build
    npx bundlesize
    npx lighthouse-ci autorun
```

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["warning", { "maxNumericValue": 400000 }]
      }
    }
  }
}
```

### `budget trend` — Track budget trends over time

```
Budget Trend (last 5 builds)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JS Bundle (gz):
  Budget: -------- 350 KB --------
  Feb 20: ██████████████████ 295 KB
  Feb 21: ███████████████████ 302 KB
  Feb 22: ████████████████████ 318 KB
  Feb 23: ███████████████████ 310 KB
  Feb 25: ███████████████████ 320 KB  ← current

Trend: +8.5% over 5 builds (within budget)
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and target. Examples:
  - _(empty)_ — Show performance overview
  - `profile` / `profile server` / `profile client` / `profile api` / `profile db` / `profile memory`
  - `audit` / `audit lighthouse` / `audit vitals` / `audit bundle` / `audit images` / `audit fonts` / `audit network`
  - `optimize` / `optimize images` / `optimize bundle` / `optimize react` / `optimize css` / `optimize api` / `optimize nextjs` / `optimize db`
  - `benchmark` / `benchmark api` / `benchmark function` / `benchmark build` / `benchmark compare`
  - `monitor` / `monitor vitals` / `monitor errors` / `monitor api` / `monitor resources` / `monitor alerts`
  - `budget` / `budget set` / `budget check` / `budget ci` / `budget trend`

## Output

Performance management across profiling, auditing, optimization, benchmarking, monitoring, and budget enforcement.
