# DoodleHopHop

A Doodle Jump clone inspired by the original Lima Sky game. Bounce upward on platforms, dodge hazards, and climb as high as you can.

Available as a **desktop app** (JavaFX) and a **web app** (HTML5 Canvas), with installers for macOS and Windows.

## Features

- Graph-paper background and platform colors matching the original style
- Six platform types: normal, bouncy, horizontal-moving, vertical-moving, disappearing, and bounce-then-break
- Auto-scrolling camera and score that increases as you climb
- Screen wrap-around on the left and right edges
- High score tracking (session for desktop, `localStorage` for web)
- Restart button after game over

### Platform guide

| Color | Behavior |
|-------|----------|
| Green | Standard bounce |
| Hot pink | Extra-high bounce |
| Light blue | Moves left and right |
| Dark blue | Moves up and down |
| Red / white | Breaks after you land |

## Quick start

### Play in the browser

```bash
./scripts/serve-web.sh
```

Open [http://localhost:8080/](http://localhost:8080/).

> ES modules require a local server — opening `web/index.html` directly from the filesystem will not work.

### Run the desktop app (development)

**Requirements:** JDK 17+, Maven 3.8+

```bash
./scripts/run-desktop.sh
# or
mvn javafx:run
```

### Download a packaged app

| Platform | Build command | Output |
|----------|---------------|--------|
| macOS | `./scripts/package-mac.sh` | `dist/mac/DoodleHopHop-1.0.0.dmg` |
| Windows | `scripts\package-windows.bat` | `dist\windows\DoodleHopHop-1.0.0.exe` |

Installers must be built on the target OS (jpackage does not cross-compile). Package scripts copy builds into `web/downloads/` so download links on the web page work immediately.

## Controls

| Action | Desktop | Web |
|--------|---------|-----|
| Move left | ← or A | ← or A |
| Move right | → or D | → or D |
| Restart | Restart button | Restart button |
| Quit | Quit button | — |

On mobile, use the on-screen ◀ ▶ buttons.

## Project structure

```
doodlejump/
├── src/main/java/doodlejump/   # Desktop game source (JavaFX)
│   ├── App.java                # Application entry point
│   ├── PaneOrganizer.java      # UI layout and background
│   ├── DoodleJump.java         # Game loop and logic
│   ├── Doodle.java             # Player entity
│   ├── Platform.java           # Platform entities
│   └── Constants.java          # Physics and tuning values
├── src/main/resources/
│   └── background.png
├── web/                        # Browser version
│   ├── index.html              # Play + download page
│   ├── css/style.css
│   └── js/                     # Game engine (Canvas)
├── scripts/
│   ├── serve-web.sh            # Local web server
│   ├── run-desktop.sh          # Run JavaFX app
│   ├── package-mac.sh          # Build macOS .dmg
│   └── package-windows.bat     # Build Windows .exe
├── pom.xml                     # Maven build config
└── dist/                       # Built installers (generated)
```

## Architecture

The desktop game uses six Java classes:

- **App** — JavaFX entry point; creates the window and scene
- **PaneOrganizer** — `BorderPane` layout, score labels, quit button, background image
- **DoodleJump** — Timeline game loop: input, physics, collisions, spawning, scrolling, game over
- **Doodle** — Player shape, velocity, collision detection
- **Platform** — Platform types, colors, and movement state
- **Constants** — Shared tuning values (gravity, dimensions, probabilities)

The web version mirrors the same constants and mechanics in `web/js/constants.js` and `web/js/game.js`.

## Build details

### Maven commands

```bash
mvn clean package     # Compile and stage jars for packaging
mvn javafx:run        # Run without installing
```

### Package installers

**macOS:**

```bash
chmod +x scripts/package-mac.sh
./scripts/package-mac.sh
```

**Windows** (from Command Prompt in the project folder):

```cmd
scripts\package-windows.bat
```

### Deploy the website (Render)

Production deployment uses a Node/Express backend on [Render](https://render.com) with download links served via GitHub Releases.

See **[DEPLOY.md](DEPLOY.md)** for the full step-by-step guide.

Quick summary:

1. `./scripts/package-mac.sh` — build the macOS installer
2. `./scripts/publish-release.sh v1.0.0` — upload to GitHub Releases
3. Connect the repo to Render (uses `render.yaml`)
4. Set `DOWNLOAD_MAC_URL` and `DOWNLOAD_WIN_URL` on Render

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `package javafx... does not exist` | Use Maven (`mvn javafx:run`) — JavaFX is pulled in via `pom.xml` |
| Keys don't work (desktop) | Click the game window to give it keyboard focus |
| Web game won't load | Serve over HTTP (`./scripts/serve-web.sh`), not `file://` |
| Download link 404 | Build the installer first with the package script for your OS |
| `jpackage` not found | Install a full JDK 17+, not just a JRE |

## History

This project started as a JavaFX coursework assignment (~30 hours). It was later extended with bug fixes, a Maven build, native installers via `jpackage`, and a browser port.

Original record score: **557**.
