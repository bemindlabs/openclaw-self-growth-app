---
title: "New Package"
tags: [ai, claude, anthropic]
aliases: ["New Package"]
---

# New Package

Create a new package in the monorepo.

## Instructions

### 1. Get Package Information

Ask for:
- **Package name**: e.g., `auth`, `api-client`, `utils`
- **Description**: Brief description of the package purpose
- **Dependencies**: Other monorepo packages needed (core, shared, config)

### 2. Create Package Structure

```bash
PACKAGE_NAME="<name>"
MODULE_NAME="monorepo_${PACKAGE_NAME//-/_}"

# Create directories
mkdir -p packages/${PACKAGE_NAME}/src/${MODULE_NAME}
mkdir -p packages/${PACKAGE_NAME}/tests
```

### 3. Create pyproject.toml

```toml
[project]
name = "monorepo-${PACKAGE_NAME}"
version = "0.1.0"
description = "<description>"
readme = "README.md"
license = "MIT"
requires-python = ">=3.12"
authors = [
    { name = "BEMIND TECHNOLOGY CO., LTD.", email = "info@bemind.tech" }
]

dependencies = [
    "monorepo-shared",  # Add as needed
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/${MODULE_NAME}"]
```

### 4. Create __init__.py

```python
"""
Monorepo ${PACKAGE_NAME} - <description>.
"""

__version__ = "0.1.0"
__all__ = []
```

### 5. Create README.md

```markdown
# @monorepo/${PACKAGE_NAME}

<description>

## Installation

\`\`\`bash
uv add monorepo-${PACKAGE_NAME}
\`\`\`

## Usage

\`\`\`python
from ${MODULE_NAME} import ...
\`\`\`

## License

MIT
```

### 6. Update Root Configuration

Add to root `pyproject.toml` under `[tool.uv.sources]`:

```toml
monorepo-${PACKAGE_NAME} = { workspace = true }
```

### 7. Sync and Validate

```bash
# Sync dependencies
uv sync

# Verify package imports
uv run python -c "import ${MODULE_NAME}; print('OK')"

# Run linting
uv run ruff check packages/${PACKAGE_NAME}
uv run mypy packages/${PACKAGE_NAME}
```

## Checklist

- [ ] Package directory created
- [ ] pyproject.toml configured
- [ ] __init__.py with exports
- [ ] README.md documentation
- [ ] Root pyproject.toml updated
- [ ] Dependencies synced
- [ ] Package imports verified
- [ ] Linting passes
