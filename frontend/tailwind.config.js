/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OmniSight Calm Editorial Palette (Stitch 1721510093736031163)
        canvas: "#FAFAF8",
        surface: {
          DEFAULT: "#fff8f1",
          dim: "#dfd9d2",
          bright: "#fff8f1",
          variant: "#e7e2db",
          container: {
            lowest: "#ffffff",
            low: "#f9f3eb",
            DEFAULT: "#f3ede6",
            high: "#ede7e0",
            highest: "#e7e2db",
          },
        },
        "on-surface": {
          DEFAULT: "#1d1b17",
          variant: "#3f4948",
        },
        // Primary — Calm Teal
        primary: {
          DEFAULT: "#016464",
          container: "#2d7d7d",
          fixed: "#a4f0ef",
          "fixed-dim": "#88d3d3",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#dafffe",
        },
        // Secondary — Warm Coral / Amber
        secondary: {
          DEFAULT: "#904c1b",
          container: "#ffa76e",
          fixed: "#ffdbc8",
          "fixed-dim": "#ffb68a",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#783a08",
        },
        // Tertiary — Sage Green (Verified / Healed)
        tertiary: {
          DEFAULT: "#356346",
          container: "#4d7c5d",
          fixed: "#bbefc9",
          "fixed-dim": "#a0d2ae",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#e5ffe9",
        },
        // Semantic Status
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          light: "#dc2626",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#93000a",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#f59e0b",
        },
        // Outline & Dividers
        outline: {
          DEFAULT: "#6f7979",
          variant: "#bec9c8",
          border: "#E8E6E1",
        },
        // Dark Studio for Diff Viewport
        studio: "#090D16",
        // Legacy compat
        border: "#E8E6E1",
        background: "#FAFAF8",
        foreground: "#1d1b17",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.025em", fontWeight: "800" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title-sm": ["18px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-base": ["16px", { lineHeight: "25.6px", letterSpacing: "0", fontWeight: "400" }],
        "body-medium": ["15px", { lineHeight: "24px", letterSpacing: "0", fontWeight: "500" }],
        "body-sm": ["13px", { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "700" }],
        "code-mono": ["13px", { lineHeight: "18px", letterSpacing: "-0.01em", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        "ambient-lvl1": "0 4px 20px -2px rgba(26, 26, 26, 0.05)",
        "ambient-lvl2": "0 12px 32px -4px rgba(26, 26, 26, 0.12)",
        "teal-focus": "0 0 0 3px rgba(45, 125, 125, 0.15)",
      },
    },
  },
  plugins: [],
}
