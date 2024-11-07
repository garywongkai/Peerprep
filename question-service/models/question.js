var mongoose = require("mongoose");
var schema = new mongoose.Schema({
 questionId: {
  type: Number,
  required: false,
  unique: false,
 },
 questionTitle: {
  type: String,
  default: "",
  required: true,
  unique: false,
 },
 questionDescription: {
  type: String,
  default: "",
  required: true,
  unique: false,
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
