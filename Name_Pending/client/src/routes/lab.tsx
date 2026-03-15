/**
 * Stock Analysis & Prediction Lab — ChatGPT-style query interface.
 * Chat feed: user message + assistant (prediction card or error). Previous searches shown.
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { env } from "@pi/env/web";
import {
  buildAnalysisPrompt,
  getStockPrediction,
  derivePriceDataFromOhlc,
  mapNewsToNewsData,
} from "@/lib/stockAnalysis";
import type { StockPrediction, StockPredictionError } from "@/types/stock";
import { AnalysisInput } from "@/components/AnalysisInput";
import { PredictionCard } from "@/components/PredictionCard";
import { cn } from "@pi/ui/lib/utils";

import type { Route } from "./+types/lab";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chatroom & Prediction Lab | PI - Predictive Investments" },
    {
      name: "description",
      content: "AI-powered stock analysis and prediction lab",
    },
  ];
}

type LabState = "idle" | "loading" | "success" | "error";

/** One entry in the chat feed. */
type ChatEntry =
  | { id: string; type: "user"; content: string; ticker: string }
  | {
      id: string;
      type: "assistant";
      prediction: StockPrediction;
      companyName: string | null;
      analyzedAt: string;
      userMessage: string;
    }
  | { id: string; type: "error"; message: string; userMessage: string }
  | { id: string; type: "loading"; ticker: string; userMessage: string };

function formatAnalyzedAt(): string {
  return new Date().toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function nextId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const MAX_PREVIOUS_SEARCHES = 10;

export default function Lab() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [state, setState] = useState<LabState>("idle");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const runAnalysis = useCallback(
    async (ticker: string, userMessage: string) => {
      // eslint-disable-next-line no-console
      console.log("[Lab] runAnalysis called", { ticker, userMessage });
      if (!env.VITE_GEMINI_API_KEY?.trim()) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), type: "user", content: userMessage, ticker },
          {
            id: nextId(),
            type: "error",
            message: "Gemini API key is not set. Add VITE_GEMINI_API_KEY to your .env.",
            userMessage,
          },
        ]);
        setState("error");
        return;
      }

      const userEntry: ChatEntry = {
        id: nextId(),
        type: "user",
        content: userMessage,
        ticker,
      };
      const loadingId = nextId();
      const loadingEntry: ChatEntry = {
        id: loadingId,
        type: "loading",
        ticker,
        userMessage,
      };
      setMessages((prev) => [...prev, userEntry, loadingEntry]);
      setState("loading");

      try {
        const symbol = ticker.toUpperCase().replace(/[^A-Z0-9\-.]/g, "");

        const [historyResult, newsResult, marketResult] = await Promise.all([
          queryClient.fetchQuery(trpc.getStockHistory.queryOptions({ symbol })),
          queryClient.fetchQuery(trpc.getStockNews.queryOptions({ symbol })),
          queryClient.fetchQuery(trpc.getMarketData.queryOptions()),
        ]);

        const ohlc = historyResult?.ok ? historyResult.data : [];
        const newsItems = newsResult?.ok ? newsResult.items : [];
        const marketRows = marketResult?.ok ? marketResult.rows : [];
        const row = marketRows.find((r) => r.symbol.toUpperCase() === symbol);
        const companyName = row?.name ?? null;

        const priceData = derivePriceDataFromOhlc(symbol, ohlc, {
          currentPrice: row?.price,
          changePercent: row?.changePercent,
        });
        const financialsData = null;
        const newsData = mapNewsToNewsData(symbol, newsItems);

        const promptPayload = buildAnalysisPrompt(
          symbol,
          priceData,
          financialsData,
          newsData
        );

        const prediction = await getStockPrediction(
          env.VITE_GEMINI_API_KEY,
          symbol,
          promptPayload
        );

        if ("error" in prediction && prediction.error) {
          // eslint-disable-next-line no-console
          console.error("[Lab] Prediction error from Gemini", {
            ticker: symbol,
            message: (prediction as StockPredictionError).message,
          });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingId
                ? {
                    id: m.id,
                    type: "error" as const,
                    message: (prediction as StockPredictionError).message,
                    userMessage,
                  }
                : m
            )
          );
          setState("error");
          return;
        }

        const resultEntry: ChatEntry = {
          id: nextId(),
          type: "assistant",
          prediction: prediction as StockPrediction,
          companyName,
          analyzedAt: formatAnalyzedAt(),
          userMessage,
        };
        setMessages((prev) =>
          prev.map((m) => (m.id === loadingId ? resultEntry : m))
        );
        setState("success");
        // eslint-disable-next-line no-console
        console.log("[Lab] Prediction success", {
          ticker: symbol,
          prediction: (prediction as StockPrediction).prediction,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Analysis failed.";
        // eslint-disable-next-line no-console
        console.error("[Lab] runAnalysis threw", { ticker, error: message });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? { id: m.id, type: "error" as const, message, userMessage }
              : m
          )
        );
        setState("error");
      }
    },
    [queryClient]
  );

  const onAnalyzeAnother = useCallback(() => {
    setState("idle");
  }, []);

  const userEntries = messages.filter(
    (m): m is Extract<ChatEntry, { type: "user" }> => m.type === "user"
  );
  const seen = new Set<string>();
  const previousTickers: { ticker: string; content: string }[] = [];
  for (let i = userEntries.length - 1; i >= 0 && previousTickers.length < MAX_PREVIOUS_SEARCHES; i--) {
    const m = userEntries[i]!;
    const key = m.ticker.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    previousTickers.push({ ticker: m.ticker, content: m.content });
  }

  const isLoading = state === "loading";
  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-2 text-2xl font-semibold">
          Chatroom & Prediction Lab
        </h1>
        <p className="text-muted-foreground">
          Ask about a stock to get an AI-powered analysis and prediction.
        </p>
      </div>

      <div className="flex flex-1 flex-col min-h-0 px-4 pb-4">
        <div
          ref={feedRef}
          className={cn(
            "flex-1 overflow-y-auto space-y-4 container max-w-4xl w-full py-4",
            !hasMessages && "flex items-center justify-center"
          )}
        >
          {!hasMessages && (
            <p className="text-sm text-muted-foreground text-center">
              Type a question like &quot;Analyze AAPL&quot; or &quot;What about TSLA?&quot;
            </p>
          )}
          {messages.map((entry) => {
            if (entry.type === "user") {
              return (
                <div
                  key={entry.id}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground text-sm shadow-sm">
                    {entry.content}
                  </div>
                </div>
              );
            }
            if (entry.type === "loading") {
              return (
                <div key={entry.id} className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                    </span>
                    Analyzing {entry.ticker}…
                  </div>
                </div>
              );
            }
            if (entry.type === "error") {
              return (
                <div key={entry.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {entry.message}
                  </div>
                </div>
              );
            }
            return (
              <div key={entry.id} className="flex justify-start w-full">
                <div className="w-full max-w-2xl">
                  <PredictionCard
                    prediction={entry.prediction}
                    companyName={entry.companyName ?? undefined}
                    analyzedAt={entry.analyzedAt}
                    onAnalyzeAnother={onAnalyzeAnother}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {previousTickers.length > 0 && (
          <div className="container max-w-4xl w-full py-2">
            <p className="text-xs text-muted-foreground mb-2">Previous searches</p>
            <div className="flex flex-wrap gap-2">
              {previousTickers.map(({ ticker, content }, idx) => (
                <button
                  key={`prev-${ticker}-${idx}`}
                  type="button"
                  onClick={() => runAnalysis(ticker, content)}
                  disabled={isLoading}
                  className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {content.length > 20 ? `${content.slice(0, 18)}…` : content}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="container max-w-4xl w-full pt-2">
          <AnalysisInput
            onSubmit={runAnalysis}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
