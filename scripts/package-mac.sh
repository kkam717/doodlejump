#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven is required. Install from https://maven.apache.org/"
  exit 1
fi

if ! command -v jpackage >/dev/null 2>&1; then
  echo "jpackage is required (JDK 17+). Install a full JDK, not just a JRE."
  exit 1
fi

ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
  JPACKAGE_TYPE="${JPACKAGE_TYPE:-dmg}"
else
  JPACKAGE_TYPE="${JPACKAGE_TYPE:-dmg}"
fi

echo "Building desktop app for macOS ($ARCH)..."
mvn -q clean package

mkdir -p dist/mac
ICON_ARG=()
if [ -f "$ROOT/assets/icon.icns" ]; then
  ICON_ARG=(--icon "$ROOT/assets/icon.icns")
fi

jpackage \
  --name DoodleHopHop \
  --app-version 1.0.0 \
  --vendor DoodleJump \
  --description "Doodle Jump arcade game" \
  --type "$JPACKAGE_TYPE" \
  --input target/package-input \
  --main-jar doodlejump-1.0.0.jar \
  --main-class doodlejump.App \
  --dest dist/mac \
  --java-options "-Xmx512m" \
  "${ICON_ARG[@]}"

mkdir -p web/downloads server/downloads
cp -f dist/mac/DoodleHopHop-1.0.0.dmg web/downloads/
cp -f dist/mac/DoodleHopHop-1.0.0.dmg server/downloads/

echo ""
echo "Installer created in dist/mac/"
echo "Web download copy: web/downloads/DoodleHopHop-1.0.0.dmg"
ls -la dist/mac/
