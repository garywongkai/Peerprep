const Docker = require('dockerode');
const { getDockerConfig } = require("./dockerConfig");

const docker = new Docker({ socketPath: '/run/user/1000/docker.sock' });

async function pullImageIfNeeded(imageName) {
  try {
    const images = await docker.listImages();
    const imageExists = images.some(image => image.RepoTags && image.RepoTags.includes(imageName));

    if (!imageExists) {
      console.log(`Image ${imageName} not found locally. Pulling from Docker registry.`);
      await docker.pull(imageName);
      console.log(`Image ${imageName} pulled successfully.`);
    }
  } catch (error) {
    console.error('Error checking/pulling image:', error);
  }
}

exports.runCode = async (language, code) => {
  const { image, cmd } = getDockerConfig(language);

  if (!image || !cmd) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await pullImageIfNeeded(image);

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
          console.log(`${image} container finished with exit code: ${data.StatusCode}`);
          resolve(data);
        }
      });
    }),
    timeoutPromise
  ]);

  await container.remove({ force: true });

  return Buffer.concat(outputBuffer).toString();
};
