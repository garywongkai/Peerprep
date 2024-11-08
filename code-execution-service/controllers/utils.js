const fs = require('fs');
const path = require('path');

exports.getLanguageFromImageName = (name) => {
  const languageMapping = {
    "python-3.10-slim": "python",
    "node-18-alpine": "javascript",
    "golang-1.20-alpine": "go",
    "ruby-3.1-alpine": "ruby",
    "openjdk-17-alpine": "java",
    "php-8.2-alpine": "php",
    "gcc-12.2.0": "cpp",
    "rust-1.72-slim": "rust",
    "mcr.microsoft.com/dotnet/runtime-7.0": "csharp",
    "swift-5.8-slim": "swift",
    "r-base-4.3.1": "r",
    "jetbrains/kotlin-1.9.10": "kotlin",
    "perl-5.38": "perl",
    "elixir-1.15": "elixir"
  };
  return languageMapping[name] || "unknown";
};

exports.getTarFiles = (directory) => {
  try {
    const files = fs.readdirSync(directory);
    return files.filter(file => path.extname(file) === '.tar');
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}
