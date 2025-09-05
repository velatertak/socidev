import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { apiRouter } from "./routes/index.js";
import { orderRouter } from "./routes/order.js";
import { errorHandler } from "./middleware/error-handler.js";
import sequelize from "./config/database.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Swagger document
const swaggerDocument = YAML.load(join(__dirname, "docs/swagger/index.yaml"));

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Social Developer API Documentation",
    customfavIcon: "/assets/favicon.ico",
  })
);

// Routes
app.use("/api", apiRouter);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Force sync in development only
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ force: false });
      console.log("Database tables recreated successfully.");
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(
        `API Documentation available at http://localhost:${port}/api-docs`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
