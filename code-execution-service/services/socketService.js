const { runCode } = require("../controllers/runCode");

exports.handleSocketConnection = async (socket) => {
  socket.on('run_code', (id, language, code) => {
    (async () => {
      try {
        const output = await runCode(language, code);
        socket.emit('code_result', output);
      } catch (err) {
        console.error('Execution error:', err);
      }
    })();
  });
};