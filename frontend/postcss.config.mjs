/** @type {import('postcss').Config} */
const config = {
  plugins: {"@tailwindcss/postcss": {},
    // This is the crucial change. We are now explicitly telling
    // PostCSS to use the new '@tailwindcss/postcss' plugin.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;