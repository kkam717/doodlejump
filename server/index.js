const express = require("express");
const fs = require("fs");
const path = require("path");
const { initDb, getStorageMode } = require("./db");
const scoresRouter = require("./routes/scores");

const app = express();
const ROOT = path.join(__dirname, "..");
const WEB_ROOT = path.join(ROOT, "web");
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

const MAC_FILE = "DoodleHopHop-1.0.0.dmg";
const WIN_FILE = "DoodleHopHop-1.0.0.exe";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://kkam717.github.io",
  /^https:\/\/[a-z0-9-]+\.github\.io$/i,
];

function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...fromEnv];
}

function isOriginAllowed(origin) {
  return getAllowedOrigins().some((allowed) => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: "16kb" }));

function resolveDownload(fileName, envUrl) {
  const localPath = path.join(DOWNLOADS_DIR, fileName);
  if (fs.existsSync(localPath)) {
    return {
      available: true,
      url: `/downloads/${fileName}`,
      source: "local",
      size: fs.statSync(localPath).size,
    };
  }

  if (envUrl) {
    return {
      available: true,
      url: envUrl,
      source: "remote",
      size: null,
    };
  }

  return {
    available: false,
    url: null,
    source: null,
    size: null,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "doodlehop",
    scores: getStorageMode(),
  });
});

app.get("/api/downloads", (_req, res) => {
  const mac = resolveDownload(MAC_FILE, process.env.DOWNLOAD_MAC_URL);
  const win = resolveDownload(WIN_FILE, process.env.DOWNLOAD_WIN_URL);

  res.json({
    mac: {
      label: "macOS (.dmg)",
      file: MAC_FILE,
      ...mac,
    },
    win: {
      label: "Windows (.exe)",
      file: WIN_FILE,
      ...win,
    },
  });
});

app.use("/api/scores", scoresRouter);

app.use(
  "/downloads",
  express.static(DOWNLOADS_DIR, {
    fallthrough: false,
    setHeaders(res, filePath) {
      const fileName = path.basename(filePath);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    },
  })
);

app.use(express.static(WEB_ROOT));

app.get("*", (_req, res) => {
  res.sendFile(path.join(WEB_ROOT, "index.html"));
});

async function start() {
  await initDb();

  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`DoodleHopHop server listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
