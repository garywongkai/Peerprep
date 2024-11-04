/** @type {import('eslint').Linter.FlatConfig} */
const parser = require('@typescript-eslint/parser');

const config = [
  // Base configuration for JavaScript and TypeScript
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser, // Use the TypeScript parser directly
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          // Specify ECMAScript features here
          jsx: true, // Enable JSX if you're using React
        },
      },
    },
    rules: {
      // Add your custom rules here
    },
  },
];

module.exports = config;