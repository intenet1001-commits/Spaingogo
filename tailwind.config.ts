import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spain: {
          red: "#C60B1E",
          yellow: "#FFC400",
          "red-dark": "#A00818",
          "yellow-dark": "#D4A000",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          dark: "#E8E0D0",
        },
        olive: {
          DEFAULT: "#6B7C3E",
          light: "#8A9E52",
        },
        terra: {
          DEFAULT: "#C4623A",
          light: "#D4825A",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        warm: "0 4px 20px rgba(196, 98, 58, 0.15)",
        "warm-lg": "0 8px 40px rgba(196, 98, 58, 0.2)",
        card: "0 2px 12px rgba(139, 90, 43, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
