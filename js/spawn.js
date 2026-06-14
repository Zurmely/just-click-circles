// =============================================
// spawn.js — Circle & distractor spawning
// =============================================

import {
  game, settings, mouse, IS_MOBILE,
  HUD_SAFE_TOP, DISTRACTOR_SHAPES,
  isBlitz, isMayhem, quakeFactor, effectDuration,
  getModeConfig,
} from "./state.js";
import { BLITZ_TIMES } from "./modes/blitz.js";
import {
  MAYHEM_POWERUP_CHANCE, F1_CHANCE, SAFETY_CHANCE,
} from "./modes/mayhem.js";

// ---------- Helpers ----------
export function targetRadius(W, H) {
  return Math.max(26, Math.min(W, H) * 0.055);
}

export function targetScale(t) {
  const p = t.age / t.life;
  if (p < 0.15) { const k = p / 0.15; return 1 - (1 - k) * (1 - k); } // pop in
  if (p > 0.72) return Math.max(0, 1 - (p - 0.72) / 0.28);            // shrink out
  return 1;
}

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function randomDistractorOutline() {
  const base = hexToHsl(settings.outlineColor);
  let h;
  if (base.s < 18) {
    h = Math.random() * 360;
  } else {
    h = (base.h + 70 + Math.random() * 220) % 360;
  }
  return "hsl(" + (Math.round(h) % 360) + ", 85%, 55%)";
}

// ---------- Spawn positioning ----------
function spawnNearMouse() {
  return !IS_MOBILE && mouse.active && isBlitz() && game.blitzDifficulty === "hard";
}

function spawnRadius(W, H) {
  return Math.min(330, Math.max(190, Math.min(W, H) * 0.32));
}

export function spawnPosition(r, placed, W, H) {
  const margin = r + 12;
  const topMin = Math.max(HUD_SAFE_TOP + margin, margin);
  let x = W / 2, y = H / 2;
  for (let attempt = 0; attempt < 14; attempt++) {
    if (spawnNearMouse()) {
      const R = spawnRadius(W, H);
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * R;
      x = mouse.x + Math.cos(a) * d;
      y = mouse.y + Math.sin(a) * d;
    } else {
      x = margin + Math.random() * (W - margin * 2);
      y = topMin + Math.random() * (H - topMin - margin);
    }
    x = Math.min(W - margin, Math.max(margin, x));
    y = Math.min(H - margin, Math.max(topMin, y));
    let clear = true;
    for (const p of placed) {
      const dx = x - p.x, dy = y - p.y;
      if (dx * dx + dy * dy < (2.1 * r) * (2.1 * r)) { clear = false; break; }
    }
    if (clear) break;
  }
  return { x, y };
}

// ---------- Circle spawning ----------
export function spawnCircle(W, H) {
  const r = targetRadius(W, H);
  const cfg = getModeConfig();
  const life = isBlitz()
    ? (BLITZ_TIMES[game.blitzDifficulty] || BLITZ_TIMES.hard)
    : cfg.circleLife(game.score);
  const placed = game.targets.map(t => ({ x: t.x, y: t.y }));
  const c = spawnPosition(r, placed, W, H);

  // power-ups: Mayhem only
  let powerup = null;
  if (isMayhem()) {
    if (game.powerupCooldown <= 0 &&
        !game.targets.some(t => !t.dead && t.powerup && t.powerup !== "f1") &&
        Math.random() < MAYHEM_POWERUP_CHANCE) {
      const kinds = ["sword", "ice", "bow", "quake", "bottle"];
      if (game.shieldLockout <= 0) kinds.push("shield");
      if (game.lives < cfg.maxLives) {
        kinds.push("life");
        if (game.lives <= cfg.maxLives - 3) kinds.push("life");
      }
      powerup = kinds[Math.floor(Math.random() * kinds.length)];
    }
    // F1 / safety car: independent system
    if (!powerup && game.f1Cooldown <= 0 &&
        !game.targets.some(t => !t.dead && (t.powerup === "f1" || t.powerup === "safetycar")) &&
        Math.random() < F1_CHANCE) {
      powerup = Math.random() < SAFETY_CHANCE ? "safetycar" : "f1";
    }
  }

  game.targets.push({
    x: c.x, y: c.y, r, shape: "circle", isDistractor: false, powerup,
    quaked: game.quakeTimer > 0,
    age: 0, life, dead: false,
  });
}

// ---------- Distractor spawning ----------
export function spawnDistractor(W, H) {
  const r = targetRadius(W, H);
  const placed = game.targets.map(t => ({ x: t.x, y: t.y }));
  const p = spawnPosition(r, placed, W, H);
  game.targets.push({
    x: p.x, y: p.y, r,
    shape: DISTRACTOR_SHAPES[Math.floor(Math.random() * DISTRACTOR_SHAPES.length)],
    isDistractor: true, age: 0,
    life: 1400 + Math.random() * 1200,
    outlineColor: randomDistractorOutline(),
    dead: false,
  });
}
