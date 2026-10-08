# API Gateway

The API Gateway is the single public entry point for HabeshaGo's microservices architecture. It handles cross-cutting concerns once so every service does not reimplement them.

## Stack
- Node.js & Express
- TypeScript
- Zod (via `@habeshago/config` & `@habeshago/api-contracts`)
- Redis & `ioredis`
- `http-proxy-middleware`
- Pino (via `@habeshago/logger`) & `pino-http`
- `prom-client`

## Capabilities
- Route and proxy requests to microservices
- Authenticate users via JWT and mint a trusted internal identity token (`x-internal-token`)
- Coarse authorization per route (role-based)
- Rate limiting (IP, authenticated user, strict auth endpoints) backed by Redis
- Request size limit, CORS, and security headers (Helmet)
- Circuit breaking and timeouts per upstream service
- Request IDs (`x-request-id`), structured logging, and Prometheus metrics
- Health (`/health`) and readiness (`/ready`) endpoints
- WebSocket upgrade proxying with authentication (for mobility live tracking)

## Directory Structure
```text
src/
├── config/
│   ├── env.ts              # Zod-validated environment config
│   └── services.ts         # Declarative service routing and proxy policies
├── middleware/
│   ├── request-id.ts       # UUID / header propagation
│   ├── security.ts         # Helmet, CORS, gzip compression
│   ├── rate-limit.ts       # Redis-backed IP, user, and auth rate limits
│   ├── payload-limit.ts    # Enforce MAX_BODY_BYTES
│   ├── authenticate.ts     # JWT verification and user context
│   ├── authorize.ts        # Role checks
│   ├── identity-headers.ts # Strip client headers, sign x-internal-token
│   ├── not-found.ts        # Standard 404
│   └── error-handler.ts    # Standardized error response envelope
├── proxy/
│   ├── circuit-breaker.ts  # 3-state circuit breaker
│   ├── create-proxy.ts     # http-proxy-middleware factory with timeouts & breaker
│   └── register-routes.ts  # Express route registration
├── infrastructure/
│   ├── redis.ts            # Redis client connection
│   └── cache.ts            # Optional Redis cache helpers
├── observability/
│   ├── logger.ts           # Pino logger
│   ├── metrics.ts          # Prometheus registry and metrics
│   └── health.ts           # /health and /ready checks
├── shared/
│   ├── errors.ts           # Gateway HttpError classes
│   └── types.ts            # AuthUser & Request augmentations
├── app.ts                  # Express application setup
└── server.ts               # HTTP server, WebSocket upgrades, graceful shutdown
```

## Running

```bash
# Development
npm run dev

# Build
npm run build

# Start production build
npm run start

# Tests
npm run test

# Typecheck
npm run typecheck
```
