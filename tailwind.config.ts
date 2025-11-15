import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "#051A24",
        background: "#F7FAFC",
        primary: "#F5F8FB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        selecta: ["var(--font-selecta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
