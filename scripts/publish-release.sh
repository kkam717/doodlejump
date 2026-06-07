#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="${1:-v1.0.0}"
TAG="${VERSION#v}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required: https://cli.github.com/"
  exit 1
fi

ASSETS=()
if [ -f "web/downloads/DoodleHopHop-${TAG}.dmg" ]; then
  ASSETS+=("web/downloads/DoodleHopHop-${TAG}.dmg")
fi
if [ -f "web/downloads/DoodleHopHop-${TAG}.exe" ]; then
  ASSETS+=("web/downloads/DoodleHopHop-${TAG}.exe")
fi

if [ "${#ASSETS[@]}" -eq 0 ]; then
  echo "No installers found in web/downloads/."
  echo "Build first: ./scripts/package-mac.sh (and package-windows.bat on Windows)"
  exit 1
fi

if gh release view "$VERSION" >/dev/null 2>&1; then
  echo "Uploading assets to existing release $VERSION..."
  gh release upload "$VERSION" "${ASSETS[@]}" --clobber
else
  echo "Creating release $VERSION..."
  gh release create "$VERSION" "${ASSETS[@]}" \
    --title "DoodleHopHop ${VERSION}" \
    --notes "Desktop installers for DoodleHopHop ${VERSION}."
fi

MAC_URL="https://github.com/kkam717/doodlejump/releases/download/${VERSION}/DoodleHopHop-${TAG}.dmg"
WIN_URL="https://github.com/kkam717/doodlejump/releases/download/${VERSION}/DoodleHopHop-${TAG}.exe"

echo ""
echo "Release published. Set these on Render:"
echo "  DOWNLOAD_MAC_URL=$MAC_URL"
if [ -f "web/downloads/DoodleHopHop-${TAG}.exe" ]; then
  echo "  DOWNLOAD_WIN_URL=$WIN_URL"
fi
