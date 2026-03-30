---
title: "Multi-Agent Management"
tags: [ai, claude, anthropic]
aliases: ["Multi-Agent Management"]
---

# Multi-Agent Management

Unified command for spawning, monitoring, and collecting results from parallel multi-agent workflows.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `spawn [count|item-ids]` — Spawn agents in tmux sessions
- `status [action]` — Check agent status and progress
- `collect [scope]` — Collect and consolidate completed work
- No arguments — Show agent overview

---

## Overview (default, no arguments)

Show combined agent dashboard:

```bash
# Check tmux sessions
tmux list-sessions 2>/dev/null || echo "No active sessions"

# Check agent tracking
ls .agents/sessions/*.json 2>/dev/null
ls .agents/completed/*.json 2>/dev/null
```

Display format:
```
Agent Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sessions:    1 active (agents-1703505600)
Agents:      3 spawned (2 working, 1 completed)
Items:       MONO-001, MONO-002, MONO-003
Collected:   0 pending collection

Quick Actions:
  /agents status          View all agent statuses
  /agents collect all     Collect completed work
  /agents spawn 3         Spawn 3 new agents
```

---

## Spawn — Launch Agents

### `spawn {count}` — Spawn multiple agents

1. Check if tmux is available
2. Create a new tmux session named `agents-{timestamp}`
3. For each agent (1 to count):
   - Create a new tmux window named `agent-{n}`
   - Start Claude Code in that window
   - Assign a backlog item from `.scrum/backlog.json` (prioritized)
4. Save session info to `.agents/sessions/{session-id}.json`

### `spawn {item-ids}` — Spawn agents for specific items

1. Parse comma-separated item IDs
2. Create tmux windows for each item
3. Assign specific backlog items to agents
4. Track assignments in `.agents/assignments.json`

### Session Commands

```bash
# Create tmux session
tmux new-session -d -s agents-$(date +%s)

# Create window for agent
tmux new-window -t agents -n agent-1

# Start Claude Code with task
tmux send-keys -t agents:agent-1 'claude "Work on MONO-001"' Enter
```

### Agent Configuration

Store in `.agents/config.json`:

```json
{
  "maxConcurrentAgents": 5,
  "defaultModel": "sonnet",
  "autoCollect": true,
  "sessionPrefix": "agents",
  "workingBranch": "feature/{item-id}"
}
```

### Agent Assignment

Each agent receives:

```markdown
You are working on backlog item: {ITEM-ID}
Branch: feature/{item-slug}

## Task
{item description}

## Acceptance Criteria
{acceptance criteria}

## Instructions
1. Create feature branch from main
2. Implement the feature
3. Write tests (80%+ coverage)
4. Run quality checks: make zero-qa
5. Commit with conventional commit message
6. Signal completion
```

### Tracking Structure

```
.agents/
├── config.json           # Agent configuration
├── sessions/             # Active session records
├── assignments.json      # Current item-to-agent mapping
├── completed/            # Completed work markers
└── logs/                 # Agent output logs
```

---

## Status — Monitor Agents

### `status` or `status list` — List all agents

Show all active and recent agent sessions:

```
Agent Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: agents-1703505600

| Agent   | Item     | Status      | Branch              |
|---------|----------|-------------|---------------------|
| agent-1 | MONO-001 | working     | feature/mono-001    |
| agent-2 | MONO-002 | testing     | feature/mono-002    |
| agent-3 | MONO-003 | completed   | feature/mono-003    |

Active: 2 | Completed: 1 | Failed: 0
```

### `status {agent-id}` — Specific agent status

Show detailed status for one agent:
- Current task
- Time elapsed
- Last activity
- Git status

### `status logs {agent-id}` — View agent logs

Display recent log output:

```bash
# Check specific agent window
tmux capture-pane -t agents:agent-1 -p | tail -20

# View agent logs
cat .agents/logs/session-id/agent-1.log
```

### Status Commands

```bash
# List tmux sessions
tmux list-sessions

# Check specific agent window
tmux capture-pane -t agents:agent-1 -p | tail -20
```

---

## Collect — Gather Results

### `collect` or `collect all` — Collect all completed work

1. **Scan Completed Work**
   - Check `.agents/completed/*.json`
   - List completed items

2. **For Each Completed Item**

   a. **Verify Branch**
   ```bash
   git fetch origin
   git log origin/feature/{item-id} --oneline -5
   ```

   b. **Check Quality**
   ```bash
   git checkout feature/{item-id}
   make zero-qa
   ```

   c. **Review Changes**
   ```bash
   git diff main...feature/{item-id} --stat
   ```

   d. **Create PR** (if quality passes)
   ```bash
   gh pr create --base main --head feature/{item-id} \
     --title "feat: {item-title}" \
     --body "Closes #{item-id}"
   ```

3. **Update Tracking**
   - Mark item as collected in `.agents/collected/`
   - Update backlog item status
   - Archive session data

### `collect {item-id}` — Collect specific item

### `collect --dry-run` — Preview collection without creating PRs

### Collection Report

```
Agent Collection Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collected Items: 3

| Item     | Agent   | Quality | PR        |
|----------|---------|---------|-----------|
| MONO-001 | agent-1 | PASS    | #12       |
| MONO-002 | agent-2 | PASS    | #13       |
| MONO-003 | agent-3 | FAIL    | -         |

Summary:
- PRs Created: 2
- Quality Failed: 1
- Pending Review: 2
```

### Failed Collection

If quality checks fail:
1. Log failure reason
2. Keep item in completed (not collected)
3. Report issues for manual review

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show agent overview
  - `spawn 3` / `spawn MONO-001,MONO-002,MONO-003`
  - `status` / `status list` / `status agent-1` / `status logs agent-1`
  - `collect` / `collect all` / `collect MONO-001` / `collect --dry-run`

## Output

Unified multi-agent management across spawning, monitoring, and result collection.
