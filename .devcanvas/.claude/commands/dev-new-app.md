---
title: "New App"
tags: [ai, claude, anthropic]
aliases: ["New App"]
---

# New App

Create a new application in the monorepo.

## Instructions

### 1. Get Application Information

Ask for:
- **App name**: e.g., `api`, `web`, `worker`, `cli`
- **App type**: REST API, CLI, Worker, Web App
- **Description**: Brief description of the application
- **Framework**: FastAPI, Click, Celery, etc.

### 2. Create Application Structure

```bash
APP_NAME="<name>"
MODULE_NAME="${APP_NAME//-/_}"

# Create directories
mkdir -p apps/${APP_NAME}/src/${MODULE_NAME}
mkdir -p apps/${APP_NAME}/tests
```

### 3. Create pyproject.toml

For a **FastAPI API**:

```toml
[project]
name = "${APP_NAME}"
version = "0.1.0"
description = "<description>"
readme = "README.md"
license = "MIT"
requires-python = ">=3.12"

dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "monorepo-core",
    "monorepo-shared",
    "monorepo-config",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.27.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

For a **CLI app**:

```toml
[project]
name = "${APP_NAME}"
version = "0.1.0"
description = "<description>"

dependencies = [
    "click>=8.0.0",
    "rich>=13.0.0",
    "monorepo-core",
    "monorepo-shared",
    "monorepo-config",
]

[project.scripts]
${APP_NAME} = "${MODULE_NAME}.cli:main"
```

### 4. Create Main Entry Point

**FastAPI (apps/${APP_NAME}/src/${MODULE_NAME}/main.py)**:

```python
"""${APP_NAME} - <description>."""

from fastapi import FastAPI
from monorepo_config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": f"Welcome to {settings.app_name}"}
```

**CLI (apps/${APP_NAME}/src/${MODULE_NAME}/cli.py)**:

```python
"""${APP_NAME} CLI."""

import click
from monorepo_config import get_settings


@click.group()
@click.version_option()
def main():
    """${APP_NAME} - <description>."""
    pass


@main.command()
def info():
    """Show application info."""
    settings = get_settings()
    click.echo(f"App: {settings.app_name}")
    click.echo(f"Version: {settings.app_version}")


if __name__ == "__main__":
    main()
```

### 5. Create __init__.py

```python
"""${APP_NAME} - <description>."""

__version__ = "0.1.0"
```

### 6. Add to Makefile (make/dev.mk)

```makefile
dev-${APP_NAME}: ## Run ${APP_NAME} in development mode
	$(UV) run uvicorn apps.${APP_NAME}.src.${MODULE_NAME}.main:app --reload
```

### 7. Sync and Run

```bash
# Sync dependencies
uv sync

# Run the application
# For API:
uv run uvicorn apps.${APP_NAME}.src.${MODULE_NAME}.main:app --reload

# For CLI:
uv run ${APP_NAME} --help
```

## Checklist

- [ ] App directory created
- [ ] pyproject.toml configured
- [ ] Main entry point created
- [ ] __init__.py with version
- [ ] Makefile target added (optional)
- [ ] Dependencies synced
- [ ] Application runs successfully
