require("dotenv").config();
const express = require("express");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import CORS
const app = express();
const PORT = 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend's URL
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(router);

app.get("/", (req, res) => {
  res.json({ message: "Peerprep user-service" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
