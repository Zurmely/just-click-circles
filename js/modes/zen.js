// =============================================
// modes/zen.js — Zen mode config (1.1, 2.1)
// =============================================

const zen = {
  ids: ["1.1", "2.1"],
  maxLives: 3,       // lives exist but are never deducted
  missCostsLife: false,
  powerups: false,

  /** Time (ms) a circle stays on screen — same curve as Normal */
  circleLife(score) {
    return Math.max(1200, 2300 - score * 18);
  },

  /** Ms between spawns — same as Normal */
  spawnInterval(elapsed, _score) {
    return Math.max(360, 1100 - (elapsed / 1000) * 20);
  },
};

export default zen;
