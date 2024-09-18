var mongoose = require("mongoose");
var schema = new mongoose.Schema({
	questionId: {
		type: Number,
		required: true,
		unique: true,
	},
	questionTitle: {
		type: String,
		default: "",
	},
	questionDescription: {
		type: String,
		default: "",
	},
	questionCategory: {
		type: String,
		default: "",
	},
	difficulty: {
		type: String,
		default: "",
	},
});
var question = new mongoose.model("Questions", schema);
module.exports = question;
