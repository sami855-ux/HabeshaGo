import { createLogger } from "@habeshago/logger";
import { env } from "../config/env";

export const logger = createLogger({
  service: "profile-service",
  level: env.LOG_LEVEL,
});
