import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectToDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import userRoutes from "./routes/userRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/users", userRoutes);

// 404 and error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3214; // avoid conflict with docs (3001)

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

void startServer();
