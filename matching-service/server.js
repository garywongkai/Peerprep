import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import matchingRoutes from "./routes/matchingRoutes";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 初始化 dotenv 以使用 .env 文件中的环境变量
dotenv.config();

// 初始化 Express 应用
const app = express();

// 中间件：用于解析 JSON 请求体
app.use(express.json());

// 中间件：允许跨域请求
app.use(cors());

// Firebase 配置和初始化
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// 应用路由：将匹配相关的路由挂载到 "/api/match" 路径
app.use("/api/match", matchingRoutes);

// 处理未找到的路由
app.use((req, res, next) => {
  res.status(404).send("Route not found");
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 设置端口号
const PORT = process.env.PORT || 5000;

// 启动服务器，监听指定端口
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
