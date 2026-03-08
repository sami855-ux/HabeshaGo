import { Redis } from "@upstash/redis"
import dotenv from "dotenv"
dotenv.config()

// init redis
export const redis = new Redis({
  url: "https://sacred-manatee-35685.upstash.io",
  token: "AYtlAAIncDJhNzkwYWY2OWJjOTU0MjkwOGMxM2VkOGFlODM3YmQxNXAyMzU2ODU",
})
