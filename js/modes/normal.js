// =============================================
// modes/normal.js — Normal mode config (1, 2)
// =============================================

const normal = {
  ids: ["1", "2"],
  maxLives: 3,
  missCostsLife: true,
  powerups: false,

  /** Time (ms) a circle stays on screen */
  circleLife(score) {
    return Math.max(1200, 2300 - score * 18);
  },

  /** Ms between spawns — ramps with elapsed time */
  spawnInterval(elapsed, _score) {
    return Math.max(360, 1100 - (elapsed / 1000) * 20);
  },
};

export default normal;
