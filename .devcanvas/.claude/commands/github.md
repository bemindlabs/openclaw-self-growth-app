---
title: "GitHub Management"
tags: [ai, claude, anthropic]
aliases: ["GitHub Management"]
---

# GitHub Management

Unified command for managing GitHub issues, actions, and PR reviews.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the operation:

- `issues [action]` — Manage and fix GitHub issues
- `actions [action]` — Manage and fix GitHub Actions workflows
- `pr [action]` — Manage and fix PR review comments
- No arguments — Show status overview of all three areas

---

## Status Overview (default, no arguments)

Show a combined dashboard:

```bash
# Issues
gh issue list --state open --limit 5 --json number,title,labels

# Actions
gh run list --limit 5 --json status,conclusion,name,headBranch,databaseId

# PRs with reviews pending
gh pr list --json number,title,reviewDecision
```

Display format:
```
GitHub Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Issues (5):
  #123 [bug]         Fix auth token refresh
  #124 [enhancement] Add retry logic to API client

Recent Actions:
  ✓ #456789 CI Pipeline   main       success
  ✗ #456788 CI Pipeline   feature/x  failure

PRs Needing Review Fixes:
  #130 Add auth module    CHANGES_REQUESTED
  #131 Update config      APPROVED
```

---

## Issues

### `issues` or `issues list` — List open issues

```bash
gh issue list --state open --limit 30
```

Display format:
```
Open Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#123 [bug]         Fix auth token refresh
#124 [enhancement] Add retry logic to API client
#125 [feature]     Implement user preferences
#126 [bug]         Handle null response in parser

Total: 4 open issues
```

### `issues fix {number}` — Fix a specific issue

1. Fetch issue details:
   ```bash
   gh issue view {number} --json title,body,labels
   ```
2. Create feature branch:
   ```bash
   git checkout -b fix/issue-{number}-{slug}
   ```
3. Analyze requirements and implement the fix
   - Follow existing code patterns
   - Maintain type safety
   - Add/update tests as needed
4. Verify:
   ```bash
   make lint
   make type-check
   make test
   ```
5. Commit with issue reference:
   ```bash
   git commit -m "fix(scope): description

   Fixes #{number}"
   ```
6. Create PR:
   ```bash
   gh pr create --title "fix: description" --body "Fixes #{number}"
   ```

### `issues batch {numbers}` — Fix multiple issues

Process multiple issues: `issues batch 123,124,125`

1. Fetch all specified issues
2. Group by affected area
3. Fix sequentially or create combined PR

### `issues triage` — Triage and prioritize

1. List all open issues
2. Categorize by type and severity
3. Suggest fix order and estimate complexity

```
Issue Triage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical (fix immediately):
  #123 [bug] Fix auth token refresh

High Priority:
  #126 [bug] Handle null response in parser

Medium Priority:
  #124 [enhancement] Add retry logic

Backlog:
  #125 [feature] Implement user preferences

Recommended: Start with #123 (critical bug)
```

### Issue Label Priority

| Label | Priority | Action |
|-------|----------|--------|
| `critical` | P0 | Fix immediately |
| `bug` | P1 | High priority |
| `security` | P1 | High priority |
| `enhancement` | P2 | Medium priority |
| `feature` | P3 | Normal priority |
| `good first issue` | P3 | Normal priority |
| `documentation` | P4 | Low priority |

### Issue Fix Checklist

- [ ] Root cause identified
- [ ] Fix implemented correctly
- [ ] Tests added/updated
- [ ] All checks pass (lint, type, test)
- [ ] PR created with issue reference
- [ ] Regression tested

Issues are auto-closed when PR is merged using: `Fixes #123`, `Closes #123`, `Resolves #123`

---

## Actions

### `actions` or `actions list` — List workflow runs

```bash
gh run list --limit 30
```

Display format:
```
GitHub Actions Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ #456789 CI Pipeline          main       2m ago   success
✗ #456788 CI Pipeline          feature/x  15m ago  failure
✓ #456787 Deploy              main       1h ago   success
✗ #456786 Tests               pr-123     2h ago   failure
○ #456785 CI Pipeline          feature/y  2h ago   in_progress

Failed: 2 | Success: 2 | Running: 1
```

### `actions failed` — Show only failed runs

```bash
gh run list --status failure --limit 10
```

### `actions fix {run-id}` — Fix a specific failed run

1. Fetch run details and logs:
   ```bash
   gh run view {run-id}
   gh run view {run-id} --log-failed
   ```
2. Parse failure reason and identify affected files
3. Implement fix
4. Verify locally:
   ```bash
   make lint
   make type-check
   make test
   ```
5. Push and re-run:
   ```bash
   git push
   gh run rerun {run-id}
   ```

### `actions logs {run-id}` — View failure logs

```bash
gh run view {run-id} --log-failed
```

### `actions rerun {run-id}` — Re-run a failed workflow

```bash
gh run rerun {run-id}
```

### `actions rerun-failed` — Re-run all failed workflows

```bash
gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -I {} gh run rerun {}
```

### Common Failure Types

| Failure Type | Indicator | Fix Approach |
|--------------|-----------|--------------|
| Lint errors | `ruff check failed` | Run `make lint-fix` |
| Type errors | `mypy found errors` | Fix type annotations |
| Test failures | `pytest failed` | Debug and fix tests |
| Build errors | `build failed` | Check dependencies |
| Timeout | `exceeded time limit` | Optimize or increase timeout |
| Network | `connection failed` | Retry or fix URLs |

### Workflow File Fixes

If issue is in workflow file (`.github/workflows/`):

```yaml
# Fix: Update action version
- uses: actions/setup-python@v4  # was v3

# Fix: Add missing env variable
env:
  MY_VAR: ${{ secrets.MY_VAR }}

# Fix: Increase timeout
timeout-minutes: 30  # was 10

# Fix: Add retry for flaky steps
uses: nick-fields/retry@v2
with:
  max_attempts: 3
  command: make test
```

### Actions Fix Checklist

- [ ] Error understood and root cause identified
- [ ] Fix implemented
- [ ] Local checks pass
- [ ] Related tests pass
- [ ] No new issues introduced

---

## PR Reviews

### `pr` or `pr list` — List review comments

```bash
gh pr view --json number,title,reviews,comments,reviewDecision
```

Display format:
```
PR Review Comments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PR #123: Add user authentication

Review Status: CHANGES_REQUESTED

Comments (4):

src/auth/handler.py
  L45 @reviewer: "Consider using a constant for the timeout value"
  L78 @reviewer: "This should handle the null case"

src/utils/validator.py
  L12 @reviewer: "Missing type hint for return value"

tests/test_auth.py
  L30 @reviewer: "Add test for edge case when token is expired"

Pending: 4 | Resolved: 0
```

### `pr fix {pr-number}` — Fix a specific PR's review comments

1. Fetch PR details:
   ```bash
   gh pr view {pr-number} --json title,body,reviews,comments,reviewDecision
   ```
2. Get review comments:
   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments --jq '.[] | {id, path, line, body, user: .user.login}'
   ```
3. Analyze and categorize each comment
4. Implement fixes following existing code patterns
5. Verify:
   ```bash
   make lint
   make type-check
   make test
   ```
6. Commit:
   ```bash
   git commit -m "fix(scope): address review feedback

   Addresses PR review comments"
   ```
7. Push and request re-review

### `pr current` — Fix current branch's PR

Automatically detect PR from current branch and fix all review comments.

### `pr comment {pr-number} {message}` — Reply to a review

```bash
gh pr comment {pr-number} --body "{message}"
```

### `pr resolve {comment-id}` — Mark comment as resolved

```bash
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {threadId: "{thread-id}"}) {
      thread { isResolved }
    }
  }'
```

### Review Comment Priority

| Type | Priority | Action |
|------|----------|--------|
| Security | P0 | Fix immediately |
| Bug/Logic | P1 | High priority |
| Breaking change | P1 | High priority |
| Performance | P2 | Medium priority |
| Code style | P3 | Normal priority |
| Documentation | P4 | Low priority |
| Nitpick | P4 | Optional |

### Handling Review Types

- **Requested Changes** — Must be addressed before merge. Fix all blocking comments and request re-review.
- **Comments Only** — Address or respond with explanation. Can merge with maintainer approval.
- **Approved with Comments** — Nice-to-have improvements. Address if time permits.

### PR Fix Checklist

- [ ] All comments addressed
- [ ] Changes match reviewer's intent
- [ ] No new issues introduced
- [ ] All checks pass (lint, type, test)
- [ ] Commit messages reference PR
- [ ] No unrelated changes included

---

## Progress Tracking

Track progress across all areas:

```
GitHub Fix Progress
━━━━━━━━━━━━━━━━━━━━━

Issues:
  ✓ #123 - Fixed (PR #130)
  ✓ #124 - Fixed (PR #131)
  ○ #126 - Pending

Actions:
  ✓ #456788 CI Pipeline - Fixed (lint errors)
  ◐ #456790 Deploy - Investigating

PR Reviews:
  ✓ src/auth/handler.py:45 - Fixed
  ◐ src/utils/validator.py:12 - In progress
  ○ tests/test_auth.py:30 - Pending

Overall: 4/8 completed (50%)
```

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show status overview
  - `issues` / `issues list` / `issues fix 123` / `issues batch 123,124` / `issues triage`
  - `actions` / `actions list` / `actions failed` / `actions fix {run-id}` / `actions logs {run-id}` / `actions rerun {run-id}` / `actions rerun-failed`
  - `pr` / `pr list` / `pr fix {pr-number}` / `pr current` / `pr comment {pr-number} {message}` / `pr resolve {comment-id}`

## Output

Manage GitHub issues, actions, and PR reviews from a single unified command.
