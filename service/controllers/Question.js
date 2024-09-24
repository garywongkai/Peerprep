const QuestionModel = require("../models/question");
// Create and Save a new user
exports.create = async (req, res) => {
	if (
		!req.body.questionId &&
		!req.body.difficulty &&
		!req.body.questionTitle &&
		!req.body.questionDescription &&
		!req.body.questionCategory
	) {
		res.status(400).send({ message: "Content can not be empty!" });
	}

	const question = new QuestionModel({
		questionId: req.body.questionId,
		questionTitle: req.body.questionTitle,
		questionDescription: req.body.questionDescription,
		questionCategory: req.body.questionCategory,
		difficulty: req.body.difficulty,
	});

	await question
		.save()
		.then((data) => {
			res.send({
				message: "Question created successfully!!",
				question: data,
			});
		})
		.catch((err) => {
			res.status(500).send({
				message: err.message || "Some error occurred while creating question",
			});
		});
};
// Retrieve all users from the database.
exports.findAll = async (req, res) => {
	try {
		const question = await QuestionModel.find();
		res.status(200).json(question);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};
// Find a single User with an id
exports.findOne = async (req, res) => {
	try {
		const question = await QuestionModel.findById(req.params.id);
		res.status(200).json(question);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};
// Update a user by the id in the request
exports.update = async (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: "Data to update can not be empty!",
		});
	}

	const id = req.params.id;

	await QuestionModel.findByIdAndUpdate(id, req.body, {
		useFindAndModify: false,
	})
		.then((data) => {
			if (!data) {
				res.status(404).send({
					message: `Question not found.`,
				});
			} else {
				res.send({ message: "Question updated successfully." });
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: err.message,
			});
		});
};
// Delete a user with the specified id in the request
exports.destroy = async (req, res) => {
	await QuestionModel.findByIdAndRemove(req.params.id)
		.then((data) => {
			if (!data) {
				res.status(404).send({
					message: `Question not found.`,
				});
			} else {
				res.send({
					message: "Question deleted successfully!",
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: err.message,
			});
		});
};

exports.getQuestionByCategory = async (req, res) => {
	try {
		const { category, difficulty } = req.query;

		// Build filter object dynamically
		const filter = {};
		if (category) {
			filter.questionCategory = { $regex: category, $options: "i" };
		}
		if (difficulty) {
			filter.difficulty = difficulty;
		}

		const questions = await QuestionModel.find(filter);
		res.status(200).json(questions);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

exports.getQuestionById = async (req, res) => {
	try {
		const { questionId } = req.query;
		// Build filter object dynamically
		const filter = {};
		if (questionId) {
			filter.questionId = questionId;
		}
		const questions = await QuestionModel.find(filter);
		res.status(200).json(questions);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};
exports.getRandomQuestion = async (req, res) => {
    try {
        const { difficulty } = req.query;

        // Build filter object dynamically
        const filter = {};
        if (difficulty) {
            filter.difficulty = difficulty;
        }

        // Use MongoDB's $sample to get one random document
        const randomQuestion = await QuestionModel.aggregate([
            { $match: filter }, // Apply any filters
            { $sample: { size: 1 } } // Randomly select one document
        ]);

        res.status(200).json(randomQuestion[0]); // Return the first (and only) result
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};