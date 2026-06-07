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

const DEFAULT_FETCH_TIMEOUT_MS = 8000;

export async function apiFetch(path, options = {}, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(apiUrl(path), { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
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
