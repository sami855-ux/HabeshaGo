import { parseEnv, csv, z } from "@habeshago/config";

const url = z.string().url();

export const env = parseEnv({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGINS: csv,
  REDIS_URL: url,
  JWT_ACCESS_SECRET: z.string().min(32),
  INTERNAL_JWT_SECRET: z.string().min(32),
  INTERNAL_TOKEN_TTL_SECONDS: z.coerce.number().default(60),
  MAX_BODY_BYTES: z.coerce.number().default(1048576),
  RATE_LIMIT_IP_PER_MINUTE: z.coerce.number().default(300),
  RATE_LIMIT_USER_PER_MINUTE: z.coerce.number().default(120),
  AUTH_SERVICE_URL: url,
  PROFILE_SERVICE_URL: url,
  MOBILITY_SERVICE_URL: url,
  TICKET_SERVICE_URL: url,
  PAYMENT_SERVICE_URL: url,
  PARKING_SERVICE_URL: url,
  EV_SERVICE_URL: url,
  EMPLOYEE_SERVICE_URL: url,
  NOTIFICATION_SERVICE_URL: url,
  REPORTING_SERVICE_URL: url,
});
