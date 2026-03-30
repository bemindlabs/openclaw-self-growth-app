---
name: jira
description: This skill should be used when the user asks to "create a Jira issue", "update Jira ticket", "check Jira status", "list Jira sprint", "transition Jira issue", "link commits to Jira", or discusses Jira project management and issue tracking workflows.
version: 1.0.0
---

# Jira Skill

Interact with Jira for issue management, sprint tracking, and development workflow integration.

## When to Activate

- User asks to create, update, or query Jira issues
- User wants to view sprint status or backlog
- User asks to transition issue status (e.g., "move to In Progress")
- User wants to link code changes to Jira tickets
- User references a Jira issue key (e.g., PROJ-123)

## Prerequisites

- **Jira URL**: Set as `JIRA_BASE_URL` environment variable (e.g., `https://company.atlassian.net`)
- **Authentication**: Set `JIRA_API_TOKEN` and `JIRA_USER_EMAIL` environment variables
- For Atlassian Cloud, use API token from https://id.atlassian.com/manage-profile/security/api-tokens

## API Authentication

All requests use Basic Auth with email and API token:

```bash
AUTH=$(echo -n "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" | base64)

curl -s -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/<endpoint>"
```

## Core Operations

### Search Issues (JQL)

```bash
# Search with JQL
curl -s -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/search?jql=<JQL_QUERY>&maxResults=50&fields=summary,status,assignee,priority,issuetype"
```

Common JQL queries:
- `project = PROJ AND sprint in openSprints()` — Current sprint issues
- `assignee = currentUser() AND status != Done` — My open issues
- `project = PROJ AND status = "To Do" ORDER BY priority DESC` — Backlog by priority
- `labels = bug AND created >= -7d` — Recent bugs

### Get Issue Details

```bash
curl -s -H "Authorization: Basic $AUTH" \
  "$JIRA_BASE_URL/rest/api/3/issue/<ISSUE_KEY>?fields=summary,description,status,assignee,priority,issuetype,labels,components,fixVersions,comment"
```

### Create Issue

```bash
curl -s -X POST -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/issue" \
  -d '{
    "fields": {
      "project": {"key": "PROJ"},
      "summary": "Issue title",
      "description": {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Description here"}]}]
      },
      "issuetype": {"name": "Task"},
      "priority": {"name": "Medium"},
      "labels": ["label1"],
      "assignee": {"accountId": "<ACCOUNT_ID>"}
    }
  }'
```

### Update Issue

```bash
curl -s -X PUT -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/issue/<ISSUE_KEY>" \
  -d '{
    "fields": {
      "summary": "Updated title",
      "labels": ["updated-label"]
    }
  }'
```

### Transition Issue (Change Status)

```bash
# First get available transitions
curl -s -H "Authorization: Basic $AUTH" \
  "$JIRA_BASE_URL/rest/api/3/issue/<ISSUE_KEY>/transitions"

# Then perform transition
curl -s -X POST -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/issue/<ISSUE_KEY>/transitions" \
  -d '{"transition": {"id": "<TRANSITION_ID>"}}'
```

### Add Comment

```bash
curl -s -X POST -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  "$JIRA_BASE_URL/rest/api/3/issue/<ISSUE_KEY>/comment" \
  -d '{
    "body": {
      "type": "doc",
      "version": 1,
      "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Comment text"}]}]
    }
  }'
```

### Sprint Information

```bash
# Get boards
curl -s -H "Authorization: Basic $AUTH" \
  "$JIRA_BASE_URL/rest/agile/1.0/board?projectKeyOrId=PROJ"

# Get active sprint
curl -s -H "Authorization: Basic $AUTH" \
  "$JIRA_BASE_URL/rest/agile/1.0/board/<BOARD_ID>/sprint?state=active"

# Get sprint issues
curl -s -H "Authorization: Basic $AUTH" \
  "$JIRA_BASE_URL/rest/agile/1.0/sprint/<SPRINT_ID>/issue?fields=summary,status,assignee,story_points"
```

## Workflow Integration

### Link Commits to Issues

When working on a Jira issue, include the issue key in commit messages and branch names:
- Branch: `feature/PROJ-123-description`
- Commit: `PROJ-123: Implement feature X`

### Auto-Transition on Code Events

After completing work on an issue:
1. Fetch available transitions for the issue
2. Find the appropriate transition (e.g., "In Review", "Done")
3. Execute the transition
4. Add a comment summarizing the changes

## Output Formatting

When displaying Jira data, format as:
- **Issue list**: Table with Key, Summary, Status, Assignee, Priority
- **Issue detail**: Structured view with all relevant fields
- **Sprint board**: Grouped by status columns (To Do | In Progress | Done)
- **Search results**: Concise table sorted by priority
