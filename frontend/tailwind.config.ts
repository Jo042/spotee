import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",  // Pages Router
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // コンポーネント
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",        // App Router
    ],
    theme: {
    extend: {
      // カスタムフォント
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "Hiragino Sans", "sans-serif"],
      },
      // Spotee のカラーパレット
      colors: {
        primary: {
          50: "#eff3ff",
          100: "#dee8ff",
          200: "#bdd1ff",
          300: "#93b0ff",
          400: "#6488ff",
          500: "#3d65fa",
          600: "#2748e0",
          700: "#1b34b8",
          800: "#142883",
          900: "#0e1c5c",
        },
      },
    },
  },
  plugins: [],
}

export default config;