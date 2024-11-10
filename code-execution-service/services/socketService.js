const { runCode } = require("../controllers/runCode");
const { getTarFiles, getLanguageFromImageName } = require("../controllers/utils");

exports.handleSocketConnection = async (socket) => {
  socket.on('get_available_languages', (callback) => {
    const tarFiles = getTarFiles('/app/images');
    const languages = tarFiles.map((name) => getLanguageFromImageName(name.replace(/\.tar$/, '')));
    callback(languages);
  });

  socket.on('run_code', (language, code, callback) => {
    (async () => {
      try {
        const output = await runCode(language, code);
        callback(output);
      } catch (err) {
        console.error('Execution error:', err);
        callback(err);
      }
    })();
  });
};