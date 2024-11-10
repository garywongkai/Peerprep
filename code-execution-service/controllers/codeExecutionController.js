const axios = require("axios");
const { supportedLanguages, config } = require("../config/judgeConfig");

exports.executeCode = async (language, sourceCode) => {
	const languageId = supportedLanguages[language.toLowerCase()];

	if (!languageId) {
		throw new Error(`Unsupported language: ${language}`);
	}

	try {
		// Create submission
		const submission = await axios.post(
			`${config.apiEndpoint}/submissions`,
			{
				source_code: sourceCode,
				language_id: languageId,
				stdin: "",
			},
			{
				headers: {
					"content-type": "application/json",
					"X-RapidAPI-Key": config.apiKey,
					"X-RapidAPI-Host": config.apiHost,
				},
			}
		);

		// Get token from submission
		const token = submission.data.token;

		// Get results
		const result = await getSubmissionResult(token);
		return formatOutput(result);
	} catch (error) {
		console.error(
			"Code execution error:",
			error.response?.data || error.message
		);
		throw new Error(
			"Code execution failed: " + (error.response?.data?.error || error.message)
		);
	}
};

async function getSubmissionResult(token) {
	const maxAttempts = 10;
	const pollInterval = 1000;

	for (let i = 0; i < maxAttempts; i++) {
		const response = await axios.get(
			`${config.apiEndpoint}/submissions/${token}`,
			{
				headers: {
					"X-RapidAPI-Key": config.apiKey,
					"X-RapidAPI-Host": config.apiHost,
				},
			}
		);

		const { status } = response.data;

		// If the code has finished executing
		if (status.id >= 3) {
			// 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, etc.
			return response.data;
		}

		// Wait before next attempt
		await new Promise((resolve) => setTimeout(resolve, pollInterval));
	}

	throw new Error("Execution timed out");
}

function formatOutput(result) {
	return {
		status: result.status.description,
		output: result.stdout || "",
		error: result.stderr || result.compile_output || "",
		executionTime: result.time,
		memoryUsed: result.memory,
	};
}

exports.getSupportedLanguages = () => Object.keys(supportedLanguages);
