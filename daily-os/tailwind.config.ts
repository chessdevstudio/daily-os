import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        line: "#E5E5E3",
        mute: "#8A8A85",
        accent: "#0A0A0A",
        done: "#0A0A0A",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        pulseRing: {
          "0%": { transform: "scale(0.98)" },
          "50%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.98)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .15s ease-out",
        pulseRing: "pulseRing 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
