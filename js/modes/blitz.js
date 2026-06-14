// =============================================
// modes/blitz.js — Blitz mode config (1.2, 2.2)
// =============================================

export const BLITZ_TIMES = { medium: 1000, hard: 325 }; // ms on screen

const blitz = {
  ids: ["1.2", "2.2"],
  maxLives: 3,       // lives exist but are never deducted by misses
  missCostsLife: false,
  powerups: false,

  /** Time (ms) a circle stays on screen — fixed per difficulty */
  circleLife(_score, difficulty) {
    return BLITZ_TIMES[difficulty] || BLITZ_TIMES.hard;
  },

  /** Ms between spawns — ramps with score */
  spawnInterval(_elapsed, score) {
    return Math.max(480, 1150 - score * 14);
  },
};

export default blitz;
