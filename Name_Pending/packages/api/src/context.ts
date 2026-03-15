import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(_opts: CreateExpressContextOptions) {
  return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
