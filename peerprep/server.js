const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const mongoose = require("mongoose");
const clientOptions = {
	serverApi: { version: "1", strict: true, deprecationErrors: true },
};
const uri =
	"mongodb+srv://peerprepenjoyer:peerprepenjoyer@cluster.tyji51x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
mongoose.Promise = global.Promise;
mongoose
	.connect(uri, clientOptions)
	.then(() => {
		console.log("Database Connected Successfully!!");
	})
	.catch((err) => {
		console.log("Could not connect to the database", err);
		process.exit();
	});
app.get("/", (req, res) => {
	res.json({ message: "Peerprep Question Pool API" });
});
app.listen(5000, () => {
	console.log("Server is listening on port 5000");
});
const QuestionRoute = require("./src/routes/questionPool");
app.use("/question", QuestionRoute);
