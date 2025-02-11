import type { Config } from "tailwindcss";


export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        ipadpro: { raw: '(min-width: 1024px) and (max-width: 1366px)' },
        samsungGalaxyS8: { raw: '(min-width: 360px) and (max-width: 740px)' },
        galaxyZFold5: { raw: '(min-width: 344px) and (max-width: 882px)' },
        custom: { raw: '(min-width: 640px) and (max-width: 720px)' },
      },
    },
  },
  plugins: [],
} satisfies Config;
