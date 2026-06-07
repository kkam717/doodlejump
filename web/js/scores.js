import { apiFetch, isBackendConfigured } from "./config.js";

const USERNAME_KEY = "doodlehop-username";

export function getSavedUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function saveUsername(username) {
  localStorage.setItem(USERNAME_KEY, username.trim());
}

export async function checkBackendHealth() {
  if (!isBackendConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const response = await apiFetch("/api/health");
    if (!response.ok) {
      return { ok: false, reason: "unreachable" };
    }
    const data = await response.json();
    return { ok: true, ...data };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

export async function fetchLeaderboard(limit = 10) {
  const response = await apiFetch(`/api/scores?limit=${limit}`);
  if (!response.ok) {
    throw new Error("leaderboard unavailable");
  }
  const data = await response.json();
  return data.scores || [];
}

export async function submitScore(username, score) {
  const response = await apiFetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score }),
  });

  if (!response.ok) {
    let message = "Could not save score";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      message = isBackendConfigured()
        ? "Score server unreachable — check your Render URL"
        : "Backend not linked — set doodlehop-api-base in index.html";
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchUserBest(username) {
  const response = await apiFetch(`/api/scores/${encodeURIComponent(username)}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not load user score");
  }
  const data = await response.json();
  return data.entry;
}

export function renderLeaderboard(listEl, scores, currentUsername = "") {
  listEl.innerHTML = "";

  if (!scores.length) {
    const empty = document.createElement("li");
    empty.className = "leaderboard-empty";
    empty.textContent = "No scores yet. Save yours to appear here!";
    listEl.appendChild(empty);
    return;
  }

  scores.forEach((entry, index) => {
    const item = document.createElement("li");
    const isCurrent =
      currentUsername &&
      entry.username.toLowerCase() === currentUsername.toLowerCase();
    item.className = isCurrent ? "leaderboard-item is-current" : "leaderboard-item";
    item.innerHTML = `
      <span class="leaderboard-rank">${index + 1}</span>
      <span class="leaderboard-name">${escapeHtml(entry.username)}</span>
      <span class="leaderboard-score">${entry.score}</span>
    `;
    listEl.appendChild(item);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function setupLeaderboard({
  listEl,
  usernameInput,
  statusEl,
  backendStatusEl,
  limit = 10,
}) {
  async function refresh() {
    const health = await checkBackendHealth();
    if (backendStatusEl) {
      backendStatusEl.classList.remove("ok", "error", "warn");
      if (!isBackendConfigured()) {
        backendStatusEl.textContent = "Backend: not linked";
        backendStatusEl.classList.add("warn");
      } else if (health.ok) {
        backendStatusEl.textContent = `Backend: connected (${health.scores || "api"})`;
        backendStatusEl.classList.add("ok");
      } else {
        backendStatusEl.textContent = "Backend: unreachable";
        backendStatusEl.classList.add("error");
      }
    }

    if (!isBackendConfigured()) {
      renderLeaderboard(listEl, []);
      if (statusEl) {
        statusEl.textContent =
          "Link your Render URL in the doodlehop-api-base meta tag (see DEPLOY.md).";
      }
      return;
    }

    try {
      const scores = await fetchLeaderboard(limit);
      renderLeaderboard(listEl, scores, usernameInput?.value?.trim() || "");
    } catch {
      renderLeaderboard(listEl, []);
      if (statusEl && !statusEl.textContent.includes("Enter a username")) {
        statusEl.textContent = "Leaderboard unavailable — check backend URL and CORS.";
      }
    }
  }

  if (usernameInput) {
    usernameInput.addEventListener("change", () => {
      saveUsername(usernameInput.value);
      refresh();
    });
    usernameInput.addEventListener("blur", () => {
      saveUsername(usernameInput.value);
    });
  }

  await refresh();
  return refresh;
}

export async function saveScoreToLeaderboard({
  username,
  score,
  statusEl,
  refreshLeaderboard,
}) {
  const trimmed = username.trim();
  if (!trimmed) {
    if (statusEl) {
      statusEl.textContent = "Enter a username above, then save your score.";
    }
    return null;
  }

  if (!isBackendConfigured()) {
    if (statusEl) {
      statusEl.textContent = "Backend not linked — add your Render URL to index.html.";
    }
    return null;
  }

  if (score <= 0) {
    if (statusEl) {
      statusEl.textContent = "Play a round first — your score must be above 0.";
    }
    return null;
  }

  try {
    const result = await submitScore(trimmed, score);
    if (statusEl) {
      statusEl.textContent = result.isNewBest
        ? `Saved ${score} as ${trimmed}! Rank #${result.rank} — new personal best.`
        : `Saved ${score} as ${trimmed}! Rank #${result.rank}.`;
    }
    if (refreshLeaderboard) {
      await refreshLeaderboard();
    }
    return result;
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = error.message;
    }
    return null;
  }
}

export async function handleGameOverScore(options) {
  return saveScoreToLeaderboard(options);
}
