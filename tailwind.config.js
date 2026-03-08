/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5c38',
          light: '#2d7a4f',
        },
        success: '#16a34a',
        warning: '#ca8a04',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
