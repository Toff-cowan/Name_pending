import { db } from "@Name_Pending/db";
import { ingestionCheckpoints, marketCandles, newsEvents } from "@Name_Pending/db/schema";
import { env } from "@Name_Pending/env/server";
import { and, eq } from "drizzle-orm";

import type { MarketProvider, NewsProvider } from "./types";

interface WorkerDependencies {
  marketProvider: MarketProvider;
  newsProvider: NewsProvider;
}

interface CheckpointArgs {
  source: string;
  streamKey: string;
  cursor?: string | null;
  healthy: boolean;
  error?: string;
}

function getInitialSinceIso(): string {
  const lookbackMs = env.INGEST_LOOKBACK_MINUTES * 60 * 1000;
  return new Date(Date.now() - lookbackMs).toISOString();
}

async function getCheckpoint(source: string, streamKey: string) {
  const rows = await db
    .select()
    .from(ingestionCheckpoints)
    .where(
      and(
        eq(ingestionCheckpoints.source, source),
        eq(ingestionCheckpoints.streamKey, streamKey),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

async function saveCheckpoint(args: CheckpointArgs) {
  const now = new Date();
  await db
    .insert(ingestionCheckpoints)
    .values({
      source: args.source,
      streamKey: args.streamKey,
      cursor: args.cursor,
      healthy: args.healthy,
      error: args.error,
      lastAttemptAt: now,
      lastSuccessAt: args.healthy ? now : null,
    })
    .onConflictDoUpdate({
      target: [ingestionCheckpoints.source, ingestionCheckpoints.streamKey],
      set: {
        cursor: args.cursor,
        healthy: args.healthy,
        error: args.error,
        lastAttemptAt: now,
        lastSuccessAt: args.healthy ? now : undefined,
      },
    });
}

async function ingestMarketOnce(provider: MarketProvider) {
  const symbols = env.INGEST_SYMBOLS.split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  for (const symbol of symbols) {
    const streamKey = `${symbol}:${env.INGEST_TIMEFRAME}`;
    const checkpoint = await getCheckpoint("market", streamKey);

    try {
      const result = await provider.fetchCandles({
        symbol,
        timeframe: env.INGEST_TIMEFRAME,
        since: checkpoint?.cursor ?? getInitialSinceIso(),
      });

      if (result.items.length > 0) {
        await db
          .insert(marketCandles)
          .values(
            result.items.map((candle) => ({
              symbol: candle.symbol,
              timeframe: env.INGEST_TIMEFRAME,
              ts: candle.ts,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume,
              source: provider.source,
            })),
          )
          .onConflictDoNothing({
            target: [marketCandles.symbol, marketCandles.timeframe, marketCandles.ts],
          });
      }

      await saveCheckpoint({
        source: "market",
        streamKey,
        cursor: result.nextCursor ?? checkpoint?.cursor ?? getInitialSinceIso(),
        healthy: true,
      });
    } catch (error) {
      await saveCheckpoint({
        source: "market",
        streamKey,
        cursor: checkpoint?.cursor,
        healthy: false,
        error: error instanceof Error ? error.message : "unknown market ingestion error",
      });
    }
  }
}

async function ingestNewsOnce(provider: NewsProvider) {
  const streamKey = "global-news";
  const checkpoint = await getCheckpoint("news", streamKey);

  try {
    const result = await provider.fetchNews({
      since: checkpoint?.cursor ?? getInitialSinceIso(),
    });

    if (result.items.length > 0) {
      await db
        .insert(newsEvents)
        .values(
          result.items.map((item) => ({
            source: item.source,
            externalId: item.externalId,
            publishedAt: item.publishedAt,
            title: item.title,
            summary: item.summary ?? null,
            url: item.url,
            symbols: item.symbols,
            sentiment: item.sentiment === null || item.sentiment === undefined ? null : item.sentiment.toFixed(2),
            impactScore: item.impactScore ?? null,
            raw: item.raw,
          })),
        )
        .onConflictDoNothing({
          target: [newsEvents.source, newsEvents.externalId],
        });
    }

    await saveCheckpoint({
      source: "news",
      streamKey,
      cursor: result.nextCursor ?? checkpoint?.cursor ?? getInitialSinceIso(),
      healthy: true,
    });
  } catch (error) {
    await saveCheckpoint({
      source: "news",
      streamKey,
      cursor: checkpoint?.cursor,
      healthy: false,
      error: error instanceof Error ? error.message : "unknown news ingestion error",
    });
  }
}

export function startIngestionWorkers(deps: WorkerDependencies) {
  let marketInProgress = false;
  let newsInProgress = false;

  const runMarket = async () => {
    if (marketInProgress) return;
    marketInProgress = true;
    try {
      await ingestMarketOnce(deps.marketProvider);
    } finally {
      marketInProgress = false;
    }
  };

  const runNews = async () => {
    if (newsInProgress) return;
    newsInProgress = true;
    try {
      await ingestNewsOnce(deps.newsProvider);
    } finally {
      newsInProgress = false;
    }
  };

  void runMarket();
  void runNews();

  const marketTimer = setInterval(() => {
    void runMarket();
  }, env.INGEST_MARKET_INTERVAL_MS);

  const newsTimer = setInterval(() => {
    void runNews();
  }, env.INGEST_NEWS_INTERVAL_MS);

  return () => {
    clearInterval(marketTimer);
    clearInterval(newsTimer);
  };
}