---
title: "Git Management"
tags: [ai, claude, anthropic]
aliases: ["Git Management"]
---

# Git Management

Unified command for git status, commits, syncing, and changelog generation.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `status [option]` — Comprehensive repository status
- `commit [message]` — Create conventional commit
- `sync [scope]` — Sync repository, dependencies, and workspace
- `changelog [option]` — Generate or update CHANGELOG.md
- No arguments — Show quick git status overview

---

## Status Overview (default, no arguments)

Show a quick combined status:

```bash
git branch --show-current
git status --short
git log --oneline -5
```

---

## Status — Repository Status

### `status` — Full status report

1. **Repository Status**
   ```bash
   git status
   ```

2. **Branch Information**
   ```bash
   git branch --show-current
   git branch -vv
   git log --oneline -10
   ```

3. **Changes Summary**
   ```bash
   git diff --cached --stat    # Staged
   git diff --stat             # Unstaged
   git status --porcelain | grep "^??"  # Untracked
   ```

4. **Remote Status**
   ```bash
   git fetch --all --prune
   git rev-list --left-right --count HEAD...origin/$(git branch --show-current)
   ```

Display format:
```
Git Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/my-feature
Tracking: origin/feature/my-feature

Status: 2 ahead, 0 behind origin

Changes:
  Staged:     3 files (+45, -12)
  Modified:   2 files
  Untracked:  1 file

Recent Commits:
  abc1234 feat(core): add new utility
  def5678 fix(shared): correct type
  ghi9012 docs: update README

Stash: 1 entry
```

### `status --short` — Brief status

### `status --verbose` — Detailed status with diffs

### Quick action suggestions based on status:
- `git add .` if unstaged changes
- `git commit` if staged changes
- `git push` if ahead of origin
- `git pull` if behind origin

---

## Commit — Conventional Commits

### `commit` — Create conventional commit

1. **Check Status**
   ```bash
   git status
   git diff --stat
   ```

2. **Review Changes** — Analyze to determine type, scope, and description

3. **Create Commit** with conventional format:
   ```
   type(scope): subject

   [optional body]

   [optional footer]
   ```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `build` | Build system changes |
| `ci` | CI/CD changes |
| `chore` | Maintenance tasks |
| `revert` | Revert previous commit |

### Scopes

| Scope | Description |
|-------|-------------|
| `core` | monorepo-core package |
| `shared` | monorepo-shared package |
| `config` | monorepo-config package |
| `app` | Application code |
| `api` | API-specific changes |
| `cli` | CLI-specific changes |
| `deps` | Dependency updates |
| `infra` | Infrastructure (Docker, K8s) |
| `docs` | Documentation |
| `ci` | CI/CD configuration |

### Rules
- Subject: lowercase, no period, max 100 chars
- Body: wrap at 72 chars
- Footer: references, breaking changes

### Examples

```bash
git commit -m "feat(core): add retry decorator with exponential backoff"
git commit -m "fix(shared): correct pagination offset calculation"
git commit -m "docs(readme): update installation instructions"
git commit -m "feat(api)!: change authentication endpoint

BREAKING CHANGE: /auth/login now requires email instead of username"
```

### Commit Command Template

```bash
git add <files>
git commit -m "$(cat <<'EOF'
type(scope): subject

Body explaining the change in detail.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### Using Commitizen

```bash
uv run cz commit    # Interactive commit
make commit          # Or use make command
```

### Pre-Commit Checklist

- [ ] Changes are staged
- [ ] Tests pass (`make test`)
- [ ] Linting passes (`make lint`)
- [ ] Type check passes (`make type-check`)
- [ ] Commit message follows convention

---

## Sync — Repository Sync

### `sync` — Full repository sync

1. **Git Sync**
   ```bash
   git fetch --all --prune
   git status
   git pull origin $(git branch --show-current) --rebase
   ```

2. **Dependency Sync**
   ```bash
   uv lock
   uv sync
   uv pip list
   ```

3. **Package Sync** (workspace packages)
   ```bash
   uv sync --reinstall-package monorepo-core
   uv sync --reinstall-package monorepo-shared
   uv sync --reinstall-package monorepo-config
   ```

4. **Pre-commit Sync**
   ```bash
   uv run pre-commit autoupdate
   uv run pre-commit install
   uv run pre-commit install --hook-type commit-msg
   ```

5. **Cache Cleanup**
   ```bash
   find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
   find . -type d -name '.pytest_cache' -exec rm -rf {} + 2>/dev/null || true
   find . -type d -name '.mypy_cache' -exec rm -rf {} + 2>/dev/null || true
   find . -type d -name '.ruff_cache' -exec rm -rf {} + 2>/dev/null || true
   ```

6. **Validation**
   ```bash
   uv run python -c "from monorepo_core import generate_id; print('core:', generate_id())"
   uv run python -c "from monorepo_shared import NotFoundError; print('shared: OK')"
   uv run python -c "from monorepo_config import get_settings; print('config: OK')"
   uv run ruff check . --fix
   uv run ruff format .
   ```

### Quick Sync (Makefile)

```bash
make sync        # Just dependency sync
make reset       # Full reset (clean + sync)
make update      # Update all dependencies
```

### Sync Checklist

- [ ] Git repository synced
- [ ] Dependencies updated and locked
- [ ] Workspace packages linked
- [ ] Pre-commit hooks updated
- [ ] Caches cleared
- [ ] Packages validated

---

## Changelog — Generate Changelog

### `changelog` — Generate from recent commits

1. **Analyze Commits**
   ```bash
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   ```

2. **Parse Conventional Commits** and group by type:
   - `feat:` → Features
   - `fix:` → Bug Fixes
   - `docs:` → Documentation
   - `perf:` → Performance
   - `refactor:` → Code Refactoring
   - `test:` → Tests
   - `build:` → Build System
   - `ci:` → CI/CD

3. **Generate Entry**
   ```markdown
   ## [Unreleased]

   ### Features
   - **core**: add retry decorator ([abc1234](commit-url))

   ### Bug Fixes
   - **config**: fix env loading ([ghi9012](commit-url))
   ```

4. **Update CHANGELOG.md** — Prepend new entry

### `changelog --from {tag}` — From specific tag

```bash
git log v0.1.0..HEAD --format="%s|%h|%an|%ad"
```

### `changelog --to {tag}` — To specific tag

### `changelog --unreleased` — Only unreleased changes

### Using Commitizen

```bash
uv run cz changelog
uv run cz changelog --start-rev v0.1.0
```

### Changelog Format

```markdown
# Changelog

All notable changes documented here.

## [Unreleased]

## [0.2.0] - YYYY-MM-DD

### Features
- ...

### Bug Fixes
- ...

## [0.1.0] - YYYY-MM-DD
- Initial release
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Quick git status
  - `status` / `status --short` / `status --verbose`
  - `commit` — Auto-detect and create conventional commit
  - `sync` — Full repository sync
  - `changelog` / `changelog --from v0.1.0` / `changelog --unreleased`

## Output

Unified git management across status, conventional commits, repository syncing, and changelog generation.
