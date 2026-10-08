import { createLogger } from "@habeshago/logger";
import { env } from "../config/env";

export const logger = createLogger({ service: "api-gateway", level: env.LOG_LEVEL });
