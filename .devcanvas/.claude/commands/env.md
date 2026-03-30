---
description: Environment management — check, fix, sync, generate, and clean
allowed-tools: Bash, Read, Write, Glob, Grep
argument-hint: [check|fix|sync|generate|clean] [action]
---

# Environment Management

Unified command for environment health checks, fixing issues, syncing dependencies, generating env files, and cleaning artifacts.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `check [component]` — Check environment health and status
- `fix [issue-type]` — Fix environment and dependency issues
- `sync [mode]` — Sync environment and dependencies
- `generate [environment]` — Generate .env files from templates
- `clean [level]` — Clean artifacts and caches
- No arguments — Show environment status overview

---

## Status Overview (default, no arguments)

Run a quick environment health summary:

```bash
uv --version 2>/dev/null || echo "UV not installed"
python --version 2>/dev/null || echo "Python not found"
git --version 2>/dev/null
ls -la .env* 2>/dev/null || echo "No .env files"
du -sh .mypy_cache .pytest_cache .ruff_cache .venv 2>/dev/null
```

Display format:
```
Environment Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tools:       Python 3.12.x | UV 0.x.x | Git 2.x.x
Venv:        .venv/ (active)
Deps:        Synced (0 outdated)
Env Files:   .env ✓ | .env.example ✓
Cache:       42MB total

Quick Actions:
  /env check all        Full health check
  /env fix all          Fix all issues
  /env sync deps        Sync dependencies
  /env clean cache      Clear caches
```

---

## Check — Environment Health

### `check` or `check all` — Complete health check

Run all checks and provide summary:

```
Environment Health Report
========================

Tools:
  [OK] Python 3.12.x
  [OK] UV 0.x.x
  [OK] Git 2.x.x
  [OK] Ruff
  [OK] MyPy
  [OK] Pytest

Dependencies:
  [OK] All packages synced
  [WARN] 3 packages outdated

Configuration:
  [OK] pyproject.toml
  [OK] uv.lock
  [MISSING] .env (run: /env generate dev)

Overall: HEALTHY (1 warning)
```

Status icons: `[OK]`, `[WARN]`, `[ERROR]`, `[MISSING]`

### `check tools` — Check required tools

Verify all tools are installed and accessible:

```bash
python --version && which python
uv --version && which uv
git --version
ruff --version 2>/dev/null || echo "Ruff: Not found"
mypy --version 2>/dev/null || echo "MyPy: Not found"
pytest --version 2>/dev/null || echo "Pytest: Not found"
```

### `check deps` — Check dependencies

```bash
uv sync --dry-run
uv pip list
uv pip list --outdated 2>/dev/null
```

### `check config` — Check configuration files

Verify required files exist: `pyproject.toml`, `.python-version`, `uv.lock`, `.env.example`, `Makefile`. Check for syntax errors, missing files, and version mismatches.

---

## Fix — Fix Environment Issues

### `fix` or `fix all` — Complete fix

Run all fixes in order: cache → venv → deps → types.

### `fix deps` — Dependency issues

1. Clear UV cache: `uv cache clean`
2. Remove lock file if corrupted
3. Re-sync dependencies: `uv sync`
4. Verify installation: `uv pip list`

### `fix cache` — Cache issues

```bash
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
rm -rf .mypy_cache .pytest_cache .ruff_cache
```

### `fix venv` — Virtual environment issues

1. Remove existing venv: `rm -rf .venv`
2. Recreate venv: `uv venv`
3. Sync dependencies: `uv sync`

### `fix types` — Type checking issues

1. Remove MyPy cache: `rm -rf .mypy_cache`
2. Run type check: `uv run mypy packages apps --ignore-missing-imports`
3. Report remaining issues

---

## Sync — Sync Dependencies

### `sync` or `sync deps` — Standard dependency sync

```bash
uv sync
uv pip check
```

### `sync lock` — Update lock file

```bash
uv lock
uv sync
```

### `sync upgrade` — Upgrade all dependencies

```bash
uv lock --upgrade
uv sync
make test
```

### `sync dev` — Development environment

```bash
uv sync --all-extras
uv run pre-commit install
```

### `sync prod` — Production environment

```bash
uv sync --no-dev
uv pip list
```

### Post-sync checks

After syncing, automatically run:
1. Type check: `uv run mypy packages apps --ignore-missing-imports`
2. Import check: `uv run python -c "import monorepo_core; import monorepo_shared; import monorepo_config"`

---

## Generate — Generate Environment Files

### `generate` or `generate dev` — Development environment

Generate `.env` and `.env.development` from `.env.example` templates.

### `generate staging` — Staging environment

Generate `.env.staging` from templates.

### `generate production` — Production environment

Generate `.env.production` from templates.

### `generate all` — All environments

Generate all environment files.

### Generation Process

1. **Find templates**: Search for `.env.example` files in project root and package directories
2. **Copy template** to target file
3. **Replace placeholders** with environment-specific defaults
4. **Validate**: Check all required variables are present, warn about missing/placeholder values

### Security Rules

- NEVER generate actual secret values
- NEVER read existing `.env` files with real secrets
- Always use `.env.example` as the source template
- Use placeholders like `<your-api-key>`

---

## Clean — Clean Artifacts

### `clean` or `clean cache` — Remove caches only

```bash
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null
rm -rf .mypy_cache .pytest_cache .ruff_cache .coverage htmlcov
```

### `clean build` — Remove build artifacts

```bash
rm -rf dist build *.egg-info
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null
find packages -type d -name "dist" -exec rm -rf {} + 2>/dev/null
find apps -type d -name "dist" -exec rm -rf {} + 2>/dev/null
```

### `clean all` — Cache + build

Run both cache and build cleanup.

### `clean deep` — Complete clean (destructive)

**WARNING**: This removes the virtual environment! Confirm with user before proceeding.

```bash
# All of the above plus:
rm -rf .venv
rm -rf node_modules
rm -rf .uv
# Remind user to run: uv sync
```

### Safety Rules

- NEVER delete `.env` files
- NEVER delete source code
- NEVER delete git history
- Always confirm before `deep` clean

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show environment overview
  - `check` / `check all` / `check tools` / `check deps` / `check config`
  - `fix` / `fix all` / `fix deps` / `fix cache` / `fix venv` / `fix types`
  - `sync` / `sync deps` / `sync lock` / `sync upgrade` / `sync dev` / `sync prod`
  - `generate` / `generate dev` / `generate staging` / `generate production` / `generate all`
  - `clean` / `clean cache` / `clean build` / `clean all` / `clean deep`

## Output

Unified environment management across health checks, fixing, syncing, generating env files, and cleaning artifacts.
