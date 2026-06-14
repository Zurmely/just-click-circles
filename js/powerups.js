// =============================================
// powerups.js — Power-up system (Mayhem mode)
// =============================================

import { game, settings, quakeFactor, effectDuration, QUAKE_SCALE } from "./state.js";
import {
  SWORD_DURATION, SHIELD_LIVES, SHIELD_DURATION,
  ICE_DURATION, BOW_DURATION, ARROW_SPEED, ARROW_LIFE, MAX_ARROWS,
  QUAKE_DURATION, BOTTLE_DURATION,
  POWERUP_COOLDOWN, F1_COOLDOWN,
} from "./modes/mayhem.js";
import { updateHUD } from "./ui.js";
import { targetScale } from "./spawn.js";

// ---------- Power-up display ----------
export const POWERUP_STYLE = {
  life:      { icon: "\u2764\uFE0F" },
  sword:     { icon: "\u2694\uFE0F" },
  shield:    { icon: "\uD83D\uDEE1\uFE0F" },
  ice:       { icon: "\u2744\uFE0F" },
  f1:        { icon: "\uD83C\uDFCE\uFE0F" },
  bow:       { icon: "\uD83C\uDFF9" },
  quake:     { icon: "\uD83C\uDF0B" },
  bottle:    { icon: "\u23F3" },
  safetycar: { icon: "\uD83D\uDEA8" },
};

// ---------- Chain-reaction core ----------
// Every circle destruction flows through here.
// cause: "click" | "slash" | "car" | "arrow" | "pilot"
export function destroyCircle(t, cause) {
  if (t.dead) return;
  t.dead = true;
  const sworded = game.swordTimer > 0;
  let gain = 1;
  if (cause === "click") {
    gain = sworded ? 2 : 1;
    game.hits++;
  }
  game.score += gain;
  if (t.powerup) applyPowerup(t.powerup, t.x, t.y);
  game.popups.push({
    x: t.x, y: t.y, text: "+" + gain,
    color: cause === "click" ? settings.outlineColor : "#f59e0b", age: 0,
  });
  if (cause !== "click" || sworded) spawnSlashPieces(t);
  if (game.bowTimer > 0) emitArrows(t.x, t.y);
  if (sworded && cause !== "slash") slashFarthest(t);
}

// ---------- Apply power-up effect ----------
function applyPowerup(kind, x, y) {
  const maxL = game.lives; // current max from mode
  switch (kind) {
    case "life": {
      const cap = (game.mode === "1.3" || game.mode === "2.3") ? 10 : 3;
      game.lives = Math.min(cap, game.lives + 3);
      game.popups.push({ x, y: y - 30, text: "+3 \u2764", color: "#ef4444", age: 0 });
      break;
    }
    case "sword":
      game.swordTimer = effectDuration(SWORD_DURATION);
      game.popups.push({ x, y: y - 30, text: "slash time!", color: "#f59e0b", age: 0 });
      break;
    case "shield":
      game.shieldLives = SHIELD_LIVES;
      game.shieldTimer = SHIELD_DURATION;
      game.popups.push({ x, y: y - 30, text: "shield!", color: "#3b82f6", age: 0 });
      break;
    case "ice":
      game.iceTimer = effectDuration(ICE_DURATION);
      game.popups.push({ x, y: y - 30, text: "slow-mo!", color: "#22d3ee", age: 0 });
      break;
    case "f1":
      spawnCar();
      if (game.bottleTimer > 0) spawnCar();
      game.popups.push({ x, y: y - 30, text: game.bottleTimer > 0 ? "double lights out!" : "lights out!", color: "#f43f5e", age: 0 });
      break;
    case "bow":
      game.bowTimer = effectDuration(BOW_DURATION);
      game.popups.push({ x, y: y - 30, text: "arrow time!", color: "#16a34a", age: 0 });
      break;
    case "quake":
      game.quakeTimer = effectDuration(QUAKE_DURATION);
      for (const c of game.targets) {
        if (!c.isDistractor && !c.dead) {
          c.quaked = true;
          c.age = Math.min(c.age, c.life * 0.6);
        }
      }
      game.popups.push({ x, y: y - 30, text: "earthquake!", color: "#b45309", age: 0 });
      break;
    case "bottle":
      game.bottleTimer = BOTTLE_DURATION;
      game.popups.push({ x, y: y - 30, text: "time x2!", color: "#a855f7", age: 0 });
      break;
    case "safetycar":
      spawnCar("safety");
      spawnCar("f1");
      spawnCar("f1");
      if (game.bottleTimer > 0) {
        spawnCar("f1");
        spawnCar("f1");
      }
      game.popups.push({ x, y: y - 30, text: "safety car!", color: "#facc15", age: 0 });
      break;
  }
  if (kind === "f1" || kind === "safetycar") game.f1Cooldown = F1_COOLDOWN;
  else game.powerupCooldown = POWERUP_COOLDOWN;
  updateHUD();
}

// ---------- Sword slashing ----------
function spawnSlashPieces(t) {
  const cut = Math.random() * Math.PI;
  const nx = Math.cos(cut + Math.PI / 2), ny = Math.sin(cut + Math.PI / 2);
  for (const side of [-1, 1]) {
    game.pieces.push({
      x: t.x + nx * side * 3,
      y: t.y + ny * side * 3,
      r: t.r, cut, side,
      vx: nx * side * (0.04 + Math.random() * 0.05) + (Math.random() - 0.5) * 0.03,
      vy: ny * side * 0.03 - (0.08 + Math.random() * 0.1),
      rot: 0,
      vr: (Math.random() - 0.5) * 0.004,
      fill: settings.fillColor,
      outline: t.outlineColor || settings.outlineColor,
      age: 0,
    });
  }
}

function slashFarthest(from) {
  const candidates = game.targets.filter(t => !t.dead && !t.isDistractor && t !== from);
  candidates.sort((a, b) =>
    ((b.x - from.x) ** 2 + (b.y - from.y) ** 2) -
    ((a.x - from.x) ** 2 + (a.y - from.y) ** 2));
  const n = Math.min(3, candidates.length);
  for (let i = 0; i < n; i++) destroyCircle(candidates[i], "slash");
}

// ---------- Bow & Arrow ----------
function emitArrows(x, y) {
  for (let i = 0; i < 3 && game.arrows.length < MAX_ARROWS; i++) {
    const a = Math.random() * Math.PI * 2;
    game.arrows.push({
      x, y,
      vx: Math.cos(a) * ARROW_SPEED,
      vy: Math.sin(a) * ARROW_SPEED,
      age: 0,
    });
  }
}

export function updateArrows(dt, W, H) {
  for (const a of game.arrows) {
    a.age += dt;
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    if (a.age >= ARROW_LIFE || a.x < -30 || a.x > W + 30 || a.y < -30 || a.y > H + 30) {
      a.dead = true;
      continue;
    }
    for (const t of game.targets) {
      if (t.dead || t.isDistractor) continue;
      const rr = t.r * targetScale(t) * quakeFactor(t) + 5;
      const dx = a.x - t.x, dy = a.y - t.y;
      if (dx * dx + dy * dy <= rr * rr) {
        a.dead = true;
        destroyCircle(t, "arrow");
        break;
      }
    }
  }
  game.arrows = game.arrows.filter(a => !a.dead);
}

// ---------- F1 Cars ----------
function rayExit(px, py, dx, dy, m, W, H) {
  let s = Infinity;
  if (dx > 0) s = Math.min(s, (W + m - px) / dx);
  else if (dx < 0) s = Math.min(s, (-m - px) / dx);
  if (dy > 0) s = Math.min(s, (H + m - py) / dy);
  else if (dy < 0) s = Math.min(s, (-m - py) / dy);
  return s;
}

/** @type {number} */
let _W = 0, _H = 0;
export function setViewport(w, h) { _W = w; _H = h; }

function spawnCar(kind) {
  kind = kind || "f1";
  const W = _W, H = _H, m = 80;
  const speed = kind === "safety"
    ? 0.32 + Math.random() * 0.06
    : 0.45 + Math.random() * 0.15;
  const live = game.targets.filter(t => !t.dead && !t.isDistractor);
  let sx, sy, dx, dy, maxDist;
  if (live.length > 0) {
    const T = live[Math.floor(Math.random() * live.length)];
    const a = Math.random() * Math.PI * 2;
    dx = Math.cos(a); dy = Math.sin(a);
    const back = rayExit(T.x, T.y, -dx, -dy, m, W, H);
    const fwd = rayExit(T.x, T.y, dx, dy, m, W, H);
    sx = T.x - dx * (back + 10);
    sy = T.y - dy * (back + 10);
    maxDist = back + fwd + 60;
  } else {
    const corners = [
      [-m, -m, W + m, H + m], [W + m, -m, -m, H + m],
      [-m, H + m, W + m, -m], [W + m, H + m, -m, -m],
    ];
    const [x0, y0, x1, y1] = corners[Math.floor(Math.random() * 4)];
    const len = Math.hypot(x1 - x0, y1 - y0);
    sx = x0; sy = y0;
    dx = (x1 - x0) / len; dy = (y1 - y0) / len;
    maxDist = len + 40;
  }
  game.cars.push({ x: sx, y: sy, vx: dx * speed, vy: dy * speed, speed, traveled: 0, maxDist, kind });
}

export function updateCars(dt) {
  const W = _W, H = _H;
  for (const c of game.cars) {
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.traveled += c.speed * dt;
    for (const t of game.targets) {
      if (t.dead || t.isDistractor) continue;
      const dx = t.x - c.x, dy = t.y - c.y;
      if (dx * dx + dy * dy < 55 * 55) destroyCircle(t, "car");
    }
    if (c.traveled >= c.maxDist) c.dead = true;
  }
  // collision between cars
  const onScreen = (c) => c.x > 0 && c.x < W && c.y > 0 && c.y < H;
  for (let i = 0; i < game.cars.length; i++) {
    for (let j = i + 1; j < game.cars.length; j++) {
      const a = game.cars[i], b = game.cars[j];
      if (a.dead || b.dead || !onScreen(a) || !onScreen(b)) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy < 50 * 50) crashCars(a, b);
    }
  }
  game.cars = game.cars.filter(c => !c.dead);
}

function crashCars(a, b) {
  a.dead = true;
  b.dead = true;
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  game.explosions.push({ x: cx, y: cy, age: 0 });
  game.shake = Math.max(game.shake, 22);
  game.popups.push({ x: cx, y: cy - 44, text: "crash!", color: "#f43f5e", age: 0 });
  const live = game.targets.filter(t => !t.dead && !t.isDistractor)
    .sort(() => Math.random() - 0.5);
  for (let i = 0; i < 2; i++) {
    game.pilots.push({
      x: cx + (i === 0 ? -16 : 16), y: cy,
      vx: (i === 0 ? -1 : 1) * 0.25, vy: 0,
      target: live[i] || live[0] || null,
      speed: 0.3, age: 0,
    });
  }
}

export function updatePilots(dt) {
  const W = _W, H = _H;
  for (const p of game.pilots) {
    p.age += dt;
    if (p.target && p.target.dead) p.target = null;
    if (!p.target) {
      const live = game.targets.filter(t => !t.dead && !t.isDistractor);
      if (live.length) p.target = live[Math.floor(Math.random() * live.length)];
    }
    if (p.target) {
      const dx = p.target.x - p.x, dy = p.target.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      p.vx = (dx / d) * p.speed;
      p.vy = (dy / d) * p.speed;
      if (d < p.target.r * quakeFactor(p.target) * 0.8) {
        destroyCircle(p.target, "pilot");
        p.dead = true;
      }
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age > 8000 || p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) p.dead = true;
  }
  game.pilots = game.pilots.filter(p => !p.dead);
}

export function updatePieces(dt, H) {
  for (const p of game.pieces) {
    p.age += dt;
    p.vy += 0.0011 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
  }
  game.pieces = game.pieces.filter(p => p.y < H + p.r * 2 && p.age < 5000);
}

export function updateExplosions(dt) {
  for (const e of game.explosions) e.age += dt;
  game.explosions = game.explosions.filter(e => e.age < 700);
}
