#!/usr/bin/env bash
# PreToolUse: Write | Edit
# Blocks modifications to sensitive files (credentials, secrets, keys, etc.)
# Input: JSON via stdin (Claude Code hook protocol)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -n "$FILE_PATH" ]] || exit 0

SENSITIVE_PATTERNS=(
  "\.env$"
  "\.env\.local$"
  "\.env\.[^.]+\.local$"
  "\.key$"
  "\.pem$"
  "\.p12$"
  "\.pfx$"
  "\.keystore$"
  "credentials.*\.json$"
  "secrets.*\.json$"
  "firebase-adminsdk.*\.json$"
  "service-account.*\.json$"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "BLOCKED: Cannot modify sensitive file: $FILE_PATH" >&2
    exit 2
  fi
done

exit 0
