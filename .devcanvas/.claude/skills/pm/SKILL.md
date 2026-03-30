---
name: pm
description: Product management — PRD writing, product roadmap, feature prioritization (RICE/MoSCoW/Kano), OKRs, user story mapping, release planning, product metrics, competitive analysis, go-to-market, and product discovery. Use when the user asks to "write a PRD", "create a product roadmap", "prioritize features", "define OKRs", "map user stories", "plan a release", "analyze product metrics", "run a product discovery", "competitive analysis", or discusses product strategy, product backlog, product vision, or launch planning.
---

# Product Management

Unified skill for the full product management lifecycle: strategy, discovery, planning, execution, and measurement.

## Route by Subcommand

Parse `$ARGUMENTS`:

- `prd [action]` — Product Requirements Document
- `roadmap [action]` — Product roadmap management
- `prioritize [action]` — Feature prioritization
- `okr [action]` — OKR setting and tracking
- `stories [action]` — User story mapping
- `release [action]` — Release planning
- `metrics [action]` — Product metrics and analytics
- `discovery [action]` — Product discovery and research
- `competitive [action]` — Competitive analysis
- `gtm [action]` — Go-to-market planning
- `vision [action]` — Product vision and strategy
- No arguments — Show PM status overview

---

## Status Overview (no arguments)

```
Product Management Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vision:     .pm/vision.md          {status}
Roadmap:    .pm/roadmap.md         {N} initiatives
OKRs:       .pm/okrs/              {N} active
PRDs:       .pm/prds/              {N} docs
Backlog:    .pm/backlog.md         {N} items
Release:    .pm/releases/          {next: vX.Y}
Metrics:    .pm/metrics.md         {N} KPIs

Quick Actions:
  /pm prd new                 Draft a new PRD
  /pm roadmap view            Show roadmap
  /pm prioritize rice         Run RICE scoring
  /pm okr set                 Set OKRs
```

---

## PRD — Product Requirements Document

### `prd new {feature}` — Draft a new PRD

Generate a complete PRD from a feature name or description:

```markdown
# PRD: {Feature Name}
**Status:** Draft | **Version:** 1.0
**PM:** {author} | **Date:** {date}
**Engineers:** | **Designer:** | **Data:**

## TL;DR
{1-paragraph summary of what this is and why}

## Problem Statement
{What problem are we solving? Who has this problem? What's the evidence?}

## Goals
- [ ] {Measurable goal 1}
- [ ] {Measurable goal 2}

## Non-Goals
- {What we are explicitly NOT doing}

## User Stories
As a {user}, I want to {action} so that {benefit}.

## Functional Requirements
| # | Requirement | Priority | Notes |
|---|-------------|----------|-------|

## Non-Functional Requirements
- Performance: {target}
- Security: {requirements}
- Accessibility: {standard}

## Design
{Link to Figma / wireframes}

## Technical Considerations
{Known constraints, dependencies, API changes}

## Success Metrics
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

## Timeline
| Milestone | Target Date | Owner |
|-----------|-------------|-------|

## Open Questions
- [ ] {Question}
```

Save to `.pm/prds/{slug}.md`.

### `prd review {file}` — Review an existing PRD

Read the PRD and evaluate:
- Clarity of problem statement
- Measurability of success metrics
- Completeness of requirements
- Identified risks
- Missing sections

Output structured feedback with specific, actionable suggestions.

---

## Roadmap

### `roadmap view` — Display roadmap

Read `.pm/roadmap.md` and render:

```
Product Roadmap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1 2026 (Now)
  ✅ Feature A                [shipped]
  🔄 Feature B                [in progress - 60%]
  📋 Feature C                [planned]

Q2 2026 (Next)
  💡 Initiative D             [discovery]
  💡 Initiative E             [discovery]

Q3-Q4 2026 (Later)
  🔮 Theme: {strategic theme}
```

### `roadmap add {initiative}` — Add item to roadmap

Prompt for: quarter, strategic theme, success metric, team, and status. Append to `.pm/roadmap.md`.

### `roadmap now-next-later` — Generate Now/Next/Later view

Restructure roadmap into the Now/Next/Later format based on current status.

---

## Feature Prioritization

### `prioritize rice` — RICE scoring

For each feature, collect or estimate:
- **Reach** — Users impacted per period
- **Impact** — Effect per user (0.25 / 0.5 / 1 / 2 / 3)
- **Confidence** — How sure are we? (%)
- **Effort** — Person-months

RICE Score = (Reach × Impact × Confidence) / Effort

Output ranked table with scores.

### `prioritize moscow` — MoSCoW prioritization

Classify backlog items:
- **Must Have** — Non-negotiable for launch
- **Should Have** — Important but not critical
- **Could Have** — Nice-to-have if time permits
- **Won't Have** — Explicitly deferred

### `prioritize kano` — Kano model analysis

Classify features into:
- **Basic (Must-be)** — Expected; absence causes dissatisfaction
- **Performance (One-dimensional)** — More = better satisfaction
- **Excitement (Delighters)** — Unexpected; drives delight
- **Indifferent** — Users don't care either way

Output recommendations on where to invest for maximum satisfaction delta.

### `prioritize matrix` — Impact vs. Effort matrix

Plot features on a 2×2:
```
High Impact │ Quick Wins   │ Big Bets
            │ (do first)   │ (plan carefully)
────────────┼──────────────┼──────────────────
Low Impact  │ Fill-ins     │ Time Sinks
            │ (do later)   │ (avoid)
            └──────────────┴──────────────────
              Low Effort      High Effort
```

---

## OKRs

### `okr set` — Define OKRs

For each objective:
```markdown
## Objective: {inspiring, qualitative goal}
**Quarter:** Q{N} {YYYY}  **Team:** {team}  **Owner:** {PM}

### Key Results
- KR1: {measurable outcome} — Baseline: {X} | Target: {Y}
- KR2: {measurable outcome} — Baseline: {X} | Target: {Y}
- KR3: {measurable outcome} — Baseline: {X} | Target: {Y}

### Initiatives
- [ ] {Initiative 1} → supports KR{N}
- [ ] {Initiative 2} → supports KR{N}
```

### `okr check-in` — Weekly/monthly OKR check-in

For each KR, record current value, % progress, status (On Track / At Risk / Off Track), and blockers.

---

## User Story Mapping

### `stories map {journey}` — Build a story map

Structure:
```
User Journey Step 1  │  Step 2  │  Step 3
─────────────────────┼──────────┼──────────
MVP (Release 1)      │          │
User story 1.1       │ 2.1      │ 3.1
─────────────────────┼──────────┼──────────
Release 2            │          │
User story 1.2       │ 2.2      │
─────────────────────┼──────────┼──────────
Future               │          │
```

### `stories write {epic}` — Write user stories for an epic

For each story:
```
Story: {US-XXX} {title}
As a {persona}, I want to {action} so that {benefit}.

Acceptance Criteria:
  Given {context}
  When {action}
  Then {outcome}

Story Points: {estimate}  Priority: {MoSCoW}
```

---

## Release Planning

### `release plan {version}` — Create release plan

```markdown
# Release Plan: v{X.Y.Z}
**Target Date:** {date}  **Release Manager:** {name}

## Scope
| Feature | PRD | Status | Owner | Risk |
|---------|-----|--------|-------|------|

## Go/No-Go Criteria
- [ ] All P0 bugs resolved
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Documentation updated

## Rollout Strategy
{Phased / Feature flags / Full release}

## Rollback Plan
{Steps to revert if critical issues found}

## Communication
- Internal: {date}
- External: {date}
```

---

## Product Metrics

### `metrics define` — Define product metrics framework

Structure metrics using the AARRR funnel or North Star framework:

```
North Star Metric: {the one metric that best captures value delivered}

Supporting Metrics:
┌─────────────────────────────────────────┐
│ Acquisition  │ DAU/MAU, signups, CAC    │
│ Activation   │ Onboarding completion %  │
│ Retention    │ D1/D7/D30, churn rate    │
│ Revenue      │ ARR, ARPU, LTV           │
│ Referral     │ NPS, viral coefficient   │
└─────────────────────────────────────────┘
```

### `metrics analyze {data}` — Interpret metrics

Given metric data, identify:
- Trends (improving / declining / stagnant)
- Anomalies and likely causes
- Comparison to targets / benchmarks
- Recommended actions with expected impact

---

## Product Discovery

### `discovery plan {opportunity}` — Discovery sprint plan

1. **Problem framing** — Opportunity statement
2. **Hypotheses** — Assumptions to validate
3. **Research methods** — User interviews, surveys, data analysis, prototypes
4. **Success criteria** — What would validate/invalidate each hypothesis
5. **Timeline** — Discovery sprint schedule

### `discovery synthesize` — Synthesize research findings

From raw notes/data, extract:
- **Patterns** — Recurring themes across users
- **Jobs to be Done** — What users are trying to accomplish
- **Pain points** — Ranked by frequency and severity
- **Opportunities** — Framed as "How might we…"
- **Validated/Invalidated hypotheses**

---

## Competitive Analysis

### `competitive map {product}` — Map competitive landscape

| Competitor | Positioning | Key Features | Pricing | Strengths | Weaknesses |
|------------|-------------|--------------|---------|-----------|------------|

Conclude with:
- **Our differentiation** — What we do uniquely well
- **Gaps to close** — Where competitors lead
- **Strategic opportunities** — Uncontested spaces

---

## Go-to-Market

### `gtm plan {feature/product}` — GTM plan

```markdown
# Go-to-Market Plan: {name}
**Launch Date:** {date}

## Target Audience
{ICP: who, what they need, where they are}

## Value Proposition
{One sentence: for {who}, {product} is the {category} that {benefit}, unlike {alternative}}.

## Pricing & Packaging
{Tiers, pricing logic, discounts}

## Launch Channels
| Channel | Message | Owner | Budget | KPI |
|---------|---------|-------|--------|-----|

## Launch Checklist
- [ ] Product ready (feature complete, QA passed)
- [ ] Sales enablement (deck, demo, FAQ)
- [ ] Marketing assets (landing page, email, social)
- [ ] Support prepared (docs, ticket templates)
- [ ] Analytics instrumented

## Success Metrics (30/60/90 days)
```

---

## Vision & Strategy

### `vision write` — Write product vision statement

Use the format:
> For **{target user}** who **{need/problem}**, **{product name}** is a **{category}** that **{key benefit}**. Unlike **{alternative}**, our product **{differentiator}**.

Then expand into:
- 3-year north star
- Strategic bets (3-5 themes)
- What we will NOT do

---

## Artifact Storage

```
.pm/
├── vision.md
├── roadmap.md
├── okrs/
│   └── {quarter}-okrs.md
├── prds/
│   └── {slug}.md
├── backlog.md
├── releases/
│   └── v{x.y.z}.md
├── metrics.md
└── discovery/
    └── {opportunity}.md
```
