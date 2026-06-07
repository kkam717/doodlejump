import { apiFetch, FALLBACK_DOWNLOADS, isBackendConfigured } from "./config.js";

export async function setupDownloads() {
  const macLink = document.getElementById("mac-download");
  const winLink = document.getElementById("win-download");

  if (isBackendConfigured()) {
    try {
      const response = await apiFetch("/api/downloads");
      if (response.ok) {
        const data = await response.json();
        configureLink(macLink, data.mac);
        configureLink(winLink, data.win);
        return;
      }
    } catch {
      // Fall through to GitHub Release links.
    }
  }

  configureDirectLink(macLink, FALLBACK_DOWNLOADS.mac, "DoodleHopHop-1.0.0.dmg");
  configureDirectLink(
    winLink,
    FALLBACK_DOWNLOADS.win,
    "DoodleHopHop-1.0.0.exe",
    "Windows build not published yet"
  );
}

function configureDirectLink(link, url, fileName, unavailableMessage) {
  if (!link) return;

  const note = link.querySelector("small");
  link.classList.remove("unavailable");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.removeAttribute("download");

  if (note) {
    note.textContent = unavailableMessage || "Download from GitHub Releases";
  }

  link.addEventListener(
    "click",
    async (event) => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          event.preventDefault();
          if (note) {
            note.textContent = unavailableMessage || "Installer not available yet";
          }
        }
      } catch {
        // Let the browser try the link anyway.
      }
    },
    { once: true }
  );
}

function configureLink(link, item) {
  if (!link) return;

  const note = link.querySelector("small");
  link.classList.remove("unavailable");

  if (!item.available || !item.url) {
    configureUnavailable(link, "Build with the package script, then publish a release");
    return;
  }

  link.href = item.url;
  if (item.source === "local") {
    link.setAttribute("download", item.file);
    link.removeAttribute("target");
    link.removeAttribute("rel");
  } else {
    link.removeAttribute("download");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  if (note) {
    if (item.size) {
      const mb = (item.size / (1024 * 1024)).toFixed(0);
      note.textContent = `Ready to download (${mb} MB)`;
    } else {
      note.textContent = "Ready to download";
    }
  }
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
