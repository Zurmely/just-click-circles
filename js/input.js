// =============================================
// input.js — Pointer / touch input handling
// =============================================

import { game, settings, mouse, IS_MOBILE, quakeFactor, missCostsLife, distractorCostsLife, loseLife } from "./state.js";
import { targetScale } from "./spawn.js";
import { destroyCircle } from "./powerups.js";
import { updateHUD } from "./ui.js";

// ---------- Haptic feedback ----------
function vibrate(ms) {
  if (IS_MOBILE && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) { /* unsupported */ }
  }
}

// ---------- Bind canvas input ----------
export function bindInput(canvas) {
  // Mouse tracking for Blitz Hard desktop spawn
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  canvas.addEventListener("pointerdown", (e) => {
    if (game.state !== "playing") return;
    e.preventDefault(); // prevent iOS gesture stealing
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // topmost target first
    for (let i = game.targets.length - 1; i >= 0; i--) {
      const t = game.targets[i];
      if (t.dead) continue;
      const s = targetScale(t);
      const hitR = t.r * Math.max(s, 0.4) * quakeFactor(t) + 14; // generous touch area
      const dx = x - t.x, dy = y - t.y;
      if (dx * dx + dy * dy <= hitR * hitR) {
        if (t.isDistractor) {
          t.dead = true;
          if (distractorCostsLife()) {
            loseLife(t.x, t.y);
            updateHUD();
            vibrate(40);
          } else {
            game.shake = 10;
          }
          game.popups.push({ x: t.x, y: t.y - 18, text: "wrong shape!", color: "#e11d48", age: 0 });
        } else {
          destroyCircle(t, "click");
          updateHUD();
        }
        return;
      }
    }

    // clicked empty space: in Normal/Mayhem, a wasted click costs a life
    if (missCostsLife()) {
      loseLife(x, y);
      updateHUD();
      vibrate(40);
      game.popups.push({ x, y: y - 18, text: "missed click!", color: "#e11d48", age: 0 });
    }
  });
}
