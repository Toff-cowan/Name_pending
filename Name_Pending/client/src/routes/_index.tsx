import { useQuery } from "@tanstack/react-query";
import type { MetaArgs } from "react-router";

import { trpc } from "@/utils/trpc";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WinLossChart } from "@/components/dashboard/win-loss-chart";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Watchlist } from "@/components/dashboard/watchlist";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { ChatbotButton } from "@/components/dashboard/chatbot-button";

export function meta({}: MetaArgs) {
  return [
    { title: "Dashboard | PI - Predictive Investments" },
    { name: "description", content: "PI - Predictive Investments dashboard" },
  ];
}

export default function Dashboard() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const marketQuery = useQuery(trpc.getMarketData.queryOptions());
  const scrapedAt =
    marketQuery.data?.ok && marketQuery.data.scrapedAt
      ? new Date(marketQuery.data.scrapedAt).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        })
      : null;

  return (
    <div className="min-h-full bg-background">
      {/* Full-width hero: image with PI centered, floating + glow */}
      <section className="relative w-full min-h-[320px] sm:min-h-[380px] md:min-h-[420px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
            alt=""
            className="h-full w-full object-cover"
            role="presentation"
          />
          <div className="absolute inset-0 bg-foreground/40" aria-hidden />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="hero-pi-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            PI
          </h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-background">
            <div>
              <span className="font-semibold">Predictive Investments</span>
              <span className="ml-2 text-background/80">· Dashboard</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-background/90">
              {healthCheck.data !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      healthCheck.data ? "bg-success" : "bg-destructive"
                    }`}
                    aria-hidden
                  />
                  API {healthCheck.data ? "Connected" : "Disconnected"}
                </span>
              )}
              {scrapedAt && (
                <span>Market data as of {scrapedAt}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Win/Loss Chart - Featured at top */}
        <WinLossChart />

        {/* Summary Cards */}
        <div className="mt-6">
          <SummaryCards />
        </div>

        {/* Performance Chart - Full width */}
        <div className="mt-6">
          <PerformanceChart />
        </div>

        {/* Secondary Content Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Watchlist />
          <NewsFeed />
        </div>
      </main>

      <ChatbotButton />
    </div>
  );
}
