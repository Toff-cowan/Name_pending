/**
 * Type definitions for the Stock Analysis & Prediction Engine (lab).
 */

/** OHLCV price point (from getStockHistory / API). */
export interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Price data plus optional pre-computed indicators for analysis prompt. */
export interface PriceData {
  ticker: string;
  currentPrice: number;
  change1dPercent?: number;
  change7dPercent?: number;
  change30dPercent?: number;
  rsi?: number;
  rsiSignal?: "overbought" | "oversold" | "neutral";
  macdSignal?: string;
  supportLevel?: number;
  resistanceLevel?: number;
  ohlcv: PriceDataPoint[];
}

/** Financial statement / ratio data for analysis (earnings, ratios, debt). */
export interface FinancialsData {
  ticker: string;
  revenueTrend?: "growing" | "declining" | "stable";
  epsTrend?: "growing" | "declining" | "stable";
  peRatio?: number;
  sectorPeAverage?: number;
  debtToEquity?: number;
  redFlags?: string[];
}

/** News item (headline, source, timestamp, sentiment hint). */
export interface NewsDataItem {
  ticker: string;
  title: string;
  link?: string;
  source: string;
  published: string;
  sentimentHint?: "bullish" | "bearish" | "neutral";
}

/** Aggregated news data for a ticker. */
export interface NewsData {
  ticker: string;
  items: NewsDataItem[];
  overallSentiment?: "bullish" | "bearish" | "neutral";
  majorEvents?: string[];
}

/** AI prediction result schema (Gemini response). */
export type PredictionDirection = "BULLISH" | "BEARISH" | "NEUTRAL";
export type Recommendation =
  | "STRONG BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG SELL";
export type TimeframeLabel =
  | "short-term (1-2 weeks)"
  | "medium-term (1-3 months)";

export interface StockPredictionRationale {
  summary: string;
  technicalFactors: string[];
  fundamentalFactors: string[];
  sentimentFactors: string[];
  risks: string[];
}

export interface StockPrediction {
  ticker: string;
  prediction: PredictionDirection;
  confidence: number;
  timeframe: TimeframeLabel;
  priceTarget: number | null;
  rationale: StockPredictionRationale;
  recommendation: Recommendation;
}

export interface StockPredictionError {
  error: true;
  message: string;
}
