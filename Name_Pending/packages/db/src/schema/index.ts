import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const marketCandles = pgTable(
  "market_candles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull(), // example: 1m, 5m, 1h
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    open: numeric("open", { precision: 20, scale: 8 }).notNull(),
    high: numeric("high", { precision: 20, scale: 8 }).notNull(),
    low: numeric("low", { precision: 20, scale: 8 }).notNull(),
    close: numeric("close", { precision: 20, scale: 8 }).notNull(),
    volume: numeric("volume", { precision: 30, scale: 10 }).notNull(),
    source: text("source").notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("market_candles_symbol_tf_ts_uq").on(t.symbol, t.timeframe, t.ts),
    index("market_candles_symbol_ts_idx").on(t.symbol, t.ts),
  ],
);

export const newsEvents = pgTable(
  "news_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull(),
    externalId: text("external_id").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    url: text("url").notNull(),
    symbols: jsonb("symbols").$type<string[]>().notNull().default([]),
    sentiment: numeric("sentiment", { precision: 5, scale: 2 }),
    impactScore: integer("impact_score"),
    raw: jsonb("raw").$type<Record<string, unknown>>().notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("news_events_source_external_id_uq").on(t.source, t.externalId),
    index("news_events_published_at_idx").on(t.publishedAt),
  ],
);

export const derivedFeatures = pgTable(
  "derived_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull(),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    feature: text("feature").notNull(),
    value: numeric("value", { precision: 30, scale: 16 }).notNull(),
    source: text("source").notNull().default("engine"),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("derived_features_symbol_tf_ts_feature_uq").on(
      t.symbol,
      t.timeframe,
      t.ts,
      t.feature,
    ),
    index("derived_features_symbol_ts_idx").on(t.symbol, t.ts),
  ],
);

export const ingestionCheckpoints = pgTable(
  "ingestion_checkpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull(), // market, news
    streamKey: text("stream_key").notNull(), // BTC-USD:1m, global-news
    cursor: text("cursor"),
    lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    error: text("error"),
    healthy: boolean("healthy").notNull().default(true),
  },
  (t) => [uniqueIndex("ingestion_checkpoints_source_stream_uq").on(t.source, t.streamKey)],
);