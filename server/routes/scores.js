const express = require("express");
const { saveScore, getLeaderboard, getUserBest } = require("../db");

const router = express.Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

function normalizeUsername(value) {
  return String(value || "").trim();
}

function validateUsername(username) {
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-20 characters and use letters, numbers, or underscores only.";
  }
  return null;
}

function validateScore(score) {
  const parsed = Number(score);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1_000_000) {
    return "Score must be a whole number between 0 and 1,000,000.";
  }
  return parsed;
}

router.get("/", async (req, res) => {
  try {
    const scores = await getLeaderboard(req.query.limit);
    res.json({ scores });
  } catch (error) {
    console.error("Failed to load leaderboard:", error);
    res.status(500).json({ error: "Could not load leaderboard." });
  }
});

router.get("/:username", async (req, res) => {
  try {
    const username = normalizeUsername(req.params.username);
    const error = validateUsername(username);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const entry = await getUserBest(username);
    if (!entry) {
      res.status(404).json({ error: "No saved score for this username." });
      return;
    }

    res.json({ entry });
  } catch (error) {
    console.error("Failed to load user score:", error);
    res.status(500).json({ error: "Could not load user score." });
  }
});

router.post("/", async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const usernameError = validateUsername(username);
    if (usernameError) {
      res.status(400).json({ error: usernameError });
      return;
    }

    const scoreOrError = validateScore(req.body?.score);
    if (typeof scoreOrError === "string") {
      res.status(400).json({ error: scoreOrError });
      return;
    }

    const result = await saveScore(username, scoreOrError);
    const leaderboard = await getLeaderboard(50);
    const rank =
      leaderboard.findIndex(
        (entry) => entry.username.toLowerCase() === username.toLowerCase()
      ) + 1;

    res.status(201).json({
      ...result,
      rank: rank > 0 ? rank : null,
    });
  } catch (error) {
    console.error("Failed to save score:", error);
    res.status(500).json({ error: "Could not save score." });
  }
});

module.exports = router;
