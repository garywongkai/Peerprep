require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const mongoose = require("mongoose");
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};
const uri = process.env.MONGO_DB_URI;
mongoose.Promise = global.Promise;
mongoose.connect(uri, clientOptions)
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
  console.log("Question server is listening on port 5000");
});
const QuestionRoute = require("./routes/questionPool");
const cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://peerprep-327190433280.asia-southeast1.run.app",
    "https://peerprep-327190433280.asia-southeast1.run.app:3000",
    "https://peerprep-327190433280.asia-southeast1.run.app:5000",
  ], // Allow only these origins
  optionsSuccessStatus: 200, // For older browsers
};
app.use(cors(corsOptions));
app.use("/question", QuestionRoute);
