# Automations

This directory contains automation templates for AI-DLC workflows.

## Available Trigger Types

| Type | Description |
|------|-------------|
| `manual` | Triggered manually from the UI |
| `schedule` | Runs on a cron schedule |
| `git_push` | Triggered on git push events |
| `file_change` | Triggered when files change |
| `webhook` | Triggered by external webhooks |

## Available Action Types

| Type | Description |
|------|-------------|
| `run_command` | Execute a shell command |
| `send_notification` | Send a notification |
| `ai_agent_task` | Dispatch task to an AI agent |
| `http_request` | Make an HTTP request |

## Example Automation

```json
{
  "name": "Run Tests on Push",
  "trigger_type": "git_push",
  "trigger_config": "{\"branch\": \"main\"}",
  "action_type": "run_command",
  "action_config": "{\"command\": \"npm test\"}"
}
```
