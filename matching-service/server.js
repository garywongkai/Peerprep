require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/db");
const matchingRoutes = require("./routes/matchingRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", matchingRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Matching Service is running on port ${PORT}`);
});
