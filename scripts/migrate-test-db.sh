#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for file in "$ROOT"/database/migrations/*.sql; do
  echo "Applying $file"
  psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --file "$file"
done
