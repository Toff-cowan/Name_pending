import type { Candle, FetchResult, MarketProvider } from "./types";

const ALPHA_INTERVAL_MAP: Record<string, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "30m": "30min",
  "60m": "60min",
  "1h": "60min",
  "4h": "60min",
  "1d": "daily",
};

function toDate(value: string): Date {
  return new Date(value);
}

function parseNumeric(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  throw new Error("Expected numeric/string value from Alpha Vantage");
}

export class AlphaVantageMarketProvider implements MarketProvider {
  readonly source = "alpha-vantage";
  readonly apiKey: string;
  readonly baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://www.alphavantage.co") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async fetchCandles(args: {
    symbol: string;
    timeframe: string;
    since?: string;
  }): Promise<FetchResult<Candle>> {
    const interval = ALPHA_INTERVAL_MAP[args.timeframe] ?? "1min";
    const functionName = interval === "daily" ? "TIME_SERIES_DAILY_ADJUSTED" : "TIME_SERIES_INTRADAY";

    const url = new URL(`${this.baseUrl}/query`);
    url.searchParams.set("function", functionName);
    url.searchParams.set("symbol", args.symbol);
    if (functionName === "TIME_SERIES_INTRADAY") {
      url.searchParams.set("interval", interval);
      url.searchParams.set("outputsize", "compact");
    } else {
      url.searchParams.set("outputsize", "compact");
    }
    url.searchParams.set("apikey", this.apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Alpha Vantage request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();

    const timeSeriesKey = Object.keys(payload).find((k) => k.includes("Time Series"));
    const series = timeSeriesKey ? (payload as Record<string, unknown>)[timeSeriesKey] : null;
    if (!series || typeof series !== "object") {
      throw new Error("Alpha Vantage response missing time series data");
    }

    const items = Object.entries(series)
      .map(([ts, values]) => {
        if (typeof values !== "object" || values === null) return null;
        const record = values as Record<string, unknown>;

        return {
          symbol: args.symbol,
          ts: toDate(ts),
          open: parseNumeric(record["1. open"] ?? record["open"]),
          high: parseNumeric(record["2. high"] ?? record["high"]),
          low: parseNumeric(record["3. low"] ?? record["low"]),
          close: parseNumeric(record["4. close"] ?? record["close"]),
          volume: parseNumeric(record["5. volume"] ?? record["volume"] ?? 0),
        };
      })
      .filter((v): v is Candle => v !== null)
      .sort((a, b) => a.ts.getTime() - b.ts.getTime());

    const nextCursor = items.length ? items[items.length - 1].ts.toISOString() : undefined;

    return {
      items,
      nextCursor,
    };
  }
}
