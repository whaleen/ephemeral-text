// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './*.{html,js,jsx,ts,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/shadcn-ui/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
