// =============================================
// settings.js — Settings panel logic
// =============================================

import { settings, saveSettings } from "./state.js";
import { drawFrame } from "./renderer.js";

const $ = (id) => document.getElementById(id);

/** Binds settings panel controls. Call once after DOM is ready. */
export function bindSettings(ctx, getW, getH) {
  // Helper to redraw after settings changes
  const redraw = () => drawFrame(ctx, getW(), getH(), 0);

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
    $("bg-status").textContent = "Default: white";
    $("remove-bg-btn").classList.remove("visible");
    redraw();
  });

  // ---------- Theme ----------
  function setTheme(t) {
    settings.theme = t;
    document.body.classList.toggle("dark", t === "dark");
    $("theme-light-btn").classList.toggle("active", t === "light");
    $("theme-dark-btn").classList.toggle("active", t === "dark");
    saveSettings();
    redraw();
  }
  $("theme-light-btn").addEventListener("click", () => setTheme("light"));
  $("theme-dark-btn").addEventListener("click", () => setTheme("dark"));

  // Apply persisted theme on load
  setTheme(settings.theme);

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
    settings.fillColor = "#9ca3af";
    settings.outlineColor = "#facc15";
    $("fill-color").value = settings.fillColor;
    $("outline-color").value = settings.outlineColor;
    saveSettings();
  });
}
