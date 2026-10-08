import { parseEnv, z } from "@habeshago/config";

// Normalize JWT_SECRET to JWT_ACCESS_SECRET if present
if (!process.env.JWT_ACCESS_SECRET && process.env.JWT_SECRET) {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_SECRET;
}

export const env = parseEnv({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4001),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev_refresh_secret_min_16_chars"),
  INTERNAL_JWT_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
});
