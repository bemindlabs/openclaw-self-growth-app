---
title: "Documentation Management"
tags: [ai, claude, anthropic]
aliases: ["Documentation Management"]
---

# Documentation Management

Unified command for documentation initialization, generation, search, review, validation, updates, wiki, and syncing.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `init [scope]` — Initialize documentation structure and tooling
- `generate [type]` — Generate API documentation from code
- `search {query}` — Search documentation across all formats
- `review [scope]` — Review and audit documentation quality
- `validate [scope]` — Validate completeness, correctness, and consistency
- `update [scope]` — Update documentation to reflect code changes
- `wiki [action]` — Update project wiki
- `sync [target]` — Sync documentation across platforms
- No arguments — Show documentation status overview

---

## Status Overview (default, no arguments)

Show documentation health dashboard:

```bash
# Check docstring coverage
uv run interrogate -v packages apps 2>/dev/null

# Check docs directory
ls docs/ 2>/dev/null

# Check wiki
ls wiki/ 2>/dev/null
```

Display format:
```
Documentation Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure:      docs/          ✓ Initialized
Docstring:      Coverage       78% (target: 80%)
API Docs:       docs/api/      ✓ Generated
Wiki:           wiki/          ✓ 12 pages
Changelog:      CHANGELOG.md   ✓ Up to date

Quick Actions:
  /doc validate all       Run full validation
  /doc update api         Regenerate API docs
  /doc sync all           Sync all platforms
```

---

## Init — Initialize Documentation

### `init` or `init full` — Full documentation setup

1. Create directory structure:
   ```
   docs/
   ├── api/              # Generated API docs
   ├── guides/           # User guides and tutorials
   ├── architecture/     # Architecture documentation
   ├── assets/           # Images, diagrams, files
   ├── examples/         # Code examples
   └── wiki/             # Wiki-style documentation
   ```

2. Configure documentation tools:
   - MkDocs or Sphinx setup
   - API doc generator (pdoc, sphinx-autodoc)
   - Docstring linter (pydocstyle)
   - Coverage checker (interrogate)

3. Create base files: README.md, CONTRIBUTING.md, CHANGELOG.md, CODE_OF_CONDUCT.md, docs/index.md

4. Set up documentation standards:
   - Choose docstring style (Google/NumPy/Sphinx)
   - Define templates
   - Set coverage requirements

5. Create MkDocs configuration (`mkdocs.yml`) with Material theme

6. Create docstring configs (`.pydocstyle`, `.interrogate.ini`)

7. Create CI/CD workflow (`.github/workflows/docs.yml`)

### `init minimal` — Minimal documentation setup

Create only essential files: README.md, docs/index.md, basic directory structure.

### `init api-only` — API documentation only

Set up pdoc/sphinx-autodoc for API reference generation only.

### Init Setup Commands

```bash
mkdir -p docs/{api,guides,architecture,assets,examples,wiki}
uv add --dev mkdocs mkdocs-material pdoc pydocstyle interrogate
uv run mkdocs new .
touch docs/index.md docs/guides/getting-started.md
touch CONTRIBUTING.md CHANGELOG.md
```

### Docstring Templates

**Function**:
```python
def function_name(param1: str, param2: int) -> bool:
    """Brief one-line description.

    Detailed description explaining what the function does.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: When param1 is empty

    Example:
        >>> function_name("test", 42)
        True
    """
```

**Module**:
```python
"""Brief module description.

This module provides functionality for...

Key components:
    - Component1: Description
    - Component2: Description
"""
```

---

## Generate — Generate Documentation

### `generate` or `generate api` — API reference

```bash
uv run pdoc --html --output-dir docs/api packages
uv run pdoc --http : packages  # Serve locally
```

- Generate from docstrings
- Include type annotations
- Cross-reference modules

### `generate readme` — Package READMEs

- Update package README files
- Include usage examples
- Document public API

### `generate wiki` — Wiki pages

- Sync to wiki/ directory
- Update architecture docs
- Generate guides

### `generate all` — Generate everything

Run all documentation generation targets.

### `generate stubs` — Type stubs

```bash
uv run stubgen packages -o stubs
```

### `generate coverage` — Docstring coverage

```bash
uv run interrogate -v packages apps
uv run interrogate --generate-badge docs/images/docstring.svg
```

### MkDocs Commands

```bash
uv run mkdocs build          # Build documentation
uv run mkdocs serve          # Serve locally
uv run mkdocs gh-deploy      # Deploy to GitHub Pages
```

### Output Structure

```
docs/
├── api/                  # Generated API docs
├── guides/               # User guides
├── architecture/         # Architecture docs
└── images/               # Badges and diagrams
```

---

## Search — Search Documentation

### `search {query}` — Search across all documentation

Search capabilities:
- **Full-text**: All markdown files, API docs, code comments, docstrings
- **Structured**: Specific API endpoints, functions/classes, modules
- **Semantic**: Related topics, similar examples, cross-references

### Search Patterns

```bash
# Search all documentation files
rg "search-term" docs/ -C 3 --type md

# Search docstrings in code
rg "search-term" packages/ --include="*.py"

# Find function documentation
rg "^def function_name" packages/

# Find class documentation
rg "^class ClassName" packages/

# Find examples
rg "Example:" docs/
rg ">>> " docs/

# Find configuration options
rg "config\." docs/
```

### Output Format

Results include:
- File path and line number
- Context (lines before/after match)
- Syntax highlighting
- Relevance ranking

---

## Review — Review Documentation Quality

### `review` or `review all` — Full documentation review

1. **Coverage Analysis**
   - Check docstring coverage across codebase
   - Identify undocumented modules, classes, and functions
   - Verify all public APIs are documented

2. **Quality Checks**
   - Validate docstring formatting (Google/NumPy/Sphinx style)
   - Check for broken links and references
   - Verify code examples are correct and runnable
   - Ensure consistency in terminology and style

3. **Content Review**
   - Review API documentation accuracy
   - Check if README files are up-to-date
   - Verify installation and setup instructions
   - Validate examples and tutorials

4. **Accessibility & Readability**
   - Check language clarity
   - Verify heading hierarchy
   - Ensure proper syntax highlighting
   - Check spelling and grammar

### `review api` / `review readme` / `review wiki` / `review guides`

Scope the review to a specific documentation area.

### Review Commands

```bash
uv run interrogate -v packages apps
uv run pydocstyle packages
uv run mkdocs build --strict
find docs -name "*.md" -exec markdown-link-check {} \;
```

### Review Checklist

- [ ] All public APIs have docstrings
- [ ] Docstrings include parameters, returns, and examples
- [ ] README files are current and accurate
- [ ] Installation instructions work
- [ ] Code examples execute without errors
- [ ] No broken internal/external links
- [ ] Consistent terminology throughout
- [ ] Proper formatting and structure
- [ ] Architecture diagrams are up-to-date
- [ ] Changelog is maintained

---

## Validate — Validate Documentation

### `validate` or `validate all` — Full validation

1. **Completeness**: All public APIs documented, modules have docs, READMEs exist
2. **Correctness**: Code examples execute, API signatures match docs, links accessible
3. **Format**: Markdown syntax valid, docstring format compliant, heading hierarchy correct
4. **Consistency**: Terminology consistent, version numbers match, cross-references valid

### `validate coverage` — Docstring coverage only

```bash
uv run interrogate -v --fail-under=80 packages apps
```

### `validate style` — Docstring style only

```bash
uv run pydocstyle packages
```

### `validate examples` — Test code examples

```bash
uv run pytest --doctest-modules packages
```

### `validate links` — Check broken links

```bash
find docs -name "*.md" -exec markdown-link-check {} \;
uv run mkdocs build --strict
```

### Validation Requirements

**Docstrings**: One-line summary, detailed description, parameters with types, return value, raises section, examples

**READMEs**: Title, description, installation, quick start, usage examples, API reference link, license

**API Docs**: Function signature, parameter descriptions, return type, example usage, related functions

### CI/CD Integration

```yaml
# .github/workflows/docs-validate.yml
steps:
  - name: Validate docstrings
    run: uv run interrogate -v --fail-under=80 packages
  - name: Validate style
    run: uv run pydocstyle packages
  - name: Test examples
    run: uv run pytest --doctest-modules packages
  - name: Build docs
    run: uv run mkdocs build --strict
```

---

## Update — Update Documentation

### `update` or `update all` — Update all documentation

1. **Track Code Changes**
   ```bash
   git diff main --name-only "*.py"
   git diff main -- packages/ | grep -E "^[+-]def |^[+-]class "
   ```

2. **Update Documentation**: Affected docstrings, API docs, READMEs, guides, examples

3. **Version Documentation**: CHANGELOG.md, version tags, archive old docs

4. **Review and Validate**: Run validation, test examples, check cross-references

### `update api` — Regenerate API documentation

```bash
uv run pdoc --html --output-dir docs/api --force packages
```

### `update readme` — Update README files

### `update changelog` — Update CHANGELOG.md

### `update guides` — Update guides and tutorials

### Update Strategies

- **Automated**: Auto-regenerate API docs, update version numbers, update dates, update TOC
- **Semi-Automated**: Identify undocumented changes, suggest updates, flag inconsistencies
- **Manual**: Conceptual docs, tutorials, architecture docs, migration guides

### Update Checklist

After code changes:
- [ ] Update affected docstrings
- [ ] Regenerate API documentation
- [ ] Update relevant README sections
- [ ] Modify examples if needed
- [ ] Update CHANGELOG.md
- [ ] Update version numbers
- [ ] Test all code examples
- [ ] Rebuild documentation site
- [ ] Validate documentation

### Tracking Documentation Debt

```bash
# Find files changed without doc updates
git log --since="1 week ago" --name-only --pretty=format: | grep "\.py$" | sort | uniq
```

---

## Wiki — Update Project Wiki

### `wiki` or `wiki update` — Update wiki pages

1. Scan for changes in docs/, CHANGELOG.md, packages
2. Sync content to wiki pages
3. Maintain wiki structure

### Wiki Structure

```
wiki/
├── Home.md              # Project overview (from README)
├── Getting-Started.md   # Quick start guide
├── Architecture.md      # System architecture
├── Packages/
│   ├── Core.md
│   ├── Shared.md
│   └── Config.md
├── Development/
│   ├── Setup.md
│   ├── Testing.md
│   └── Contributing.md
└── Deployment/
    ├── Docker.md
    └── Kubernetes.md
```

### Wiki Sync Commands

```bash
cp README.md wiki/Home.md
cp CONTRIBUTING.md wiki/Development/Contributing.md
cd wiki && git add -A && git commit -m "docs(wiki): sync with main repository" && git push
```

### Wiki Checklist

- [ ] Documentation files reviewed
- [ ] Package READMEs synced
- [ ] API documentation generated
- [ ] Wiki pages updated
- [ ] Changes committed and pushed

---

## Sync — Sync Across Platforms

### `sync` or `sync all` — Full sync to all targets

1. Generate latest API docs
2. Build static site (MkDocs/Sphinx)
3. Sync to GitHub Wiki
4. Deploy to GitHub Pages
5. Update README files

### `sync wiki` — Sync to GitHub Wiki

```bash
cd wiki/ && git pull && rsync -av ../docs/wiki/ . && git add . && git commit -m "docs: sync wiki" && git push
```

### `sync pages` — Deploy to GitHub Pages

```bash
uv run mkdocs gh-deploy --clean --message "docs: update documentation"
```

### `sync api` — Update API documentation

```bash
uv run pdoc --html --output-dir docs/api --force packages
```

### `sync readme` — Sync README files

Sync package-level README files and update root README.

### Sync Configuration

Create `.claude/doc-sync.yaml`:

```yaml
sync:
  targets:
    - github-wiki
    - github-pages
    - api-docs

  wiki:
    source: docs/wiki
    remote: git@github.com:user/repo.wiki.git

  pages:
    branch: gh-pages
    cname: docs.example.com

  api:
    output: docs/api
    format: html
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show documentation status overview
  - `init` / `init full` / `init minimal` / `init api-only`
  - `generate api` / `generate readme` / `generate wiki` / `generate all` / `generate stubs` / `generate coverage`
  - `search {query}`
  - `review all` / `review api` / `review readme` / `review wiki` / `review guides`
  - `validate all` / `validate coverage` / `validate style` / `validate examples` / `validate links`
  - `update all` / `update api` / `update readme` / `update changelog` / `update guides`
  - `wiki` / `wiki update`
  - `sync all` / `sync wiki` / `sync pages` / `sync api` / `sync readme`

## Output

Unified documentation management across initialization, generation, search, review, validation, updates, wiki, and platform syncing.
