---
description: Review a Next.js project against standard best practices and conventions
allowed-tools: Bash(npx *), Bash(npm *), Bash(pnpm *), Bash(yarn *), Bash(bun *), Bash(node *), Read, Glob, Grep
argument-hint: [--fix] [--verbose] [--skip-build]
---

# Next.js Project Standard Review

Perform a comprehensive review of a Next.js project against standard best practices and conventions.

## Instructions

### 0. Detect Project Setup

Identify the project configuration:

- Read `next.config.js`, `next.config.mjs`, or `next.config.ts` to determine Next.js version and settings
- Read `package.json` for dependencies, scripts, and Next.js version
- Read `tsconfig.json` or `jsconfig.json` for compiler options
- Detect package manager from lock files (`bun.lockb`/`bun.lock` -> bun, `pnpm-lock.yaml` -> pnpm, `yarn.lock` -> yarn, `package-lock.json` -> npm)
- Determine if the project uses App Router (`app/` directory) or Pages Router (`pages/` directory) or both

### 1. Project Structure Review

#### App Router Projects

Check for correct structure:
- `app/layout.tsx` - Root layout exists
- `app/page.tsx` - Root page exists
- `app/loading.tsx` - Loading states where appropriate
- `app/error.tsx` - Error boundaries where appropriate
- `app/not-found.tsx` - Custom 404 page
- Nested layouts follow correct conventions
- Route groups `(groupName)` used appropriately
- Parallel routes and intercepting routes follow conventions

Verify file conventions are correct:
- `page.tsx` for route pages
- `layout.tsx` for layouts
- `template.tsx` for templates
- `loading.tsx` for loading UI
- `error.tsx` for error handling
- `not-found.tsx` for 404
- `route.ts` for API routes (not mixed with `page.tsx` in same segment)

#### Pages Router Projects

Check for correct structure:
- `pages/_app.tsx` - Custom App exists
- `pages/_document.tsx` - Custom Document exists
- `pages/404.tsx` - Custom 404 page
- `pages/api/` - API routes organized properly

### 2. Server vs Client Components (App Router)

Review component boundaries:

- [ ] `"use client"` directive only where needed (event handlers, hooks, browser APIs)
- [ ] Server Components are the default (no unnecessary `"use client"`)
- [ ] No `"use server"` in client components for Server Actions (should be in separate files or inline in server components)
- [ ] Data fetching happens in Server Components, not Client Components
- [ ] Client Components are leaf nodes where possible
- [ ] No importing Server Components into Client Components (pass as children instead)
- [ ] Context providers wrapped in a Client Component wrapper

### 3. Data Fetching Patterns

#### App Router
- [ ] Using `fetch()` with appropriate cache/revalidation options in Server Components
- [ ] `generateStaticParams()` used for static generation where appropriate
- [ ] Proper use of `revalidatePath()` / `revalidateTag()` for on-demand revalidation
- [ ] Server Actions used for mutations (not GET-style API routes)
- [ ] No `getServerSideProps` / `getStaticProps` (those are Pages Router)
- [ ] Parallel data fetching where possible (avoid request waterfalls)
- [ ] `loading.tsx` or `<Suspense>` boundaries for streaming

#### Pages Router
- [ ] Correct use of `getServerSideProps` vs `getStaticProps` vs `getInitialProps`
- [ ] `getStaticPaths` with appropriate `fallback` option
- [ ] No data fetching in `_app.tsx` unless absolutely necessary

### 4. Routing & Navigation

- [ ] Using `<Link>` from `next/link` (not `<a>` tags for internal navigation)
- [ ] `useRouter` imported from correct package (`next/navigation` for App Router, `next/router` for Pages Router)
- [ ] Dynamic routes use proper naming `[param]` / `[...slug]` / `[[...slug]]`
- [ ] Middleware (`middleware.ts`) at project root if used, with correct `matcher` config
- [ ] `redirect()` and `notFound()` used appropriately in Server Components
- [ ] No client-side redirects where server-side would be better

### 5. Image & Asset Optimization

- [ ] Using `<Image>` from `next/image` instead of `<img>` tags
- [ ] Images have `width` and `height` or `fill` prop (no layout shift)
- [ ] `alt` attributes on all images
- [ ] `priority` prop on above-the-fold images (LCP candidates)
- [ ] Static assets in `public/` directory
- [ ] Using `next/font` for font optimization (not external font links in `<head>`)
- [ ] No unoptimized large assets

### 6. Metadata & SEO

#### App Router
- [ ] `metadata` export or `generateMetadata()` in layouts/pages
- [ ] Root layout has proper `<html>` and `<body>` tags
- [ ] `robots.ts` / `sitemap.ts` if production-ready
- [ ] Open Graph images configured

#### Pages Router
- [ ] Using `next/head` or `<Head>` for meta tags
- [ ] Unique titles per page
- [ ] Meta descriptions present

### 7. Performance Review

- [ ] Dynamic imports (`next/dynamic`) for heavy client components
- [ ] No unnecessary bundle bloat (check for large dependencies)
- [ ] Route segment config options used where appropriate (`dynamic`, `revalidate`, `runtime`)
- [ ] Proper use of `React.memo`, `useMemo`, `useCallback` where beneficial
- [ ] No blocking data fetches in layouts (causes waterfall for all child routes)
- [ ] Using `<Suspense>` boundaries for progressive loading

Run bundle analysis if available:
```bash
ANALYZE=true <pm> run build
```

### 8. API Routes Review

#### App Router Route Handlers (`app/**/route.ts`)
- [ ] Proper HTTP method exports (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- [ ] Request validation on inputs
- [ ] Proper error handling with appropriate status codes
- [ ] `NextRequest` and `NextResponse` used correctly
- [ ] No route handler in the same segment as `page.tsx`

#### Pages Router API Routes (`pages/api/`)
- [ ] Input validation present
- [ ] Proper error handling
- [ ] Correct HTTP method checking

### 9. Environment & Configuration

- [ ] Environment variables prefixed with `NEXT_PUBLIC_` only when needed client-side
- [ ] No secrets exposed with `NEXT_PUBLIC_` prefix
- [ ] `.env.local` in `.gitignore`
- [ ] `next.config` has appropriate settings (images domains, redirects, headers)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.) via `next.config` or middleware

### 10. TypeScript & Code Quality

Run automated checks:

```bash
# Type check
npx tsc --noEmit

# Lint (with Next.js specific rules)
npx next lint

# Format check (if prettier/biome configured)
npx prettier --check . 2>/dev/null || npx biome format --check . 2>/dev/null || echo "No formatter detected"
```

Review TypeScript standards:
- [ ] Strict mode enabled in `tsconfig.json`
- [ ] Props interfaces/types defined for all components
- [ ] No `any` types (unless justified)
- [ ] Path aliases configured (`@/*` mapping)

### 11. Build Verification

Skip if `--skip-build` argument provided.

```bash
<pm> run build
```

Check for:
- Build completes without errors
- No excessive warnings
- Static/Dynamic route classification makes sense
- Bundle sizes are reasonable

### 12. Common Anti-Patterns Check

Search for common issues:

- Using `window` or `document` without checking environment or `"use client"`
- Fetching data in `useEffect` when Server Components could be used (App Router)
- Using `getInitialProps` (deprecated pattern)
- Hardcoded API URLs instead of environment variables
- Missing error boundaries
- Using `<a>` instead of `<Link>` for internal links
- Using `<img>` instead of `<Image>` from next/image
- Importing from `next/router` in App Router components
- Large dependencies imported without dynamic import

## Review Output Format

Report results in this format:

```
Next.js Project Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: <name> | Next.js <version> | <App/Pages> Router
Package Manager: <pm>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Category                     Status
─────────────────────────────────────
Project Structure .......... OK / ISSUES (n)
Server/Client Boundary ..... OK / ISSUES (n)
Data Fetching .............. OK / ISSUES (n)
Routing & Navigation ....... OK / ISSUES (n)
Image & Asset Optimization . OK / ISSUES (n)
Metadata & SEO ............. OK / ISSUES (n)
Performance ................ OK / ISSUES (n)
API Routes ................. OK / ISSUES (n) / N/A
Environment & Config ....... OK / ISSUES (n)
TypeScript & Code Quality .. OK / ISSUES (n)
Build ...................... OK / FAILED / SKIPPED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical Issues (must fix):
1. ...

Warnings (should fix):
1. ...

Suggestions (nice to have):
1. ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall: PASS / NEEDS WORK / FAIL
```

When `--verbose` is provided, include file paths and line numbers for every finding.

When `--fix` is provided, auto-fix lint and format issues where possible.

## Arguments

- `--fix` - Auto-fix lint and format issues
- `--verbose` - Show file paths and line numbers for all findings
- `--skip-build` - Skip the build verification step

## When to Use

- Before deploying a Next.js project to production
- When onboarding to an existing Next.js codebase
- After a major Next.js version upgrade
- During code review of significant feature additions
- Periodic health check of project standards
