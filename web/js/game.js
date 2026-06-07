import { C } from "./constants.js";

const PLATFORM_COLORS = {
  [C.VAR_NORMAL]: C.COLORS.normal,
  [C.VAR_BOUNCY]: C.COLORS.bouncy,
  [C.VAR_MOVING_X]: C.COLORS.movingX,
  [C.VAR_DIS]: C.COLORS.dis,
  [C.VAR_MOVING_Y]: C.COLORS.movingY,
  [C.VAR_BOUNCE_DISAPPEAR]: C.COLORS.bounceDisappear,
};

function randomPlatformType() {
  const random = Math.floor(Math.random() * C.PROBABILITY_CONSTANT);
  if (random < C.PROBABILITY_NORMAL) return C.VAR_NORMAL;
  if (random < C.PROBABILITY_BOUNCY) return C.VAR_BOUNCY;
  if (random < C.PROBABILITY_DISAPPEARING) return C.VAR_DIS;
  if (random < C.PROBABILITY_MOVING_X) return C.VAR_MOVING_X;
  if (random < C.PROBABILITY_MOVING_Y) return C.VAR_MOVING_Y;
  return C.VAR_BOUNCE_DISAPPEAR;
}

function createPlatform(type = randomPlatformType()) {
  const platform = {
    type,
    x: C.ROOT_CENTER_X,
    y: C.ROOT_CENTER_Y,
    direction: false,
    centralVertical: 0,
    velocity: 0,
    color: C.COLORS.normal,
  };
  setupPlatform(platform);
  return platform;
}

function setupPlatform(platform) {
  switch (platform.type) {
    case C.VAR_NORMAL:
      platform.color = C.COLORS.normal;
      break;
    case C.VAR_BOUNCY:
      platform.color = C.COLORS.bouncy;
      break;
    case C.VAR_MOVING_X:
      platform.color = C.COLORS.movingX;
      platform.direction = true;
      break;
    case C.VAR_DIS:
      platform.color = C.COLORS.dis;
      platform.velocity = 0;
      break;
    case C.VAR_MOVING_Y:
      platform.color = C.COLORS.movingY;
      platform.direction = true;
      break;
    case C.VAR_BOUNCE_DISAPPEAR:
      platform.color = C.COLORS.bounceDisappear;
      platform.velocity = 0;
      break;
    default:
      break;
  }
}

function boundsIntersect(player, platform) {
  const playerLeft = player.x - C.DOODLE_WIDTH / 2;
  const playerRight = player.x + C.DOODLE_WIDTH / 2;
  const playerTop = player.y - C.DOODLE_HEIGHT / 2;
  const playerBottom = player.y + C.DOODLE_HEIGHT / 2;
  const platformLeft = platform.x - C.PLATFORM_WIDTH / 2;
  const platformRight = platform.x + C.PLATFORM_WIDTH / 2;
  const platformTop = platform.y - C.PLATFORM_HEIGHT / 2;
  const platformBottom = platform.y + C.PLATFORM_HEIGHT / 2;

  return !(
    playerRight < platformLeft ||
    playerLeft > platformRight ||
    playerBottom < platformTop ||
    playerTop > platformBottom
  );
}

export class DoodleJumpGame {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScore = callbacks.onScore || (() => {});
    this.onGameOver = callbacks.onGameOver || (() => {});
    this.onRestart = callbacks.onRestart || (() => {});

    this.background = new Image();
    this.background.src = "assets/background.png";

    this.accumulator = 0;
    this.lastTime = performance.now();
    this.running = false;
    this.gameOver = false;

    this.highScore = 0;
    this.reset();
    this.bindInput();
  }

  setHighScore(score) {
    this.highScore = Math.max(this.highScore, Number(score) || 0);
  }

  reset() {
    this.platforms = [];
    this.score = 0;
    this.gameOver = false;
    this.running = true;
    this.accumulator = 0;

    this.spawnStartingPlatform();
    this.player = {
      x: C.DOODLE_START_X,
      y: C.DOODLE_START_Y,
      velocityY: 0,
    };

    this.spawnPlatforms();
    this.onScore(0, this.highScore, false);
  }

  bindInput() {
    this.handleKeyPress = (e) => {
      if (this.gameOver || !this.running) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          this.player.x -= C.MAINBODY_OFFSET;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          this.player.x += C.MAINBODY_OFFSET;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", this.handleKeyPress);
  }

  movePlayer(dx, dy) {
    this.player.x += dx;
    this.player.y += dy;
  }

  setPlayerPos(x, y) {
    this.player.x = x;
    this.player.y = y;
  }

  moveLeft() {
    if (!this.gameOver && this.running) {
      this.player.x -= C.MAINBODY_OFFSET;
    }
  }

  moveRight() {
    if (!this.gameOver && this.running) {
      this.player.x += C.MAINBODY_OFFSET;
    }
  }

  restart() {
    this.reset();
    this.onRestart();
  }

  stop() {
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    if (!this.running) return;

    const frameDelta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.accumulator += frameDelta;

    while (this.accumulator >= C.DURATION && !this.gameOver) {
      this.updateTimeline();
      this.accumulator -= C.DURATION;
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  updateTimeline() {
    const gameScoreInt = Math.floor(this.score);

    if (this.score > this.highScore) {
      this.highScore = gameScoreInt;
    }

    this.onScore(gameScoreInt, this.highScore, false);

    if (this.player.x > C.ROOT_WIDTH + C.DOODLE_WIDTH / 2) {
      this.movePlayer(-C.ROOT_WIDTH, 0);
    }
    if (this.player.x < 0 - C.DOODLE_WIDTH / 2) {
      this.movePlayer(C.ROOT_WIDTH, 0);
    }

    this.player.velocityY += C.GRAVITY / C.REFRESH_RATE;
    this.movePlayer(0, this.player.velocityY / C.REFRESH_RATE);

    for (const plat of this.platforms) {
      this.movePlatform(plat);
    }

    for (const platform of this.platforms) {
      if (this.collisionDetection(platform)) {
        this.handleCollision(platform);
        this.snapToPlatformTop(platform);
        break;
      }
    }

    this.spawnPlatforms();
    this.scrollRoot();
    this.checkGameOver();
  }

  movePlatform(plat) {
    if (plat.type === C.VAR_MOVING_X) {
      if (plat.direction) {
        if (plat.x < C.ROOT_WIDTH - C.PLATFORM_WIDTH / 2) {
          plat.x += C.PLATFORM_MOVE_X_OFFSET;
        } else {
          plat.x -= C.PLATFORM_MOVE_X_OFFSET;
          plat.direction = false;
        }
      } else if (plat.x > C.PLATFORM_WIDTH / 2) {
        plat.x -= C.PLATFORM_MOVE_X_OFFSET;
      } else {
        plat.x += C.PLATFORM_MOVE_X_OFFSET;
        plat.direction = true;
      }
    } else if (plat.type === C.VAR_MOVING_Y) {
      if (plat.direction) {
        if (plat.y - plat.centralVertical < C.MAX_MOVING_PLATFORM_Y_OFFSET) {
          plat.y += C.PLATFORM_MOVE_Y_OFFSET;
        } else {
          plat.y -= C.PLATFORM_MOVE_Y_OFFSET;
          plat.direction = false;
        }
      } else if (plat.y - plat.centralVertical > -C.MAX_MOVING_PLATFORM_Y_OFFSET) {
        plat.y -= C.PLATFORM_MOVE_Y_OFFSET;
      } else {
        plat.y += C.PLATFORM_MOVE_Y_OFFSET;
        plat.direction = true;
      }
    } else if (
      plat.type === C.VAR_DIS ||
      plat.type === C.VAR_BOUNCE_DISAPPEAR
    ) {
      plat.y += plat.velocity / C.REFRESH_RATE;
    }
  }

  collisionDetection(platform) {
    if (this.player.velocityY <= 0) return false;
    if (!boundsIntersect(this.player, platform)) return false;

    const playerBottom = this.player.y + C.DOODLE_HEIGHT / 2;
    const platformTop = platform.y - C.PLATFORM_HEIGHT / 2;
    const playerLeft = this.player.x - C.DOODLE_WIDTH / 2;
    const playerRight = this.player.x + C.DOODLE_WIDTH / 2;
    const platformLeft = platform.x - C.PLATFORM_WIDTH / 2;
    const platformRight = platform.x + C.PLATFORM_WIDTH / 2;

    const horizontalOverlap =
      playerRight > platformLeft && playerLeft < platformRight;
    const landingOnTop =
      playerBottom >= platformTop && this.player.y <= platform.y;
    return horizontalOverlap && landingOnTop;
  }

  handleCollision(platform) {
    switch (platform.type) {
      case C.VAR_BOUNCY:
        this.player.velocityY = C.BOUNCY_REBOUND_VELOCITY;
        break;
      case C.VAR_DIS:
        platform.velocity = -C.REBOUND_VELOCITY;
        break;
      case C.VAR_BOUNCE_DISAPPEAR:
        platform.velocity = -C.REBOUND_VELOCITY;
        platform.color = C.COLORS.dis;
        this.player.velocityY = C.REBOUND_VELOCITY;
        break;
      case C.VAR_MOVING_Y:
        this.player.velocityY = platform.direction
          ? C.REBOUND_VELOCITY + C.REFRESH_RATE
          : C.REBOUND_VELOCITY - C.REFRESH_RATE;
        break;
      default:
        this.player.velocityY = C.REBOUND_VELOCITY;
    }
  }

  snapToPlatformTop(platform) {
    this.player.y =
      platform.y - C.PLATFORM_HEIGHT / 2 - C.DOODLE_HEIGHT / 2;
  }

  spawnStartingPlatform() {
    const base = createPlatform(C.VAR_NORMAL);
    base.color = C.COLORS.base;
    base.x = C.PLATFORM_START_X;
    base.y = C.PLATFORM_START_Y;
    this.platforms.push(base);
  }

  spawnPlatforms() {
    let topPlatform = this.platforms[this.platforms.length - 1];

    while (topPlatform.y > 0) {
      let low = Math.max(0, topPlatform.x - C.MAX_PLATFORM_X_OFFSET);
      let high = Math.min(
        C.ROOT_WIDTH - C.PLATFORM_WIDTH,
        topPlatform.x + C.MAX_PLATFORM_X_OFFSET
      );
      const horizontalCoordinate = low + Math.random() * (high - low);

      low = topPlatform.y - C.MINIMUM_PLATFORM_Y_OFFSET;
      high = topPlatform.y - C.MAX_PLATFORM_Y_OFFSET;
      let verticalCoordinate = low + Math.random() * (high - low);

      const platform = createPlatform();
      platform.x = horizontalCoordinate;
      platform.y = verticalCoordinate;

      if (platform.type === C.VAR_MOVING_Y) {
        platform.centralVertical = platform.y;
      }

      if (topPlatform.type === C.VAR_DIS && this.platforms.length >= 3) {
        const anchor = this.platforms[this.platforms.length - 3];
        low = anchor.y - C.MINIMUM_PLATFORM_Y_OFFSET;
        high = anchor.y - C.MAX_PLATFORM_Y_OFFSET;
        verticalCoordinate = low + (high - low);
        platform.y = verticalCoordinate;
        platform.type = C.VAR_NORMAL;
        platform.color = C.COLORS.normal;
        if (platform.y - topPlatform.y < C.MINIMUM_PLATFORM_Y_OFFSET) {
          platform.y += C.CORRECTION_PLATFORM_OFFSET;
        }
      }

      this.platforms.push(platform);
      topPlatform = platform;
    }
  }

  scrollRoot() {
    if (this.player.y < C.ROOT_HEIGHT / 2) {
      const difference = C.ROOT_HEIGHT / 2 - this.player.y;
      this.score += C.SCORE_INCREMENT;
      for (const plat of this.platforms) {
        plat.y += difference;
        if (plat.type === C.VAR_MOVING_Y) {
          plat.centralVertical += difference;
        }
      }
      this.player.y += difference;
    }

    let count = 0;
    while (count <= this.platforms.length - 1) {
      if (this.platforms[count].y > C.ROOT_HEIGHT) {
        this.platforms.splice(count, 1);
        count--;
      }
      count++;
    }
  }

  checkGameOver() {
    if (this.player.y > C.ROOT_HEIGHT) {
      this.gameOver = true;
      const finalScore = Math.floor(this.score);
      const isNewHigh = finalScore >= this.highScore;
      this.onGameOver(finalScore, this.highScore, isNewHigh);
      this.onScore(finalScore, this.highScore, true);
    }
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.background.complete && this.background.naturalWidth > 0) {
      ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = C.COLORS.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    for (const plat of this.platforms) {
      ctx.fillStyle = plat.color;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.fillRect(
        plat.x - C.PLATFORM_WIDTH / 2,
        plat.y - C.PLATFORM_HEIGHT / 2,
        C.PLATFORM_WIDTH,
        C.PLATFORM_HEIGHT
      );
      ctx.strokeRect(
        plat.x - C.PLATFORM_WIDTH / 2,
        plat.y - C.PLATFORM_HEIGHT / 2,
        C.PLATFORM_WIDTH,
        C.PLATFORM_HEIGHT
      );
    }

    ctx.fillStyle = C.COLORS.doodle;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillRect(
      this.player.x - C.DOODLE_WIDTH / 2,
      this.player.y - C.DOODLE_HEIGHT / 2,
      C.DOODLE_WIDTH,
      C.DOODLE_HEIGHT
    );
    ctx.strokeRect(
      this.player.x - C.DOODLE_WIDTH / 2,
      this.player.y - C.DOODLE_HEIGHT / 2,
      C.DOODLE_WIDTH,
      C.DOODLE_HEIGHT
    );

    if (this.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "italic bold 56px Verdana, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#7b3131";
      ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
    }
  }
}
