import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .min(1)
      .default("postgresql://localhost:5432/name_pending"),
    CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
    MARKET_DATA_API_URL: z.string().url().default("https://massive.com/api"),
    MARKET_DATA_API_KEY: z.string().default("m7Kg0apxBBty8KAjBepuxLMG5Owy5plJ"),
    NEWS_API_URL: z.string().url().default("https://example-news-api.com"),
    NEWS_API_KEY: z.string().optional(),
    INGEST_SYMBOLS: z.string().default("BTC-USD,ETH-USD"),
    INGEST_TIMEFRAME: z.string().default("1m"),
    INGEST_MARKET_INTERVAL_MS: z.coerce.number().int().min(5_000).default(30_000),
    INGEST_NEWS_INTERVAL_MS: z.coerce.number().int().min(10_000).default(60_000),
    FEATURE_REFRESH_MS: z.coerce.number().int().min(5_000).default(30_000),
    INGEST_LOOKBACK_MINUTES: z.coerce.number().int().min(1).default(120),
    MARKET_DATA_PROVIDER: z.enum(["http", "alphavantage"]).default("http"),
    USE_MOCK_DATA: z.coerce.boolean().default(false),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
