/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{layout,sections,snippets}/*.liquid',
    './templates/**/*.{liquid,json}',
    './frontend/**/*.js',
    './{config,locales}/*.json'
  ],
    theme: {
      screens: {
        xs: '480px',
        sm: '720px',
        md: '960px',
        lg: '1440px',
        xl: '1600px'
      },
      lineHeight: {},
      fontSize: {}
    },
    plugins: [],
}
