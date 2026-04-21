import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      js,
      react: pluginReact,
    },
    extends: ["js/recommended", pluginReact.configs.flat.recommended],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@javascript-eslint/no-unused-vars": "off",
      "react/prop-types": "off",
      // "react/jsx-uses-react": "off",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
      },
    },
  },
]);
