---
description: Business analysis — requirements, BRD, process mapping (AS-IS/TO-BE), gap analysis, stakeholders, use cases, KPIs, ROI, SWOT, and PESTLE
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [requirements|process|stakeholders|gap|brd|usecase|kpi|roi|swot] [action]
---

# Business Analysis

Comprehensive business analysis: requirements gathering, BRD writing, process mapping, stakeholder analysis, and business case documentation.

## Instructions

Use the `biz-analysis` skill. Parse `$ARGUMENTS` to route to the correct subcommand:

- `requirements [gather|list|prioritize]` — Requirements elicitation and documentation
- `process [as-is|to-be|gap]` — Business process analysis
- `stakeholders [map|raci]` — Stakeholder mapping and RACI
- `gap` — Gap analysis (current vs. desired state)
- `brd [init|update]` — Business Requirements Document
- `usecase [write]` — Use case documentation
- `kpi [define]` — KPI / metric framework
- `roi [calculate]` — ROI and cost-benefit analysis
- `swot` — SWOT strategic analysis
- `pestle` — PESTLE analysis
- No arguments — Show BA status overview from `.ba/` directory

Save all artifacts to `.ba/` subdirectories. Never overwrite existing content without reading it first.
