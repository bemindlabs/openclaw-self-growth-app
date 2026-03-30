#!/usr/bin/env bash
# PostToolUse: Write | Edit
# Runs the appropriate linter/formatter for the edited file based on extension.
# Input: JSON via stdin (Claude Code hook protocol)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -n "$FILE_PATH" ]] || exit 0

lint_if_available() {
  local cmd=$1; shift
  if command -v "$cmd" &>/dev/null; then
    "$cmd" "$@" && echo "✓ $cmd passed: $FILE_PATH" || echo "⚠ $cmd issues: $FILE_PATH" >&2
  fi
}

case "$FILE_PATH" in
  *.md)        lint_if_available markdownlint "$FILE_PATH" ;;
  *.py)        lint_if_available ruff check --fix "$FILE_PATH" ;;
  *.sh)        lint_if_available shellcheck "$FILE_PATH" ;;
  *.js|*.jsx)  lint_if_available eslint --fix "$FILE_PATH" ;;
  *.ts|*.tsx)  lint_if_available eslint --fix "$FILE_PATH" ;;
  *.go)        lint_if_available gofmt -w "$FILE_PATH" ;;
  *.rs)        lint_if_available rustfmt "$FILE_PATH" ;;
  *.json)      lint_if_available jq . < "$FILE_PATH" > /dev/null ;;
  *.yaml|*.yml) lint_if_available yamllint "$FILE_PATH" ;;
esac

exit 0
