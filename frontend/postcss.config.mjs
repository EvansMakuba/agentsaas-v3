/** @type {import('postcss').Config} */
const config = {
  plugins: {
    // This is the crucial change. We are now explicitly telling
    // PostCSS to use the new '@tailwindcss/postcss' plugin.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;