const js = require("@eslint/js");

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: [
      "index.js",
      "src/**/*.js",
      "scripts/**/*.js",
      "tests/**/*.js",
      "eslint.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "writable",
        __dirname: "readonly",
        setTimeout: "readonly",
        Promise: "readonly",
        JSON: "readonly",
        Error: "readonly",
        String: "readonly",
        Object: "readonly",
        Array: "readonly",
        Math: "readonly",
        Boolean: "readonly",
        RegExp: "readonly",
      },
    },
    rules: {
      eqeqeq: ["error", "always"],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
];
