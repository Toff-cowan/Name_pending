import { db } from "@Name_Pending/db";
import { derivedFeatures, marketCandles } from "@Name_Pending/db/schema";
import { env } from "@Name_Pending/env/server";
import { and, desc, eq } from "drizzle-orm";

/**
 * How many recent candles to pull in each run to compute indicators.
 * This keeps the engine bounded and avoids scanning the entire table each time.
 */
const LOOKBACK_CANDLES = 500;

/**
 * This worker computes derived features from ingested candle data.
 * It runs regularly and writes features into the derived_features table.
 */
export function startFeatureWorker() {
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await computeAndStoreFeatures();
    } finally {
      running = false;
    }
  };

  void run();

  const timer = setInterval(() => {
    void run();
  }, env.FEATURE_REFRESH_MS);

  return () => clearInterval(timer);
}

function computeAndStoreFeatures() {
  const symbols = env.INGEST_SYMBOLS.split(",").map((s) => s.trim()).filter(Boolean);
  const timeframe = env.INGEST_TIMEFRAME;

  return Promise.all(symbols.map(async (symbol) => {
    const candles = await db
      .select()
      .from(marketCandles)
      .where(
        and(
          eq(marketCandles.symbol, symbol),
          eq(marketCandles.timeframe, timeframe),
        ),
      )
      .orderBy(desc(marketCandles.ts))
      .limit(LOOKBACK_CANDLES);

    if (candles.length === 0) return;

    const recent = candles.reverse(); // ascending
    const features = computeFeatures(recent);

    if (features.length === 0) return;

    const inserts = features.flatMap(({ ts, values }) =>
      Object.entries(values).map(([feature, value]) => ({
        symbol,
        timeframe,
        ts,
        feature,
        value: value.toString(),
        source: "feature-engine",
      })),
    );

    await db
      .insert(derivedFeatures)
      .values(inserts)
      .onConflictDoNothing({
        target: [
          derivedFeatures.symbol,
          derivedFeatures.timeframe,
          derivedFeatures.ts,
          derivedFeatures.feature,
        ],
      });
  }));
}

function computeFeatures(candles: Array<{
  ts: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}>): Array<{ ts: Date; values: Record<string, number> }> {
  const closes = candles.map((c) => Number(c.close));
  const highs = candles.map((c) => Number(c.high));
  const lows = candles.map((c) => Number(c.low));

  const ema20 = computeEma(closes, 20);
  const ema50 = computeEma(closes, 50);
  const atr14 = computeAtr(highs, lows, closes, 14);
  const volatility20 = computeVolatility(closes, 20);
  const momentum10 = computeMomentum(closes, 10);

  return candles.map((candle, idx) => {
    const values: Record<string, number> = {};

    if (ema20[idx] !== null) values["ema_20"] = ema20[idx]!;
    if (ema50[idx] !== null) values["ema_50"] = ema50[idx]!;
    if (atr14[idx] !== null) values["atr_14"] = atr14[idx]!;
    if (volatility20[idx] !== null) values["volatility_20"] = volatility20[idx]!;
    if (momentum10[idx] !== null) values["momentum_10"] = momentum10[idx]!;

    return { ts: candle.ts, values };
  });
}

function computeEma(values: number[], period: number): Array<number | null> {
  const k = 2 / (period + 1);
  const ema: Array<number | null> = [];
  let prev: number | null = null;

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i]!;
    if (i < period - 1) {
      ema.push(null);
      continue;
    }

    if (i === period - 1) {
      const slice = values.slice(0, period);
      const sma = slice.reduce((sum, v) => sum + v, 0) / period;
      prev = sma;
      ema.push(sma);
      continue;
    }

    prev = prev === null ? value : value * k + prev * (1 - k);
    ema.push(prev);
  }

  return ema;
}

function computeAtr(highs: number[], lows: number[], closes: number[], period: number): Array<number | null> {
  const tr: number[] = [];
  for (let i = 0; i < highs.length; i += 1) {
    const high = highs[i]!;
    const low = lows[i]!;

    if (i === 0) {
      tr.push(high - low);
      continue;
    }

    const prevClose = closes[i - 1]!;
    const range1 = high - low;
    const range2 = Math.abs(high - prevClose);
    const range3 = Math.abs(low - prevClose);
    tr.push(Math.max(range1, range2, range3));
  }

  const atr: Array<number | null> = [];
  let prev: number | null = null;
  const k = 2 / (period + 1);

  for (let i = 0; i < tr.length; i += 1) {
    const value = tr[i]!;
    if (i < period - 1) {
      atr.push(null);
      continue;
    }

    if (i === period - 1) {
      const sma = tr.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
      prev = sma;
      atr.push(sma);
      continue;
    }

    prev = prev === null ? value : value * k + prev * (1 - k);
    atr.push(prev);
  }

  return atr;
}

function computeVolatility(values: number[], period: number): Array<number | null> {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i += 1) {
    const current = values[i]!;
    const previous = values[i - 1]!;
    returns.push(Math.log(current / previous));
  }

  const vol: Array<number | null> = [];
  for (let i = 0; i < values.length; i += 1) {
    if (i < period) {
      vol.push(null);
      continue;
    }

    const window = returns.slice(i - period, i);
    const mean = window.reduce((sum, v) => sum + v, 0) / window.length;
    const variance = window.reduce((sum, v) => sum + (v - mean) ** 2, 0) / window.length;
    vol.push(Math.sqrt(variance) * Math.sqrt(252)); // annualized
  }

  return vol;
}

function computeMomentum(values: number[], period: number): Array<number | null> {
  return values.map((value, idx) => {
    if (idx < period) return null;
    const prior = values[idx - period]!;
    if (prior === 0) return null;
    return (value - prior) / Math.abs(prior);
  });
}
