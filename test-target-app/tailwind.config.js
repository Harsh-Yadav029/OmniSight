/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        primary: {
          DEFAULT: "#016464",
          container: "#2d7d7d",
        },
        secondary: {
          DEFAULT: "#904c1b",
          container: "#ffa76e",
        },
        tertiary: {
          DEFAULT: "#356346",
          container: "#4d7c5d",
        },
        "on-surface": "#1d1b17",
        "on-surface-variant": "#3f4948",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
