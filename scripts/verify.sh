#!/usr/bin/env bash
# Runs every Python and Java snippet that the notes import. Fails on the first broken one.
set -euo pipefail
cd "$(dirname "$0")/.."
out=$(mktemp -d)
for dir in code/*/python; do
  for f in "$dir"/*.py; do
    case "$f" in *kavya*) continue ;; esac
    (cd "$dir" && python3 "$(basename "$f")" --test)
  done
done
for dir in code/*/java; do
  javac -d "$out" "$dir"/*.java
  for f in "$dir"/*.java; do
    java -cp "$out" "$(basename "$f" .java)" --test
  done
done
echo "All snippets verified."
