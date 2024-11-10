const languageConfigs = {
  python: { // working
    image: 'python:3.10-slim',
    cmd: ['python', '-c']
  },
  javascript: { // working
    image: 'node:18-alpine',
    cmd: ['node', '-e']
  },
  go: { // working
    image: 'golang:1.20-alpine',
    cmd: ['sh', '-c', 'echo "$0" > main.go && go run main.go']
  },
  ruby: { // working
    image: 'ruby:3.1-alpine',
    cmd: ['ruby', '-e']
  },
  java: { // working
    image: 'openjdk:17-alpine',
    cmd: ['sh', '-c', 'echo "$1" > Main.java && javac Main.java && java Main']
  },
  php: { // working
    image: 'php:8.2-alpine',
    cmd: ['sh', '-c', 'php -r "$0"']
  },
  cpp: {
    image: 'gcc:12.2.0',
    cmd: ['sh', '-c', 'echo "$0" > main.cpp && g++ main.cpp -o main && ./main']
  },
  rust: {
    image: 'rust:1.72-slim',
    cmd: ['sh', '-c', 'echo "$0" > main.rs && rustc main.rs && ./main']
  },
  csharp: {
    image: 'mcr.microsoft.com/dotnet/sdk:7.0',
    cmd: ['sh', '-c', 'echo "$0" > Program.cs && dotnet run Program.cs']
  },
  swift: {
    image: 'swift:5.8-slim',
    cmd: ['sh', '-c', 'echo "$0" > main.swift && swiftc main.swift && ./main']
  },
  r: {
    image: 'rust:1.72-slim',
    cmd: ['Rscript', '-e']
  },
  kotlin: {
    image: 'jetbrains/kotlin:1.9.10',
    cmd: ['sh', '-c', 'echo "$0" > Main.kt && kotlinc Main.kt -include-runtime -d Main.jar && java -jar Main.jar']
  },
  perl: {
    image: 'perl:5.36-slim',
    cmd: ['perl', '-e']
  },
  elixir: {
    image: 'elixir:1.14-slim',
    cmd: ['elixir', '-e']
  },
  scala: {
    image: 'hseeberger/scala-sbt:11.0.16_1.8.0_2.13.10_1.9.3',
    cmd: ['sh', '-c', 'echo "$0" > Main.scala && scalac Main.scala && scala Main']
  },
  shell: {
    image: 'bash:5.2',
    cmd: ['bash', '-c']
  },
  haskell: {
    image: 'haskell:9.2-slim-buster',
    cmd: ['sh', '-c', 'echo "$0" > main.hs && runhaskell main.hs']
  },
  lua: {
    image: 'lua:5.4',
    cmd: ['lua', '-e']
  }
};

exports.getDockerConfig = (language) => {
  return languageConfigs[language.toLowerCase()] || {};
};

exports.allSupportedLanguages = Object.keys(languageConfigs);
