import { Redis } from "@upstash/redis"
import dotenv from "dotenv"
dotenv.config()

class InMemoryCache {
  constructor() {
    this.store = new Map()
  }

  _isExpired(item) {
    return item && item.expiresAt !== null && Date.now() > item.expiresAt
  }

  async get(key) {
    const item = this.store.get(key)
    if (!item) return null
    if (this._isExpired(item)) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  async set(key, value, options = {}) {
    let expiresAt = null
    if (options?.ex) {
      expiresAt = Date.now() + options.ex * 1000
    } else if (options?.px) {
      expiresAt = Date.now() + options.px
    }

    if (options?.nx) {
      const existing = await this.get(key)
      if (existing !== null) return null
    }

    this.store.set(key, { value, expiresAt })
    return "OK"
  }

  async del(...keys) {
    const flatKeys = Array.isArray(keys[0]) ? keys[0] : keys
    let count = 0
    for (const k of flatKeys) {
      if (this.store.delete(k)) count++
    }
    return count
  }

  async incr(key) {
    const item = this.store.get(key)
    let num = 0
    if (item && !this._isExpired(item)) {
      num = Number.parseInt(item.value, 10) || 0
    }
    num += 1
    const expiresAt = item ? item.expiresAt : null
    this.store.set(key, { value: num.toString(), expiresAt })
    return num
  }

  async expire(key, seconds) {
    const item = this.store.get(key)
    if (!item || this._isExpired(item)) return 0
    item.expiresAt = Date.now() + seconds * 1000
    return 1
  }

  async getdel(key) {
    const val = await this.get(key)
    if (val !== null) this.store.delete(key)
    return val
  }

  async keys(pattern) {
    const now = Date.now()
    const results = []
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`)
    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.store.delete(key)
        continue
      }
      if (regex.test(key)) results.push(key)
    }
    return results
  }

  async ping() {
    return "PONG"
  }
}

const memoryFallback = new InMemoryCache()

let upstashClient = null
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL.startsWith("http")
) {
  try {
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (err) {
    console.warn("⚠️ Failed to initialize Upstash Redis client. Using in-memory cache fallback.", err.message)
  }
}

let upstashDisabled = false
let lastFailureTime = 0
const RETRY_COOLDOWN_MS = 60000 // Retry Upstash after 60s

const createResilientRedis = () => {
  const handler = {
    get(target, prop) {
      return async (...args) => {
        // If Upstash client is missing or currently cooled down, use memory fallback immediately
        const isCooldown = upstashDisabled && Date.now() - lastFailureTime < RETRY_COOLDOWN_MS
        if (!upstashClient || isCooldown) {
          if (typeof memoryFallback[prop] === "function") {
            return memoryFallback[prop](...args)
          }
          return null
        }

        try {
          if (typeof upstashClient[prop] === "function") {
            const res = await upstashClient[prop](...args)
            // On success, reset cooldown state
            upstashDisabled = false
            return res
          }
        } catch (error) {
          // Upstash failed (e.g. DNS ENOTFOUND, network timeout, credentials error)
          if (!upstashDisabled) {
            console.warn(
              `⚠️ Upstash Redis error (${error.message}). Failing over to in-memory cache for ${RETRY_COOLDOWN_MS / 1000}s.`,
            )
          }
          upstashDisabled = true
          lastFailureTime = Date.now()

          // Execute operation on in-memory fallback
          if (typeof memoryFallback[prop] === "function") {
            return memoryFallback[prop](...args)
          }
        }

        return null
      }
    },
  }

  return new Proxy({}, handler)
}

export const redis = createResilientRedis()
