#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if [[ ! -s pnpm-lock.yaml ]]; then
  echo 'ERROR: pnpm-lock.yaml is missing.' >&2
  echo 'Generate it in a network-enabled environment with: pnpm install' >&2
  exit 1
fi
printf 'pnpm-lock.yaml: present\n'
