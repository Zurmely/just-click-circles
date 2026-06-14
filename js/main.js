// =============================================
// main.js — Entry point, game loop, wiring
// =============================================

import {
  game, highScores, settings,
  loadSettings, saveSettings, loadHighScores, saveHighScores,
  isBlitz, hasDistractors, isMayhem, isNormal,
  missCostsLife, maxLives, scoreKey,
  rollDistractorGap, MAX_DISTRACTORS,
  IS_MOBILE, QUAKE_SCALE,
  getModeConfig, registerModes, setEndGameCallback, loseLife,
} from "./state.js";
import { ICE_SLOW, SHIELD_LOCKOUT, POWERUP_COOLDOWN, F1_COOLDOWN } from "./modes/mayhem.js";
import normal from "./modes/normal.js";
import zen from "./modes/zen.js";
import blitz from "./modes/blitz.js";
import mayhem from "./modes/mayhem.js";
import { spawnCircle, spawnDistractor } from "./spawn.js";
import { updateArrows, updateCars, updatePilots, updatePieces, updateExplosions, setViewport } from "./powerups.js";
import { drawFrame } from "./renderer.js";
import { bindInput } from "./input.js";
import {
  hud, showOverlay, updateHUD, updateBuffsHUD, updateAdAndCopyright,
  rollSplash, rollGameoverQuote, purchaseRemoveAds,
  showModesMenu, openDistractionMenu, openDifficultyMenu,
} from "./ui.js";
import { bindSettings } from "./settings.js";

const $ = (id) => document.getElementById(id);

// Register mode configs so state.js can look them up without a circular import
registerModes([normal, zen, blitz, mayhem]);

// ---------- Canvas setup ----------
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let W = 0, H = 0;

function resize() {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  setViewport(W, H);
  if (game.state !== "playing") drawFrame(ctx, W, H, 0);
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => setTimeout(resize, 200));

// ---------- Fullscreen ----------
function enterFullscreen() {
  const el = document.documentElement;
  const alreadyFs = document.fullscreenElement || document.webkitFullscreenElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (req && !alreadyFs) {
    try {
      const p = req.call(el);
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* fullscreen unavailable */ }
  }
}

// loseLife is imported from state.js (where endGame callback is registered at init)

// ---------- Spawn interval (delegates to mode config) ----------
function spawnInterval() {
  const cfg = getModeConfig();
  return cfg.spawnInterval(game.elapsed, game.score);
}

// ---------- Game loop ----------
function loop(ts) {
  if (game.state !== "playing") return;
  if (!game.lastTime) game.lastTime = ts;
  const dt = Math.min(50, ts - game.lastTime);
  game.lastTime = ts;

  const timeScale = game.iceTimer > 0 ? ICE_SLOW : 1;
  if (game.iceTimer > 0) game.iceTimer = Math.max(0, game.iceTimer - dt);
  const wdt = dt * timeScale;

  game.elapsed += wdt;
  game.spawnTimer += wdt;
  if (game.spawnTimer >= spawnInterval()) {
    game.spawnTimer = 0;
    spawnCircle(W, H);
  }

  // Independent decoy clock (distraction modes)
  if (hasDistractors()) {
    game.distractorTimer += wdt;
    if (game.distractorTimer >= game.nextDistractorIn) {
      const active = game.targets.reduce((n, t) => n + (t.isDistractor && !t.dead ? 1 : 0), 0);
      if (active < MAX_DISTRACTORS) {
        spawnDistractor(W, H);
        game.distractorTimer = 0;
        game.nextDistractorIn = rollDistractorGap();
      }
    }
  }

  // Power-up cooldowns (real time)
  if (game.powerupCooldown > 0) game.powerupCooldown = Math.max(0, game.powerupCooldown - dt);
  if (game.f1Cooldown > 0) game.f1Cooldown = Math.max(0, game.f1Cooldown - dt);

  // Update targets
  for (const t of game.targets) {
    if (t.quaked) {
      t.age = Math.min(t.age + wdt, t.life * 0.6);
    } else {
      t.age += wdt;
    }
    if (t.age >= t.life && !t.dead) {
      t.dead = true;
      if (t.powerup === "f1" || t.powerup === "safetycar") game.f1Cooldown = F1_COOLDOWN;
      else if (t.powerup) game.powerupCooldown = POWERUP_COOLDOWN;
      if (!t.isDistractor) {
        game.missed++;
        if (missCostsLife()) {
          loseLife(t.x, t.y);
          updateHUD();
        } else {
          game.popups.push({ x: t.x, y: t.y, text: "miss", color: "#e11d48", age: 0 });
        }
      }
    }
  }
  game.targets = game.targets.filter(t => !t.dead);

  // Update entities (world time)
  updatePieces(wdt, H);
  updateArrows(wdt, W, H);
  updateCars(wdt);
  updatePilots(wdt);
  updateExplosions(wdt);

  // Buff timers (real time)
  if (game.swordTimer > 0) game.swordTimer = Math.max(0, game.swordTimer - dt);
  if (game.bowTimer > 0) game.bowTimer = Math.max(0, game.bowTimer - dt);
  if (game.quakeTimer > 0) {
    game.quakeTimer = Math.max(0, game.quakeTimer - dt);
    game.shake = Math.max(game.shake, 5);
  }
  if (game.bottleTimer > 0) game.bottleTimer = Math.max(0, game.bottleTimer - dt);
  if (game.shieldTimer > 0) {
    game.shieldTimer = Math.max(0, game.shieldTimer - dt);
    if (game.shieldTimer === 0) {
      game.shieldLives = 0;
      game.shieldLockout = SHIELD_LOCKOUT;
      updateHUD();
    }
  }
  if (game.shieldLockout > 0) game.shieldLockout = Math.max(0, game.shieldLockout - dt);
  updateBuffsHUD();

  drawFrame(ctx, W, H, dt);
  game.rafId = requestAnimationFrame(loop);
}

// ---------- Flow ----------
function startGame(selectedMode) {
  enterFullscreen();
  game.mode = selectedMode;
  game.score = 0;
  game.lives = maxLives();
  game.hits = 0;
  game.missed = 0;
  game.targets = [];
  game.popups = [];
  game.pieces = [];
  game.spawnTimer = 600;
  game.distractorTimer = 0;
  game.nextDistractorIn = rollDistractorGap();
  game.powerupCooldown = 0;
  game.f1Cooldown = 0;
  game.swordTimer = 0;
  game.quakeTimer = 0;
  game.bottleTimer = 0;
  game.shieldLives = 0;
  game.shieldTimer = 0;
  game.shieldLockout = 0;
  game.iceTimer = 0;
  game.bowTimer = 0;
  game.arrows = [];
  game.cars = [];
  game.pilots = [];
  game.explosions = [];
  game.elapsed = 0;
  game.lastTime = 0;
  game.shake = 0;
  game.state = "playing";
  showOverlay(null);
  hud.classList.add("visible");
  updateHUD();
  cancelAnimationFrame(game.rafId);
  game.rafId = requestAnimationFrame(loop);
}

function pauseGame() {
  if (game.state !== "playing") return;
  game.state = "paused";
  cancelAnimationFrame(game.rafId);
  showOverlay("pause");
}

function resumeGame() {
  if (game.state !== "paused") return;
  game.state = "playing";
  game.lastTime = 0;
  showOverlay(null);
  game.rafId = requestAnimationFrame(loop);
}

function recordHighScore() {
  const k = scoreKey();
  if (game.score > highScores[k]) {
    highScores[k] = game.score;
    saveHighScores();
  }
}

function clearGameEntities() {
  game.targets = [];
  game.popups = [];
  game.pieces = [];
  game.arrows = [];
  game.cars = [];
  game.pilots = [];
  game.explosions = [];
}

function showResults() {
  game.state = "results";
  cancelAnimationFrame(game.rafId);
  recordHighScore();
  clearGameEntities();
  hud.classList.remove("visible");
  $("stat-points").textContent = game.score;
  $("stat-hits").textContent = game.hits;
  $("stat-missed").textContent = game.missed;
  showOverlay("results");
  drawFrame(ctx, W, H, 0);
}

function exitToMenu() {
  game.state = "menu";
  cancelAnimationFrame(game.rafId);
  clearGameEntities();
  hud.classList.remove("visible");
  showOverlay("menu");
  drawFrame(ctx, W, H, 0);
}

function endGame() {
  game.state = "gameover";
  cancelAnimationFrame(game.rafId);
  recordHighScore();
  $("gameover-quote").textContent = rollGameoverQuote();
  $("final-score").textContent = game.score;
  $("best-score").textContent = "Best: " + highScores[scoreKey()];
  hud.classList.remove("visible");
  showOverlay("gameover");
}

// ---------- Button wiring ----------
$("play-btn").addEventListener("click", () => { enterFullscreen(); showModesMenu(); });
$("settings-btn").addEventListener("click", () => { game.state = "settings"; showOverlay("settings"); });
$("cat-normal-btn").addEventListener("click", () => startGame("1"));
$("cat-zen-btn").addEventListener("click", () => startGame("1.1"));
$("cat-blitz-btn").addEventListener("click", () => openDifficultyMenu("1.2"));
$("cat-mayhem-btn").addEventListener("click", () => startGame("1.3"));
$("cat-distraction-btn").addEventListener("click", openDistractionMenu);
$("dx-normal-btn").addEventListener("click", () => startGame("2"));
$("dx-zen-btn").addEventListener("click", () => startGame("2.1"));
$("dx-blitz-btn").addEventListener("click", () => openDifficultyMenu("2.2"));
$("dx-mayhem-btn").addEventListener("click", () => startGame("2.3"));
$("dx-back-btn").addEventListener("click", showModesMenu);
$("diff-medium-btn").addEventListener("click", () => { game.blitzDifficulty = "medium"; startGame(game.pendingBlitzMode); });
$("diff-hard-btn").addEventListener("click", () => { game.blitzDifficulty = "hard"; startGame(game.pendingBlitzMode); });
$("difficulty-back-btn").addEventListener("click", () => {
  if (game.pendingBlitzMode === "2.2") openDistractionMenu(); else showModesMenu();
});
$("modes-back-btn").addEventListener("click", () => { game.state = "menu"; showOverlay("menu"); });
$("settings-back-btn").addEventListener("click", () => { game.state = "menu"; showOverlay("menu"); });
$("pause-btn").addEventListener("click", pauseGame);
$("resume-btn").addEventListener("click", resumeGame);
$("exit-btn").addEventListener("click", showResults);
$("retry-btn").addEventListener("click", () => startGame(game.mode));
$("gameover-exit-btn").addEventListener("click", showResults);
$("results-menu-btn").addEventListener("click", exitToMenu);
$("remove-ads-btn").addEventListener("click", purchaseRemoveAds);

// Auto-pause on tab switch
document.addEventListener("visibilitychange", () => {
  if (document.hidden && game.state === "playing") pauseGame();
});

// Escape key navigation
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  switch (game.state) {
    case "modes":       game.state = "menu"; showOverlay("menu"); break;
    case "distraction": showModesMenu(); break;
    case "difficulty":
      if (game.pendingBlitzMode === "2.2") openDistractionMenu(); else showModesMenu();
      break;
    case "settings":   game.state = "menu"; showOverlay("menu"); break;
    case "paused":     resumeGame(); break;
    case "results":    exitToMenu(); break;
    case "gameover":   showResults(); break;
    case "playing":    pauseGame(); break;
  }
});

// ---------- Rotate hint ----------
const rotateOverlay = $("rotate-overlay");
let rotateHintShown = false;
let rotateHideTimer = null;

function hideRotateHint() {
  clearTimeout(rotateHideTimer);
  rotateOverlay.classList.add("fading");
  setTimeout(() => rotateOverlay.classList.remove("visible", "fading"), 400);
}

function maybeShowRotateHint() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) <= 820;
  if (isPortrait && isSmallScreen && !rotateHintShown) {
    rotateHintShown = true;
    rotateOverlay.classList.add("visible");
    rotateHideTimer = setTimeout(hideRotateHint, 4000);
  }
}
rotateOverlay.addEventListener("pointerdown", hideRotateHint);
window.addEventListener("resize", () => {
  if (rotateOverlay.classList.contains("visible") && window.innerWidth > window.innerHeight) {
    hideRotateHint();
  }
});

// ---------- Init ----------
loadSettings();
loadHighScores();
setEndGameCallback(endGame);
bindInput(canvas);
bindSettings(ctx, () => W, () => H);
resize();
drawFrame(ctx, W, H, 0);
rollSplash();
updateAdAndCopyright();
maybeShowRotateHint();
