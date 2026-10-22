import { parseEnv, z } from "@habeshago/config";

export const env = parseEnv({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4002),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  INTERNAL_JWT_SECRET: z.string().min(16),
  INTERNAL_TOKEN_TTL_SECONDS: z.coerce.number().default(60),
  INTERNAL_SERVICE_TOKEN: z.string().default("habeshago_internal_secret_token_key_12345"),
  CDN_BASE_URL: z.string().default("https://cdn.habeshago.com"),
  STORAGE_UPLOAD_URL: z.string().default("https://storage.habeshago.com/upload"),
});
