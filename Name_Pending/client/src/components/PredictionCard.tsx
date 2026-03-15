/**
 * Result card for the Lab: prediction badge, recommendation, confidence, rationale.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@pi/ui/components/card";
import { Button } from "@pi/ui/components/button";
import type {
  StockPrediction,
  PredictionDirection,
  Recommendation,
} from "@/types/stock";
import { cn } from "@pi/ui/lib/utils";
import { AlertTriangle } from "lucide-react";

const PREDICTION_STYLES: Record<
  PredictionDirection,
  { bg: string; text: string; border: string }
> = {
  BULLISH: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/40",
  },
  BEARISH: {
    bg: "bg-red-500/15 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/40",
  },
  NEUTRAL: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

const RECOMMENDATION_STYLES: Record<Recommendation, string> = {
  "STRONG BUY": "bg-emerald-600 text-white",
  BUY: "bg-emerald-500/80 text-white",
  HOLD: "bg-amber-500/80 text-white",
  SELL: "bg-red-500/80 text-white",
  "STRONG SELL": "bg-red-600 text-white",
};

function confidenceColor(confidence: number): string {
  if (confidence >= 70) return "bg-emerald-500";
  if (confidence >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export interface PredictionCardProps {
  prediction: StockPrediction;
  companyName?: string;
  analyzedAt: string;
  onAnalyzeAnother: () => void;
}

export function PredictionCard({
  prediction,
  companyName,
  analyzedAt,
  onAnalyzeAnother,
}: PredictionCardProps) {
  const [openSection, setOpenSection] = useState<"summary" | "technical" | "fundamental" | "sentiment" | "risks">("summary");
  const styles = PREDICTION_STYLES[prediction.prediction];
  const recStyle = RECOMMENDATION_STYLES[prediction.recommendation];

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl">
            {prediction.ticker}
            {companyName ? (
              <span className="ml-2 font-normal text-muted-foreground">
                {companyName}
              </span>
            ) : null}
          </CardTitle>
          <span className="text-sm text-muted-foreground">{analyzedAt}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-center text-lg font-semibold",
            styles.bg,
            styles.text,
            styles.border
          )}
        >
          {prediction.prediction}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              recStyle
            )}
          >
            {prediction.recommendation}
          </span>
          {prediction.timeframe && (
            <span className="text-sm text-muted-foreground">
              {prediction.timeframe}
            </span>
          )}
          {prediction.priceTarget != null && (
            <span className="text-sm text-muted-foreground">
              Price target: ${prediction.priceTarget.toFixed(2)}
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Confidence
          </p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", confidenceColor(prediction.confidence))}
              style={{ width: `${Math.min(100, Math.max(0, prediction.confidence))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {prediction.confidence}%
          </p>
        </div>

        <div className="border rounded-lg divide-y">
          {(
            [
              ["summary", "Summary", "summary"],
              ["technicalFactors", "Technical factors", "technical"],
              ["fundamentalFactors", "Fundamental factors", "fundamental"],
              ["sentimentFactors", "Sentiment factors", "sentiment"],
              ["risks", "Risks", "risks"],
            ] as const
          ).map(([k, label, sectionKey]) => {
              const content =
                k === "summary"
                  ? prediction.rationale.summary
                  : Array.isArray(prediction.rationale[k])
                    ? (prediction.rationale[k] as string[])
                    : null;
              const isRisks = k === "risks";
              const isOpen = openSection === sectionKey;
              return (
                <details
                  key={k}
                  open={isOpen || k === "summary"}
                  onToggle={() => setOpenSection(sectionKey)}
                  className="group"
                >
                  <summary className="list-none cursor-pointer px-4 py-3 hover:bg-muted/50 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isRisks && "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {isRisks && (
                        <AlertTriangle className="inline w-4 h-4 mr-2" />
                      )}
                      {label}
                    </span>
                  </summary>
                  <div
                    className={cn(
                      "px-4 pb-3 pt-0 text-sm",
                      isRisks && "text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {typeof content === "string" ? (
                      <p className="text-foreground/90">{content}</p>
                    ) : Array.isArray(content) && content.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {content.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                  </div>
                </details>
              );
            })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onAnalyzeAnother}
        >
          Analyze another stock
        </Button>
      </CardContent>
    </Card>
  );
}
