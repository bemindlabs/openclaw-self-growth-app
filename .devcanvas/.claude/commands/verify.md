---
description: Verify project quality — TypeScript, Python, Go, Rust, C++ (types, lint, format, tests, build)
allowed-tools: Bash, Read, Glob, Grep
argument-hint: [typescript|python|go|rust|cpp] [--fix] [--no-tests] [--verbose]
---

# Verify Project Quality

Unified verification pipeline for TypeScript, Python, Go, Rust, and C++ projects.

## Instructions

### Route by Language

Parse `$ARGUMENTS` to determine the language:

- `typescript` or `ts` — TypeScript verification
- `python` or `py` — Python verification
- `go` — Go verification
- `rust` or `rs` — Rust verification
- `cpp` or `c++` — C++ verification
- No language specified — Auto-detect from project files

### Options (apply to all languages)

- `--fix` — Auto-fix lint and format issues
- `--no-tests` — Skip test execution
- `--verbose` — Show detailed output for each step

### Auto-Detection

When no language is specified, detect from project files:

| File Found | Language |
|---|---|
| `tsconfig.json` or `package.json` with TypeScript | TypeScript |
| `pyproject.toml` or `setup.py` or `requirements.txt` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `CMakeLists.txt` or `Makefile` with g++/clang++ | C++ |

If multiple languages detected, run verification for each.

---

## TypeScript

### 0. Detect Package Manager

- `bun.lockb` / `bun.lock` → `bun`
- `pnpm-lock.yaml` → `pnpm`
- `yarn.lock` → `yarn`
- `package-lock.json` → `npm`

Read `tsconfig.json` and `package.json` to understand project setup.

### 1. Install Dependencies

```bash
<pm> install
```

### 2. Type Check

```bash
npx tsc --noEmit
# or with project references:
npx tsc --build --noEmit
```

### 3. Lint Check

Detect linter from `package.json` devDependencies:

**ESLint:**
```bash
npx eslint .
# --fix: npx eslint . --fix
```

**Biome:**
```bash
npx biome check .
# --fix: npx biome check . --write
```

### 4. Format Check

**Prettier:**
```bash
npx prettier --check .
# --fix: npx prettier --write .
```

**Biome:**
```bash
npx biome format --check .
```

### 5. Run Tests

Detect test runner from `package.json`:

```bash
npx vitest run       # Vitest
npx jest             # Jest
npx playwright test  # Playwright (e2e)
```

### 6. Build Check

```bash
<pm> run build
```

---

## Python

### 0. Detect Tools

Read `pyproject.toml` for tool configuration. Detect package manager:

- `uv.lock` → `uv`
- `poetry.lock` → `poetry`
- `Pipfile.lock` → `pipenv`
- `requirements.txt` → `pip`

### 1. Install Dependencies

```bash
uv sync              # uv
poetry install       # poetry
pip install -r requirements.txt  # pip
```

### 2. Type Check

```bash
uv run mypy packages apps                    # mypy
uv run pyright                                # pyright
uv run pytype                                 # pytype
```

### 3. Lint Check

```bash
uv run ruff check .                           # ruff
# --fix: uv run ruff check . --fix

uv run flake8 .                               # flake8
uv run pylint packages apps                   # pylint
```

### 4. Format Check

```bash
uv run ruff format . --check                  # ruff
# --fix: uv run ruff format .

uv run black --check .                        # black
# --fix: uv run black .

uv run isort --check-only .                   # isort
# --fix: uv run isort .
```

### 5. Run Tests

```bash
uv run pytest --cov --cov-fail-under=80       # pytest
uv run python -m unittest discover            # unittest
```

### 6. Security Check

```bash
uv run bandit -r packages apps -ll            # bandit
uv run pip-audit                              # pip-audit
```

---

## Go

### 0. Detect Tools

Read `go.mod` for module name and Go version.

### 1. Install Dependencies

```bash
go mod download
go mod verify
```

### 2. Type / Compile Check

```bash
go build ./...
go vet ./...
```

### 3. Lint Check

```bash
golangci-lint run ./...                       # golangci-lint
# --fix: golangci-lint run ./... --fix

staticcheck ./...                             # staticcheck
```

### 4. Format Check

```bash
gofmt -l .                                    # list unformatted
# --fix: gofmt -w .

goimports -l .                                # check imports
# --fix: goimports -w .
```

### 5. Run Tests

```bash
go test ./... -v -race -coverprofile=coverage.out
go tool cover -func=coverage.out              # show coverage
```

### 6. Security Check

```bash
govulncheck ./...                             # vulnerability check
gosec ./...                                   # security scan
```

---

## Rust

### 0. Detect Tools

Read `Cargo.toml` for project configuration, edition, and dependencies.

### 1. Install Dependencies

```bash
cargo fetch
```

### 2. Type / Compile Check

```bash
cargo check
cargo check --all-targets                     # include tests/benches
```

### 3. Lint Check

```bash
cargo clippy -- -D warnings
# --fix: cargo clippy --fix --allow-dirty
```

### 4. Format Check

```bash
cargo fmt -- --check
# --fix: cargo fmt
```

### 5. Run Tests

```bash
cargo test
cargo test -- --nocapture                     # with output
```

### 6. Security Check

```bash
cargo audit                                   # dependency vulnerabilities
cargo deny check                              # license and advisory check
```

---

## C++

### 0. Detect Build System

- `CMakeLists.txt` → CMake
- `Makefile` → Make
- `meson.build` → Meson
- `BUILD` / `WORKSPACE` → Bazel

Read build configuration for compiler flags and standards (C++17, C++20, etc.).

### 1. Install Dependencies

```bash
# CMake
cmake -B build -DCMAKE_BUILD_TYPE=Debug
# or: conan install . --build=missing
# or: vcpkg install
```

### 2. Compile Check

```bash
# CMake
cmake --build build

# Make
make -j$(nproc)

# Direct
g++ -std=c++20 -Wall -Wextra -Werror -c src/*.cpp
```

### 3. Lint Check

```bash
clang-tidy src/*.cpp -- -std=c++20
# --fix: clang-tidy src/*.cpp --fix -- -std=c++20

cppcheck --enable=all --std=c++20 src/
```

### 4. Format Check

```bash
clang-format --dry-run --Werror src/*.cpp src/*.h
# --fix: clang-format -i src/*.cpp src/*.h
```

### 5. Run Tests

```bash
# CMake + CTest
cd build && ctest --output-on-failure

# GoogleTest
./build/tests/test_runner

# Catch2
./build/tests/catch_tests
```

### 6. Static Analysis

```bash
# Address/Memory sanitizer build
cmake -B build-asan -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined"
cmake --build build-asan
cd build-asan && ctest

# Valgrind
valgrind --leak-check=full ./build/tests/test_runner
```

---

## Verification Summary

Report results in this format:

```
{Language} Verification Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Dependencies ........ OK
✓ Types/Compile ....... OK (0 errors)
✓ Lint ................ OK (0 warnings)
✓ Format .............. OK
✓ Tests ............... OK (X passed)
✓ Build ............... OK
✓ Security ............ OK (0 issues)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: VERIFIED - Ready to commit
```

Or if issues found:

```
{Language} Verification Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Dependencies ........ OK
✗ Types/Compile ....... FAILED (5 errors)
✓ Lint ................ OK (2 warnings)
✗ Format .............. FAILED (3 files)
- Tests ............... SKIPPED
- Build ............... SKIPPED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: FAILED - Fix issues before commit
```

When `--verbose` is provided, include full error output for each failing step.

---

## When to Use

- Before committing changes
- Before pushing to remote
- After rebasing or merging
- After upgrading dependencies or compiler/runtime version
- Quick sanity check during development

---

## Arguments

- `$ARGUMENTS` — Language and options. Examples:
  - _(empty)_ — Auto-detect language and run full verification
  - `typescript` / `ts` / `typescript --fix` / `ts --no-tests`
  - `python` / `py` / `python --fix --verbose`
  - `go` / `go --fix` / `go --no-tests`
  - `rust` / `rs` / `rust --fix`
  - `cpp` / `c++` / `cpp --fix --verbose`

## Output

Verification report with pass/fail status for each check step.
