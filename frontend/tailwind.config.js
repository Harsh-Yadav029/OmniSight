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
        // Obsidian Neon — Canvas & Surfaces
        canvas: "#020617",
        surface: {
          DEFAULT: "#0f172a",
          dim: "#0b1326",
          bright: "#31394d",
          container: {
            lowest: "#060e20",
            low: "#131b2e",
            DEFAULT: "#171f33",
            high: "#222a3d",
            highest: "#2d3449",
          },
        },
        "on-surface": {
          DEFAULT: "#dae2fd",
          variant: "#c7c4d7",
        },
        // Primary — Electric Indigo
        primary: {
          DEFAULT: "#818cf8",
          container: "#8083ff",
          dim: "#c0c1ff",
          fixed: "#e1e0ff",
        },
        "on-primary": {
          DEFAULT: "#1000a9",
          container: "#0d0096",
        },
        // Secondary — Cyber Purple
        secondary: {
          DEFAULT: "#c084fc",
          dim: "#ddb7ff",
          container: "#6f00be",
          fixed: "#f0dbff",
        },
        "on-secondary": {
          DEFAULT: "#490080",
          container: "#d6a9ff",
        },
        // Tertiary — Cyber Cyan
        tertiary: {
          DEFAULT: "#22d3ee",
          dim: "#4cd7f6",
          container: "#009eb9",
          fixed: "#acedff",
        },
        "on-tertiary": {
          DEFAULT: "#003640",
          container: "#002f38",
        },
        // Semantic Status
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dim: "#059669",
        },
        error: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dim: "#e11d48",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        },
        // Outline
        outline: {
          DEFAULT: "#908fa0",
          variant: "#464554",
        },
        // Legacy compat
        border: "hsl(var(--border, 214.3 31.8% 91.4%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "title-base": ["16px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-base": ["14px", { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "400" }],
        "code-base": ["12px", { lineHeight: "18px", letterSpacing: "0", fontWeight: "500" }],
        "code-sm": ["11px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "400" }],
        "label-caps": ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        xs: "4px",
        gutter: "16px",
        "container-max": "1280px",
      },
      boxShadow: {
        "glow-primary": "0 0 15px rgba(99, 102, 241, 0.25), 0 0 30px rgba(99, 102, 241, 0.1)",
        "glow-secondary": "0 0 15px rgba(168, 85, 247, 0.25)",
        "glow-tertiary": "0 0 15px rgba(6, 182, 212, 0.3)",
        "glow-success": "0 0 15px rgba(16, 185, 129, 0.25)",
        "glow-error": "0 0 12px rgba(244, 63, 94, 0.25)",
        "inset-terminal": "inset 0 2px 4px 0 rgb(0 0 0 / 0.5)",
      },
      animation: {
        "pulse-dot": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(168, 85, 247, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 4px rgba(168, 85, 247, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(168, 85, 247, 0)" },
        },
      },
    },
  },
  plugins: [],
}
