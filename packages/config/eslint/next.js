const base = require("./base");
const nextjsPlugin = require("@next/eslint-plugin-next");

module.exports = [
  ...base,
  {
    plugins: { "@next/next": nextjsPlugin },
    rules: {
      ...Object.fromEntries(
        Object.entries(nextjsPlugin.rules).map(([name, rule]) => [
          `@next/next/${name}`,
          "error",
        ]),
      ),
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
