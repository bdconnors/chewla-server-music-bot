module.exports = {
  extends: [
    "airbnb",
    "airbnb-typescript/base"
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "import/no-cycle": "off",
    "radix": "off",
    "import/export": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "class-methods-use-this": "off",
    "no-return-assign": "off"
  },
  parserOptions: {
    project: "./tsconfig.json"
  },
  ignorePatterns: ["build/**/*.d.ts","build/**/*.ts","build/**/*.js",".eslintrc.js"]
}