#!/usr/bin/env bash
# SpecGuard: repeatable, fail-closed deployment to the owner's verified Jira.
# Run from a trusted shell with FORGE_API_TOKEN set. Never commit the token.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

SITE="issueslinux.atlassian.net"
: "${FORGE_EMAIL:=issueslinux@gmail.com}"
export FORGE_EMAIL

# Never forward secrets to npm lifecycle scripts or locally-run tests.
# Keep the token non-exported and add it only to Forge CLI invocations.
FORGE_TOKEN="${FORGE_API_TOKEN:-}"
export -n FORGE_TOKEN
unset FORGE_API_TOKEN

if [[ "${1:-}" == "--verify-only" ]]; then
  npm test
  npm run check
  npm run preflight -- --json
  exit 0
fi
if [[ "${1:-}" != "--deploy" ]]; then
  echo "Usage: $0 --verify-only|--deploy" >&2
  exit 2
fi
if [[ "$FORGE_EMAIL" != "issueslinux@gmail.com" ]]; then
  echo "BLOCK: unexpected Forge account; refusing to install on $SITE" >&2
  exit 2
fi
if [[ -z "$FORGE_TOKEN" ]]; then
  echo "BLOCK: export a scoped FORGE_API_TOKEN (Forge app) in your trusted shell; not in git." >&2
  exit 2
fi
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo "BLOCK: Node.js and npm must be installed." >&2
  exit 2
fi

# Atlassian Forge CLI minimums changed on 26 October 2026. Node 20 and early
# Node 22 releases cannot run the current CLI. Validate before npm downloads.
NODE_VERSION="$(node --version)"
if [[ ! "$NODE_VERSION" =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  echo "BLOCK: cannot parse Node.js version '$NODE_VERSION'." >&2
  exit 2
fi
NODE_MAJOR="${BASH_REMATCH[1]}"
NODE_MINOR="${BASH_REMATCH[2]}"
NODE_PATCH="${BASH_REMATCH[3]}"
if ! (( (NODE_MAJOR == 22 && (NODE_MINOR > 23 || (NODE_MINOR == 23 && NODE_PATCH >= 4))) ||
        (NODE_MAJOR == 24 && (NODE_MINOR > 22 || (NODE_MINOR == 22 && NODE_PATCH >= 1))) ||
        (NODE_MAJOR == 26 && (NODE_MINOR > 12 || (NODE_MINOR == 12 && NODE_PATCH >= 1))) )); then
  echo "BLOCK: Node.js $NODE_VERSION unsupported by Forge CLI; requires >=22.23.4, >=24.22.1, or >=26.12.1 within those LTS majors." >&2
  exit 2
fi

# Avoid root privileges and global npm installation: put CLI in ignored local tools.
npm install --prefix .forge-tools --no-audit --no-fund @forge/cli@latest
FORGE_CLI="$PWD/.forge-tools/node_modules/.bin/forge"
if [[ ! -x "$FORGE_CLI" ]]; then
  echo "BLOCK: Forge CLI installation did not produce executable." >&2
  exit 2
fi
npm install --no-audit --no-fund
npm test
npm run check

if grep -q 'ari:cloud:ecosystem::app/00000000-0000-0000-0000-000000000000' manifest.yml; then
  echo "Registering existing SpecGuard source. This may require interactive developer space / terms confirmation."
  FORGE_API_TOKEN="$FORGE_TOKEN" "$FORGE_CLI" register SpecGuard
fi
npm run preflight -- --strict
FORGE_API_TOKEN="$FORGE_TOKEN" "$FORGE_CLI" lint
FORGE_API_TOKEN="$FORGE_TOKEN" "$FORGE_CLI" deploy -e development
FORGE_API_TOKEN="$FORGE_TOKEN" "$FORGE_CLI" install -e development -s "$SITE" -p jira --confirm-scopes
FORGE_API_TOKEN="$FORGE_TOKEN" "$FORGE_CLI" install list
echo "Forge deployment and install commands completed; verify the live issue panel at https://$SITE/browse/SGD-1"
