const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const { getDockerConfig } = require("./dockerConfig");
const { getTarFiles } = require('./utils');

const docker = new Docker({ socketPath: '/run/user/1000/docker.sock' });

// Load all images located in /images directory
exports.loadDockerImages = () => {
  const tarFiles = getTarFiles('/app/images');

  const loadPromises = tarFiles.map(imageName => {
    return new Promise((resolve, reject) => {
      const imagePath = path.join('/app/images', imageName);
      const imageStream = fs.createReadStream(imagePath);

      docker.loadImage(imageStream, (err, response) => {
        if (err) {
          console.error("Error loading", imageName, ":", err);
          return reject(err);
        }
        console.log(imageName, "loaded successfully!");
        resolve();
      });
    });
  });

  // Return the promise that resolves when all images are loaded
  return Promise.all(loadPromises)
    .then(() => {
      console.log("All images successfully loaded.");
    })
    .catch((error) => {
      console.error("An error occurred while loading the images:", error);
    });
}

exports.runCode = async (language, code) => {
  code = code + `\nprocess.exit(0);\n`;

  const { image, cmd } = getDockerConfig(language);

  if (!image || !cmd) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const container = await docker.createContainer({
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
