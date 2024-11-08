exports.getDockerConfig = (language) => {
  switch (language.toLowerCase()) {
    case 'python':
      return {
        image: 'python:3.10-slim',
        cmd: ['python', '-']
      };
    case 'javascript':
      return {
        image: 'node:18-alpine',
        cmd: ['node', '-'],
        terminate: 'process.exit(0);'
      };
    case 'go':
      return {
        image: 'golang:1.20-alpine',
        cmd: ['go', 'run', '-']
      };
    case 'ruby':
      return {
        image: 'ruby:3.1-alpine',
        cmd: ['ruby', '-']
      };
    case 'java':
      return {
        image: 'openjdk:17-alpine',
        cmd: ['java', '-']
      };
    case 'php':
      return {
        image: 'php:8.2-alpine',
        cmd: ['php', '-']
      };
    case 'cpp':
      return {
        image: 'gcc:12.2.0',
        cmd: ['gcc', '-o', 'program', '-']
      };
    case 'rust':
      return {
        image: 'rust:1.72-slim',
        cmd: ['cargo', 'run']
      };
    case 'csharp':
      return {
        image: 'mcr.microsoft.com/dotnet/runtime:7.0',
        cmd: ['dotnet', 'exec']
      };
    case 'swift':
      return {
        image: 'swift:5.8-slim',
        cmd: ['swift']
      };
    case 'r':
      return {
        image: 'r-base:4.3.1',
        cmd: ['Rscript']
      };
    case 'kotlin':
      return {
        image: 'jetbrains/kotlin:1.9.10',
        cmd: ['kotlinc', '-script']
      };
    case 'perl':
      return {
        image: 'perl:5.38',
        cmd: ['perl', '-']
      };
    case 'elixir':
      return {
        image: 'elixir:1.15',
        cmd: ['elixir']
      };
    default:
      return {}; // Return empty object for unsupported languages
  }
};