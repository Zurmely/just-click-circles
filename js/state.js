// =============================================
// state.js — Shared game state & persistence
// =============================================

// ---------- Constants ----------
export const HUD_SAFE_TOP = 70;
export const DISTRACTOR_SHAPES = ["square", "triangle", "diamond", "pentagon"];
export const MAX_DISTRACTORS = 3;

// ---------- Mobile detection ----------
export const IS_MOBILE =
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches);

// ---------- Settings ----------
const SETTINGS_KEY = "jcc-settings";
const HS_KEY = "jcc-highscores";

export const settings = {
  bgImage: null,           // Image object or null (not persisted)
  fillColor: "#9ca3af",
  outlineColor: "#facc15",
  theme: "light",
};

export const highScores = {
  "1": 0, "1.1": 0, "2": 0, "2.1": 0,
  "1.3": 0, "2.3": 0,
  "1.2-medium": 0, "1.2-hard": 0,
  "2.2-medium": 0, "2.2-hard": 0,
};

// ---------- Game state ----------
export const game = {
  state: "menu",   // menu | modes | distraction | difficulty | settings | playing | paused | gameover | results
  mode: "1",
  score: 0,
  lives: 3,
  hits: 0,
  missed: 0,
  targets: [],
  popups: [],
  pieces: [],
  arrows: [],
  cars: [],
  pilots: [],
  explosions: [],
  spawnTimer: 0,
  elapsed: 0,
  lastTime: 0,
  shake: 0,
  rafId: null,
  blitzDifficulty: "hard",
  pendingBlitzMode: null,
  adsRemoved: false,

  // Distractor timing
  distractorTimer: 0,
  nextDistractorIn: 0,

  // Power-up timers
  powerupCooldown: 0,
  f1Cooldown: 0,
  swordTimer: 0,
  bowTimer: 0,
  quakeTimer: 0,
  bottleTimer: 0,
  shieldLives: 0,
  shieldTimer: 0,
  shieldLockout: 0,
  iceTimer: 0,
};

// ---------- Mouse tracking (for Blitz Hard desktop) ----------
export const mouse = { x: 0, y: 0, active: false };

// ---------- Persistence ----------
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.fillColor) settings.fillColor = saved.fillColor;
      if (saved.outlineColor) settings.outlineColor = saved.outlineColor;
      if (saved.theme) settings.theme = saved.theme;
    }
  } catch (e) { /* localStorage unavailable or corrupt — use defaults */ }
}

export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      fillColor: settings.fillColor,
      outlineColor: settings.outlineColor,
      theme: settings.theme,
    }));
  } catch (e) { /* silently fail */ }
}

export function loadHighScores() {
  try {
    const raw = localStorage.getItem(HS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      for (const k of Object.keys(highScores)) {
        if (typeof saved[k] === "number") highScores[k] = saved[k];
      }
    }
  } catch (e) { /* use defaults */ }
}

export function saveHighScores() {
  try {
    localStorage.setItem(HS_KEY, JSON.stringify(highScores));
  } catch (e) { /* silently fail */ }
}

// ---------- Mode helpers ----------
export const isBlitz = () => game.mode.endsWith(".2");
export const hasDistractors = () => game.mode.startsWith("2");
export const isNormal = () => game.mode === "1" || game.mode === "2";
export const isMayhem = () => game.mode === "1.3" || game.mode === "2.3";

export const scoreKey = () => isBlitz() ? game.mode + "-" + game.blitzDifficulty : game.mode;
export const maxLives = () => isMayhem() ? 10 : 3;
export const missCostsLife = () => isNormal() || isMayhem();
export const distractorCostsLife = () => game.mode === "2" || game.mode === "2.2" || game.mode === "2.3";
export const livesEnabled = () => missCostsLife() || distractorCostsLife();

// Time in a Bottle: effects picked while active last twice as long
export const effectDuration = (ms) => game.bottleTimer > 0 ? ms * 2 : ms;

// Quaked circles stay big permanently
export const QUAKE_SCALE = 1.35;
export const quakeFactor = (t) => t.quaked ? QUAKE_SCALE : 1;

// ---------- Distractor gap ----------
export function rollDistractorGap() {
  return 450 + Math.random() * 700;
}

// ---------- Mode config registry ----------
// Modes register themselves here; getModeConfig is called from spawn.js
// without importing main.js, breaking the circular dependency.
const _modes = [];

export function registerModes(modes) {
  _modes.length = 0;
  _modes.push(...modes);
}

export function getModeConfig() {
  for (const m of _modes) {
    if (m.ids.includes(game.mode)) return m;
  }
  return _modes[0]; // fallback to first registered mode
}

// ---------- Life loss (shared) ----------
// endGame callback set by main.js to avoid a circular import.
let _onEndGame = () => {};
export function setEndGameCallback(fn) { _onEndGame = fn; }

export function loseLife(x, y) {
  if (game.shieldLives > 0) {
    game.shieldLives--;
    game.shake = 8;
    if (x !== undefined) game.popups.push({ x, y, text: "blocked!", color: "#3b82f6", age: 0 });
    // updateHUD is called by the caller
    return;
  }
  game.lives--;
  game.shake = 14;
  if (x !== undefined) game.popups.push({ x, y, text: "miss", color: "#e11d48", age: 0 });
  // Haptic feedback
  if (IS_MOBILE && navigator.vibrate) {
    try { navigator.vibrate(40); } catch (e) { /* unsupported */ }
  }
  if (game.lives <= 0) _onEndGame();
}
