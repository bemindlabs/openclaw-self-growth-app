---
description: Product management — PRD, roadmap, feature prioritization (RICE/MoSCoW/Kano), OKRs, user story mapping, release planning, product metrics, competitive analysis, and go-to-market
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [prd|roadmap|prioritize|okr|stories|release|metrics|discovery|competitive|gtm|vision] [action]
---

# Product Management

Full product management lifecycle: strategy, discovery, planning, execution, and measurement.

## Instructions

Use the `pm` skill. Parse `$ARGUMENTS` to route to the correct subcommand:

- `prd [new|review]` — Product Requirements Document
- `roadmap [view|add|now-next-later]` — Product roadmap
- `prioritize [rice|moscow|kano|matrix]` — Feature prioritization
- `okr [set|check-in]` — OKR setting and tracking
- `stories [map|write]` — User story mapping
- `release [plan]` — Release planning
- `metrics [define|analyze]` — Product metrics framework
- `discovery [plan|synthesize]` — Product discovery
- `competitive [map]` — Competitive analysis
- `gtm [plan]` — Go-to-market planning
- `vision [write]` — Product vision and strategy
- No arguments — Show PM status overview from `.pm/` directory

Save all artifacts to `.pm/` subdirectories. Never overwrite existing content without reading it first.
