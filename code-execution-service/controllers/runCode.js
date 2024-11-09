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
  const { image, cmd } = getDockerConfig(language);

  if (!image || !cmd) {
    throw new Error(`Unsupported language: ${language}`);
  }
  cmd.push(code);
  const container = await docker.createContainer({
    Image: image,
    Cmd: cmd,
    Tty: false,
    AttachStdout: true,
    AttachStderr: true
  });
  await container.start();

  const outputStream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true
  });

  const outputBuffer = [];
  outputStream.on('data', (data) => {
    outputBuffer.push(data);
  });

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
