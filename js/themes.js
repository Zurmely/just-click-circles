// =============================================
// themes.js — Theme preset definitions
// =============================================

const SYS_FONT = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const THEMES = {

  // ─────────────────── DEFAULT ───────────────────
  default: {
    label: "Default",

    // Colors
    canvasBg: "#ffffff",
    canvasBgDark: "#15161a",
    fillColor: "#9ca3af",
    outlineColor: "#facc15",
    panelBg: "#1c1d22",
    panelSoft: "#26272e",
    panelBorder: "rgba(250,204,21,.18)",
    accent: "#facc15",
    accentDark: "#ca9a04",
    accentText: "#1c1d22",
    textColor: "#f5f5f4",
    textDim: "#a8a8a3",
    isDark: false,
    swatch: ["#facc15", "#9ca3af", "#ffffff"],

    // Typography
    font: "'Inter', sans-serif",
    fontDisplay: "'Outfit', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;900&display=swap",

    // Shapes
    panelRadius: "20px",
    btnRadius: "14px",
    panelShadow: "0 20px 60px rgba(0,0,0,.45)",

    // Identity
    titleAccent: ".",
    lifeIcon: "\u2665",

    // Texts
    splashes: [
      "Just Click It",
      "The Best a Man Can Click",
      "There are some things money can't click",
      "Click Different",
      "Betcha can't click just one",
      "America Runs on Clickin",
      "I'm Clickin' It",
      "Click Outside the Box",
      "Click Big",
      "Click the rainbow",
      "The Quicker Clicker Upper",
      "Click Time. Click Money",
      "Click it your way",
      "All for clicks. Clicks for all",
      "Clicks never go out of style",
      "Live in your world. Click in ours",
      "Click Fresh",
      "Click Anywhere",
      "I want my Clicks!",
      "Click happiness",
      "The Click that smiles back",
      "Pure Click",
      "Clicks are forever",
      "Its finger-clickin good",
      "Gotta click'em all!",
      "The Ultimate Clicking Machine",
      "It keeps clicking, and clicking, and clicking",
      "Click further",
    ],
    gameoverQuotes: [
      "All you had to do was click the damn circle CJ!",
      "You miss 100% of the circles you don't click.",
      "Game over, man. Game over!",
      "The circle was right there!",
      "I used to be a clicker like you, then I took a miss to the knee.",
      "That wasn't very cash money of you.",
      "Task failed successfully.",
      "Your clicks have been reported to the authorities.",
      "Certified circle fumble.",
      "Skill issue detected.",
      "Did you just... miss? On purpose?",
      "Your finger called \u2014 it wants a refund.",
      "Even the circles feel sorry for you.",
      "Breaking news: circles dodge player for the first time.",
    ],
  },

  // ─────────────────── CLAUDE ───────────────────
  claude: {
    label: "Claude",

    canvasBg: "#faf5ee",
    canvasBgDark: "#1a1410",
    fillColor: "#d4a574",
    outlineColor: "#da7b4a",
    panelBg: "#1a1410",
    panelSoft: "#2a2018",
    panelBorder: "rgba(218,123,74,.22)",
    accent: "#da7b4a",
    accentDark: "#b5623a",
    accentText: "#fff8f0",
    textColor: "#f5efe8",
    textDim: "#a89a8a",
    isDark: false,
    swatch: ["#da7b4a", "#d4a574", "#faf5ee"],

    font: "'JetBrains Mono', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",

    panelRadius: "24px",
    btnRadius: "16px",
    panelShadow: "0 16px 48px rgba(218,123,74,.10), 0 20px 60px rgba(0,0,0,.30)",

    titleAccent: ".",
    lifeIcon: "\u2665",

    splashes: [
      "I'd be happy to click that",
      "Constitutional Clicking",
      "Let me think about that circle...",
      "Helpful, Harmless, Clickable",
      "I cannot click that for you",
      "Actually, on reflection...",
      "Let me reconsider that click",
      "Thinking...",
      "As a circle-clicking assistant...",
      "I appreciate the circle",
      "That's a great circle",
      "I aim to be helpful",
      "Click responsibly",
      "One moment, processing...",
      "I should note that...",
      "Here's my honest assessment",
      "Let me be direct",
      "I'm fairly confident about that circle",
      "Anthropic approved!",
    ],
    gameoverQuotes: [
      "I appreciate your effort, but perhaps clicking isn't your strong suit.",
      "Let me help you reflect on what went wrong.",
      "I'd suggest a different approach next time.",
      "I cannot help you if you won't click the circles.",
      "That was suboptimal. Shall we try again?",
      "I'm unable to click the circles for you.",
      "On reflection, you should have clicked faster.",
      "I notice you missed several circles. Would you like to discuss?",
      "I want to be direct: you need more practice.",
      "Let me be honest \u2014 that was not your best performance.",
      "I appreciate the attempt. I really do.",
    ],
  },

  // ─────────────────── MARIO 64 ───────────────────
  mario64: {
    label: "Mario 64",

    canvasBg: "#4a90d9",
    canvasBgDark: "#1a3a6e",
    fillColor: "#e03030",
    outlineColor: "#ffd700",
    panelBg: "#1a0a2e",
    panelSoft: "#2a1848",
    panelBorder: "rgba(255,215,0,.22)",
    accent: "#ffd700",
    accentDark: "#c4a600",
    accentText: "#1a0a2e",
    textColor: "#fff8e0",
    textDim: "#b0a8c8",
    isDark: true,
    swatch: ["#ffd700", "#e03030", "#4a90d9"],

    font: "'Press Start 2P', monospace",
    fontUrl: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",

    panelRadius: "16px",
    btnRadius: "12px",
    panelShadow: "0 6px 0 rgba(0,0,0,.25), 0 20px 50px rgba(0,0,0,.40)",

    titleAccent: "\u2605",
    lifeIcon: "\u2605",

    splashes: [
      "It's-a me, Clicker!",
      "Yahoo!",
      "Let's-a go!",
      "Here we go!",
      "Mamma mia!",
      "So long, King Bowser!",
      "Thank you for-a playing!",
      "Wahoo!",
      "Okey dokey!",
      "Just what I needed!",
      "Power Star get!",
      "Coins! Coins everywhere!",
      "BLJ to victory!",
      "16 star speedrun!",
      "A-haha!",
      "It's-a me!",
      "Letsa go clickin!",
      "A Bob-omb Battlefield!",
      "Dire Dire Clicks!",
    ],
    gameoverQuotes: [
      "Thank you Mario! But our circle is in another castle!",
      "Mamma mia! You missed-a the circle!",
      "Game Over! Insert coin to continue.",
      "You need more stars, Mario!",
      "The princess is not going to save herself!",
      "Bowser laughs at your clicking skills.",
      "You got zero stars. Impressive.",
      "Even Lakitu couldn't save that run.",
      "You've been Bob-omb'd!",
      "Not enough coins for a 1-UP!",
    ],
  },

  // ─────────────────── WOW ───────────────────
  wow: {
    label: "WoW",

    canvasBg: "#0d1117",
    canvasBgDark: "#0d1117",
    fillColor: "#1eff00",
    outlineColor: "#a335ee",
    panelBg: "#12101a",
    panelSoft: "#1e1a2e",
    panelBorder: "rgba(163,53,238,.25)",
    accent: "#a335ee",
    accentDark: "#8228c0",
    accentText: "#f0e8ff",
    textColor: "#e8e0f0",
    textDim: "#8878a8",
    isDark: true,
    swatch: ["#a335ee", "#1eff00", "#0d1117"],

    font: "'Metamorphous', serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Metamorphous&display=swap",

    panelRadius: "8px",
    btnRadius: "6px",
    panelShadow: "0 0 30px rgba(163,53,238,.12), 0 20px 60px rgba(0,0,0,.55)",

    titleAccent: "\u2694",
    lifeIcon: "\u2665",

    splashes: [
      "Lok'tar Ogar!",
      "For the Alliance!",
      "For the Horde!",
      "Leeeroy Jenkins!",
      "Time is money, friend",
      "Zug zug",
      "Me not that kind of orc!",
      "Many whelps! Handle it!",
      "More dots! More dots!",
      "50 DKP minus!",
      "Click the Soulstone",
      "Need on everything",
      "LFG Clicking Circles",
      "Onyxia wipe incoming",
      "You are not prepared!",
      "Blood and Thunder!",
      "Work, work!",
      "Ready to work!",
      "Something need doing?",
    ],
    gameoverQuotes: [
      "You have died. Release spirit?",
      "You are not prepared!",
      "Your repair bill is 50g.",
      "Wipe it up, let's go again.",
      "That's a 50 DKP minus!",
      "You stood in the fire. Again.",
      "Back to the graveyard with you.",
      "Even Hogger could click better.",
      "Guild kicked for low DPS.",
      "Healer's fault, obviously.",
      "Should have used a flask.",
    ],
  },

  // ─────────────────── CS:GO ───────────────────
  csgo: {
    label: "CS:GO",

    canvasBg: "#2a2520",
    canvasBgDark: "#1a1815",
    fillColor: "#5a5a5e",
    outlineColor: "#cf6a32",
    panelBg: "#1a1a1a",
    panelSoft: "#2a2a2a",
    panelBorder: "rgba(207,106,50,.22)",
    accent: "#cf6a32",
    accentDark: "#a85528",
    accentText: "#fff0e0",
    textColor: "#e8e4e0",
    textDim: "#8a8580",
    isDark: true,
    swatch: ["#cf6a32", "#5a5a5e", "#2a2520"],

    font: "'Rajdhani', 'Segoe UI', Roboto, sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap",

    panelRadius: "4px",
    btnRadius: "3px",
    panelShadow: "0 4px 20px rgba(0,0,0,.65)",

    titleAccent: ".",
    lifeIcon: "\u2665",

    splashes: [
      "Rush B, don't stop!",
      "The bomb has been planted",
      "Fire in the hole!",
      "Clutch or kick",
      "Ace!",
      "Enemy spotted!",
      "Dropping AWP",
      "Last alive, lock in!",
      "Saving for next round",
      "Flash out!",
      "Smoke mid",
      "One tap machine",
      "EZ game EZ life",
      "GG WP",
      "Click heads, not circles",
      "Eco round vibes",
      "Just buy a Deagle",
      "VAC secured",
      "Global Elite clicker",
    ],
    gameoverQuotes: [
      "Terrorists Win.",
      "Counter-Terrorists Win.",
      "Round lost.",
      "Kicked for team damage.",
      "VAC banned from clicking.",
      "You got wallbanged.",
      "Should have bought armor.",
      "Deranked to Silver I.",
      "Reported for griefing.",
      "Overwatch case incoming.",
      "Your crosshair placement is tragic.",
    ],
  },
};

// ---------- Font loading ----------
const _loadedFonts = new Set();

/** Dynamically load a Google Fonts stylesheet if not already loaded. */
export function loadThemeFont(url) {
  if (!url || _loadedFonts.has(url)) return;
  _loadedFonts.add(url);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// ---------- CSS application ----------
/** Apply a theme's CSS custom properties to the document root. */
export function applyCSSProperties(theme) {
  const s = document.documentElement.style;
  s.setProperty("--accent", theme.accent);
  s.setProperty("--accent-dark", theme.accentDark);
  s.setProperty("--accent-text", theme.accentText);
  s.setProperty("--panel", theme.panelBg);
  s.setProperty("--panel-soft", theme.panelSoft);
  s.setProperty("--panel-border", theme.panelBorder);
  s.setProperty("--text", theme.textColor);
  s.setProperty("--text-dim", theme.textDim);
  s.setProperty("--font-primary", theme.font);
  s.setProperty("--font-display", theme.fontDisplay || theme.font);
  s.setProperty("--panel-radius", theme.panelRadius);
  s.setProperty("--btn-radius", theme.btnRadius);
  s.setProperty("--panel-shadow", theme.panelShadow);
}
