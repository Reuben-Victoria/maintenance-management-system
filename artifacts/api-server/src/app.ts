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

// Skip verbose request logging in the test environment to keep test output clean
if (process.env.NODE_ENV !== "test") {
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
    }),
  );
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache the parsed OpenAPI spec once at startup (avoids repeated disk reads)
const specPath = path.resolve(__dirname, "../../../lib/api-spec/openapi.yaml");
const swaggerDocument: Record<string, unknown> | null = fs.existsSync(specPath)
  ? (yaml.load(fs.readFileSync(specPath, "utf8")) as Record<string, unknown>)
  : null;

if (swaggerDocument) {
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

// Serve raw OpenAPI spec as JSON — reuse the already-loaded document
app.get("/api/openapi.json", (_req, res) => {
  if (swaggerDocument) {
    res.json(swaggerDocument);
  } else {
    res.status(404).json({ error: "Spec not found" });
  }
});

app.use("/api", router);

export default app;
