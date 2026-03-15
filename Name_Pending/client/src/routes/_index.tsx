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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your portfolio overview.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {healthCheck.data !== undefined && (
              <span>API: {healthCheck.data ? "Connected" : "Disconnected"}</span>
            )}
            {scrapedAt && (
              <span>Market data as of {scrapedAt}</span>
            )}
          </div>
        </div>

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
