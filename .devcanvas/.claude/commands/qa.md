---
description: Quality assurance — code review, auto-fix, testing, and verification
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [review|fix|test|verify] [action]
---

# Quality Assurance

Unified command for code review, auto-fixing issues, running tests, and pre-commit verification.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `review [scope]` — Code review checklist
- `fix [target]` — Auto-fix code issues
- `test [scope]` — Run test suites
- `verify [options]` — Quick verification before commit/push
- No arguments — Run quick verification (same as `verify`)

---

## Review — Code Review Checklist

### `review` — Full code review of recent changes

1. **Identify Changes**
   ```bash
   git log --oneline -10
   git diff main...HEAD --stat
   git diff main...HEAD
   ```

2. **Review Checklist**

   **Code Quality:**
   - [ ] Follows project style guidelines (Ruff)
   - [ ] No unnecessary complexity
   - [ ] Functions are focused and small
   - [ ] Meaningful variable/function names
   - [ ] No code duplication

   **Type Safety:**
   - [ ] All functions have type hints
   - [ ] No `Any` types (unless justified)
   - [ ] Return types are explicit
   - [ ] MyPy passes without errors

   **Testing:**
   - [ ] New code has tests
   - [ ] Tests cover edge cases
   - [ ] Tests are readable and maintainable
   - [ ] Coverage meets threshold (80%+)

   **Security:**
   - [ ] No hardcoded secrets
   - [ ] Input validation present
   - [ ] No SQL injection vulnerabilities
   - [ ] No command injection risks
   - [ ] Proper error handling (no stack traces in responses)

   **Documentation:**
   - [ ] Public APIs have docstrings
   - [ ] Complex logic is commented
   - [ ] README updated if needed
   - [ ] CHANGELOG updated if needed

   **Architecture:**
   - [ ] Changes align with project structure
   - [ ] Dependencies are appropriate
   - [ ] No circular imports
   - [ ] Separation of concerns maintained

3. **Run Automated Checks**
   ```bash
   uv run ruff check .
   uv run mypy packages apps
   uv run pytest --cov
   uv run bandit -r packages apps -ll
   ```

4. **Generate Review Summary**
   ```markdown
   ## Code Review Summary

   ### Files Reviewed
   - path/to/file1.py

   ### Findings

   #### Critical
   - None / List issues

   #### Major
   - None / List issues

   #### Minor
   - None / List suggestions

   #### Positive
   - List good practices observed

   ### Approval Status
   - [ ] Approved
   - [ ] Approved with minor changes
   - [ ] Changes requested
   ```

### Common Issues Reference

| Category | Check For |
|----------|-----------|
| **Imports** | Unused imports, wrong order |
| **Types** | Missing hints, incorrect types |
| **Errors** | Bare except, swallowed errors |
| **Logging** | Print statements, missing logs |
| **Tests** | Missing tests, flaky tests |
| **Security** | Hardcoded values, unsafe operations |

---

## Fix — Auto-fix Code Issues

### `fix` — Run all auto-fixes

```bash
uv run ruff check . --fix
uv run ruff format .
# or: make fix
```

### `fix lint` — Fix linting issues

```bash
uv run ruff check . --fix

# Show what would be fixed
uv run ruff check . --diff

# Fix specific rules
uv run ruff check . --fix --select I    # Import sorting
uv run ruff check . --fix --select F    # Pyflakes
uv run ruff check . --fix --select UP   # Pyupgrade
```

### `fix imports` — Fix import issues

```bash
uv run ruff check . --fix --select I     # Sort imports
uv run ruff check . --fix --select F401  # Remove unused imports
```

### `fix format` — Fix formatting

```bash
uv run ruff format .

# Format specific file
uv run ruff format path/to/file.py

# Check only (no changes)
uv run ruff format . --check
```

### `fix precommit` — Run all pre-commit hooks

```bash
uv run pre-commit run --all-files

# Specific hook
uv run pre-commit run ruff --all-files
uv run pre-commit run ruff-format --all-files
```

### Fix Quick Reference

| Issue | Command |
|-------|---------|
| All auto-fixable | `make fix` |
| Linting | `uv run ruff check . --fix` |
| Formatting | `uv run ruff format .` |
| Import sorting | `uv run ruff check . --fix --select I` |
| Unused imports | `uv run ruff check . --fix --select F401` |
| Pre-commit all | `uv run pre-commit run --all-files` |

### Manual Fixes Needed

Some issues require manual intervention:
- Type errors (add proper type hints)
- Logic errors (review and fix)
- Missing tests (write new tests)
- Security issues (review and remediate)

### Fix Workflow

```bash
make fix           # 1. Run fixes
make lint          # 2. Check remaining issues
make type-check    # 3. Check types
make test          # 4. Run tests
make commit        # 5. If all good, commit
```

---

## Test — Run Test Suites

### `test` — Run all tests

```bash
uv run pytest
```

### `test unit` — Unit tests only

```bash
uv run pytest tests/unit -m unit
```

### `test integration` — Integration tests

```bash
uv run pytest tests/integration -m integration
```

### `test e2e` — End-to-end tests

```bash
uv run pytest tests/e2e -m e2e
```

### `test {package}` — Test specific package

```bash
uv run pytest packages/core/tests
uv run pytest packages/shared/tests
uv run pytest packages/config/tests
```

### `test {file}` — Test specific file

```bash
uv run pytest tests/unit/test_core.py
```

### `test {pattern}` — Pattern matching

```bash
uv run pytest -k "test_slug"
uv run pytest tests/unit/test_core.py::TestSlugify::test_converts_to_lowercase
```

### `test coverage` — With coverage report

```bash
uv run pytest --cov=packages --cov=apps --cov-report=term-missing

# HTML report
uv run pytest --cov=packages --cov=apps --cov-report=html
open coverage/html/index.html

# Fail if below threshold
uv run pytest --cov=packages --cov=apps --cov-fail-under=80
```

### `test debug` — Debugging mode

```bash
uv run pytest -v          # Verbose
uv run pytest -vv         # Very verbose
uv run pytest -s          # Show print statements
uv run pytest -x          # Stop on first failure
uv run pytest --pdb       # Debug on failure
uv run pytest --lf        # Last failed tests only
```

### `test parallel` — Parallel execution

```bash
uv run pytest -n auto     # Auto-detect workers
uv run pytest -n 4        # 4 workers
```

### `test watch` — Watch mode

```bash
uv run pytest-watch
# or: make test-watch
```

### Make Commands

```bash
make test             # All tests
make test-v           # Verbose
make test-coverage    # With coverage
make test-unit        # Unit only
make test-fast        # Skip slow tests
make test-failed      # Last failed only
```

### Test Markers

```python
@pytest.mark.unit
@pytest.mark.integration
@pytest.mark.slow
```

---

## Verify — Quick Pre-Commit Verification

### `verify` — Run fast verification pipeline

1. **Sync Dependencies**
   ```bash
   uv sync --frozen
   ```

2. **Lint Check**
   ```bash
   uv run ruff check .
   ```

3. **Format Check**
   ```bash
   uv run ruff format . --check
   ```

4. **Type Check**
   ```bash
   uv run mypy packages apps
   ```

5. **Run Tests**
   ```bash
   uv run pytest -x --tb=short
   ```

### `verify --fix` — Auto-fix lint and format issues during verification

### `verify --no-tests` — Skip test execution

### `verify --verbose` — Show detailed output

### Verification Output

```
Verification Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Dependencies ........ OK
✓ Lint ................ OK (0 errors)
✓ Format .............. OK
✓ Types ............... OK (0 errors)
✓ Tests ............... OK (X passed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: VERIFIED - Ready to commit
```

Or if issues found:

```
Verification Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Dependencies ........ OK
✗ Lint ................ FAILED (3 errors)
✓ Format .............. OK
✗ Types ............... FAILED (1 error)
- Tests ............... SKIPPED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: FAILED - Fix issues before commit
```

### When to Use

- Before committing changes
- Before pushing to remote
- After rebasing or merging
- Quick sanity check during development

For full quality gate validation, use `/zero-qa-gate` instead.

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Quick verification (same as `verify`)
  - `review` — Full code review of recent changes
  - `fix` / `fix lint` / `fix imports` / `fix format` / `fix precommit`
  - `test` / `test unit` / `test integration` / `test e2e` / `test coverage` / `test debug` / `test parallel` / `test watch` / `test {package}` / `test {pattern}`
  - `verify` / `verify --fix` / `verify --no-tests` / `verify --verbose`

## Output

Unified quality assurance across code review, auto-fixing, testing, and pre-commit verification.
