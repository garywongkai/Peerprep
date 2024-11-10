const codeExecutionController = require("../controllers/codeExecutionController");

exports.handleSocketConnection = async (socket) => {
	socket.on("get_available_languages", (callback) => {
		callback(codeExecutionController.getSupportedLanguages());
	});

	socket.on("run_code", async (language, code, callback) => {
		try {
			const result = await codeExecutionController.executeCode(language, code);
			callback({
				status: result.status,
				output: result.output,
				error: result.error,
				executionTime: result.executionTime,
				memoryUsed: result.memoryUsed,
			});
		} catch (err) {
			console.error("Execution error:", err);
			callback({
				status: "error",
				error: err.message || "Code execution failed",
				output: "",
				executionTime: 0,
				memoryUsed: 0,
			});
		}
	});
};
