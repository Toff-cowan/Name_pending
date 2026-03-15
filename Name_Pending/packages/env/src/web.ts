import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.string().url().default("http://localhost:3000"),
    /** Google Gemini API key for lab stock prediction (optional; lab AI disabled if missing). */
    VITE_GEMINI_API_KEY: z.string().optional(),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
