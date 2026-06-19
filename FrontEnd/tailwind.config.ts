import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        surface: "#121A2B",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        },
        accent: {
          DEFAULT: "#7C3AED",
          glow: "rgba(124,58,237,0.35)",
          soft: "#A78BFA",
        },
        success: "#10B981",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-inter)",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        shell: "1280px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,58,237,0.25), 0 18px 60px -18px rgba(124,58,237,0.55)",
        "glow-sm": "0 0 30px -6px rgba(124,58,237,0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 70px -30px rgba(0,0,0,0.85)",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "flow-dash": {
          to: { strokeDashoffset: "-240" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 6s ease infinite",
        float: "float 7s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "flow-dash": "flow-dash 3s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
