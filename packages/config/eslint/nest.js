const base = require("./base");

module.exports = [
  ...base,
  {
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
    },
  },
];
