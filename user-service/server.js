import http from "http";
import index from "./index.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";
const app = express();
const corsOptions = {
	origin: "http://localhost:3000", // Replace with frontend URL
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
	res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
	next();
});

const port = process.env.PORT || 3001;

const server = http.createServer(index);

await connectToDB()
	.then(() => {
		console.log("MongoDB Connected!");

		server.listen(port);
		console.log("User service server listening on http://localhost:" + port);
	})
	.catch((err) => {
		console.error("Failed to connect to DB");
		console.error(err);
	});
