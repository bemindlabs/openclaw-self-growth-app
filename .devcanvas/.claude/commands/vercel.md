---
description: Vercel — deploy, domains, env, logs, projects, and troubleshooting
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [deploy|domains|env|logs|project|debug] [action]
---

# Vercel

Unified command for Vercel deployments, domain management, environment variables, logs, project configuration, and troubleshooting.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `deploy [action]` — Deploy and manage deployments
- `domains [action]` — Domain and DNS management
- `env [action]` — Environment variable management
- `logs [action]` — View deployment and function logs
- `project [action]` — Project configuration
- `debug [action]` — Troubleshooting and diagnostics
- No arguments — Show Vercel project overview

---

## Overview (default, no arguments)

Show Vercel project status:

```bash
# Check Vercel CLI version
vercel --version

# Show current project info
vercel project ls

# Show recent deployments
vercel ls --limit 5

# Check linked project
vercel inspect
```

Display format:
```
Vercel Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project:     my-app
Framework:   Next.js
Team:        my-team
Region:      iad1

Latest Deployment:
  URL:       https://my-app-abc123.vercel.app
  Status:    Ready
  Branch:    main
  Created:   2 hours ago

Domains:
  my-app.com (production)
  staging.my-app.com (preview)

Quick Actions:
  /vercel deploy         Deploy to preview
  /vercel deploy --prod  Deploy to production
  /vercel logs           View logs
  /vercel env            Manage env vars
```

---

## Deploy — Deployment Management

### `deploy` — Deploy to preview

```bash
vercel
# or: vercel deploy
```

### `deploy --prod` or `deploy production` — Deploy to production

```bash
vercel --prod
# or: vercel deploy --prod
```

### `deploy status` — Check deployment status

```bash
vercel ls --limit 10
```

### `deploy inspect` — Inspect specific deployment

```bash
# Latest deployment
vercel inspect

# Specific deployment
vercel inspect <deployment-url>
```

### `deploy promote` — Promote preview to production

```bash
vercel promote <deployment-url>
```

### `deploy rollback` — Rollback to previous deployment

```bash
vercel rollback
# or specific deployment:
vercel rollback <deployment-url>
```

### `deploy remove` — Remove a deployment

```bash
vercel remove <deployment-url>
```

### `deploy --prebuilt` — Deploy prebuilt output

```bash
# Build locally first
vercel build
# or for production:
vercel build --prod

# Then deploy prebuilt
vercel deploy --prebuilt
```

### Deploy Options

| Option | Description |
|--------|-------------|
| `--prod` | Production deployment |
| `--force` | Force new deployment |
| `--no-wait` | Don't wait for completion |
| `--archive=tgz` | Upload as archive |
| `--build-env KEY=VAL` | Build environment variable |
| `--meta KEY=VAL` | Deployment metadata |
| `--regions iad1,sfo1` | Specify regions |
| `--yes` | Skip confirmation |

---

## Domains — Domain Management

### `domains` or `domains ls` — List domains

```bash
vercel domains ls
```

### `domains add` — Add domain

```bash
vercel domains add <domain>
# e.g.: vercel domains add my-app.com
```

### `domains remove` — Remove domain

```bash
vercel domains remove <domain>
```

### `domains inspect` — Inspect domain

```bash
vercel domains inspect <domain>
```

### `domains verify` — Verify domain

```bash
vercel domains verify <domain>
```

### `domains move` — Move domain to another project

```bash
vercel domains move <domain> <project-name>
```

### `domains dns` — DNS management

```bash
# List DNS records
vercel dns ls <domain>

# Add DNS record
vercel dns add <domain> <name> <type> <value>
# e.g.: vercel dns add my-app.com www CNAME cname.vercel-dns.com

# Remove DNS record
vercel dns rm <record-id>
```

### `domains certs` — SSL certificate management

```bash
# List certificates
vercel certs ls

# Issue certificate
vercel certs issue <domain>
```

---

## Env — Environment Variables

### `env` or `env ls` — List environment variables

```bash
vercel env ls
# Filter by environment:
vercel env ls production
vercel env ls preview
vercel env ls development
```

### `env add` — Add environment variable

```bash
vercel env add <name>
# Interactive: prompts for value and environments

# Non-interactive:
echo "value" | vercel env add <name> production
echo "value" | vercel env add <name> preview
echo "value" | vercel env add <name> development
```

### `env remove` — Remove environment variable

```bash
vercel env rm <name> production
```

### `env pull` — Pull env vars to local `.env`

```bash
vercel env pull
# or specific file:
vercel env pull .env.local
# specific environment:
vercel env pull .env.production --environment production
```

### `env push` — Push local `.env` to Vercel

Read `.env.local` and add each variable:
```bash
# Read and push each variable
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  echo "$value" | vercel env add "$key" development preview production
done < .env.local
```

### Environment Scoping

| Scope | Description |
|-------|-------------|
| `production` | Production deployments only |
| `preview` | Preview deployments only |
| `development` | `vercel dev` only |
| All three | Available everywhere |

---

## Logs — Log Management

### `logs` — View latest deployment logs

```bash
vercel logs
```

### `logs --follow` — Stream logs in real-time

```bash
vercel logs --follow
```

### `logs <url>` — Logs for specific deployment

```bash
vercel logs <deployment-url>
```

### `logs --output json` — JSON format logs

```bash
vercel logs --output json
```

### `logs functions` — View function logs

```bash
# Via Vercel dashboard or:
vercel logs --follow
```

### Log Filtering

| Option | Description |
|--------|-------------|
| `--follow` | Stream real-time |
| `--limit N` | Limit to N entries |
| `--since 1h` | Since time period |
| `--until 30m` | Until time period |
| `--output json` | JSON format |

---

## Project — Project Configuration

### `project` or `project info` — Show project info

```bash
vercel project ls
vercel inspect
```

### `project init` — Initialize/link project

```bash
vercel link
# or create new:
vercel project add <name>
```

### `project settings` — Review vercel.json

Read and review `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "next dev",
  "regions": ["iad1"],
  "headers": [],
  "redirects": [],
  "rewrites": [],
  "functions": {},
  "crons": []
}
```

### `project framework` — Framework detection

```bash
# Check framework
vercel inspect | grep -i framework
```

Supported frameworks:
| Framework | Config |
|-----------|--------|
| Next.js | `next.config.js` |
| Remix | `remix.config.js` |
| Nuxt | `nuxt.config.ts` |
| SvelteKit | `svelte.config.js` |
| Astro | `astro.config.mjs` |
| Vite | `vite.config.ts` |
| CRA | `react-scripts` |
| Gatsby | `gatsby-config.js` |

### `project team` — Team management

```bash
# Switch team
vercel switch

# List teams
vercel teams ls
```

### vercel.json Reference

**Headers:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

**Redirects:**
```json
{
  "redirects": [
    { "source": "/old-path", "destination": "/new-path", "permanent": true },
    { "source": "/blog/:slug", "destination": "/posts/:slug", "permanent": false }
  ]
}
```

**Rewrites:**
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/:path*" }
  ]
}
```

**Cron Jobs:**
```json
{
  "crons": [
    { "path": "/api/cron/daily", "schedule": "0 0 * * *" },
    { "path": "/api/cron/hourly", "schedule": "0 * * * *" }
  ]
}
```

**Functions:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    },
    "api/heavy-task.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

---

## Debug — Troubleshooting

### `debug` — Run diagnostics

1. **Check CLI**
   ```bash
   vercel --version
   vercel whoami
   ```

2. **Check Project Link**
   ```bash
   cat .vercel/project.json
   vercel inspect
   ```

3. **Validate Configuration**
   ```bash
   cat vercel.json 2>/dev/null || echo "No vercel.json"
   ```

4. **Check Deployment Status**
   ```bash
   vercel ls --limit 5
   ```

5. **Check Logs**
   ```bash
   vercel logs --limit 50
   ```

### `debug build` — Debug build issues

```bash
# Build locally to reproduce
vercel build

# Check build output
ls -la .vercel/output/

# Check build logs
vercel logs <deployment-url>
```

### `debug functions` — Debug serverless functions

```bash
# Run locally
vercel dev

# Check function logs
vercel logs --follow

# Inspect function config
cat vercel.json | grep -A 10 functions
```

### `debug domains` — Debug domain issues

```bash
# Check domain status
vercel domains inspect <domain>

# Verify DNS
dig <domain>
dig CNAME <domain>
nslookup <domain>

# Check SSL
vercel certs ls
```

### `debug env` — Debug environment variables

```bash
# List all env vars
vercel env ls

# Pull to verify
vercel env pull .env.check
cat .env.check
rm .env.check
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | `vercel build` locally, check logs |
| 404 on routes | Check `rewrites` in vercel.json |
| Env var missing | `vercel env ls` — check scope matches environment |
| Domain not working | `vercel domains verify`, check DNS records |
| Function timeout | Increase `maxDuration` in vercel.json |
| Function memory | Increase `memory` in vercel.json (up to 3008MB) |
| Cold starts | Use Edge Runtime where possible |
| CORS errors | Add headers in vercel.json or middleware |
| Build cache issues | Deploy with `--force` |
| Wrong Node version | Set `engines.node` in package.json |
| Large deployment | Check `.vercelignore`, add unneeded files |
| SSL error | `vercel certs issue <domain>` |

### `.vercelignore`

```
.git
node_modules
.env*.local
*.test.ts
*.spec.ts
__tests__
coverage
.nyc_output
```

### Deployment Limits

| Resource | Hobby | Pro | Enterprise |
|----------|-------|-----|------------|
| Deployments/day | 100 | 6000 | Custom |
| Serverless timeout | 10s | 60s | 900s |
| Edge timeout | 25s | 25s | 25s |
| Build timeout | 45min | 45min | 45min |
| Function size | 50MB | 250MB | 250MB |

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Vercel overview
  - `deploy` / `deploy --prod` / `deploy status` / `deploy inspect` / `deploy rollback` / `deploy promote`
  - `domains` / `domains add <domain>` / `domains remove <domain>` / `domains dns` / `domains verify`
  - `env` / `env ls` / `env add <name>` / `env remove <name>` / `env pull` / `env push`
  - `logs` / `logs --follow` / `logs <url>` / `logs functions`
  - `project` / `project init` / `project settings` / `project framework` / `project team`
  - `debug` / `debug build` / `debug functions` / `debug domains` / `debug env`

## Output

Vercel platform management across deployments, domains, environment variables, logs, project configuration, and troubleshooting.
