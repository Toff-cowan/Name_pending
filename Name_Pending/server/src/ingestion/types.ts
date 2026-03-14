import { z } from "zod";

export const candleSchema = z.object({
  symbol: z.string(),
  ts: z.coerce.date(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string(),
});

export const newsItemSchema = z.object({
  source: z.string(),
  externalId: z.string(),
  publishedAt: z.coerce.date(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  url: z.string().url(),
  symbols: z.array(z.string()).default([]),
  sentiment: z.number().min(-1).max(1).nullable().optional(),
  impactScore: z.number().int().min(0).max(100).nullable().optional(),
  raw: z.record(z.string(), z.unknown()),
});

export type Candle = z.infer<typeof candleSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;

export interface FetchResult<T> {
  items: T[];
  nextCursor?: string;
}

export interface MarketProvider {
  readonly source: string;
  fetchCandles(args: {
    symbol: string;
    timeframe: string;
    since?: string;
  }): Promise<FetchResult<Candle>>;
}

export interface NewsProvider {
  readonly source: string;
  fetchNews(args: {
    since?: string;
  }): Promise<FetchResult<NewsItem>>;
}