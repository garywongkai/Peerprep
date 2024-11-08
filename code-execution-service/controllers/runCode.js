const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');

const docker = new Docker({ socketPath: '/run/user/1000/docker.sock' });

exports.runCodeInit = () => {
  const imagePath = path.join('/app/images', 'node-alpine.tar');
  console.log("Path created")
  const imageStream = fs.createReadStream(imagePath);

  // Load the image into Docker
  docker.loadImage(imageStream, (err, response) => {
    if (err) {
      console.error("Error loading image:", err);
      return;
    }
    console.log("Image loaded successfully!");
  });
}

exports.runCode = async (language, code) => {
  code = code + `\nprocess.exit(0);\n`;

  const { image, cmd } = getDockerConfig(language);

  if (!image || !cmd) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const container = await docker.createContainer({
    // name: `code-execution-container-${language}`,
    Image: image,
    Cmd: cmd,
    Tty: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: true,
    StdinOnce: true,
  });
  await container.start();

  const stdinStream = await container.attach({ stream: true, stdin: true, stdout: false, stderr: false });
  const stdoutStream = await container.attach({ stream: true, stdin: false, stdout: true, stderr: true });

  // Capture output from stdout and stderr
  const outputBuffer = [];
  stdoutStream.on('data', (data) => {
    outputBuffer.push(data);
  });
  
  stdinStream.write(code, (err) => {
    if (err) {
      new Error('Error writing to stdinStream:', err);
    }
  });
  stdinStream.end();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout waiting for container')), 30000) // 30 seconds timeout
  );

  await Promise.race([
    new Promise((resolve, reject) => {
      console.log('Waiting for container to finish...');
      container.wait((err, data) => {
        if (err) {
          console.error('Error while waiting for container to finish:', err);
          reject(err);
        } else {
          console.log('Container finished with exit data:', data);
          resolve(data);
        }
      });
    }),
    timeoutPromise
  ]);

  await container.remove({ force: true });

  return Buffer.concat(outputBuffer).toString();
};

const getDockerConfig = (language) => {
  switch (language.toLowerCase()) {
    case 'python':
      return {
        image: 'python:3.8-slim',
        cmd: ['python', '-']
      };
    case 'javascript':
      return {
        image: 'node:alpine',
        cmd: ['node', '-'],

      };
    case 'go':
      return {
        image: 'golang:alpine',
        cmd: ['go', 'run', '-']
      };
    case 'ruby':
      return {
        image: 'ruby:alpine',
        cmd: ['ruby', '-']
      };
    case 'java':
      return {
        image: 'openjdk:alpine',
        cmd: ['java', '-']
      };
    case 'php':
      return {
        image: 'php:alpine',
        cmd: ['php', '-']
      };
    default:
      return {}; // Return empty object for unsupported languages
  }
};

// Example usage
// -------------
// const pythonCode = `print("Hello from Python!")`;
// const javascriptCode = `console.log("Hello from JavaScript!")`;

// (async () => {
//   try {
//     const pythonOutput = await runCode(pythonCode, 'python'); // Run Python code
//     console.log('Python Output:', pythonOutput);

//     const javascriptOutput = await runCode(javascriptCode, 'javascript'); // Run JavaScript code
//     console.log('JavaScript Output:', javascriptOutput);
//   } catch (err) {
//     console.error('Execution error:', err);
//   }
// })();
