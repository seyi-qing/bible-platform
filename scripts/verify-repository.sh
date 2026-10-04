#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo '[1/5] Checking repository metadata'
test -f pnpm-workspace.yaml
test -f package.json
test -f turbo.json

echo '[2/5] Checking migration ordering'
python3 - <<'PY'
from pathlib import Path
files = sorted(Path('database/migrations').glob('*.sql'))
assert files, 'no migrations found'
nums = [int(f.name.split('_', 1)[0]) for f in files]
assert nums == list(range(1, max(nums)+1)), f'migration sequence has gaps: {nums}'
print('migration sequence:', nums)
PY

echo '[3/5] Checking required release documents'
for f in docs/audit/V1.7_RELEASE_AUDIT.md docs/architecture/v1.6-workers.md docs/architecture/v1.7-production-integration.md docs/architecture/v1.9-attack-testing.md tests/integration/README.md; do
  test -f "$f"
done

echo '[4/5] Typecheck/build must be executed by CI after dependency installation'
echo 'repository static checks: PASS'

echo '[5/5] Lockfile status'
if test -f pnpm-lock.yaml; then
  echo 'pnpm-lock.yaml: PRESENT'
else
  echo 'pnpm-lock.yaml: MISSING (release blocker; generate with pnpm install in a network-enabled environment)'
  exit 2
fi
