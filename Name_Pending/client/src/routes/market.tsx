import type { Route } from "./+types/market";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Market Details | Name_Pending" },
    { name: "description", content: "View market details and data" },
  ];
}

export default function MarketDetails() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">Market Details</h1>
      <p className="text-muted-foreground">
        Market data, instruments, and detailed views will appear here.
      </p>
      <section className="mt-6 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">Content coming soon.</p>
      </section>
    </div>
  );
}
