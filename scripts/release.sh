#!/usr/bin/env bash
# Local release flow for @journeys/core (no CI publish).
# Usage: ./scripts/release.sh <semver>   e.g. ./scripts/release.sh 0.1.1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

VERSION="$1"
TAG="v${VERSION}"
CORE_PKG="$ROOT/packages/core/package.json"

if [[ ! -f "$CORE_PKG" ]]; then
  echo "Missing $CORE_PKG" >&2
  exit 1
fi

CURRENT="$(node -e "const fs=require('fs');console.log(JSON.parse(fs.readFileSync('$CORE_PKG','utf8')).version)")"
if [[ "$CURRENT" == "$VERSION" ]]; then
  echo "packages/core is already at $VERSION"
else
  node -e "
    const fs = require('fs');
    const path = '$CORE_PKG';
    const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
    pkg.version = '$VERSION';
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  "
  echo "Bumped @journeys/core $CURRENT → $VERSION"
fi

echo "Running pnpm validate..."
pnpm validate

if ! git diff --quiet || ! git diff --cached --quiet; then
  git add packages/core/package.json
  git commit -m "chore(core): release $TAG"
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG already exists; skipping tag creation"
else
  git tag -a "$TAG" -m "@journeys/core $TAG"
  echo "Created tag $TAG"
fi

echo "Publishing @journeys/core@$VERSION..."
pnpm --filter @journeys/core publish --access public

echo "Done. Remember to:"
echo "  - Update CHANGELOG.md and docs/release-notes.md"
echo "  - git push origin main --tags"
