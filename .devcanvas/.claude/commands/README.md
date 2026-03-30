---
title: "Claude Commands"
tags: [ai, claude, anthropic]
aliases: ["Claude Commands"]
---

# Claude Commands

Custom slash commands following the official Claude Code format.

## Available Commands (59)

### 📦 Development

| Command | Description |
|---------|-------------|
| `/dev-new-app` | Create a new application |
| `/dev-new-package` | Create a new package |

### 🔧 Environment

| Command | Description |
|---------|-------------|
| `/env-check` | Check environment health and status |
| `/env-clean` | Clean environment artifacts and caches |
| `/env-fix` | Fix environment and dependency issues |
| `/env-generate` | Generate environment files from templates |
| `/env-sync` | Sync environment and dependencies |

### ✅ Quality Assurance

| Command | Description |
|---------|-------------|
| `/qa-verify` | Quick verification before commit or push |
| `/qa-fix` | Auto-fix code issues |
| `/qa-review` | Code review checklist |
| `/qa-test` | Run test suites |
| `/zero-qa-check` | Run Zero-QA quality checks |
| `/zero-qa-gate` | Zero-QA gate validation |

### 📝 Git & Version Control

| Command | Description |
|---------|-------------|
| `/git-commit` | Create conventional commit |
| `/git-sync` | Sync repository |
| `/git-status` | Git status overview |
| `/git-changelog` | Generate changelog |

### 🔄 GitHub

| Command | Description |
|---------|-------------|
| `/github-fix-issues` | Fix GitHub issues |
| `/github-fix-actions` | Fix GitHub Actions failures |
| `/github-fix-pr` | Fix GitHub PR review issues |

### 🚀 Operations

| Command | Description |
|---------|-------------|
| `/ops-deploy` | Deploy application |

### 📚 Documentation

| Command | Description |
|---------|-------------|
| `/doc-generate` | Generate API documentation |
| `/doc-init` | Initialize documentation structure |
| `/doc-review` | Review documentation |
| `/doc-search` | Search documentation |
| `/doc-sync` | Sync documentation |
| `/doc-update` | Update documentation |
| `/doc-validate` | Validate documentation |
| `/doc-wiki-update` | Update wiki pages |

### 🏃 Scrum/Agile

| Command | Description |
|---------|-------------|
| `/scrum-init` | Initialize Scrum framework |
| `/scrum-backlog` | Manage product backlog |
| `/scrum-epic` | Manage Scrum epics |
| `/scrum-story` | Manage user stories |
| `/scrum-planning` | Sprint planning |
| `/scrum-sprint` | Sprint management |
| `/scrum-standup` | Daily standup |
| `/scrum-review` | Sprint review |
| `/scrum-retro` | Sprint retrospective |
| `/scrum-refinement` | Backlog refinement |
| `/scrum-burndown` | Sprint burndown chart |
| `/scrum-dod` | Definition of Done |

### 💼 Business & Product

| Command | Description |
|---------|-------------|
| `/biz-analysis` | Business analysis — requirements, BRD, process mapping, gap analysis |
| `/pm` | Product management — PRD, roadmap, prioritization, OKRs, GTM |

### 🔍 Research

| Command | Description |
|---------|-------------|
| `/research` | Research a technical topic (default) |
| `/research-compare` | Compare technologies or approaches |
| `/research-evaluate` | Evaluate a technology for adoption |
| `/research-best-practices` | Research current best practices |
| `/research-deep` | Exhaustive deep dive research |
| `/research-list` | List all saved research |
| `/research-search` | Search existing research |

### 🤖 Multi-Agent

| Command | Description |
|---------|-------------|
| `/agents-spawn` | Spawn multi-agent workflow |
| `/agents-status` | Check agent status |
| `/agents-collect` | Collect agent results |

### 🎨 UX/UI Design

| Command | Description |
|---------|-------------|
| `/uxui-accessibility` | Audit and improve accessibility |
| `/uxui-design-review` | Conduct design reviews |
| `/uxui-design-system` | Manage design systems |
| `/uxui-handoff` | Design-to-development handoff |
| `/uxui-prototype` | Create prototypes and wireframes |
| `/uxui-user-research` | Conduct user research |

## Quick Examples

```bash
# Environment
/env-check all
/env-sync upgrade

# Quality assurance
/qa-verify --fix
/zero-qa-check all

# Research
/research "how does React Server Components work"
/research compare Prisma vs Drizzle vs TypeORM
/research evaluate tRPC
/research best-practices "API error handling"
/research deep "microservice event sourcing patterns"

# Git workflow
/git-status
/git-commit feat: add new feature
/github-fix-pr 123

# Scrum
/scrum-standup
/scrum-backlog list

# Business & Product
/biz-analysis brd init
/biz-analysis process as-is
/pm prd new "User Authentication"
/pm prioritize rice
/pm roadmap view
```

## Command Format

All commands follow the official Claude Code format:

```markdown
---
description: Brief command description
allowed-tools: Bash(*), Read, Write
argument-hint: [optional-args]
---

# Command Title

Description of what the command does.

## Usage

\```
/command-name [args]
\```

## Instructions

Step-by-step instructions for Claude...
```

### Frontmatter Options

| Option | Description |
|--------|-------------|
| `description` | Brief description shown in command list |
| `allowed-tools` | Tools this command can use |
| `argument-hint` | Hint for required arguments |
| `model` | Override model for this command (opus, sonnet, haiku) |

### Special Variables

- `$ARGUMENTS` - All passed arguments
- `$1`, `$2`, etc. - Individual positional arguments
- `!`command`` - Execute bash command inline
- `@filepath` - Include file contents

## Adding New Commands

1. Create a new `.md` file in this directory
2. Follow the command format above
3. Use kebab-case naming: `category-action.md`
4. Update this README with the new command

## Recent Changes

### 2026-02-10
- ✅ Removed `qa-check.md` (duplicate of `zero-qa-check.md`)
- ✅ Renamed `docs-update-wiki.md` → `doc-wiki-update.md` (consistency)
- ✅ Moved `agents-verify.md` → `qa-verify.md` (proper namespace)
- ✅ Updated 6 command titles for clarity:
  - `qa-fix` → "Auto-fix Code Issues"
  - `qa-review` → "Code Review Checklist"
  - `qa-test` → "Run Test Suites"
  - `git-commit` → "Create Conventional Commit"
  - `git-sync` → "Sync Repository"
  - `ops-deploy` → "Deploy Application"
- ✅ Added frontmatter to `qa-verify.md`

## Categories Explained

- **Development**: Create new apps and packages
- **Environment**: Manage dependencies and environment setup
- **Quality Assurance**: Code quality checks and fixes
- **Git/GitHub**: Version control and GitHub automation
- **Operations**: Deployment and infrastructure
- **Documentation**: Generate and maintain docs
- **Scrum/Agile**: Project management workflows
- **Multi-Agent**: Parallel agent workflows
- **Research**: Deep dive on topics, tech evaluation, comparisons, and best practices
- **UX/UI**: Design and accessibility tools
- **Business & Product**: Requirements, BRD, roadmaps, and product strategy

## Standards

✅ All command files use:
- Kebab-case naming: `category-action.md`
- Descriptive titles (not generic)
- Proper frontmatter with description
- Clear usage instructions
- Organized by category

---

**Total Commands:** 59
**Last Updated:** 2026-03-13
