import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        datasea: {
          main: '#222F4D',
          gray: '#a0a5b2',
          surface: '#F8F9FA',
        },
      },
    },
  },
  plugins: [],
};
export default config;