import { apiFetch, isBackendConfigured } from "./config.js";

const RELEASE_API =
  "https://api.github.com/repos/kkam717/doodlejump/releases/tags/v1.0.0";

const ASSET_FILES = {
  mac: "DoodleHopHop-1.0.0.dmg",
  win: "DoodleHopHop-1.0.0.exe",
};

async function fetchReleaseAssets() {
  const response = await fetch(RELEASE_API);
  if (!response.ok) {
    throw new Error("release unavailable");
  }

  const release = await response.json();
  const assets = {};
  for (const asset of release.assets || []) {
    assets[asset.name] = asset;
  }
  return assets;
}

export async function setupDownloads() {
  const macLink = document.getElementById("mac-download");
  const winLink = document.getElementById("win-download");

  let assets = null;
  try {
    assets = await fetchReleaseAssets();
  } catch {
    assets = null;
  }

  if (isBackendConfigured()) {
    try {
      const response = await apiFetch("/api/downloads");
      if (response.ok) {
        const data = await response.json();
        configureLink(macLink, data.mac, assets?.[ASSET_FILES.mac]);
        configureLink(winLink, data.win, assets?.[ASSET_FILES.win]);
        return;
      }
    } catch {
      // Fall through to GitHub Release links.
    }
  }

  configureReleaseLink(macLink, assets?.[ASSET_FILES.mac], "macOS installer unavailable");
  configureReleaseLink(winLink, assets?.[ASSET_FILES.win], "Windows installer unavailable");
}

function configureReleaseLink(link, asset, unavailableMessage) {
  if (!link) return;

  if (!asset?.browser_download_url) {
    configureUnavailable(link, unavailableMessage);
    return;
  }

  configureDirectLink(link, asset.browser_download_url, asset.name, asset.size);
}

function configureDirectLink(link, url, fileName, sizeBytes) {
  if (!link) return;

  const note = link.querySelector("small");
  link.classList.remove("unavailable");
  link.href = url;
  link.removeAttribute("target");
  link.removeAttribute("rel");
  link.removeAttribute("download");

  if (note) {
    if (sizeBytes) {
      const mb = (sizeBytes / (1024 * 1024)).toFixed(0);
      note.textContent = `Ready to download (${mb} MB)`;
    } else {
      note.textContent = `Ready to download — ${fileName}`;
    }
  }
}

function configureLink(link, item, asset) {
  if (!link) return;

  if (!item.available) {
    configureUnavailable(link, "Build with the package script, then publish a release");
    return;
  }

  if (item.source === "local" && item.url) {
    configureDirectLink(link, item.url, item.file, item.size);
    return;
  }

  if (asset?.browser_download_url) {
    configureDirectLink(link, asset.browser_download_url, asset.name, asset.size);
    return;
  }

  if (item.url) {
    configureDirectLink(link, item.url, item.file, item.size);
    return;
  }

  configureUnavailable(link, "Installer unavailable — check GitHub Releases");
}

function configureUnavailable(link, message) {
  if (!link) return;

  link.classList.add("unavailable");
  link.removeAttribute("href");
  link.removeAttribute("download");
  link.removeAttribute("target");
  link.removeAttribute("rel");

  const note = link.querySelector("small");
  if (note) {
    note.textContent = message;
  }
}
