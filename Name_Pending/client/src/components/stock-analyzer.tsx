/**
 * Stock Prediction Analyzer for the Analytics page.
 * Analyze a stock: set symbol, time horizon, run prediction, compare actual vs predicted (mirror overlay).
 */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { trpc } from "@/utils/trpc";
import type {
  OHLC,
  PredictionPoint,
  PredictionAccuracy,
  MarketRow,
} from "@Name_Pending/api/routers/index";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@Name_Pending/ui/components/card";
import { Input } from "@Name_Pending/ui/components/input";
import { Label } from "@Name_Pending/ui/components/label";
import { Button } from "@Name_Pending/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Target, BarChart3, CheckCircle2, AlertCircle, Layers, TrendingUp, TrendingDown, Loader2, Download } from "lucide-react";

const FALLBACK_STOCK_OPTIONS = [
  { value: "AAPL", label: "AAPL - Apple" },
  { value: "GOOGL", label: "GOOGL - Alphabet" },
  { value: "MSFT", label: "MSFT - Microsoft" },
  { value: "NVDA", label: "NVDA - NVIDIA" },
  { value: "TSLA", label: "TSLA - Tesla" },
];

const FORECAST_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 30, label: "30 Days" },
  { value: 60, label: "60 Days" },
  { value: 90, label: "90 Days" },
];

function buildAnalyzeChartData(actual: OHLC[], predicted: PredictionPoint[]) {
  const toDate = (d: string) => (d.split(" ")[0] ?? d).trim();
  const historical = actual.map((d) => ({
    date: toDate(d.date),
    actual: d.close,
    predicted: null as number | null,
  }));
  const lastActualDate = actual.length > 0 ? toDate(actual[actual.length - 1].date) : null;
  const future = predicted.map((p) => ({
    date: toDate(p.date),
    actual: null as number | null,
    predicted: p.predictedClose,
  }));
  return { combined: [...historical, ...future], lastActualDate };
}

function AnalyzeChartRecharts({
  actual,
  predicted,
  symbol,
  forecastDays,
  height = 320,
}: {
  actual: OHLC[];
  predicted: PredictionPoint[];
  symbol: string;
  forecastDays: number;
  height?: number;
}) {
  const { combined, lastActualDate } = useMemo(
    () => buildAnalyzeChartData(actual, predicted),
    [actual, predicted]
  );

  return (
    <Card className="rounded-lg border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          {symbol} Price Analysis
        </CardTitle>
        <CardDescription>
          Historical data with {forecastDays}-day prediction (mirror overlay for comparison)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          <span>Mirror overlay: actual and predicted on same chart to compare accuracy</span>
        </div>
        <ChartContainer
          config={{
            actual: { label: "Historical price", color: "#3b82f6" },
            predicted: { label: "Predicted price", color: "#f59e0b" },
          }}
          className="w-full"
          style={{ height }}
        >
          <ComposedChart data={combined} margin={{ top: 12, right: 20, left: 12, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 10", "dataMax + 10"]}
              tickFormatter={(v: number) => `$${Number(v).toFixed(0)}`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(v: string) =>
                new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
              }
              formatter={(value: unknown) => (typeof value === "number" ? `$${value.toFixed(2)}` : String(value))}
            />
            {lastActualDate && (
              <ReferenceLine
                x={lastActualDate}
                stroke="#6b7280"
                strokeDasharray="5 5"
                label={{ value: "Forecast start", position: "top", fill: "#6b7280", fontSize: 10 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Historical price"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#f59e0b", r: 2 }}
              name="Predicted price"
              connectNulls={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function StockAnalyzer() {
  const [symbolFromSelect, setSymbolFromSelect] = useState("AAPL");
  const [customSymbol, setCustomSymbol] = useState("");
  const [forecastDays, setForecastDays] = useState(14);
  const [forecastRequest, setForecastRequest] = useState<{ symbol: string; days: number } | null>(null);

  const marketQuery = useQuery({
    ...trpc.getMarketData.queryOptions(),
  });
  const availableSymbolsQuery = useQuery({
    ...trpc.getAvailableSymbols.queryOptions(),
  });
  const dataStatusQuery = useQuery({
    ...trpc.getDataStatus.queryOptions(),
  });
  const marketRows: MarketRow[] = marketQuery.data?.ok ? marketQuery.data.rows : [];
  const availableSymbols: string[] = availableSymbolsQuery.data?.ok ? availableSymbolsQuery.data.symbols : [];
  const dataStatus = dataStatusQuery.data;
  const stockOptions = useMemo(() => {
    if (marketRows.length > 0) {
      return marketRows
        .map((r) => ({ value: r.symbol, label: `${r.symbol} - ${r.name}` }))
        .sort((a, b) => a.value.localeCompare(b.value));
    }
    if (availableSymbols.length > 0) {
      return availableSymbols.map((s) => ({ value: s, label: s }));
    }
    return FALLBACK_STOCK_OPTIONS;
  }, [marketRows, availableSymbols]);

  useEffect(() => {
    const values = stockOptions.map((o) => o.value);
    if (values.length > 0 && !values.includes(symbolFromSelect)) {
      setSymbolFromSelect(stockOptions[0].value);
    }
  }, [stockOptions, symbolFromSelect]);

  const normalizedSymbol = customSymbol.trim().toUpperCase() || symbolFromSelect;
  const historyQuery = useQuery({
    ...trpc.getStockHistory.queryOptions({ symbol: normalizedSymbol }),
    enabled: normalizedSymbol.length > 0,
  });
  const history: OHLC[] = historyQuery.data?.ok ? historyQuery.data.data : [];
  const historyLoading = historyQuery.isLoading;

  const predictionQuery = useQuery({
    ...trpc.getStockPrediction.queryOptions({
      symbol: forecastRequest?.symbol ?? "",
      forecastDays: forecastRequest?.days ?? 10,
    }),
    enabled: !!forecastRequest,
  });
  const predictions: PredictionPoint[] = predictionQuery.data?.ok ? predictionQuery.data.predictions : [];
  const accuracy: PredictionAccuracy | null = predictionQuery.data?.ok ? predictionQuery.data.accuracy ?? null : null;

  const hasPredictions = forecastRequest && !predictionQuery.isLoading && predictions.length > 0;
  const hasHistory = history.length > 0;
  const hasResults = hasPredictions && hasHistory;

  const scrapedRow = forecastRequest
    ? marketRows.find((r) => r.symbol.toUpperCase() === forecastRequest.symbol.toUpperCase())
    : null;
  const currentPrice =
    scrapedRow?.price ??
    (history.length > 0 ? history[history.length - 1].close : predictions[0]?.predictedClose ?? null);

  return (
    <div className="w-full space-y-6">
      <Card className="rounded-lg border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Stock Prediction Analyzer
          </CardTitle>
          <CardDescription>
            Analyze stocks from web-scraped market data, generate predictions, and compare accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="analyzer-symbol">Stock Symbol</Label>
              <Select
                value={symbolFromSelect}
                onValueChange={(v) => {
                  setSymbolFromSelect(v);
                  setCustomSymbol("");
                }}
              >
                <SelectTrigger id="analyzer-symbol" className="w-full">
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                  {stockOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analyzer-custom">Or Enter Custom</Label>
              <Input
                id="analyzer-custom"
                placeholder="e.g., META"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analyzer-forecast">Forecast Period</Label>
              <Select value={String(forecastDays)} onValueChange={(v) => setForecastDays(Number(v))}>
                <SelectTrigger id="analyzer-forecast" className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {FORECAST_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                disabled={!normalizedSymbol || historyLoading || predictionQuery.isLoading}
                onClick={() => normalizedSymbol && setForecastRequest({ symbol: normalizedSymbol, days: forecastDays })}
                className="w-full gap-2"
              >
                {predictionQuery.isLoading ? (
                  "Analyzing…"
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
          {predictionQuery.isError && (
            <p className="mt-2 text-sm text-destructive">
              Error: {predictionQuery.error?.message ?? "Prediction failed."}
              {(predictionQuery.error?.message?.toLowerCase().includes("history not found") ||
                predictionQuery.error?.message?.toLowerCase().includes("not found")) && (
                <span className="block mt-1">
                  Run the market scrape first so that <code className="text-xs">{normalizedSymbol}_history.csv</code> exists in server/scripts/yahoo_top_100_output.
                </span>
              )}
              {(predictionQuery.error?.message?.toLowerCase().includes("script not found") ||
                predictionQuery.error?.message?.toLowerCase().includes("python")) && (
                <span className="block mt-1">
                  Ensure Python is installed and the server is run from the project root (or that server/scripts/predict_stock.py exists). Install pandas, numpy, and scikit-learn: <code className="text-xs">pip install pandas numpy scikit-learn</code>
                </span>
              )}
            </p>
          )}
          {!forecastRequest && normalizedSymbol && (
            <p className="mt-2 text-sm text-muted-foreground">
              Click &quot;Analyze&quot; to run the model. The chart will show actual and predicted overlaid (mirror) so you can compare accuracy.
            </p>
          )}
        </CardContent>
      </Card>

      {forecastRequest && predictionQuery.isLoading && (
        <Card className="rounded-lg border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium">Running prediction…</p>
            <p className="text-xs text-muted-foreground">
              Populating details from predicted CSV for comparison. Results will appear below.
            </p>
          </CardContent>
        </Card>
      )}

      {hasPredictions && currentPrice != null && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card size="sm" className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                Current price {scrapedRow ? "(scraped)" : hasHistory ? "(history)" : "(from prediction)"}
              </p>
              <p className="text-lg font-bold">${currentPrice.toFixed(2)}</p>
              <span className="text-xs text-muted-foreground">{forecastRequest!.symbol}</span>
            </Card>
            <Card size="sm" className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Predicted price</p>
              <p className="text-lg font-bold">${predictions[predictions.length - 1].predictedClose.toFixed(2)}</p>
              {predictions[predictions.length - 1].predictedClose >= currentPrice ? (
                <TrendingUp className="mt-1 h-5 w-5 text-emerald-500" />
              ) : (
                <TrendingDown className="mt-1 h-5 w-5 text-red-500" />
              )}
            </Card>
            <Card size="sm" className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Expected change</p>
              <p
                className={`text-lg font-bold ${
                  ((predictions[predictions.length - 1].predictedClose - currentPrice) / currentPrice) * 100 >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {(((predictions[predictions.length - 1].predictedClose - currentPrice) / currentPrice) * 100).toFixed(2)}%
              </p>
              <span className="text-xs text-muted-foreground">{forecastDays} days</span>
            </Card>
            <Card size="sm" className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Forecast period</p>
              <p className="text-lg font-bold">{forecastDays} days</p>
              <Target className="mt-1 h-5 w-5 text-muted-foreground" />
            </Card>
          </div>

          {hasResults ? (
            <AnalyzeChartRecharts
              actual={history}
              predicted={predictions}
              symbol={forecastRequest!.symbol}
              forecastDays={forecastDays}
              height={360}
            />
          ) : (
            <Card className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  Chart unavailable: historical data did not load for {forecastRequest!.symbol}. Summary and predicted values below use prediction data. Ensure <code className="text-xs">server/scripts/yahoo_top_100_output/{forecastRequest!.symbol}_history.csv</code> exists (run the market scrape).
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {accuracy != null && (
        <Card className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Prediction Accuracy Analysis
            </CardTitle>
            <CardDescription>
              Backtest: comparing predicted vs actual on last {accuracy.backtestDays} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">MAE</p>
                <p className="text-xl font-bold">${accuracy.mae.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">MAPE</p>
                <p className="text-xl font-bold">{accuracy.mape.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Backtest period</p>
                <p className="text-xl font-bold">{accuracy.backtestDays} days</p>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4" />
                Prediction quality feedback
              </h4>
              {accuracy.mape <= 5 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-emerald-600">Excellent prediction accuracy.</span> The model closely
                  mirrored actual movements. Use these predictions with higher confidence for decisions.
                </p>
              ) : accuracy.mape <= 15 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-amber-600">Good prediction accuracy.</span> The model captured general
                  trends with some deviation. Consider wider margins for risk management.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-red-600">Prediction accuracy needs improvement.</span> Significant
                  deviation from actuals. Consider shorter forecast periods or more data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {forecastRequest && !predictionQuery.isLoading && predictions.length > 0 && (
        <Card className="rounded-lg border bg-card">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Predicted values (compare below)</CardTitle>
                <CardDescription>Generated prediction data for the next {forecastDays} days — use the chart and accuracy section to compare.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => {
                  const header = "Date,Predicted_Close";
                  const rows = predictions.map((p) => `${p.date},${p.predictedClose}`);
                  const csv = [header, ...rows].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${forecastRequest!.symbol}_predicted.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[220px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">Predicted close</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.date} className="border-b">
                      <td className="p-2">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="p-2 text-right font-medium">${p.predictedClose.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {forecastRequest &&
        !predictionQuery.isLoading &&
        predictions.length === 0 &&
        predictionQuery.data?.ok && (
          <p className="text-sm text-muted-foreground">
            No predictions returned. Check that {forecastRequest.symbol}_history.csv exists in
            server/scripts/yahoo_top_100_output.
          </p>
        )}

      {dataStatus && (
        <Card className="rounded-lg border border-muted bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stored data status (troubleshooting)</CardTitle>
            <CardDescription>
              What the server sees. If the dropdown is empty or wrong, check these.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 font-mono">
            <p><span className="text-muted-foreground">Server cwd:</span> {dataStatus.cwd}</p>
            <p><span className="text-muted-foreground">Data directory:</span> {dataStatus.outputDir}</p>
            <p><span className="text-muted-foreground">Summary file exists:</span> {dataStatus.summaryExists ? "Yes" : "No"}</p>
            <p><span className="text-muted-foreground">History files (*_history.csv):</span> {dataStatus.historyCount}</p>
            {dataStatus.sampleSymbols.length > 0 && (
              <p><span className="text-muted-foreground">Sample symbols:</span> {dataStatus.sampleSymbols.join(", ")}</p>
            )}
            {dataStatus.hint && (
              <p className="text-amber-600 dark:text-amber-400 mt-2">{dataStatus.hint}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
