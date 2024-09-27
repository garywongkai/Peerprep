var mongoose = require("mongoose");
var schema = new mongoose.Schema({
	questionId: {
		type: Number,
		required: false,
		unique: true,
	},
	questionTitle: {
		type: String,
		default: "",
		required: true,
	},
	questionDescription: {
		type: String,
		default: "",
		required: true,
	},
	questionCategory: {
		type: String,
		default: "",
		required: true,
	},
	difficulty: {
		type: String,
		default: "",
		required: true,
	},
});
var question = new mongoose.model("Questions", schema);
module.exports = question;
