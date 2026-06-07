# Deploy DoodleHopHop

## GitHub Pages (static game only)

GitHub Pages only lets you pick **`/` (root)** or **`/docs`** as a publish folder — not `/web`.

This repo uses a **GitHub Actions** workflow (`.github/workflows/pages.yml`) to deploy the `web/` folder instead.

### Setup

1. Push this repo to GitHub (the workflow file must be on `main`).
2. Open **Settings → Pages** on the repository.
3. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. After the next push to `main`, the **Deploy GitHub Pages** workflow runs automatically.
5. Your site will be at **https://kkam717.github.io/doodlejump/**

### Link GitHub Pages to the Render backend

GitHub Pages cannot run the Node API. Point the static site at your Render service:

1. Deploy the backend on Render first (see below) and copy your URL, e.g. `https://doodlehop.onrender.com`
2. On GitHub: **Settings → Secrets and variables → Actions → Variables**
3. Add **`API_BASE_URL`** = `https://doodlehop.onrender.com` (your real Render URL, no trailing slash)
4. Push to `main` — the Pages workflow injects this into `web/index.html` automatically

Or set it manually in `web/index.html`:

```html
<meta name="doodlehop-api-base" content="https://doodlehop.onrender.com" />
```

The Render server allows CORS from `*.github.io`, so leaderboard and score saving work from Pages once linked.

**Mac downloads** fall back to GitHub Releases if the API is unreachable. **Windows** downloads appear when you publish a `.exe` release.

### Using the leaderboard

1. Enter a **username** above the game
2. Play until game over
3. Click **Save to Leaderboard** (enabled after game over)
4. Use **Refresh** in the sidebar to update the list

For the full experience without linking, deploy everything on **Render** below (frontend + API on one URL).

---

## Render (full app with backend)

The live site runs as a **Node.js web service** on [Render](https://render.com). It serves the browser game and download links through a small backend API.

## Architecture

```
Render Web Service (Node/Express)
├── /                  → web game (static)
├── /api/health        → health check
├── /api/downloads     → download metadata (local file or GitHub Release URL)
├── /api/scores        → leaderboard + save high scores by username
└── /downloads/*       → direct installer downloads (when files exist on disk)

Render PostgreSQL (free)
└── high_scores table  → persistent username/score leaderboard
```

Installers are **not committed to git** (they are too large). They are published to **GitHub Releases**, and Render uses environment variables to point download links at those files.

## One-time setup

### 1. Push the repo to GitHub

```bash
git push origin main
```

### 2. Build desktop installers locally

**macOS:**

```bash
./scripts/package-mac.sh
```

**Windows** (on a Windows machine):

```cmd
scripts\package-windows.bat
```

This copies builds into `web/downloads/`.

### 3. Publish installers to GitHub Releases

```bash
chmod +x scripts/publish-release.sh
./scripts/publish-release.sh v1.0.0
```

This uploads `.dmg` / `.exe` files and prints the URLs to use on Render.

### 4. Create the Render service

**Option A — Blueprint (recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → Blueprint**
3. Connect the `kkam717/doodlejump` repository
4. Render reads `render.yaml` and creates:
   - the `doodlehop` web service
   - the `doodlehop-db` PostgreSQL database (wired via `DATABASE_URL`)

**Option B — Manual**

1. **New → Web Service**
2. Connect `kkam717/doodlejump`
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

### 5. Set environment variables on Render

In the service → **Environment**:

| Key | Example value |
|-----|----------------|
| `DOWNLOAD_MAC_URL` | `https://github.com/kkam717/doodlejump/releases/download/v1.0.0/DoodleHopHop-1.0.0.dmg` |
| `DOWNLOAD_WIN_URL` | `https://github.com/kkam717/doodlejump/releases/download/v1.0.0/DoodleHopHop-1.0.0.exe` |

Only set `DOWNLOAD_WIN_URL` after you have built and published the Windows `.exe`.

Click **Save Changes** — Render redeploys automatically.

### 6. Verify

- Site loads: `https://<your-service>.onrender.com/`
- Health: `https://<your-service>.onrender.com/api/health`
- Downloads API: `https://<your-service>.onrender.com/api/downloads`
- Leaderboard API: `https://<your-service>.onrender.com/api/scores`
- Health should report `"scores": "postgres"` once the database is connected
- Play a round, enter a username, and confirm your score appears on the leaderboard
- Click **macOS (.dmg)** on the site — it should download from GitHub Releases

## Local development (matches production)

```bash
./scripts/serve-web.sh
```

Open [http://localhost:8080/](http://localhost:8080/).

Locally, scores are stored in `server/data/highscores.json` when `DATABASE_URL` is not set. On Render, scores use PostgreSQL automatically.

If `web/downloads/` contains installers, they are served locally. Otherwise set env vars:

```bash
export DOWNLOAD_MAC_URL="https://github.com/kkam717/doodlejump/releases/download/v1.0.0/DoodleHopHop-1.0.0.dmg"
./scripts/serve-web.sh
```

## Updating a release

1. Bump version in `pom.xml` / package scripts if needed
2. Rebuild installers
3. Run `./scripts/publish-release.sh v1.0.1`
4. Update `DOWNLOAD_MAC_URL` / `DOWNLOAD_WIN_URL` on Render

## Custom domain (optional)

In Render → your service → **Settings → Custom Domains**, add your domain and follow Render's DNS instructions.
