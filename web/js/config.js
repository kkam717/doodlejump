function readMetaApiBase() {
  const meta = document.querySelector('meta[name="doodlehop-api-base"]');
  const value = meta?.content?.trim();
  return value ? value.replace(/\/$/, "") : "";
}

export function getApiBase() {
  const configured = readMetaApiBase();
  if (configured) {
    return configured;
  }

  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".onrender.com")) {
    return "";
  }

  if (host === "github.io" || host.endsWith(".github.io")) {
    return "";
  }

  return "";
}

export function apiUrl(path) {
  const base = getApiBase();
  return `${base}${path}`;
}

export async function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options);
}

export function isBackendConfigured() {
  const host = window.location.hostname;
  const onSelfHostedApi =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".onrender.com");
  return onSelfHostedApi || Boolean(readMetaApiBase());
}

export const FALLBACK_DOWNLOADS = {
  mac: "https://github.com/kkam717/doodlejump/releases/download/v1.0.0/DoodleHopHop-1.0.0.dmg",
  win: "https://github.com/kkam717/doodlejump/releases/download/v1.0.0/DoodleHopHop-1.0.0.exe",
};
