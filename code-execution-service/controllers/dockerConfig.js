const languageConfigs = {
  python: {
    image: 'python:3.10-slim',
    cmd: ['python', '-']
  },
  javascript: {
    image: 'node:18-alpine',
    cmd: ['node', '-e']
  },
  go: {
    image: 'golang:1.20-alpine',
    cmd: ['go', 'run', '-']
  },
  ruby: {
    image: 'ruby:3.1-alpine',
    cmd: ['ruby', '-']
  },
  java: {
    image: 'openjdk:17-alpine',
    cmd: ['java', '-']
  },
  php: {
    image: 'php:8.2-alpine',
    cmd: ['php', '-']
  },
  cpp: {
    image: 'gcc:12.2.0',
    cmd: ['gcc', '-o', 'program', '-']
  },
  rust: {
    image: 'rust:1.72-slim',
    cmd: ['cargo', 'run']
  },
  csharp: {
    image: 'mcr.microsoft.com/dotnet/runtime:7.0',
    cmd: ['dotnet', 'exec']
  },
  swift: {
    image: 'swift:5.8-slim',
    cmd: ['swift']
  },
  r: {
    image: 'r-base:4.3.1',
    cmd: ['Rscript']
  },
  kotlin: {
    image: 'jetbrains/kotlin:1.9.10',
    cmd: ['kotlinc', '-script']
  },
  perl: {
    image: 'perl:5.38',
    cmd: ['perl', '-']
  },
  elixir: {
    image: 'elixir:1.15',
    cmd: ['elixir']
  }
};

exports.getDockerConfig = (language) => {
  return languageConfigs[language.toLowerCase()] || {};
};

exports.allSupportedLanguages = Object.keys(languageConfigs);
