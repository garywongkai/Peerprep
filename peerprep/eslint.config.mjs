import globals from "globals";
import jsPlugin from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    // Target all common JavaScript and TypeScript file types
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
      },
      globals: {
        ...globals.browser, // Browser globals (e.g., window, document)
        ...globals.node,    // Node.js globals (e.g., process)
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": tsPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      "react/jsx-uses-react": "off", // Disable as React 17+ JSX transform no longer requires `React` in scope
      "react/react-in-jsx-scope": "off", // Disable as React 17+ JSX transform no longer requires `React` in scope
      "react/prop-types": "off", // Disable prop-types rule as TypeScript provides type-checking
      "@typescript-eslint/explicit-module-boundary-types": "off", // Optional: Relax return type requirement in functions
      "jsx-a11y/anchor-is-valid": "warn", // Warn on invalid anchor tags for better accessibility
      // "no-console": "warn", // Uncomment to warn on `console` usage in production code
    },
    settings: {
      react: {
        version: "detect", // Automatically detect installed React version
      },
    },
  },
  jsPlugin.configs.recommended,  // Base JavaScript recommendations
  {
    // Include recommended TypeScript rules explicitly without using `extends`
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  reactPlugin.configs.flat.recommended,  // React flat configuration for the flat config system
  {
    // Add accessibility rules manually
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
    },
  },
];
