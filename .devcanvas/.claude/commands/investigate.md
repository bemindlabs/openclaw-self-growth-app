---
title: "Investigate"
tags: [ai, claude, anthropic]
aliases: ["Investigate"]
---

# Investigate

Deep investigation of bugs, issues, performance problems, or codebase questions using multiple parallel agents.

## Instructions

### Parse Investigation Target

From `$ARGUMENTS`, determine what to investigate:

- A bug description (e.g., `"login fails after token expires"`)
- A GitHub issue number (e.g., `issue 123`)
- An error message (e.g., `"TypeError: Cannot read property 'id' of undefined"`)
- A performance problem (e.g., `"API response slow on /users endpoint"`)
- A codebase question (e.g., `"how does the auth flow work"`)

### Investigation Strategy

1. **Define the investigation scope** — Break the problem into parallel investigation tracks
2. **Spawn specialized agents** — Launch agents concurrently using the Task tool
3. **Collect findings** — Gather results from all agents
4. **Synthesize report** — Combine findings into a root cause analysis

### Agent Types to Spawn

Choose the relevant agents based on the investigation type. Always spawn at least 2 agents in parallel using a single message with multiple Task tool calls.

#### For Bug Investigation

| Agent | Type | Task |
|-------|------|------|
| Code Tracer | `Explore` | Trace the code path related to the bug. Find the entry point, follow the execution flow, identify where the failure occurs. |
| Error Hunter | `Explore` | Search for error handling, edge cases, recent changes to affected files. Check git log for recent commits that may have introduced the bug. |
| Test Analyzer | `Explore` | Find existing tests for the affected area. Identify missing test coverage. Check if any tests are failing or flaky. |
| Config Checker | `Explore` | Check configuration, environment variables, dependencies, and external service integrations related to the issue. |

#### For Performance Investigation

| Agent | Type | Task |
|-------|------|------|
| Hotspot Finder | `Explore` | Find the code path for the slow operation. Look for N+1 queries, missing indexes, inefficient algorithms, large data processing. |
| Dependency Auditor | `Explore` | Check external calls, database queries, API calls, file I/O in the affected path. Look for blocking operations or missing caching. |
| Pattern Scanner | `Explore` | Search for known performance anti-patterns: synchronous loops with async calls, missing pagination, unbounded queries, memory leaks. |

#### For Architecture/Codebase Questions

| Agent | Type | Task |
|-------|------|------|
| Structure Explorer | `Explore` | Map the overall structure, key files, entry points, and module boundaries related to the question. |
| Flow Tracer | `Explore` | Trace the data/control flow through the system for the area in question. Document the sequence of operations. |
| Integration Mapper | `Explore` | Find external integrations, APIs, databases, and service boundaries. Document how components connect. |

#### For GitHub Issue Investigation

First fetch the issue details:

```bash
gh issue view {number} --json title,body,labels,comments
```

Then spawn agents based on the issue type (bug, performance, or architecture question).

### Spawning Agents

Use the Task tool to spawn agents **in parallel** in a single message. Each agent should receive:

1. **Clear objective** — What specifically to investigate
2. **Starting points** — Files, functions, or areas to begin searching
3. **What to report** — Expected output format

Example prompt for each agent:

```
Investigate: {investigation target}

Your role: {agent role}

Search the codebase to find:
- {specific things to look for}
- {patterns to identify}
- {files/areas to check}

Report your findings including:
- Relevant file paths and line numbers
- Code snippets that are significant
- Your assessment of what you found
- Any potential root causes or issues identified
```

### Synthesize Findings

After all agents return, combine their findings into a structured report:

```
Investigation Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target: {what was investigated}

Summary
-------
{1-2 sentence summary of findings}

Root Cause / Answer
--------------------
{primary finding with evidence}

Evidence
--------
1. {file:line} — {what was found}
2. {file:line} — {what was found}
3. {file:line} — {what was found}

Affected Files
--------------
- {file path} — {why it's relevant}
- {file path} — {why it's relevant}

Recommended Actions
-------------------
1. {action with specific file/line references}
2. {action with specific file/line references}
3. {action with specific file/line references}

Additional Notes
----------------
{anything else discovered during investigation}
```

### Actions

#### Default — Investigate with auto-detected strategy

1. Parse the investigation target from arguments
2. Determine investigation type (bug, performance, architecture, issue)
3. Select appropriate agent roles
4. Spawn 2-4 agents in parallel
5. Collect and synthesize findings
6. Present investigation report

#### `deep` — Thorough investigation with more agents

Spawn additional agents for a more comprehensive investigation:
- Add a git history agent to check recent changes
- Add a dependency agent to check related modules
- Use `"very thorough"` exploration level for all agents

#### `quick` — Fast investigation with fewer agents

Spawn only 2 agents with focused scope for a quick assessment.

#### `fix` — Investigate and fix

1. Run full investigation
2. Present findings to user
3. Ask for confirmation
4. Implement the fix based on findings

## Arguments

- `$ARGUMENTS` — The investigation target. Examples:
  - `"login fails after token expires"`
  - `issue 123`
  - `"TypeError: Cannot read property 'id' of undefined"`
  - `"API response slow on /users endpoint"`
  - `"how does the payment flow work"`
  - `deep "memory leak in worker process"`
  - `quick "why is this test flaky"`
  - `fix "null pointer in user service"`

## Output

Investigation report with root cause analysis, evidence, affected files, and recommended actions.
