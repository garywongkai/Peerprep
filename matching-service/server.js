require("dotenv").config();
const express = require("express");
const router = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = 5002;

// CORS 配置
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://peerprep-327190433280.asia-southeast1.run.app",
    "https://peerprep-327190433280.asia-southeast1.run.app:3000",
    "https://peerprep-327190433280.asia-southeast1.run.app:5000",
  ],
  optionsSuccessStatus: 200, // 适配旧版浏览器
};

// 启用 CORS
app.use(cors(corsOptions));
app.use(router);

// 根路由，检查服务器是否正常工作
app.get("/", (req, res) => {
  res.json({ message: "Matching Service is running!" });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
