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
echo "DoodleHopHop: http://localhost:${PORT}/"
echo "Health check: http://localhost:${PORT}/api/health"
npm start
