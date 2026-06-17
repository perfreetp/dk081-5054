/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        void: "#070A0F",
        panel: "#0E141C",
        surface: "#151C26",
        elevated: "#1B2430",
        line: {
          DEFAULT: "#222B37",
          strong: "#2E3A4A",
        },
        ink: {
          DEFAULT: "#E6EBF2",
          dim: "#93A1B5",
          mute: "#5C6B7E",
        },
        amber: {
          DEFAULT: "#F5B544",
          dim: "#B8862C",
        },
        crit: "#FF4D5E",
        ok: "#3DD68C",
        info: "#4FC3F7",
        focus: "#B084F5",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,181,68,0.35), 0 0 22px rgba(245,181,68,0.14)",
        crit: "0 0 0 1px rgba(255,77,94,0.35), 0 0 22px rgba(255,77,94,0.18)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.03)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.7)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "amber-breath": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,181,68,0)" },
          "50%": { boxShadow: "0 0 0 2px rgba(245,181,68,0.45)" },
        },
        "crit-breath": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,77,94,0)" },
          "50%": { boxShadow: "0 0 0 2px rgba(255,77,94,0.5)" },
        },
        scan: {
          "0%": { transform: "translateY(-110%)" },
          "100%": { transform: "translateY(110%)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        "amber-breath": "amber-breath 2s ease-in-out infinite",
        "crit-breath": "crit-breath 1.6s ease-in-out infinite",
        scan: "scan 3.2s linear infinite",
        ticker: "ticker 26s linear infinite",
      },
    },
  },
  plugins: [],
};
