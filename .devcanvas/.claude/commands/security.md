---
description: Security — review, audit, scan, secrets, dependencies, and hardening
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [review|audit|scan|secrets|deps|harden] [action]
---

# Security

Unified command for security reviews, vulnerability audits, code scanning, secret detection, dependency checks, and hardening recommendations.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `review [scope]` — Security code review (OWASP, injection, auth, etc.)
- `audit [scope]` — Full security audit with report
- `scan [target]` — Automated security scanning
- `secrets [action]` — Secret detection and management
- `deps [action]` — Dependency vulnerability checks
- `harden [target]` — Hardening recommendations
- No arguments — Quick security overview

---

## Overview (default, no arguments)

Run a quick security health check:

```bash
# Check for secrets in git history
git log --diff-filter=A --name-only --pretty=format: | head -20

# Check for .env files
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null

# Check dependencies
npm audit 2>/dev/null || pip-audit 2>/dev/null || cargo audit 2>/dev/null || true

# Check for common security files
ls -la .gitignore .npmignore .dockerignore SECURITY.md 2>/dev/null
```

Display format:
```
Security Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project:     my-app
Framework:   Next.js / Express / FastAPI / etc.

Quick Scan:
  Secrets:       0 detected
  Dependencies:  2 vulnerabilities (1 high, 1 moderate)
  .env files:    .env.local (gitignored ✓)
  SECURITY.md:   present ✓

Quick Actions:
  /security review      Code security review
  /security audit       Full security audit
  /security secrets     Scan for secrets
  /security deps        Check dependencies
  /security harden      Hardening guide
```

---

## Review — Security Code Review

### `review` — Full security review of codebase

1. **Identify Attack Surface**
   ```bash
   # Find API routes / endpoints
   find . -path "*/api/*" -name "*.ts" -o -name "*.js" -o -name "*.py" | head -30
   # Find route handlers
   grep -r "app\.\(get\|post\|put\|patch\|delete\)" --include="*.ts" --include="*.js" -l
   grep -r "@app\.\(get\|post\|put\|patch\|delete\)" --include="*.py" -l
   ```

2. **OWASP Top 10 Review**

   **A01 — Broken Access Control:**
   - [ ] Authentication on all protected routes
   - [ ] Authorization checks (role-based / resource-based)
   - [ ] No IDOR vulnerabilities (insecure direct object references)
   - [ ] CORS properly configured
   - [ ] No directory traversal
   - [ ] Rate limiting on sensitive endpoints

   **A02 — Cryptographic Failures:**
   - [ ] Sensitive data encrypted at rest
   - [ ] TLS/HTTPS enforced
   - [ ] No weak algorithms (MD5, SHA1 for passwords)
   - [ ] Proper key management
   - [ ] No hardcoded secrets

   **A03 — Injection:**
   - [ ] SQL injection (parameterized queries / ORM)
   - [ ] NoSQL injection
   - [ ] Command injection (no shell exec with user input)
   - [ ] XSS (output encoding, CSP headers)
   - [ ] LDAP injection
   - [ ] Template injection

   **A04 — Insecure Design:**
   - [ ] Threat modeling done
   - [ ] Security requirements defined
   - [ ] Fail-safe defaults
   - [ ] Defense in depth

   **A05 — Security Misconfiguration:**
   - [ ] Debug mode disabled in production
   - [ ] Default credentials changed
   - [ ] Error messages don't leak info
   - [ ] Security headers set
   - [ ] Unnecessary features disabled

   **A06 — Vulnerable Components:**
   - [ ] Dependencies up to date
   - [ ] No known vulnerabilities
   - [ ] Components from trusted sources
   - [ ] Unused dependencies removed

   **A07 — Auth Failures:**
   - [ ] Strong password policy
   - [ ] Brute force protection
   - [ ] Session management secure
   - [ ] MFA available
   - [ ] Password hashing (bcrypt/argon2)

   **A08 — Data Integrity:**
   - [ ] Input validation
   - [ ] CI/CD pipeline secured
   - [ ] Dependency integrity verified
   - [ ] Signed commits

   **A09 — Logging & Monitoring:**
   - [ ] Security events logged
   - [ ] No sensitive data in logs
   - [ ] Log integrity protected
   - [ ] Alerting configured

   **A10 — SSRF:**
   - [ ] URL validation on server-side requests
   - [ ] Allowlist for external calls
   - [ ] No internal network access from user input

3. **Generate Review Report**

### `review auth` — Authentication & authorization review

Focus areas:
- Session management
- Token handling (JWT validation, expiry, refresh)
- Password storage
- OAuth/OIDC implementation
- API key management
- RBAC / ABAC implementation

### `review api` — API security review

Focus areas:
- Input validation
- Rate limiting
- Authentication middleware
- CORS configuration
- Response headers
- Error handling (no stack traces)
- File upload handling

### `review frontend` — Frontend security review

Focus areas:
- XSS prevention
- CSP headers
- CSRF protection
- Secure cookie flags
- Client-side storage (no secrets in localStorage)
- Subresource integrity (SRI)
- iframe protection (X-Frame-Options)

### `review database` — Database security review

Focus areas:
- Parameterized queries (no string concatenation)
- Connection string security
- Least privilege access
- Data encryption
- Backup security
- Migration safety

---

## Audit — Full Security Audit

### `audit` — Comprehensive security audit

1. **Static Analysis**
   ```bash
   # JavaScript/TypeScript
   npx eslint --plugin security . 2>/dev/null

   # Python
   uv run bandit -r . -ll 2>/dev/null
   uv run safety check 2>/dev/null

   # Go
   gosec ./... 2>/dev/null

   # Rust
   cargo audit 2>/dev/null
   ```

2. **Dependency Audit**
   ```bash
   npm audit 2>/dev/null
   pip-audit 2>/dev/null
   cargo audit 2>/dev/null
   ```

3. **Secret Scanning**
   ```bash
   # Check for common secret patterns
   grep -rn "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --include="*.py" --include="*.go" .
   grep -rn "api[_-]?key\s*=\s*['\"]" --include="*.ts" --include="*.js" --include="*.py" --include="*.go" .
   grep -rn "secret\s*=\s*['\"]" --include="*.ts" --include="*.js" --include="*.py" --include="*.go" .
   ```

4. **Configuration Audit**
   - Check security headers
   - Check CORS config
   - Check cookie settings
   - Check CSP policy
   - Check TLS configuration

5. **Generate Audit Report**

### Audit Report Format

```
Security Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date:     YYYY-MM-DD
Scope:    Full application
Rating:   B (Good)

Findings Summary:
  Critical:  0
  High:      1
  Medium:    3
  Low:       5
  Info:      8

| # | Severity | Category      | Finding                        | Status |
|---|----------|---------------|--------------------------------|--------|
| 1 | HIGH     | Injection     | SQL injection in search API    | OPEN   |
| 2 | MEDIUM   | Auth          | Missing rate limit on login    | OPEN   |
| 3 | MEDIUM   | Config        | CORS allows all origins        | OPEN   |
| 4 | MEDIUM   | Crypto        | Weak session token entropy     | OPEN   |
| 5 | LOW      | Headers       | Missing X-Content-Type-Options | OPEN   |

Recommendations:
1. [HIGH] Parameterize search query — use ORM or prepared statements
2. [MEDIUM] Add rate limiting (e.g., 5 attempts/minute) on /api/auth/login
3. [MEDIUM] Restrict CORS to specific allowed origins
```

---

## Scan — Automated Scanning

### `scan` — Run all available scanners

Detect project type and run appropriate scanners:

**JavaScript/TypeScript:**
```bash
npm audit --json
npx retire --js        # Retired.js
npx snyk test          # Snyk (if available)
```

**Python:**
```bash
uv run bandit -r . -f json -ll
uv run pip-audit --format json
uv run safety check --json
```

**Go:**
```bash
govulncheck ./...
gosec -fmt json ./...
```

**Rust:**
```bash
cargo audit --json
cargo deny check
```

**Docker:**
```bash
# If Dockerfile exists
trivy image <image-name>
trivy fs .
docker scout cves <image-name>
```

**Infrastructure:**
```bash
trivy config .          # IaC scanning
checkov -d .            # Checkov (if available)
```

### `scan code` — Static code analysis only

### `scan deps` — Dependency scanning only

### `scan docker` — Container scanning

### `scan iac` — Infrastructure-as-Code scanning

---

## Secrets — Secret Detection

### `secrets` or `secrets scan` — Scan for secrets

```bash
# Common patterns
grep -rn --include="*.ts" --include="*.js" --include="*.py" --include="*.go" --include="*.env" --include="*.yaml" --include="*.yml" --include="*.json" \
  -E "(password|secret|api[_-]?key|token|credentials|private[_-]?key)\s*[:=]\s*['\"][^'\"]{8,}" . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor

# AWS keys
grep -rn "AKIA[0-9A-Z]{16}" . --exclude-dir=node_modules --exclude-dir=.git

# Private keys
find . -name "*.pem" -o -name "*.key" -o -name "*.p12" | grep -v node_modules

# Check .gitignore covers secrets
cat .gitignore | grep -E "(\.env|\.pem|\.key|secret|credential)"
```

### `secrets verify` — Verify secrets are properly managed

Checklist:
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in source code
- [ ] No secrets in git history
- [ ] Secrets in environment variables or secret manager
- [ ] `.env.example` has no real values
- [ ] Docker secrets not in Dockerfile
- [ ] CI/CD secrets in secure storage

### `secrets rotate` — Secret rotation guide

Provide rotation steps for:
- API keys
- Database passwords
- JWT signing keys
- OAuth client secrets
- Encryption keys

### `secrets gitguard` — Check git history for leaked secrets

```bash
# Check recent commits for secrets
git log -p --all -S "password" --since="30 days ago" -- ":(exclude)*.lock"
git log -p --all -S "api_key" --since="30 days ago" -- ":(exclude)*.lock"
git log -p --all -S "secret" --since="30 days ago" -- ":(exclude)*.lock"

# If gitleaks available
gitleaks detect --source . --verbose
```

---

## Deps — Dependency Security

### `deps` or `deps check` — Check dependency vulnerabilities

```bash
# Node.js
npm audit 2>/dev/null
# or: yarn audit / pnpm audit

# Python
uv run pip-audit 2>/dev/null
# or: safety check

# Go
govulncheck ./... 2>/dev/null

# Rust
cargo audit 2>/dev/null
```

### `deps fix` — Auto-fix dependency vulnerabilities

```bash
# Node.js
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force
```

### `deps update` — Update vulnerable dependencies

```bash
# Node.js
npx npm-check-updates -u --target minor
npm install

# Python
uv lock --upgrade

# Go
go get -u ./...
go mod tidy

# Rust
cargo update
```

### `deps licenses` — Check dependency licenses

```bash
# Node.js
npx license-checker --summary

# Python
uv run pip-licenses

# Rust
cargo deny check licenses
```

### `deps sbom` — Generate Software Bill of Materials

```bash
# Node.js
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Python
uv run cyclonedx-py environment -o sbom.json

# Container
trivy image --format cyclonedx -o sbom.json <image>
```

---

## Harden — Hardening Recommendations

### `harden` — Full hardening checklist

**HTTP Security Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Cookie Security:**
```
Set-Cookie: session=value; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600
```

**CORS Configuration:**
```typescript
// Restrictive CORS
{
  origin: ['https://myapp.com'],
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 86400
}
```

### `harden nextjs` — Next.js hardening

```typescript
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  poweredByHeader: false,
}
```

### `harden api` — API hardening

- Rate limiting
- Input validation (zod / joi / pydantic)
- Request size limits
- Timeout configuration
- Error handling (no stack traces)
- Authentication middleware
- API versioning
- Request logging

### `harden docker` — Docker hardening

```dockerfile
# Use specific versions
FROM node:20-alpine AS base

# Non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

# Read-only filesystem
# --read-only flag at runtime

# No new privileges
# --security-opt=no-new-privileges at runtime

# Health check
HEALTHCHECK --interval=30s CMD wget -q --spider http://localhost:3000/health || exit 1
```

### `harden database` — Database hardening

- Least privilege access
- Connection encryption (SSL/TLS)
- Connection pooling limits
- Query timeouts
- Parameterized queries only
- Audit logging
- Regular backups
- Row-level security (RLS)

### `harden ci` — CI/CD hardening

- Signed commits
- Branch protection rules
- Dependency pinning
- SBOM generation
- Container scanning in pipeline
- Secret scanning in pipeline
- Deployment approval gates

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Quick security overview
  - `review` / `review auth` / `review api` / `review frontend` / `review database`
  - `audit` — Full security audit with report
  - `scan` / `scan code` / `scan deps` / `scan docker` / `scan iac`
  - `secrets` / `secrets scan` / `secrets verify` / `secrets rotate` / `secrets gitguard`
  - `deps` / `deps check` / `deps fix` / `deps update` / `deps licenses` / `deps sbom`
  - `harden` / `harden nextjs` / `harden api` / `harden docker` / `harden database` / `harden ci`

## Output

Security management across code review, auditing, scanning, secret detection, dependency checks, and hardening.
