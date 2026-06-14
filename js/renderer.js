// =============================================
// renderer.js — Canvas drawing
// =============================================

import { game, settings, quakeFactor } from "./state.js";
import { targetScale } from "./spawn.js";
import { POWERUP_STYLE } from "./powerups.js";

const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");

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
  
  if (settings.activeTheme === "mario64") {
    // Pixelated retro canvas drawing for Mario 64
    const size = 32;
    offCanvas.width = size;
    offCanvas.height = size;
    offCtx.clearRect(0, 0, size, size);
    
    offCtx.save();
    pathShape(offCtx, t.shape, 16, 16, 11);
    offCtx.fillStyle = settings.fillColor;
    offCtx.fill();
    offCtx.lineWidth = 2.5;
    offCtx.strokeStyle = t.outlineColor || settings.outlineColor;
    offCtx.stroke();
    
    if (t.powerup) {
      offCtx.font = "12px sans-serif";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = t.outlineColor || settings.outlineColor;
      offCtx.fillText(POWERUP_STYLE[t.powerup].icon, 16, 17);
    }
    offCtx.restore();
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    
    // Blocky shadow
    ctx.globalAlpha = 0.35;
    ctx.drawImage(offCanvas, t.x - r + 4, t.y - r + 4, r * 2, r * 2);
    
    ctx.globalAlpha = 1;
    ctx.drawImage(offCanvas, t.x - r, t.y - r, r * 2, r * 2);
    ctx.restore();
    return;
  }
  
  ctx.save();
  
  if (settings.activeTheme === "wow") {
    // Spiked dragon eye target drawing
    // Spikes first
    ctx.fillStyle = t.outlineColor || settings.outlineColor;
    const spikeCount = 6;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * 2 * Math.PI) / spikeCount + (t.x + t.y) * 0.01;
      const sx = t.x + Math.cos(angle) * r;
      const sy = t.y + Math.sin(angle) * r;
      const tx1 = t.x + Math.cos(angle - 0.25) * (r * 0.85);
      const ty1 = t.y + Math.sin(angle - 0.25) * (r * 0.85);
      const tx2 = t.x + Math.cos(angle + 0.25) * (r * 0.85);
      const ty2 = t.y + Math.sin(angle + 0.25) * (r * 0.85);
      const ex = t.x + Math.cos(angle) * (r * 1.35);
      const ey = t.y + Math.sin(angle) * (r * 1.35);
      
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(ex, ey);
      ctx.lineTo(tx2, ty2);
      ctx.closePath();
      ctx.fill();
    }
    
    // Main target base shape
    pathShape(ctx, t.shape, t.x, t.y, r);
    ctx.fillStyle = settings.fillColor;
    ctx.fill();
    ctx.lineWidth = Math.max(3, r * 0.16);
    ctx.strokeStyle = t.outlineColor || settings.outlineColor;
    ctx.stroke();
    
    // Slit iris monster eye center
    const irisRadius = r * 0.55;
    const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, irisRadius);
    grad.addColorStop(0, "#ffe000"); // yellow center
    grad.addColorStop(0.5, "#ff3300"); // orange/red middle
    grad.addColorStop(1, "#3a0007"); // dark dark red outer
    ctx.beginPath();
    ctx.arc(t.x, t.y, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(0.25, 1);
    ctx.beginPath();
    ctx.arc(0, 0, irisRadius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(t.x - irisRadius * 0.25, t.y - irisRadius * 0.25, irisRadius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
    
  } else if (settings.activeTheme === "csgo") {
    // Tactical military scope targets
    pathShape(ctx, t.shape, t.x, t.y, r);
    ctx.fillStyle = settings.fillColor;
    ctx.fill();
    ctx.lineWidth = Math.max(3, r * 0.16);
    ctx.strokeStyle = t.outlineColor || settings.outlineColor;
    ctx.stroke();
    
    // Crosshair ticks
    ctx.strokeStyle = t.outlineColor || settings.outlineColor;
    ctx.lineWidth = 2;
    const gap = r * 1.05;
    const tickLen = r * 0.25;
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - gap); ctx.lineTo(t.x, t.y - gap - tickLen);
    ctx.moveTo(t.x, t.y + gap); ctx.lineTo(t.x, t.y + gap + tickLen);
    ctx.moveTo(t.x - gap, t.y); ctx.lineTo(t.x - gap - tickLen, t.y);
    ctx.moveTo(t.x + gap, t.y); ctx.lineTo(t.x + gap + tickLen, t.y);
    ctx.stroke();
    
    // Internal reticle line
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(t.x - r * 0.8, t.y); ctx.lineTo(t.x + r * 0.8, t.y);
    ctx.moveTo(t.x, t.y - r * 0.8); ctx.lineTo(t.x, t.y + r * 0.8);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(t.x, t.y, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = t.outlineColor || settings.outlineColor;
    ctx.fill();
    
  } else if (settings.activeTheme === "claude") {
    // Sleek AI debug targets
    pathShape(ctx, t.shape, t.x, t.y, r);
    ctx.fillStyle = settings.fillColor;
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.strokeStyle = t.outlineColor || settings.outlineColor;
    ctx.stroke();
    
    // Corner marks
    ctx.strokeStyle = t.outlineColor || settings.outlineColor;
    ctx.lineWidth = 1.5;
    const boxSize = r * 1.15;
    const corner = r * 0.35;
    
    ctx.beginPath();
    ctx.moveTo(t.x - boxSize, t.y - boxSize + corner);
    ctx.lineTo(t.x - boxSize, t.y - boxSize);
    ctx.lineTo(t.x - boxSize + corner, t.y - boxSize);
    
    ctx.moveTo(t.x + boxSize, t.y - boxSize + corner);
    ctx.lineTo(t.x + boxSize, t.y - boxSize);
    ctx.lineTo(t.x + boxSize - corner, t.y - boxSize);
    
    ctx.moveTo(t.x - boxSize, t.y + boxSize - corner);
    ctx.lineTo(t.x - boxSize, t.y + boxSize);
    ctx.lineTo(t.x - boxSize + corner, t.y + boxSize);
    
    ctx.moveTo(t.x + boxSize, t.y + boxSize - corner);
    ctx.lineTo(t.x + boxSize, t.y + boxSize);
    ctx.lineTo(t.x + boxSize - corner, t.y + boxSize);
    ctx.stroke();
    
    ctx.font = "9px monospace";
    ctx.fillStyle = settings.outlineColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const pct = Math.max(0, 1 - t.age / t.life);
    ctx.fillText(`ID:${Math.floor(t.x % 100)}`, t.x + boxSize + 4, t.y - boxSize);
    ctx.fillText(`VAL:${pct.toFixed(2)}`, t.x + boxSize + 4, t.y - boxSize + 11);
    
  } else {
    // Default style
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
  }
  
  if (t.powerup && settings.activeTheme !== "mario64") {
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
    if (settings.activeTheme === "mario64") {
      const size = 32;
      offCanvas.width = size;
      offCanvas.height = size;
      offCtx.clearRect(0, 0, size, size);
      
      offCtx.save();
      offCtx.translate(16, 16);
      offCtx.beginPath();
      if (p.side === 1) offCtx.arc(0, 0, 12, 0, Math.PI);
      else offCtx.arc(0, 0, 12, Math.PI, Math.PI * 2);
      offCtx.closePath();
      offCtx.fillStyle = p.fill;
      offCtx.fill();
      offCtx.lineWidth = 2.5;
      offCtx.strokeStyle = p.outline;
      offCtx.stroke();
      offCtx.restore();

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.cut + p.rot);
      ctx.drawImage(offCanvas, -p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    } else {
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
