#!/bin/sh
# Install git hooks for development
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SOURCE="$REPO_ROOT/.githooks"
GIT_DIR="$(git rev-parse --git-dir)"
HOOKS_TARGET="$GIT_DIR/hooks"

echo "Installing git hooks..."
for hook in "$HOOKS_SOURCE"/*; do
  name=$(basename "$hook")
  cp "$hook" "$HOOKS_TARGET/$name"
  chmod +x "$HOOKS_TARGET/$name"
  echo "  Installed $name"
done
echo "Done. Hooks installed to $HOOKS_TARGET"
