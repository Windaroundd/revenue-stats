import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { connectToDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/authRoutes";
import revenueRoutes from "./routes/revenueRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files for Swagger UI
app.use(
  express.static("node_modules/swagger-ui-dist", {
    index: false,
    setHeaders: (res) => {
      res.setHeader("Content-Type", "text/html");
    },
  })
);

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Restaurant Revenue API Docs",
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/revenue", revenueRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 and error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3214; // avoid conflict with docs (3001)

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(
      `API Documentation available at http://localhost:${PORT}/api-docs`
    );
  });
}

void startServer();
