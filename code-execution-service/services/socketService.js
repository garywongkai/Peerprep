const { runCode } = require("../controllers/runCode");
const { allSupportedLanguages } = require("../controllers/dockerConfig");

exports.handleSocketConnection = async (socket) => {
  socket.on('get_available_languages', (callback) => {
    callback(allSupportedLanguages);
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