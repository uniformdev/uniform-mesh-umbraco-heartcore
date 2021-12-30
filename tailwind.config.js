const { colors } = require('tailwindcss/defaultTheme');

const brandColors = {
  // primary colours that build up the logo
  'brand-primary-1': '#438FD5', // bright blue
  'brand-primary-2': '#f4220b', // red
  'brand-primary-3': '#83c6e1', // slate blue
  // secondary colours
  'brand-secondary-1': '#1f2b34', // carbon
  'brand-secondary-2': '#ecf1f1', // silver
  'brand-secondary-3': '#2ecdb4', // teal
  'brand-secondary-4': '#005e3b', // racergreen
  'brand-secondary-5': '#f6f1c3', // yellow
  'brand-secondary-6': '#d9534f', // brick red
  'brand-secondary-7': '#dbf6f2', // mint
};

module.exports = {
  purge: ['./pages/**/*.tsx', './components/**/*.tsx'],
  variants: {},
  plugins: [],
  mode: 'jit',
  // specify other options here
  theme: {
    colors: {
      current: colors.current,
      transparent: colors.transparent,
      gray: {
        200: '#f1f1f1',
        300: '#E0E0E0',
        400: '#D3DBE1',
        500: '#BDBDBD',
        700: '#828282',
      },
      white: '#ffffff',
      primary: brandColors['brand-secondary-1'],
      secondary: brandColors['brand-secondary-6'],
      tertiary: brandColors['brand-primary-3'],
      quaternary: brandColors['brand-primary-1'],
      standard: brandColors['brand-secondary-1'],
      ...brandColors,
      green: {
        50: colors.green['50'],
        300: colors.green['300'],
        400: colors.green['400'],
        500: '#3DCCB4',
        700: colors.green['700'],
        800: colors.green['800'],
      },
    },
    extend: {
      minHeight: {
        500: '500px',
      },
      maxHeight: {
        500: '500px',
      },
    },
  },
};
