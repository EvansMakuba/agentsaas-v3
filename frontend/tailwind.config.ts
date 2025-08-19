import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // This is the standard and correct glob pattern for the Next.js App Router.
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // We'll add this just in case
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;