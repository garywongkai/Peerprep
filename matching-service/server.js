require("dotenv").config();
const express = require("express");
const router = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 5002;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://peerprep-327190433280.asia-southeast1.run.app",
    "https://peerprep-327190433280.asia-southeast1.run.app:3000",
    "https://peerprep-327190433280.asia-southeast1.run.app:5000",
  ],
  optionsSuccessStatus: 200, // adaptive to old browser
};

app.use(cors(corsOptions));
app.use("/match", router);

// root router
app.get("/", (req, res) => {
  res.json({ message: "Matching Service is running!" });
});

// handle error 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// start service
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
