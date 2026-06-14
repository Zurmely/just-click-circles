// =============================================
// settings.js — Settings panel logic
// =============================================

import { settings, saveSettings } from "./state.js";
import { drawFrame } from "./renderer.js";
import { THEMES, applyCSSProperties, loadThemeFont } from "./themes.js";

const $ = (id) => document.getElementById(id);

/** Apply a theme preset by key. Updates CSS vars, body class, font, shapes, title.
 *  @param {boolean} preserveColors — if true, don't overwrite fill/outline (used on load) */
export function applyTheme(key, ctx, getW, getH, preserveColors) {
  const theme = THEMES[key];
  if (!theme) return;

  settings.activeTheme = key;
  settings.theme = theme.isDark ? "dark" : "light";
  settings.canvasBg = theme.isDark ? theme.canvasBgDark : theme.canvasBg;

  if (!preserveColors) {
    settings.fillColor = theme.fillColor;
    settings.outlineColor = theme.outlineColor;
  }

  // CSS custom properties (colors + structural)
  applyCSSProperties(theme);

  // Body classes and data attribute
  document.body.classList.toggle("dark", theme.isDark);
  document.body.dataset.theme = key;

  // Update body background (visible behind overlays)
  document.body.style.background = settings.canvasBg;

  // Load custom font if needed
  if (theme.fontUrl) loadThemeFont(theme.fontUrl);

  // Title accent character (the dot at the end of "JUST CLICK CIRCLES")
  const dot = document.querySelector(".game-title .dot");
  if (dot) dot.textContent = theme.titleAccent || ".";

  // Update active button state
  document.querySelectorAll(".theme-preset-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === key);
  });

  // Sync color inputs
  const fillInput = $("fill-color");
  const outlineInput = $("outline-color");
  if (fillInput) fillInput.value = settings.fillColor;
  if (outlineInput) outlineInput.value = settings.outlineColor;

  saveSettings();
  if (ctx) drawFrame(ctx, getW(), getH(), 0);
}

/** Binds settings panel controls. Call once after DOM is ready. */
export function bindSettings(ctx, getW, getH) {
  // Helper to redraw after settings changes
  const redraw = () => drawFrame(ctx, getW(), getH(), 0);

  // ---------- Theme selector ----------
  document.querySelectorAll(".theme-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme, ctx, getW, getH, false);
    });
  });

  // Apply persisted theme on load (preserve user's custom colors from localStorage)
  applyTheme(settings.activeTheme, ctx, getW, getH, true);

  // ---------- Background image ----------
  $("upload-bg-btn").addEventListener("click", () => $("bg-input").click());
  $("bg-input").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        settings.bgImage = img;
        $("bg-status").textContent = "Custom image set";
        $("remove-bg-btn").classList.add("visible");
        redraw();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  });
  $("remove-bg-btn").addEventListener("click", () => {
    settings.bgImage = null;
    $("bg-status").textContent = "Default";
    $("remove-bg-btn").classList.remove("visible");
    redraw();
  });

  // ---------- Colors ----------
  $("fill-color").value = settings.fillColor;
  $("outline-color").value = settings.outlineColor;

  $("fill-color").addEventListener("input", (e) => {
    settings.fillColor = e.target.value;
    saveSettings();
  });
  $("outline-color").addEventListener("input", (e) => {
    settings.outlineColor = e.target.value;
    saveSettings();
  });
  $("reset-colors-btn").addEventListener("click", () => {
    // Reset to the active theme's colors
    const theme = THEMES[settings.activeTheme] || THEMES.default;
    settings.fillColor = theme.fillColor;
    settings.outlineColor = theme.outlineColor;
    $("fill-color").value = settings.fillColor;
    $("outline-color").value = settings.outlineColor;
    saveSettings();
    redraw();
  });
}
