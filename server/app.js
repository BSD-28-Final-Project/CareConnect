import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import route from "./routes/index.js"
import { errorHandler } from "./middlewares/errorhandler.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🔵 ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use("/api", route)

// Error handler middleware (must be last)
app.use(errorHandler)

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

app.listen(process.env.PORT, startServer);

export default app;


