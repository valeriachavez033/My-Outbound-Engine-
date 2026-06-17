import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#4f6ef7",
          600: "#3d5af1",
          700: "#2d46e0",
          900: "#1a2a8a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
