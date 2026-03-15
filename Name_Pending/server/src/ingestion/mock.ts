import type { Candle, FetchResult, MarketProvider, NewsItem, NewsProvider } from "./types";

const DEFAULT_SYMBOL = "BTC-USD";

function toDate(ts: number) {
  return new Date(ts);
}

export class MockMarketProvider implements MarketProvider {
  readonly source = "mock";

  async fetchCandles(args: {
    symbol: string;
    timeframe: string;
    since?: string;
  }): Promise<FetchResult<Candle>> {
    const symbol = args.symbol ?? DEFAULT_SYMBOL;
    const timeframe = args.timeframe ?? "1m";

    const sinceTs = args.since ? Date.parse(args.since) : Date.now() - 1000 * 60 * 60;
    const now = Date.now();

    const intervalMs = timeframeToMs(timeframe);
    const maxPoints = 120;

    const points: Candle[] = [];

    let ts = sinceTs;
    let lastClose = 30000 + Math.random() * 10000;

    while (ts < now && points.length < maxPoints) {
      const open = lastClose;
      const change = (Math.random() - 0.5) * open * 0.005;
      const close = Math.max(0, open + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 100;

      points.push({
        symbol,
        ts: toDate(ts),
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: volume.toFixed(2),
      });

      lastClose = close;
      ts += intervalMs;
    }

    const nextCursor = toDate(now).toISOString();

    return { items: points, nextCursor };
  }
}

export class MockNewsProvider implements NewsProvider {
  readonly source = "mock";

  async fetchNews(_args: { since?: string }): Promise<FetchResult<NewsItem>> {
    const now = Date.now();

    return {
      items: [
        {
          source: this.source,
          externalId: `mock-${now}`,
          publishedAt: toDate(now),
          title: "Mock market update",
          summary: "This is a synthetic news item generated for local development.",
          url: "https://example.com/mock-news",
          symbols: ["BTC-USD"],
          sentiment: 0.1,
          impactScore: 1,
          raw: { mock: true, ts: now },
        },
      ],
      nextCursor: toDate(now).toISOString(),
    };
  }
}

function timeframeToMs(tf: string): number {
  // Supported: 1m, 5m, 15m, 1h
  const n = Number(tf.replace(/[^0-9]/g, ""));
  if (tf.endsWith("m")) return n * 60 * 1000;
  if (tf.endsWith("h")) return n * 60 * 60 * 1000;
  return 60 * 1000;
}
