import { env } from "@Name_Pending/env/server";

import {
  type Candle,
  candleSchema,
  type FetchResult,
  type MarketProvider,
  type NewsItem,
  newsItemSchema,
  type NewsProvider,
} from "./types";

interface HttpProviderOptions {
  baseUrl: string;
  apiKey?: string;
  source: string;
}

const envelopeSchema = {
  parse(payload: unknown): { items: unknown[]; nextCursor?: string } {
    const objectPayload = payload as {
      items?: unknown[];
      data?: unknown[];
      nextCursor?: string | null;
      cursor?: string | null;
    };

    const items = objectPayload.items ?? objectPayload.data ?? [];
    const nextCursor = objectPayload.nextCursor ?? objectPayload.cursor ?? undefined;

    return {
      items: Array.isArray(items) ? items : [],
      nextCursor: nextCursor ?? undefined,
    };
  },
};

function toStringNumber(value: unknown): string {
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return value;
  throw new Error("Expected numeric value in provider payload");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeCandle(raw: unknown, defaultSymbol: string): Candle {
  const entry = asRecord(raw);
  return candleSchema.parse({
    symbol: (entry.symbol as string | undefined) ?? defaultSymbol,
    ts: entry.ts ?? entry.timestamp ?? entry.time,
    open: toStringNumber(entry.open),
    high: toStringNumber(entry.high),
    low: toStringNumber(entry.low),
    close: toStringNumber(entry.close),
    volume: toStringNumber(entry.volume),
  });
}

function normalizeNews(raw: unknown, source: string): NewsItem {
  const entry = asRecord(raw);
  const symbolsRaw = entry.symbols;
  const symbols = Array.isArray(symbolsRaw)
    ? symbolsRaw.filter((item): item is string => typeof item === "string")
    : [];

  return newsItemSchema.parse({
    source,
    externalId: String(entry.externalId ?? entry.id ?? entry.uuid),
    publishedAt: entry.publishedAt ?? entry.published_at ?? entry.ts,
    title: String(entry.title ?? ""),
    summary: typeof entry.summary === "string" ? entry.summary : null,
    url: String(entry.url ?? ""),
    symbols,
    sentiment:
      typeof entry.sentiment === "number"
        ? entry.sentiment
        : typeof entry.sentiment === "string"
          ? Number(entry.sentiment)
          : null,
    impactScore:
      typeof entry.impactScore === "number"
        ? entry.impactScore
        : typeof entry.impact_score === "number"
          ? entry.impact_score
          : null,
    raw: asRecord(raw),
  });
}

async function requestJson(
  options: HttpProviderOptions,
  path: string,
  params: Record<string, string | undefined>,
): Promise<unknown> {
  const url = new URL(path, options.baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: options.apiKey
      ? {
          Authorization: `Bearer ${options.apiKey}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`${options.source} request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export class HttpMarketProvider implements MarketProvider {
  readonly source: string;
  readonly #options: HttpProviderOptions;

  constructor(options: HttpProviderOptions) {
    this.source = options.source;
    this.#options = options;
  }

  async fetchCandles(args: {
    symbol: string;
    timeframe: string;
    since?: string;
  }): Promise<FetchResult<Candle>> {
    const payload = await requestJson(this.#options, "/candles", {
      symbol: args.symbol,
      timeframe: args.timeframe,
      since: args.since,
    });

    const envelope = envelopeSchema.parse(payload);

    return {
      items: envelope.items.map((item) => normalizeCandle(item, args.symbol)),
      nextCursor: envelope.nextCursor,
    };
  }
}

export class HttpNewsProvider implements NewsProvider {
  readonly source: string;
  readonly #options: HttpProviderOptions;

  constructor(options: HttpProviderOptions) {
    this.source = options.source;
    this.#options = options;
  }

  async fetchNews(args: { since?: string }): Promise<FetchResult<NewsItem>> {
    const payload = await requestJson(this.#options, "/news", {
      since: args.since,
    });

    const envelope = envelopeSchema.parse(payload);

    return {
      items: envelope.items.map((item) => normalizeNews(item, this.source)),
      nextCursor: envelope.nextCursor,
    };
  }
}

export function createDefaultProviders() {
  return {
    marketProvider: new HttpMarketProvider({
      baseUrl: env.MARKET_DATA_API_URL,
      apiKey: env.MARKET_DATA_API_KEY,
      source: "market-http",
    }),
    newsProvider: new HttpNewsProvider({
      baseUrl: env.NEWS_API_URL,
      apiKey: env.NEWS_API_KEY,
      source: "news-http",
    }),
  };
}