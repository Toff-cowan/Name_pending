import { createContext } from "@Name_Pending/api/context";
import { appRouter } from "@Name_Pending/api/routers/index";
import { env } from "@Name_Pending/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

import { createDefaultProviders } from "./ingestion/adapters";
import { startIngestionWorkers } from "./ingestion/workers";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const stopIngestionWorkers = startIngestionWorkers(createDefaultProviders());

process.on("SIGINT", () => {
  stopIngestionWorkers();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopIngestionWorkers();
  process.exit(0);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log(`Ingestion workers enabled for timeframe ${env.INGEST_TIMEFRAME}`);
});
