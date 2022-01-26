const { uniformMeshPlugin } = require('@uniformdev/mesh-sdk-react/tailwind');

module.exports = {
  content: ['./pages/**/*.tsx', './components/**/*.tsx'],
  plugins: [require('@tailwindcss/forms'), uniformMeshPlugin],
};
