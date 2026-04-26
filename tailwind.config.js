/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        felt: {
          900: "#0b3d2e",
          800: "#0f5136",
          700: "#14683f",
        },
        ivory: "#f6efe0",
        gold: {
          400: "#e4c96b",
          500: "#c9a94a",
          600: "#a88830",
        },
        crimson: "#b3261e",
      },
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tile: "0 2px 0 #867457, 0 6px 10px rgba(0,0,0,0.35)",
        "tile-lifted": "0 6px 0 #867457, 0 14px 22px rgba(0,0,0,0.45)",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(90deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "rotateY(0) scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(228,201,107,0.0)" },
          "50%": { boxShadow: "0 0 0 10px rgba(228,201,107,0.25)" },
        },
      },
      animation: {
        flipIn: "flipIn 400ms cubic-bezier(.2,.9,.3,1.2) both",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
