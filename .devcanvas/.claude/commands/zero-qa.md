---
description: Zero-QA quality checks and gate validation
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [check|gate] [scope]
---

# Zero-QA

Unified command for comprehensive quality checks and gate validation before merge/release.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `check [scope]` — Run quality checks
- `gate [option]` — Validate against quality gates
- No arguments — Run full quality check (same as `check all`)

---

## Check — Quality Checks

### `check` or `check all` — Run all checks

#### 1. Static Analysis

```bash
# Lint check
uv run ruff check .

# Format check
uv run ruff format . --check

# Type check
uv run mypy packages apps
```

#### 2. Test Execution

```bash
# Unit tests with coverage
uv run pytest --cov=packages --cov=apps --cov-report=term-missing

# Check coverage threshold
uv run pytest --cov-fail-under=80
```

#### 3. Security Checks

```bash
# Bandit security scan
uv run bandit -r packages apps -ll

# Dependency audit
uv run pip-audit
```

#### 4. Code Quality Metrics

- Function complexity
- File length
- Duplicate code detection

### `check quick` — Lint and type-check only

```bash
uv run ruff check .
uv run ruff format . --check
uv run mypy packages apps
```

### `check tests` — Test suites only

```bash
uv run pytest --cov=packages --cov=apps --cov-report=term-missing
uv run pytest --cov-fail-under=80
```

### `check security` — Security-focused checks

```bash
uv run bandit -r packages apps -ll
uv run pip-audit
```

### Make Commands

```bash
make zero-qa          # Quick check
make zero-qa-full     # Full check
make lint             # Lint only
make type-check       # Types only
make test             # Tests only
make security         # Security only
```

### Check Report Format

```
Zero-QA Check Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: PASS
Scope: all

Results:

| Check    | Status | Details                 |
|----------|--------|-------------------------|
| Lint     | PASS   | 0 errors, 0 warnings    |
| Format   | PASS   | All files formatted     |
| Types    | PASS   | 0 errors                |
| Tests    | PASS   | 45/45 passed, 85% cov   |
| Security | PASS   | 0 vulnerabilities       |

Quality Gates:

| Gate       | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| Coverage   | 80%       | 85%    | PASS   |
| Lint Errors| 0         | 0      | PASS   |
| Type Errors| 0         | 0      | PASS   |
| Security   | 0 high    | 0      | PASS   |
```

---

## Gate — Quality Gate Validation

### `gate` — Validate against all quality gates

1. **Load Gate Configuration**
   - Read `.zero-qa/config.json`
   - Get thresholds for each gate

2. **Run All Gates**
   ```bash
   # Lint Gate
   uv run ruff check . --output-format=json > /tmp/lint-report.json

   # Format Gate
   uv run ruff format . --check

   # Type Gate
   uv run mypy packages apps --no-error-summary

   # Test Gate
   uv run pytest --cov=packages --cov=apps --cov-report=json

   # Security Gate
   uv run bandit -r packages apps -ll -f json
   ```

3. **Evaluate Results**

   | Gate | Threshold | Result | Status |
   |------|-----------|--------|--------|
   | Lint Errors | 0 | {count} | PASS/FAIL |
   | Type Errors | 0 | {count} | PASS/FAIL |
   | Test Coverage | 80% | {pct}% | PASS/FAIL |
   | Test Failures | 0 | {count} | PASS/FAIL |
   | Security High | 0 | {count} | PASS/FAIL |
   | Security Medium | 0 | {count} | PASS/FAIL |

### `gate --strict` — Zero tolerance mode

All thresholds enforced with zero tolerance. Any issue blocks merge/release.

### Gate Status Output

```
Zero-QA Gate Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Lint Gate ............ PASS (0 errors)
✓ Format Gate .......... PASS (formatted)
✓ Type Gate ............ PASS (0 errors)
✓ Test Gate ............ PASS (85% coverage)
✓ Security Gate ........ PASS (0 issues)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall: PASS - Ready to merge
```

### Failure Handling

If any gate fails:
1. List specific failures
2. Provide fix recommendations
3. Block merge/release

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Full quality check (same as `check all`)
  - `check` / `check all` / `check quick` / `check tests` / `check security`
  - `gate` / `gate --strict`

## Output

Quality check reports and gate validation status with pass/fail for each gate.
