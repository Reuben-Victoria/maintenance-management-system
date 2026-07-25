import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import * as yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import uploadRouter, { uploadsDir } from "./routes/upload";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
const specPath = path.resolve(__dirname, "../../../lib/api-spec/openapi.yaml");
if (fs.existsSync(specPath)) {
  const swaggerDocument = yaml.load(fs.readFileSync(specPath, "utf8")) as Record<string, unknown>;
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "Maintenance Request System API",
      customCss: `
        .swagger-ui .topbar { background-color: #1e3a5f; }
        .swagger-ui .topbar-wrapper img { display: none; }
        .swagger-ui .topbar-wrapper::after { content: "Maintenance Request System API"; color: white; font-size: 18px; font-weight: bold; }
      `,
    }),
  );
  logger.info("Swagger UI available at /api/docs");
}

// Serve uploaded files
app.use("/api/uploads", express.static(uploadsDir));

// Upload route (before main router so multer runs before JSON body parser issues)
app.use("/api", uploadRouter);

// Serve raw OpenAPI spec as JSON
app.get("/api/openapi.json", (_req, res) => {
  if (fs.existsSync(specPath)) {
    const spec = yaml.load(fs.readFileSync(specPath, "utf8"));
    res.json(spec);
  } else {
    res.status(404).json({ error: "Spec not found" });
  }
});

app.use("/api", router);

export default app;
