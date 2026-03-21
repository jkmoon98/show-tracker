#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Rotate TMDB API key for this project (Spark/client-side).

Usage:
  TMDB_API_KEY="new_tmdb_key" ./scripts/rotate-tmdb-key.sh
  ./scripts/rotate-tmdb-key.sh --no-deploy

Options:
  --no-deploy   Update config.js + functions/.env, but do not run firebase deploy

Notes:
  - Do NOT commit secrets. This script only edits gitignored files:
    - config.js
    - functions/.env
EOF
}

NO_DEPLOY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-deploy) NO_DEPLOY=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "${TMDB_API_KEY:-}" ]]; then
  echo "TMDB_API_KEY is not set. Example: TMDB_API_KEY=\"...\" $0" >&2
  exit 1
fi

NEW_KEY="${TMDB_API_KEY}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_JS="${ROOT_DIR}/config.js"
ENV_FILE="${ROOT_DIR}/functions/.env"
ENV_EXAMPLE="${ROOT_DIR}/functions/.env.example"

if [[ ! -f "$CONFIG_JS" ]]; then
  echo "Missing $CONFIG_JS. Create it from config.example.js first." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$ENV_EXAMPLE" ]]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created $ENV_FILE from $ENV_EXAMPLE."
  else
    echo "Missing $ENV_FILE and $ENV_EXAMPLE." >&2
    exit 1
  fi
fi

backup() {
  local f="$1"
  local b="${f}.bak-${TIMESTAMP}"
  cp "$f" "$b"
  echo "Backup: $b"
}

echo "Updating TMDB key in $CONFIG_JS and $ENV_FILE ..."
backup "$CONFIG_JS" >/dev/null
backup "$ENV_FILE" >/dev/null

# Update config.js (client-side key)
if grep -qE 'window\.TMDB_API_KEY[[:space:]]*=' "$CONFIG_JS"; then
  # Replace the quoted value only (avoid touching the rest of the file).
  perl -0777 -i -pe 's/window\.TMDB_API_KEY\s*=\s*"[^"]*"\s*;?/window.TMDB_API_KEY = "'\"${NEW_KEY//\\/\\\\}\"'";/g' "$CONFIG_JS"
else
  # Fallback: append near the Firebase config block.
  echo "" >> "$CONFIG_JS"
  echo "window.TMDB_API_KEY = \"${NEW_KEY//\\/\\\\}\";" >> "$CONFIG_JS"
fi

# Update functions/.env (server-side key, used if you later deploy Blaze functions)
if grep -qE '^TMDB_API_KEY=' "$ENV_FILE"; then
  perl -0777 -i -pe 's/^TMDB_API_KEY=.*$/TMDB_API_KEY="'\"${NEW_KEY//\\/\\\\}\"'"/m' "$ENV_FILE"
else
  echo "TMDB_API_KEY=${NEW_KEY}" >> "$ENV_FILE"
fi

echo "Done updating files."

if [[ "$NO_DEPLOY" -eq 1 ]]; then
  echo "Skipping deploy (--no-deploy)."
  exit 0
fi

echo "Deploying Firebase Hosting..."
cd "$ROOT_DIR"
firebase deploy --only hosting
echo "Deploy complete."

