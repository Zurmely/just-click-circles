// =============================================
// modes/mayhem.js — Mayhem mode config (1.3, 2.3)
// =============================================

// ----- Power-up constants -----
export const MAYHEM_LIVES = 10;
export const MAYHEM_POWERUP_CHANCE = 0.85;
export const POWERUP_COOLDOWN = 1250;     // ms after an effect ends
export const SWORD_DURATION = 5000;
export const SHIELD_LIVES = 10;
export const SHIELD_DURATION = 10000;
export const SHIELD_LOCKOUT = 10000;
export const ICE_DURATION = 3000;
export const ICE_SLOW = 0.35;
export const BOW_DURATION = 5000;
export const ARROW_SPEED = 0.5;           // px per ms
export const ARROW_LIFE = 1600;
export const MAX_ARROWS = 60;
export const QUAKE_DURATION = 4000;
export const BOTTLE_DURATION = 10000;
export const F1_CHANCE = 0.22;
export const F1_COOLDOWN = 6000;
export const SAFETY_CHANCE = 0.1;

const mayhem = {
  ids: ["1.3", "2.3"],
  maxLives: MAYHEM_LIVES,
  missCostsLife: true,
  powerups: true,

  /** Time (ms) a circle stays on screen — longer, so players can grab power-ups */
  circleLife(score) {
    return Math.max(1700, 2700 - score * 8);
  },

  /** Ms between spawns — aggressive MAYHEM pace */
  spawnInterval(elapsed, _score) {
    return Math.max(280, 750 - (elapsed / 1000) * 25);
  },
};

export default mayhem;
