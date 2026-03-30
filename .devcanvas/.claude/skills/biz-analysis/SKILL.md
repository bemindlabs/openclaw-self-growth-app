---
name: biz-analysis
description: Business analysis — requirements gathering, BRD, process analysis, gap analysis, stakeholder mapping, use cases, business rules, data flow, ROI, and KPI definition. Use when the user asks to "analyze business requirements", "write a BRD", "map business processes", "perform gap analysis", "define KPIs", "create AS-IS/TO-BE process flows", "document business rules", "stakeholder analysis", "cost-benefit analysis", or discusses business problem framing, requirements documentation, or process improvement.
---

# Business Analysis

Comprehensive business analysis covering requirements, processes, stakeholders, and business case documentation.

## Route by Subcommand

Parse `$ARGUMENTS`:

- `requirements [action]` — Requirements gathering and documentation
- `process [action]` — Business process analysis (AS-IS / TO-BE)
- `stakeholders [action]` — Stakeholder identification and RACI mapping
- `gap [action]` — Gap analysis (current vs. desired state)
- `brd [action]` — Business Requirements Document
- `usecase [action]` — Use cases and functional specifications
- `kpi [action]` — KPI / metric definition and tracking framework
- `roi [action]` — ROI and cost-benefit analysis
- `rules [action]` — Business rules documentation
- `swot [action]` — SWOT / PESTLE strategic analysis
- No arguments — Show BA status overview

---

## Status Overview (no arguments)

Scan for existing BA artifacts:

```
Business Analysis Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Requirements:  .ba/requirements/    {N} items
Processes:     .ba/processes/       {N} flows
Stakeholders:  .ba/stakeholders/    {N} mapped
BRD:           .ba/brd.md           {status}
Use Cases:     .ba/usecases/        {N} defined
KPIs:          .ba/kpis.md          {N} metrics

Quick Actions:
  /biz-analysis brd init          Start a new BRD
  /biz-analysis requirements list List all requirements
  /biz-analysis process as-is     Map current state
  /biz-analysis stakeholders map  Map stakeholders
```

---

## Requirements

### `requirements gather` — Elicit requirements

Interview-style requirement elicitation. Ask the user clarifying questions:
1. **Business objective** — What problem are we solving? What outcome do we need?
2. **Scope** — What's in / out of scope?
3. **Actors** — Who uses the system / process?
4. **Constraints** — Budget, timeline, regulatory, technical
5. **Success criteria** — How do we measure success?

Organize output into:
- **Functional Requirements** — What the system/process must do (FR-001, FR-002, …)
- **Non-Functional Requirements** — Performance, security, scalability (NFR-001, …)
- **Business Rules** — Constraints governing behavior (BR-001, …)
- **Assumptions** — Stated assumptions
- **Out of Scope** — Explicitly excluded items

### `requirements list` — Display all requirements

Read `.ba/requirements/` and display a prioritized table:

| ID | Type | Description | Priority | Status | Owner |
|----|------|-------------|----------|--------|-------|

### `requirements prioritize` — MoSCoW prioritization

Apply MoSCoW to existing requirements list (Must/Should/Could/Won't).

---

## Process Analysis

### `process as-is` — Map current state

Document the current business process:
1. Identify process name, trigger, and end state
2. List all actors/roles involved
3. Map sequential steps with decision points
4. Identify pain points, bottlenecks, handoffs, and manual steps
5. Output as structured Markdown with a textual flow diagram

Format:
```
Process: {name}
Trigger: {event}
End: {outcome}

Steps:
  1. [Actor] Action → Output
  2. [Actor] Decision: Yes → Step 3 / No → Step 5
  ...

Pain Points:
  - {pain point with impact}
```

### `process to-be` — Map future state

Design the improved process:
1. Reference the AS-IS analysis
2. Address identified pain points
3. Show automation, elimination, or consolidation of steps
4. Highlight delta from AS-IS (new, removed, changed steps)

### `process gap` — Gap analysis

Compare AS-IS vs. TO-BE:

| Area | Current State | Desired State | Gap | Priority |
|------|--------------|---------------|-----|----------|
| {area} | {what exists} | {what's needed} | {delta} | H/M/L |

---

## Stakeholder Analysis

### `stakeholders map` — Identify stakeholders

For each stakeholder:
- Name / role / department
- Interest level (High/Medium/Low)
- Influence level (High/Medium/Low)
- Stance (Champion/Neutral/Resistant)
- Key concerns
- Engagement strategy

Output a 2×2 Power/Interest grid + engagement plan.

### `stakeholders raci {process}` — RACI matrix

| Activity | {Role A} | {Role B} | {Role C} |
|----------|----------|----------|----------|
| {step}   | R        | A        | C/I      |

---

## BRD — Business Requirements Document

### `brd init` — Create new BRD

Generate a complete BRD template pre-filled from context:

```markdown
# Business Requirements Document
**Project:** {name}
**Version:** 1.0  **Date:** {date}  **Status:** Draft
**Author:** {author}  **Approvers:** {list}

## 1. Executive Summary
## 2. Business Objectives
## 3. Scope
### 3.1 In Scope
### 3.2 Out of Scope
## 4. Stakeholders
## 5. Current State (AS-IS)
## 6. Future State (TO-BE)
## 7. Functional Requirements
## 8. Non-Functional Requirements
## 9. Business Rules
## 10. Assumptions & Constraints
## 11. Dependencies
## 12. Success Metrics / KPIs
## 13. Risks
## 14. Appendix
```

Save to `.ba/brd.md`.

### `brd update {section}` — Update a BRD section

Read `.ba/brd.md`, locate the section, update with new information, preserve all other sections.

---

## Use Cases

### `usecase write {name}` — Write a use case

```markdown
## Use Case: {UC-001} {name}

**Actor:** {primary actor}
**Goal:** {what the actor wants to achieve}
**Preconditions:** {state before}
**Postconditions:** {state after}

### Main Success Scenario
1. {step}
2. {step}

### Extensions (Alternate Flows)
2a. {condition}: {alternate steps}

### Business Rules
- {relevant rules}
```

---

## KPI Definition

### `kpi define` — Define KPIs for a goal

For each KPI:
| KPI | Description | Formula | Target | Frequency | Owner | Data Source |
|-----|-------------|---------|--------|-----------|-------|-------------|

Group into: **Leading** (predictive) and **Lagging** (outcome) indicators.

---

## ROI / Cost-Benefit Analysis

### `roi calculate` — Build ROI model

Collect from user:
- **Investment costs**: one-time + recurring
- **Benefits**: quantified revenue gain, cost savings, risk reduction
- **Timeline**: implementation + benefit realization period

Output:
```
ROI Analysis: {project}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Investment (Year 0-1): THB {amount}
Annual Benefits:       THB {amount}
Break-even:            {N} months
3-Year ROI:            {%}
NPV (5%):              THB {amount}
```

---

## SWOT / PESTLE

### `swot {subject}` — SWOT analysis

| Strengths | Weaknesses |
|-----------|------------|
| {S}       | {W}        |

| Opportunities | Threats |
|---------------|---------|
| {O}           | {T}     |

**Strategic Implications:**
- SO Strategies (use strengths to capture opportunities)
- ST Strategies (use strengths to mitigate threats)
- WO Strategies (overcome weaknesses via opportunities)
- WT Strategies (minimize weaknesses, avoid threats)

### `pestle {subject}` — PESTLE analysis

| Factor | Key Forces | Impact (H/M/L) | Timeframe |
|--------|-----------|----------------|-----------|
| Political | … | … | … |
| Economic | … | … | … |
| Social | … | … | … |
| Technological | … | … | … |
| Legal | … | … | … |
| Environmental | … | … | … |

---

## Artifact Storage

All BA artifacts are stored under `.ba/`:

```
.ba/
├── brd.md
├── requirements/
│   ├── functional.md
│   └── non-functional.md
├── processes/
│   ├── {process-name}-as-is.md
│   └── {process-name}-to-be.md
├── stakeholders/
│   └── stakeholder-map.md
├── usecases/
│   └── {uc-id}-{name}.md
└── kpis.md
```

When saving, always create the directory if it doesn't exist, then write the file. Never overwrite existing content — append or update specific sections.
