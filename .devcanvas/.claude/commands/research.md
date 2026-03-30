---
description: Research — deep dive on topics, tech evaluation, comparisons, and best practices
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, WebSearch, WebFetch
argument-hint: [topic|compare|evaluate|best-practices|deep|list|search] <query>
---

# Research

Deep research on technical topics, technology evaluation, comparisons, and best practices using parallel agents with web search. All findings are persisted to `research/` for context RAG.

## Instructions

### Pre-flight — Check Existing Research

Before spawning agents, **always** check for prior research on the same or related topics:

```bash
ls research/ 2>/dev/null || echo "No research directory yet"
```

If `research/index.md` exists, read it and scan for related entries. If a closely related report already exists:
- Inform the user and ask if they want to **update** the existing report or create a new one
- When updating, read the existing report first, then research only what's new or changed

### Route by Subcommand

Parse `$ARGUMENTS` to determine the research mode:

- `topic <query>` — Research a technical topic in depth
- `compare <A> vs <B> [vs C...]` — Compare technologies, libraries, or approaches
- `evaluate <technology>` — Evaluate a technology for adoption
- `best-practices <topic>` — Research current best practices
- `deep <query>` — Exhaustive research with more agents and sources
- `list` — List all saved research
- `search <keyword>` — Search existing research
- No subcommand — Treat entire argument as a topic query

---

## Persistence — `research/` Directory

All research output is saved to `research/` for later retrieval and context augmentation.

### Directory Structure

```
research/
├── index.md                    # Master index of all research
├── topics/                     # Topic research
│   └── {slug}.md
├── comparisons/                # Technology comparisons
│   └── {slug}.md
├── evaluations/                # Technology evaluations
│   └── {slug}.md
├── best-practices/             # Best practices guides
│   └── {slug}.md
└── deep-dives/                 # Deep research
    └── {slug}.md
```

### File Naming

Generate a kebab-case slug from the query:
- `"React Server Components"` → `react-server-components.md`
- `"Prisma vs Drizzle vs TypeORM"` → `prisma-vs-drizzle-vs-typeorm.md`
- `"API error handling"` → `api-error-handling.md`

### File Format

Every research file must include YAML frontmatter:

```markdown
---
title: "{Human-readable title}"
type: topic|comparison|evaluation|best-practices|deep-dive
query: "{original query}"
date: {YYYY-MM-DD}
tags: [tag1, tag2, tag3]
sources_count: {N}
status: complete|partial|outdated
---

# {Title}

{Full research report content...}
```

### Index Management

After writing a research file, **always** update `research/index.md`:

```markdown
# Research Index

| Date | Type | Title | File | Tags |
|------|------|-------|------|------|
| 2026-02-27 | topic | React Server Components | [Link](topics/react-server-components.md) | react, rsc, nextjs |
| 2026-02-27 | comparison | Prisma vs Drizzle vs TypeORM | [Link](comparisons/prisma-vs-drizzle-vs-typeorm.md) | orm, database, prisma |
```

- Append new entries to the table
- When updating an existing report, update its date in the index
- Keep the table sorted by date (newest first)

### Init Directory

If `research/` doesn't exist, create the directory structure:

```bash
mkdir -p research/{topics,comparisons,evaluations,best-practices,deep-dives}
```

Then create `research/index.md` with the table header.

---

## List — Show Saved Research

### `list`

1. Read `research/index.md`
2. Display the index table to the user
3. Show total count and breakdown by type

### `search <keyword>`

1. Search across all `research/**/*.md` files using Grep for the keyword
2. Display matching files with relevant excerpts
3. Show frontmatter metadata for each match

---

## Topic — Research a Technical Topic

### Default — Research with auto-detected scope

1. **Parse the query** from arguments
2. **Spawn 3 research agents in parallel** using Task tool:

| Agent | Type | Task |
|-------|------|------|
| Web Researcher | `general-purpose` | Search the web for current information, official docs, blog posts, and tutorials on the topic. Summarize key findings with source URLs. |
| Code Explorer | `Explore` | Search the codebase for any existing usage, patterns, or implementations related to the topic. Report relevant files and how the topic currently applies. |
| Deep Diver | `general-purpose` | Search for advanced resources: conference talks, RFCs, design documents, GitHub discussions, and expert opinions. Focus on nuances, trade-offs, and lesser-known aspects. |

3. **Synthesize findings** into a structured report
4. **Save** to `research/topics/{slug}.md`
5. **Update** `research/index.md`

### Agent Prompts

Each agent should receive:

```
Research topic: {query}

Your role: {agent role}

Search for:
- {specific things to find}
- {types of sources to check}

Report your findings including:
- Key facts and concepts
- Source URLs where applicable
- Relevance to practical usage
- Any caveats or nuances
```

### Topic Output Format

```markdown
---
title: "{query}"
type: topic
query: "{original query}"
date: {YYYY-MM-DD}
tags: [{auto-generated tags}]
sources_count: {N}
status: complete
---

# {Title}

## Summary

{2-3 sentence overview}

## Key Concepts

### {Concept 1}
{explanation}

### {Concept 2}
{explanation}

## How It Works

{detailed explanation with examples}

## Practical Usage

{code examples, patterns, when to use}

## Trade-offs and Caveats

- {caveat 1}
- {caveat 2}

## Codebase Relevance

{how this topic relates to the current project, if applicable}

## Sources

- [{title}]({url}) — {description}
- [{title}]({url}) — {description}
```

---

## Compare — Technology Comparison

### `compare <A> vs <B> [vs C...]`

1. **Parse technologies** from arguments (split on `vs` or commas)
2. **Spawn parallel agents** — one per technology plus a synthesis agent:

| Agent | Type | Task |
|-------|------|------|
| Tech A Researcher | `general-purpose` | Research technology A: features, strengths, weaknesses, ecosystem, community, performance, learning curve, pricing/licensing. Include recent developments and version info. |
| Tech B Researcher | `general-purpose` | Research technology B: same criteria as above. |
| Community Analyst | `general-purpose` | Search for head-to-head comparisons, migration stories, benchmarks, and community sentiment. Find real-world adoption stories and pain points. |
| Codebase Scanner | `Explore` | Check if the current project uses any of the compared technologies. Report existing usage, dependencies, and integration patterns. |

3. **Generate comparison matrix**
4. **Save** to `research/comparisons/{slug}.md`
5. **Update** `research/index.md`

### Comparison Output Format

```markdown
---
title: "{Tech A} vs {Tech B}"
type: comparison
query: "{original query}"
date: {YYYY-MM-DD}
tags: [{tech names, category}]
sources_count: {N}
status: complete
---

# {Tech A} vs {Tech B}

## Summary

{1-2 sentence verdict}

## Comparison Matrix

| Criteria           | {Tech A}     | {Tech B}     |
|--------------------|--------------|--------------|
| Maturity           | ...          | ...          |
| Performance        | ...          | ...          |
| Ecosystem          | ...          | ...          |
| Learning Curve     | ...          | ...          |
| Community          | ...          | ...          |
| Documentation      | ...          | ...          |
| Type Safety        | ...          | ...          |
| Bundle Size / Deps | ...          | ...          |
| License            | ...          | ...          |

## Strengths

**{Tech A}:** ...
**{Tech B}:** ...

## Weaknesses

**{Tech A}:** ...
**{Tech B}:** ...

## When to Choose

- **Choose {Tech A} when:** ...
- **Choose {Tech B} when:** ...

## Current Project Context

{How this applies to the current codebase, if relevant}

## Sources

- [{title}]({url}) — {description}
```

---

## Evaluate — Technology Evaluation for Adoption

### `evaluate <technology>`

1. **Spawn 4 research agents in parallel**:

| Agent | Type | Task |
|-------|------|------|
| Overview Researcher | `general-purpose` | Research the technology: what it is, core features, current version, release cadence, backing organization, license. Get the latest stable version and recent changelog highlights. |
| Adoption Analyst | `general-purpose` | Research adoption: GitHub stars/activity, npm/PyPI downloads, Stack Overflow questions, notable companies using it, case studies. Look for signs of growth or decline. |
| Risk Assessor | `general-purpose` | Research risks: known issues, breaking changes history, bus factor, competing technologies, deprecation signals, security track record, vendor lock-in concerns. |
| Integration Scout | `Explore` | Check the current project's stack compatibility. Look at existing dependencies, framework versions, and potential conflicts. Assess integration effort. |

2. **Generate evaluation scorecard**
3. **Save** to `research/evaluations/{slug}.md`
4. **Update** `research/index.md`

### Evaluation Output Format

```markdown
---
title: "{Technology} Evaluation"
type: evaluation
query: "{original query}"
date: {YYYY-MM-DD}
tags: [{tech name, category}]
sources_count: {N}
status: complete
recommendation: adopt|trial|assess|hold
overall_score: {X}/5
---

# {Technology} Evaluation

## Overview

| Field | Value |
|-------|-------|
| Technology | {name} |
| Version | {latest stable} |
| License | {license} |
| Maintained by | {org/community} |

## Scorecard

| Criteria            | Score | Notes                    |
|---------------------|-------|--------------------------|
| Maturity            | X/5   | ...                      |
| Community           | X/5   | ...                      |
| Documentation       | X/5   | ...                      |
| Performance         | X/5   | ...                      |
| Ecosystem           | X/5   | ...                      |
| Maintenance         | X/5   | ...                      |
| Security            | X/5   | ...                      |
| Integration Effort  | X/5   | ...                      |
|---------------------|-------|--------------------------|
| **Overall**         | **X/5** |                        |

## Pros

1. ...
2. ...
3. ...

## Cons

1. ...
2. ...
3. ...

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| {risk} | High/Med/Low | {mitigation} |

## Project Compatibility

{Assessment of fit with current stack}

## Recommendation

**{ADOPT / TRIAL / ASSESS / HOLD}** — {reasoning}

## Sources

- [{title}]({url}) — {description}
```

---

## Best Practices — Research Current Best Practices

### `best-practices <topic>`

1. **Spawn 3 agents in parallel**:

| Agent | Type | Task |
|-------|------|------|
| Standards Researcher | `general-purpose` | Search for official recommendations, style guides, and documented best practices from authoritative sources (official docs, core team blogs, RFCs). |
| Community Researcher | `general-purpose` | Search for community-adopted best practices: popular blog posts, conference talks, widely-starred GitHub repos with exemplary patterns. Focus on recent content (last 12 months). |
| Codebase Auditor | `Explore` | Audit the current codebase against known best practices for this topic. Identify areas that follow or deviate from standards. |

2. **Generate best practices guide**
3. **Save** to `research/best-practices/{slug}.md`
4. **Update** `research/index.md`

### Best Practices Output Format

```markdown
---
title: "Best Practices: {topic}"
type: best-practices
query: "{original query}"
date: {YYYY-MM-DD}
tags: [{topic tags}]
sources_count: {N}
status: complete
---

# Best Practices: {topic}

## Essential Practices

### 1. {practice}

**Why it matters:** {explanation}

**Do:**
{example or code snippet}

**Avoid:**
{anti-pattern or code snippet}

### 2. {practice}
...

## Recommended Practices

1. ...
2. ...

## Current Codebase Assessment

### Following
- {practice} — {where in codebase}

### Needs Improvement
- {practice} — {what to change, with file references}

## Action Items

1. {specific action with file references}
2. {specific action with file references}

## Sources

- [{title}]({url}) — {description}
```

---

## Deep — Exhaustive Research

### `deep <query>`

Spawn 5+ agents for a comprehensive investigation:

| Agent | Type | Task |
|-------|------|------|
| Web Researcher | `general-purpose` | Broad web search for current information and documentation. |
| Academic Researcher | `general-purpose` | Search for papers, specifications, RFCs, formal documentation. |
| Community Scout | `general-purpose` | Search GitHub issues/discussions, Stack Overflow, Reddit, HN for real-world experiences and gotchas. |
| Code Explorer | `Explore` | Deep codebase scan at `"very thorough"` level. |
| Trend Analyst | `general-purpose` | Research recent developments, upcoming changes, roadmap items, and ecosystem trends. |

Use `"very thorough"` exploration level for all Explore agents. Generate a comprehensive report combining all sections from the formats above.

**Save** to `research/deep-dives/{slug}.md` and **update** `research/index.md`.

---

## General Guidelines

### Agent Configuration

- All web-searching agents should use `general-purpose` type with explicit instructions to use WebSearch and WebFetch tools
- All codebase agents should use `Explore` type
- Always spawn agents **in parallel** using a single message with multiple Task tool calls
- Each agent should return findings with source URLs where applicable

### Source Quality

Prioritize sources in this order:
1. Official documentation
2. Core team blogs and announcements
3. Reputable tech publications
4. Well-regarded community content
5. Stack Overflow answers (high-vote)
6. GitHub issues and discussions

### Report Quality

- Always include source URLs for verifiable claims
- Distinguish between facts and opinions
- Note when information may be outdated
- Highlight conflicting information from different sources
- Include practical takeaways, not just theory

### Persistence Checklist

After every research run, verify:
1. Research file written to correct subdirectory
2. Frontmatter is complete and valid
3. Tags are relevant and lowercase
4. Sources count matches actual sources listed
5. Index updated with new/updated entry
6. Inform user of saved file path

---

## Arguments

- `$ARGUMENTS` — Research mode and query. Examples:
  - `"how does React Server Components work"` — Topic research (default)
  - `topic "WebSocket authentication patterns"` — Explicit topic mode
  - `compare "Prisma vs Drizzle vs TypeORM"` — Technology comparison
  - `compare Next.js vs Remix` — Compare frameworks
  - `evaluate "tRPC"` — Technology evaluation
  - `best-practices "API error handling"` — Best practices research
  - `best-practices "monorepo structure"` — Best practices research
  - `deep "microservice event sourcing patterns"` — Exhaustive deep dive
  - `list` — List all saved research
  - `search "authentication"` — Search existing research

## Output

Structured research report with findings, sources, practical recommendations, and codebase relevance. All reports are persisted to `research/` for future reference and context RAG.
