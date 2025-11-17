import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./routes/index.js";
import { errorHandler } from "./middlewares/errorhandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use("/api", route);

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
