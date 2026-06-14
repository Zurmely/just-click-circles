// =============================================
// renderer.js — Canvas drawing
// =============================================

import { game, settings, quakeFactor } from "./state.js";
import { targetScale } from "./spawn.js";
import { POWERUP_STYLE } from "./powerups.js";

// ---------- Background ----------
export function drawBackground(ctx, W, H) {
  if (settings.bgImage) {
    const img = settings.bgImage;
    const scale = Math.max(W / img.width, H / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = settings.canvasBg;
    ctx.fillRect(0, 0, W, H);
  }
}

// ---------- Shapes ----------
export function pathShape(ctx, shape, x, y, r) {
  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(x, y, r, 0, Math.PI * 2);
      break;
    case "square": {
      const s = r * 1.7;
      ctx.rect(x - s / 2, y - s / 2, s, s);
      break;
    }
    case "triangle":
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const px = x + Math.cos(a) * r * 1.15;
        const py = y + Math.sin(a) * r * 1.15;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(x, y - r * 1.2);
      ctx.lineTo(x + r * 0.95, y);
      ctx.lineTo(x, y + r * 1.2);
      ctx.lineTo(x - r * 0.95, y);
      ctx.closePath();
      break;
    case "pentagon":
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const px = x + Math.cos(a) * r * 1.1;
        const py = y + Math.sin(a) * r * 1.1;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
  }
}

// ---------- Target ----------
export function drawTarget(ctx, t) {
  const s = targetScale(t);
  if (s <= 0) return;
  const r = t.r * s * quakeFactor(t);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  pathShape(ctx, t.shape, t.x, t.y, r);
  ctx.fillStyle = settings.fillColor;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = Math.max(3, r * 0.16);
  ctx.strokeStyle = t.outlineColor || settings.outlineColor;
  ctx.stroke();
  if (t.powerup) {
    ctx.font = Math.round(r * 1.0) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(POWERUP_STYLE[t.powerup].icon, t.x, t.y + r * 0.06);
  }
  ctx.restore();
}

// ---------- Popups ----------
export function drawPopups(ctx, dt) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "700 22px 'Segoe UI', Roboto, sans-serif";
  for (const p of game.popups) {
    p.age += dt;
    const a = 1 - p.age / 700;
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y - (p.age / 700) * 36);
  }
  ctx.restore();
  game.popups = game.popups.filter(p => p.age < 700);
}

// ---------- Pieces (slashed halves) ----------
export function drawPieces(ctx) {
  for (const p of game.pieces) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.cut + p.rot);
    ctx.beginPath();
    if (p.side === 1) ctx.arc(0, 0, p.r, 0, Math.PI);
    else ctx.arc(0, 0, p.r, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = p.fill;
    ctx.fill();
    ctx.lineWidth = Math.max(2, p.r * 0.12);
    ctx.strokeStyle = p.outline;
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- F1 Cars ----------
export function drawCars(ctx) {
  for (const c of game.cars) {
    const phi = Math.atan2(c.vy, c.vx);
    ctx.save();
    ctx.translate(c.x, c.y);
    if (c.vx >= 0) {
      ctx.rotate(phi);
      ctx.scale(-1, 1);
    } else {
      ctx.rotate(phi - Math.PI);
    }
    ctx.font = "42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.kind === "safety" ? "\uD83D\uDE93" : "\uD83C\uDFCE\uFE0F", 0, 0);
    ctx.restore();
  }
}

// ---------- Pilots ----------
export function drawPilots(ctx) {
  for (const p of game.pilots) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.vx > 0) ctx.scale(-1, 1);
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uD83C\uDFC3", 0, 0);
    ctx.restore();
  }
}

// ---------- Arrows ----------
export function drawArrows(ctx) {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#16a34a";
  ctx.fillStyle = "#16a34a";
  for (const a of game.arrows) {
    const mag = Math.hypot(a.vx, a.vy) || 1;
    const ux = a.vx / mag, uy = a.vy / mag;
    ctx.beginPath();
    ctx.moveTo(a.x - ux * 14, a.y - uy * 14);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- Explosions ----------
export function drawExplosions(ctx) {
  for (const e of game.explosions) {
    const p = e.age / 700;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.font = Math.round(44 + p * 56) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uD83D\uDCA5", e.x, e.y);
    ctx.restore();
  }
}

// ---------- Full frame ----------
export function drawFrame(ctx, W, H, dt) {
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
    game.shake = Math.max(0, game.shake - dt * 0.04);
  }
  drawBackground(ctx, W, H);
  for (const t of game.targets) drawTarget(ctx, t);
  drawPieces(ctx);
  drawCars(ctx);
  drawPilots(ctx);
  drawArrows(ctx);
  drawExplosions(ctx);
  if (game.iceTimer > 0) {
    ctx.fillStyle = "rgba(125, 211, 252, 0.16)";
    ctx.fillRect(0, 0, W, H);
  }
  drawPopups(ctx, dt || 16);
  ctx.restore();
}
