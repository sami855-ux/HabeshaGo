import { createLogger } from "@habeshago/logger";
import { env } from "../config/env";

export const logger = createLogger({
  service: "auth-service",
  level: env.LOG_LEVEL,
});
