// =============================================
// ui.js — Overlays, HUD, ads, copyright
// =============================================

import {
  game, settings, highScores, IS_MOBILE,
  livesEnabled, maxLives, isMayhem, scoreKey, isBlitz,
} from "./state.js";
import { THEMES } from "./themes.js";

// ---------- DOM cache ----------
const $ = (id) => document.getElementById(id);
export const hud = $("hud");
export const scoreLabel = $("score-label");
export const livesLabel = $("lives-label");
export const shieldLabel = $("shield-label");
export const buffLabel = $("buff-label");

export const overlays = {
  menu:        $("menu-main"),
  modes:       $("menu-modes"),
  distraction: $("menu-distraction"),
  difficulty:  $("menu-difficulty"),
  settings:    $("menu-settings"),
  pause:       $("menu-pause"),
  gameover:    $("menu-gameover"),
  results:     $("menu-results"),
};

// ---------- Theme-aware text helpers ----------
function getTheme() {
  return THEMES[settings.activeTheme] || THEMES.default;
}

export function rollSplash() {
  const el = $("splash");
  const splashes = getTheme().splashes;
  const text = splashes[Math.floor(Math.random() * splashes.length)];
  el.textContent = text;
  el.classList.toggle("rainbow", text === "Click the rainbow");
  el.style.fontSize = Math.max(9, Math.min(15, Math.round(364 / text.length))) + "px";
}

export function rollGameoverQuote() {
  const quotes = getTheme().gameoverQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ---------- Overlay management ----------
export function showOverlay(name) {
  Object.values(overlays).forEach(o => o.classList.remove("visible"));
  if (name && overlays[name]) overlays[name].classList.add("visible");
  if (name === "menu") rollSplash();
  updateAdAndCopyright();
}

// ---------- HUD ----------
export function updateHUD() {
  scoreLabel.textContent = game.score;
  if (livesEnabled()) {
    const max = maxLives();
    const icon = getTheme().lifeIcon || "\u2665";
    livesLabel.style.display = "";
    livesLabel.style.fontSize = max > 3 ? "13px" : "";
    livesLabel.style.letterSpacing = max > 3 ? "1px" : "";
    livesLabel.innerHTML = icon.repeat(Math.max(0, game.lives)) +
      "<span style='opacity:.25'>" + icon.repeat(Math.max(0, max - game.lives)) + "</span>";
  } else {
    livesLabel.style.display = "none";
  }
  shieldLabel.textContent = game.shieldLives > 0 ? "\uD83D\uDEE1\uFE0F".repeat(game.shieldLives) : "";
}

export function updateBuffsHUD() {
  const parts = [];
  if (game.swordTimer > 0) parts.push("\u2694\uFE0F " + (game.swordTimer / 1000).toFixed(1) + "s");
  if (game.bowTimer > 0) parts.push("\uD83C\uDFF9 " + (game.bowTimer / 1000).toFixed(1) + "s");
  if (game.quakeTimer > 0) parts.push("\uD83C\uDF0B " + (game.quakeTimer / 1000).toFixed(1) + "s");
  if (game.bottleTimer > 0) parts.push("\u23F3 x2 " + (game.bottleTimer / 1000).toFixed(1) + "s");
  if (game.cars.length > 0) parts.push("\uD83C\uDFCE\uFE0F");
  if (game.cars.some(c => c.kind === "safety")) parts.push("\uD83D\uDEA8");
  if (game.pilots.length > 0) parts.push("\uD83C\uDFC3");
  if (game.iceTimer > 0) parts.push("\u2744\uFE0F " + (game.iceTimer / 1000).toFixed(1) + "s");
  buffLabel.textContent = parts.join("   ");
  buffLabel.style.display = parts.length ? "inline-block" : "none";
}

// ---------- Ads & copyright ----------
export function updateAdAndCopyright() {
  const inMenus = game.state !== "playing";
  const adsActive = IS_MOBILE && !game.adsRemoved;
  document.body.classList.toggle("ads-visible", adsActive && inMenus);
  $("copyright").classList.toggle("hidden", !inMenus);
  $("remove-ads-btn").style.display = adsActive ? "" : "none";
}

export function purchaseRemoveAds() {
  if (game.adsRemoved) return;
  // ============================================================
  // PLAY STORE INTEGRATION POINT — Google Play Billing
  // In the published Android app (Capacitor/Cordova wrapper),
  // replace the confirm() below with the real purchase flow:
  //   productId: "remove_ads_099"  (one-time, US$ 0.99)
  // On purchase success (and on restore at app launch), call:
  //   game.adsRemoved = true; updateAdAndCopyright();
  // and persist the entitlement.
  // ============================================================
  const ok = window.confirm(
    "Remove ads — $0.99\n\nIn the published app this opens the Google Play checkout. Simulate a successful purchase?"
  );
  if (ok) {
    game.adsRemoved = true;
    updateAdAndCopyright();
  }
}

// ---------- High-score display helpers ----------
export function blitzSummary(m) {
  return "Best: M " + highScores[m + "-medium"] +
    " \u00B7 H " + highScores[m + "-hard"];
}

export function showModesMenu() {
  game.state = "modes";
  $("hs-m-1").textContent = "High score: " + highScores["1"];
  $("hs-m-11").textContent = "High score: " + highScores["1.1"];
  $("hs-m-12").textContent = blitzSummary("1.2");
  $("hs-m-13").textContent = "High score: " + highScores["1.3"];
  showOverlay("modes");
}

export function openDistractionMenu() {
  game.state = "distraction";
  $("hs-dx-2").textContent = "High score: " + highScores["2"];
  $("hs-dx-21").textContent = "High score: " + highScores["2.1"];
  $("hs-dx-22").textContent = blitzSummary("2.2");
  $("hs-dx-23").textContent = "High score: " + highScores["2.3"];
  showOverlay("distraction");
}

export function openDifficultyMenu(blitzMode) {
  game.pendingBlitzMode = blitzMode;
  game.state = "difficulty";
  $("difficulty-mode-label").textContent = blitzMode === "1.2"
    ? "BLITZ"
    : "DISTRACTION BLITZ";
  $("hs-d-medium").textContent = "High score: " + highScores[blitzMode + "-medium"];
  $("hs-d-hard").textContent = "High score: " + highScores[blitzMode + "-hard"];
  showOverlay("difficulty");
}
