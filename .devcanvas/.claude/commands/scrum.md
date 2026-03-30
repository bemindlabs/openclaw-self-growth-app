---
description: Scrum framework — init, backlog, sprint, planning, standup, review, retro, stories, epics, refinement, burndown, DoD, lean sprint
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [init|backlog|sprint|planning|standup|review|retro|story|epic|refinement|burndown|dod|lean] [action]
---

# Scrum Management

Unified command for the complete Scrum framework: initialization, backlog management, sprint lifecycle, ceremonies, stories, epics, burndown tracking, and lean execution.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `init [action]` — Initialize Scrum framework
- `backlog [action]` — Manage product backlog
- `sprint [action]` — Sprint lifecycle management
- `planning [action]` — Sprint planning sessions
- `standup [action]` — Daily standup notes
- `review [action]` — Sprint review/demo
- `retro [action]` — Sprint retrospective
- `story [action]` — User story management
- `epic [action]` — Epic management
- `refinement [action]` — Backlog refinement/grooming
- `burndown [action]` — Sprint burndown tracking
- `dod [action]` — Definition of Done
- `lean [action]` — Lean sprint execution with multi-agent parallel tasks
- No arguments — Show Scrum status overview

---

## Status Overview (default, no arguments)

Show combined Scrum dashboard by reading `.scrum/` files:

```
Scrum Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project:     {name} ({KEY})
Sprint:      Sprint {n} - Day {x} of {y}
Goal:        {sprint goal}

Progress:    ████████████░░░░░░░░ 60%
Points:      20/34 completed
Items:       5/8 done

Backlog:     12 items (48 pts total)
Velocity:    Avg 32 pts/sprint (last 3)

Quick Actions:
  /scrum standup              Record today's standup
  /scrum burndown             View burndown chart
  /scrum backlog list         View backlog
  /scrum sprint status        Sprint progress
```

---

## Init — Initialize Scrum Framework

### `init` — Full project-aware initialization

1. **Detect Project Context**: Read `package.json`, `pyproject.toml`, etc. to identify tech stack, CI/CD, test framework, linter, monorepo structure
2. **Check Jira**: If `JIRA_BASE_URL`, `JIRA_API_TOKEN`, `JIRA_USER_EMAIL` are set, auto-enable Jira integration
3. **Create `.scrum/` directory**:
   ```
   .scrum/
   ├── config.json              # Scrum configuration
   ├── backlog.json             # Product backlog
   ├── velocity.json            # Velocity tracking
   ├── definition-of-done.md    # DoD tailored to project
   ├── jira-sync.json           # Jira sync state (if enabled)
   ├── sprints/                 # Sprint data
   ├── planning/                # Sprint planning docs
   ├── standups/                # Daily standup notes
   ├── reviews/                 # Sprint review documents
   ├── retrospectives/          # Retro notes
   ├── refinement/              # Refinement sessions
   └── burndowns/               # Burndown chart data
   ```
4. **Generate `config.json`** with auto-detected: project name/key/type, tech stack, sprint duration, workflow statuses, estimation scale (fibonacci), quality gates (test/lint/type-check commands), integrations (CI/CD, issue tracker, board), Jira config, team settings
5. **Generate project-tailored DoD** based on detected stack (TypeScript → type checking, Docker → container builds, API → OpenAPI docs, etc.)
6. **Initialize empty backlog and velocity tracker**
7. **Seed backlog** from TODO.md, ROADMAP.md, TODO/FIXME comments, or GitHub Issues
8. **Jira integration setup** (if detected): validate connectivity, detect project/board/fields/issue types, map workflow statuses, import backlog and active sprint
9. **Display initialization summary**

### `init solo` — Solo developer mode

- Team size 1, 7-day sprints, simplified statuses (`backlog → in_progress → done`), no review requirements

### `init team {size}` — Team mode

- Set team size, prompt for member names, full DoD with review requirements

### `init minimal` — Lightweight setup

- Only `config.json`, `backlog.json`, `velocity.json` with simplified statuses

### `init jira {PROJECT_KEY}` — Initialize with Jira

- Force Jira integration on, use Jira issue keys as local IDs, full Jira setup (connectivity, project, board, fields, import)

### `init jira sync` — Re-sync existing Jira integration

- Pull latest issues, push local status changes, update sync timestamp

### `init jira disconnect` — Remove Jira integration

- Set `jira.enabled: false`, keep local items, remove sync metadata

### `init reset` — Reset scrum configuration

- Archive existing `.scrum/` to backup, re-run initialization

### `init status` — Show initialization status

- Check which `.scrum/` files exist, validate config, report missing/misconfigured files

### Project Type Profiles

| Profile | Sprint | Statuses | Extra DoD |
|---------|--------|----------|-----------|
| `app` | 14 days | full | Cross-browser, accessibility |
| `api` | 14 days | full | API docs, contract tests |
| `library` | 14 days | full | CHANGELOG, semver, backward compat |
| `cli` | 14 days | full | Help text, man page |
| `monorepo` | 14 days | full | Affected packages, cross-package |
| `service` | 14 days | full | Health checks, monitoring |

---

## Backlog — Product Backlog Management

### `backlog` or `backlog list` — List backlog items

Read `.scrum/backlog.json`, display sorted by priority with ID, title, points, priority, status.

### `backlog add "{title}"` — Add new backlog item

Create item with auto-generated ID (`{PROJECT_KEY}-{number}`), default priority medium, status backlog. If Jira enabled, create corresponding Jira issue.

### `backlog prioritize {id} {priority}` — Update priority

Set priority: `critical`, `high`, `medium`, `low`. Re-sort backlog.

### `backlog estimate {id} {points}` — Set story points

Fibonacci scale: 1, 2, 3, 5, 8, 13, 21.

### `backlog start {id}` — Move to in-progress

Update status, create feature branch (`feature/{KEY}-{id}-{slug}`). If Jira enabled, transition to "In Progress".

### `backlog done {id}` — Mark as completed

Update status to done. If Jira enabled, transition to "Done".

### `backlog remove {id}` — Remove item

Remove from backlog. If Jira enabled, warn that Jira issue remains.

### `backlog search {query}` — Search backlog

Search across title, description, and labels.

---

## Sprint — Sprint Lifecycle

### `sprint start` — Start new sprint

Create `.scrum/sprints/sprint-{n}.json` with dates, goal, selected items, active status.

### `sprint status` — Show sprint progress

Display day progress, burndown metrics, item statuses with completion percentages.

### `sprint close` — End sprint

Move incomplete items back to backlog, calculate actual velocity, update status to completed, archive data. If Jira enabled, sync final statuses and close Jira sprint.

---

## Planning — Sprint Planning

### `planning` — Start new planning session

1. Review last sprint velocity
2. Calculate team capacity
3. Present prioritized backlog items
4. Facilitate item selection based on capacity
5. Create sprint goal
6. Save planning document to `.scrum/planning/sprint-{n}-planning.md`

### `planning capacity` — Calculate team capacity

Prompt for availability, calculate total hours, recommend story points based on velocity.

### `planning goal {description}` — Set sprint goal

Validate goal is specific and achievable, link to selected items.

### `planning select {item-ids}` — Select backlog items for sprint

Validate items exist, check total points vs capacity, move items to sprint.

### `planning breakdown {item-id}` — Break down item into tasks

Display item, prompt for task breakdown, estimate task hours.

### `planning finalize` — Complete planning session

Validate sprint goal exists, confirm all items have tasks, create sprint file, archive planning document.

### Planning includes velocity reference chart and optional planning poker.

---

## Standup — Daily Standup

### `standup` — Record today's standup

Create/open `.scrum/standups/YYYY-MM-DD.md` with sections: What I Did Yesterday, What I'm Doing Today, Blockers, Notes.

### `standup list` — List recent standups (last 7)

### `standup view {date}` — View specific standup

### `standup blockers` — Show unresolved blockers from recent standups

### Quick entry: `standup "Done: X, Y | Today: A, B | Blocked: none"`

---

## Review — Sprint Review/Demo

### `review` — Conduct sprint review

Load current sprint, gather completed items, calculate metrics, create review document at `.scrum/reviews/sprint-{n}-review.md`. If Jira enabled, transition completed items to Done.

### `review prepare` — Prepare demo agenda

List completed items, assign demo responsibilities, create demo script, estimate duration.

### `review demo {item-id}` — Record demo for specific item

Display item, record demo notes, capture stakeholder feedback.

### `review feedback` — Collect stakeholder feedback

Display completed work, prompt for feedback per item, capture new backlog suggestions.

### `review metrics` — Show sprint metrics

Calculate velocity, compare planned vs actual, show completion rate and trend chart.

### `review finalize` — Complete review session

Save feedback, update backlog with new items, archive review document.

---

## Retro — Sprint Retrospective

### `retro` — Create new retrospective

Create `.scrum/retrospectives/sprint-{n}-retro.md` with: Sprint Summary, What Went Well, What Could Be Improved, Action Items, Key Metrics, Notes.

### `retro list` — List past retrospectives

### `retro actions` — Show open action items from all retros

### `retro view {sprint-id}` — View specific retrospective

### Includes facilitation prompts for each section.

---

## Story — User Story Management

### `story list` — List user stories

Filter backlog by `type: "story"`, display with points, assignee, epic, status.

### `story add "{title}"` — Create new user story

Create with user story template (`As a... I want... So that...`), acceptance criteria, story points. If Jira enabled, create Jira story.

### `story update {id} "{description}"` — Update story details

### `story criteria {id} "{criterion}"` — Add acceptance criterion

### `story estimate {id} {points}` — Set story points

Fibonacci scale. Warn if >13 (consider splitting).

### `story assign {id} {user}` — Assign to team member

### `story status {id} {status}` — Update story status

Statuses: `backlog`, `ready`, `in_progress`, `review`, `testing`, `done`. If Jira enabled, transition issue.

### `story epic {id} {epic_id}` — Link story to epic

### `story remove {id}` — Remove story

### `story view {id}` — View full story details

Includes user story template, acceptance criteria, metadata, linked epic.

### Story best practices: INVEST principles, size guidelines (1-3 pts = <1 day, 5 pts = 1-2 days, 8 pts = 2-3 days, 13+ = split).

---

## Epic — Epic Management

### `epic list` — List all epics

Display from `.scrum/epics.json` with ID, title, stories count, completion %, status.

### `epic add "{title}"` — Create new epic

Generate ID `{PROJECT_KEY}-EPIC-{number}` with title, description, status, priority, stories array, acceptance criteria, metadata. If Jira enabled, create Jira epic.

### `epic update {id} "{description}"` — Update epic details

### `epic link {epic_id} {story_id}` — Link story to epic

### `epic unlink {epic_id} {story_id}` — Unlink story from epic

### `epic status {id} {status}` — Update epic status

Statuses: `planned`, `in_progress`, `completed`, `on_hold`, `cancelled`.

### `epic remove {id}` — Remove epic

### `epic view {id}` — View epic details with linked stories, progress bar, acceptance criteria

---

## Refinement — Backlog Refinement/Grooming

### `refinement` — Start refinement session

Load unrefined backlog items, sort by priority, create session document at `.scrum/refinement/YYYY-MM-DD-refinement.md`.

### `refinement list` — Show items needing refinement

Identify items missing estimates, acceptance criteria, or clear descriptions. Show readiness summary.

### `refinement refine {item-id}` — Refine specific item

Display current details, prompt for refined description, define acceptance criteria, estimate points, identify dependencies.

### `refinement estimate {item-id}` — Estimate single item

### `refinement split {item-id}` — Split large item

Identify split points, create child items, distribute story points.

### `refinement criteria {item-id}` — Add acceptance criteria

### `refinement ready` — Check sprint readiness

Verify top items have clear description, acceptance criteria, estimate, no blocking dependencies.

### Includes Definition of Ready checklist, estimation guidelines, INVEST criteria check.

---

## Burndown — Sprint Burndown Tracking

### `burndown` — Show current burndown chart

Display ASCII burndown chart with actual vs ideal lines, remaining points, on-track status.

### `burndown update` — Record daily progress

Calculate remaining points, record completed items, note scope changes.

### `burndown daily` — Quick daily auto-update

Scan completed items since last update, auto-calculate remaining points.

### `burndown forecast` — Project completion

Calculate current velocity, project completion date, identify risks, show confidence %.

### `burndown trend` — Show velocity trend

Historical burndown data across sprints, velocity patterns, trend analysis.

### `burndown scope` — Track scope changes

Original vs current scope, added/removed items, scope creep percentage.

### `burndown compare {sprint1} {sprint2}` — Compare sprints

### `burndown export` — Export burndown data (CSV/JSON)

### Status indicators: AHEAD (>10% ahead), ON TRACK (within 10%), AT RISK (10-25% behind), BEHIND (>25% behind).

---

## DoD — Definition of Done

### `dod` — Show current Definition of Done

Display from `.scrum/definition-of-done.md` with all criteria grouped by category: Code Complete, Testing, Code Quality, Documentation, Review, Deployment, Verification.

### `dod check {item-id}` — Check item against DoD

Present DoD checklist, prompt for each criterion, calculate completion %, report pass/fail status.

### `dod update` — Update DoD criteria

Display current DoD, prompt for changes, update timestamp.

### `dod add {criterion}` — Add new criterion

### `dod remove {criterion}` — Remove criterion

### `dod history` — Show DoD change history

### `dod report` — Sprint DoD compliance report

Check all completed items against DoD, calculate compliance % by category, identify common gaps, generate recommendations.

---

## Lean — Lean Sprint Execution

### `lean start {day}` — Start daily lean work

Daily standup, read execution plan, check day tasks, identify blockers, setup multi-agent workflow, create feature branches.

### `lean work {story_id}` — Execute story with lean approach

Implement with lean principles:
- Make it work (even if ugly), commit every 30-60 min, basic smoke test only
- Skip: refactoring, comprehensive tests, perfecting UI, edge cases, premature optimization
- Quick quality check (<2 min): lint + type-check only

### `lean spawn {epic_id}` — Spawn multi-agent parallel tasks

Read epic breakdown, identify parallel tasks, check dependencies, group independent stories, assign to agents with separate branches.

### `lean eod` — End of day workflow

Commit all WIP, push branches, update progress tracking, review tomorrow's tasks, plan agent assignments.

### `lean qa` — Start QA phase

Switch to comprehensive testing: full test suite, E2E tests, manual testing (mobile), create prioritized bug list (P1/P2/P3), fix critical bugs, production build verification, DoD compliance check, deployment preparation.

### `lean status` — Show lean sprint progress

Display completed/remaining points, daily velocity (target vs actual), on-track status, blockers.

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Scrum status overview
  - `init` / `init solo` / `init team 5` / `init minimal` / `init jira PROJ` / `init reset` / `init status`
  - `backlog list` / `backlog add "Title"` / `backlog prioritize PROJ-1 high` / `backlog estimate PROJ-1 5` / `backlog start PROJ-1` / `backlog done PROJ-1`
  - `sprint start` / `sprint status` / `sprint close`
  - `planning` / `planning capacity` / `planning goal "Goal"` / `planning select PROJ-1,PROJ-2` / `planning breakdown PROJ-1` / `planning finalize`
  - `standup` / `standup list` / `standup blockers`
  - `review` / `review prepare` / `review demo PROJ-1` / `review feedback` / `review metrics` / `review finalize`
  - `retro` / `retro list` / `retro actions` / `retro view sprint-1`
  - `story list` / `story add "Title"` / `story criteria PROJ-1 "criterion"` / `story estimate PROJ-1 5` / `story view PROJ-1`
  - `epic list` / `epic add "Title"` / `epic link EPIC-1 PROJ-1` / `epic view EPIC-1`
  - `refinement` / `refinement list` / `refinement refine PROJ-1` / `refinement split PROJ-1` / `refinement ready`
  - `burndown` / `burndown daily` / `burndown forecast` / `burndown trend` / `burndown scope`
  - `dod` / `dod check PROJ-1` / `dod report`
  - `lean start 3` / `lean work ALE-1134` / `lean spawn ALE-1054` / `lean eod` / `lean qa` / `lean status`

## Output

Unified Scrum framework management across initialization, backlog, sprint lifecycle, ceremonies, stories, epics, refinement, burndown, DoD, and lean execution.
