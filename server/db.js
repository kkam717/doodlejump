const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const JSON_STORE = path.join(DATA_DIR, "highscores.json");

let pool = null;
let usePostgres = false;

function readJsonStore() {
  if (!fs.existsSync(JSON_STORE)) {
    return { entries: [] };
  }
  return JSON.parse(fs.readFileSync(JSON_STORE, "utf8"));
}

function writeJsonStore(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(JSON_STORE, JSON.stringify(data, null, 2));
}

function compareUsernames(left, right) {
  return left.toLowerCase() === right.toLowerCase();
}

async function initDb() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require("pg");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS high_scores (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) NOT NULL UNIQUE,
        score INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_high_scores_score
      ON high_scores (score DESC)
    `);
    usePostgres = true;
    console.log("Using PostgreSQL for high scores");
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(JSON_STORE)) {
    writeJsonStore({ entries: [] });
  }
  console.log("Using local JSON store for high scores");
}

async function getUserBest(username) {
  if (usePostgres) {
    const result = await pool.query(
      `SELECT username, score, updated_at AS "updatedAt"
       FROM high_scores
       WHERE LOWER(username) = LOWER($1)`,
      [username]
    );
    return result.rows[0] || null;
  }

  const store = readJsonStore();
  return store.entries.find((entry) => compareUsernames(entry.username, username)) || null;
}

async function saveScore(username, score) {
  const existing = await getUserBest(username);
  const now = new Date().toISOString();
  const bestScore = existing ? Math.max(existing.score, score) : score;
  const isNewBest = !existing || score > existing.score;

  if (usePostgres) {
    if (existing) {
      const result = await pool.query(
        `UPDATE high_scores
         SET score = $1,
             updated_at = CASE WHEN $2 THEN NOW() ELSE updated_at END
         WHERE LOWER(username) = LOWER($3)
         RETURNING username, score, updated_at AS "updatedAt"`,
        [bestScore, isNewBest, username]
      );
      const row = result.rows[0];
      return {
        username: row.username,
        score: row.score,
        updatedAt: row.updatedAt,
        isNewBest,
        saved: true,
      };
    }

    const result = await pool.query(
      `INSERT INTO high_scores (username, score, updated_at)
       VALUES ($1, $2, NOW())
       RETURNING username, score, updated_at AS "updatedAt"`,
      [username, score]
    );
    const row = result.rows[0];
    return {
      username: row.username,
      score: row.score,
      updatedAt: row.updatedAt,
      isNewBest: true,
      saved: true,
    };
  }

  const store = readJsonStore();
  const index = store.entries.findIndex((entry) =>
    compareUsernames(entry.username, username)
  );

  if (index === -1) {
    store.entries.push({ username, score, updatedAt: now });
  } else {
    store.entries[index] = {
      username: store.entries[index].username,
      score: bestScore,
      updatedAt: isNewBest ? now : store.entries[index].updatedAt,
    };
  }

  writeJsonStore(store);
  return {
    username: index === -1 ? username : store.entries[index].username,
    score: bestScore,
    updatedAt: isNewBest ? now : store.entries[index]?.updatedAt || now,
    isNewBest: index === -1 || isNewBest,
    saved: true,
  };
}

async function getLeaderboard(limit = 10) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  if (usePostgres) {
    const result = await pool.query(
      `SELECT username, score, updated_at AS "updatedAt"
       FROM high_scores
       ORDER BY score DESC, updated_at ASC
       LIMIT $1`,
      [safeLimit]
    );
    return result.rows;
  }

  const store = readJsonStore();
  return [...store.entries]
    .sort((a, b) => b.score - a.score || a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, safeLimit);
}

function getStorageMode() {
  return usePostgres ? "postgres" : "json";
}

module.exports = {
  initDb,
  saveScore,
  getLeaderboard,
  getUserBest,
  getStorageMode,
};
