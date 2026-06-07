#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/server"

if [ ! -d node_modules ]; then
  npm install
fi

if [ -f "$ROOT/web/downloads/DoodleHopHop-1.0.0.dmg" ]; then
  mkdir -p downloads
  cp -f "$ROOT/web/downloads/DoodleHopHop-1.0.0.dmg" downloads/ 2>/dev/null || true
fi
if [ -f "$ROOT/web/downloads/DoodleHopHop-1.0.0.exe" ]; then
  mkdir -p downloads
  cp -f "$ROOT/web/downloads/DoodleHopHop-1.0.0.exe" downloads/ 2>/dev/null || true
fi

PORT="${PORT:-8080}"
export PORT

if lsof -i :"${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use (likely an old static file server):" >&2
  lsof -i :"${PORT}" -sTCP:LISTEN >&2
  echo "Stop that process, then run this script again." >&2
  exit 1
fi

echo "DoodleHopHop: http://localhost:${PORT}/"
echo "Health check: http://localhost:${PORT}/api/health"
echo "Use the root URL above — not /web/ (that path was for the old Python server)."
npm start
