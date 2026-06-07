const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const ROOT = path.join(__dirname, "..");
const WEB_ROOT = path.join(ROOT, "web");
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

const MAC_FILE = "DoodleHopHop-1.0.0.dmg";
const WIN_FILE = "DoodleHopHop-1.0.0.exe";

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
  res.json({ ok: true, service: "doodlehop" });
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

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`DoodleHopHop server listening on port ${port}`);
});
