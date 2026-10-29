#!/usr/bin/env bash
# Builds the installable plugin zip: dist/anypress-blocks.zip, with the plugin in an "anypress-blocks" folder as WordPress expects,
# and dist/SHA256SUMS. Leaves out the top-level files and folders listed in .distignore (tests, tooling, this script).
#
#   bin/build-zip.sh
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SLUG=anypress-blocks
VERSION=$(sed -n 's/^ \* Version: *//p' "$ROOT/anypress-blocks.php" | head -1)
STABLE=$(sed -n 's/^Stable tag: *//p' "$ROOT/readme.txt" | head -1)
[ "$VERSION" = "$STABLE" ] || { echo "plugin header Version ($VERSION) and readme.txt Stable tag ($STABLE) differ" >&2; exit 1; }

DIST=$ROOT/dist
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
rm -rf "$DIST" && mkdir -p "$DIST" "$STAGE/$SLUG"

# .distignore lists top-level files and folders, one per line.
for entry in "$ROOT"/* "$ROOT"/.[!.]*; do
    [ -e "$entry" ] || continue
    grep -qxF "$(basename "$entry")" "$ROOT/.distignore" || cp -a "$entry" "$STAGE/$SLUG/"
done
# Fixed timestamps and order, so the same commit always gives the same zip (and checksum).
find "$STAGE/$SLUG" -exec touch -h -d '2000-01-01 00:00:00 UTC' {} +
(cd "$STAGE" && find "$SLUG" -type f | LC_ALL=C sort | TZ=UTC zip -q -X -D "$DIST/$SLUG.zip" -@)
(cd "$DIST" && sha256sum "$SLUG.zip" > SHA256SUMS)
echo "AnyPress Blocks $VERSION: $(cat "$DIST/SHA256SUMS")"
