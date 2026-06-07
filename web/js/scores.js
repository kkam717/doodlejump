const USERNAME_KEY = "doodlehop-username";

export function getSavedUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function saveUsername(username) {
  localStorage.setItem(USERNAME_KEY, username.trim());
}

export async function fetchLeaderboard(limit = 10) {
  const response = await fetch(`/api/scores?limit=${limit}`);
  if (!response.ok) {
    throw new Error("leaderboard unavailable");
  }
  const data = await response.json();
  return data.scores || [];
}

export async function submitScore(username, score) {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not save score");
  }
  return data;
}

export async function fetchUserBest(username) {
  const response = await fetch(`/api/scores/${encodeURIComponent(username)}`);
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
    empty.textContent = "No scores yet. Be the first!";
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
  limit = 10,
}) {
  async function refresh() {
    try {
      const scores = await fetchLeaderboard(limit);
      renderLeaderboard(listEl, scores, usernameInput?.value?.trim() || "");
      if (statusEl) {
        statusEl.textContent = "";
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = "Leaderboard unavailable";
      }
      renderLeaderboard(listEl, []);
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

export async function handleGameOverScore({
  username,
  score,
  statusEl,
  refreshLeaderboard,
}) {
  const trimmed = username.trim();
  if (!trimmed) {
    if (statusEl) {
      statusEl.textContent = "Enter a username to save your score.";
    }
    return null;
  }

  if (score <= 0) {
    return null;
  }

  try {
    const result = await submitScore(trimmed, score);
    if (statusEl) {
      statusEl.textContent = result.isNewBest
        ? `Saved! Rank #${result.rank} — new personal best.`
        : `Saved! Rank #${result.rank}.`;
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
