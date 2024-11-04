require("dotenv").config();
const express = require("express");
const router = require("./routes"); // this requires the .js file in ./routes must be named as 'index.js', otherwise you need to point out the filename explicitly
const cors = require("cors"); // Import CORS
const app = express();
const PORT = 5001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://peerprep-327190433280.asia-southeast1.run.app",
      "https://peerprep-327190433280.asia-southeast1.run.app:3000",
      "https://peerprep-327190433280.asia-southeast1.run.app:5000",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  res.json({ message: "Peerprep user-service" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
