# HabeshaGo API Gateway: Architecture and Operational Guide

## 1. Executive Purpose & Architectural Boundaries

The API Gateway is HabeshaGo's **single public HTTP & WebSocket ingress**. It concentrates all cross-cutting infrastructure concerns into one place so downstream microservices never reimplement them.

### What the Gateway Does
- **Routing & Proxying**: Reverse-proxies client traffic (`/api/v1/*`) to 10 private microservices using non-blocking HTTP streaming.
- **Identity & Trust Boundary**: Validates public client access tokens (JWTs) and mints a short-lived, cryptographically signed internal identity token (`x-internal-token`) for microservices.
- **Traffic Protection**: Enforces payload size limits (1MB), rate limits (per IP, per user, and strict limits on auth routes), CORS, and security headers (Helmet).
- **Resilience & Fault Isolation**: Per-service circuit breakers (3-state) and timeouts to protect the platform from cascading upstream failures.
- **Real-time Streaming**: Authenticates and proxies WebSocket upgrade handshakes (e.g., live vehicle tracking in Mobility Service).
- **Observability**: Request correlation IDs (`x-request-id`), Prometheus metrics (`/metrics`), structured Pino logging, and Kubernetes health probes (`/health`, `/ready`).

### What the Gateway Does NOT Do
- **No Domain Business Logic**: Does not process payments, issue tickets, calculate bus fares, or manage fleet schedules.
- **No Database / Prisma**: Owns no Postgres schema and executes no SQL. Its only operational data store is Redis (for rate limits and caching).
- **No Event Publishing**: Does not publish or consume Kafka/RabbitMQ events; does not run outbox/inbox background workers.
- **No Payload Mutation**: Streams request/response bodies without JSON parsing or restructuring.

---

## 2. Request Lifecycle & Middleware Pipeline

Order is critical. Each middleware layer shields the layers that follow:

```text
[ Client (Mobile / Web App) ]
              │
              ▼
    1. Request ID (x-request-id)               Generates/validates UUID
              │
              ▼
    2. Structured Access Logger (pino-http)    Logs method, URL, status, latency
              │
              ▼
    3. Security Headers (Helmet) & CORS        Sanitizes headers, validates allowed origins
              │
              ▼
    4. Gzip Compression                        Gzips responses (skips SSE streams)
              │
              ▼
    5. Payload Size Guard (Content-Length)     Rejects bodies > MAX_BODY_BYTES (413)
              │
              ▼
    6. IP Rate Limiter (Redis)                 Global IP throttle (300 req/min)
              │
              ├─▶ GET /health                  Liveness probe (200 OK)
              ├─▶ GET /ready                   Readiness probe (Redis ping)
              └─▶ GET /metrics                 Prometheus scraper endpoint
              │
              ▼
    7. Authentication Filter                   Validates JWT; exempts publicRules
              │
              ▼
    8. Route Authorization                     Checks required roles (e.g. admin, employee)
              │
              ▼
    9. User Rate Limiter (Redis)               Authenticated user throttle (120 req/min)
              │
              ▼
   10. Identity Trust Boundary                 Strips client identity headers;
                                               Attaches signed x-internal-token
              │
              ▼
   11. Circuit Breaker Guard                   Rejects fast if upstream is failing (503)
              │
              ▼
   12. Streaming Proxy (http-proxy-middleware) Pipes body to microservice with timeout
              │
              ▼
[ Downstream Service (e.g., Ticket Service) ]
```

> **Why `express.json()` is NOT used globally**: Parsing the request body into a JavaScript object consumes the Node.js readable stream. If the gateway parses the body, the proxied request to the upstream service will hang or arrive with an empty body. The gateway streams the raw TCP payload directly.

---

## 3. The Trust Boundary (Zero-Trust Security)

Downstream microservices sit on a private Docker/VPC network and **never accept untrusted client headers directly**.

```text
Untrusted Client Headers                  Gateway Trust Barrier               Trusted Internal Request
┌─────────────────────────┐               ┌────────────────────┐               ┌───────────────────────────┐
│ x-user-id: "admin-123"  │ ────────────▶ │ 1. Strip untrusted │ ────────────▶ │ x-request-id: <uuid>      │
│ x-user-roles: "ADMIN"   │               │    headers         │               │ x-user-id: <verified-id>  │
│ x-internal-token: "..." │               │ 2. Verify token    │               │ x-user-roles: "PASSENGER" │
│ Authorization: Bearer   │               │ 3. Sign new token  │               │ x-internal-token: <jwt>   │
└─────────────────────────┘               └────────────────────┘               └───────────────────────────┘
```

### Identity Transformation
1. When a request arrives, `identityHeaders` middleware **deletes** any client-supplied identity headers:
   - `x-user-id`
   - `x-user-roles`
   - `x-session-id`
   - `x-internal-token`
   - `x-forwarded-user`
2. If the user is authenticated, the gateway mints a fresh **`x-internal-token`**:
   - **Algorithm**: `HS256`
   - **Issuer**: `"api-gateway"`
   - **Audience**: `"internal-services"`
   - **TTL**: 60 seconds (`INTERNAL_TOKEN_TTL_SECONDS`)
   - **Payload**: `{ sub: user.id, roles: user.roles, sid: user.sessionId, rid: req.id }`

### Downstream Service Verification
Each downstream microservice mounts the shared middleware from `@habeshago/api-contracts`:

```typescript
import { requireGateway } from "@habeshago/api-contracts";

// Rejects any request lacking a valid, unexpired internal token
app.use(requireGateway(process.env.INTERNAL_JWT_SECRET));
```
Direct access to a service from outside or bypassing the gateway is strictly blocked.

---

## 4. Upstream Microservice Routing Table

Routes are declaratively registered in [`src/config/services.ts`](file:///home/sam/Documents/Code-Project/HabeshaGo/backend/apps/api-gateway/src/config/services.ts). Adding a service requires only one configuration entry:

| Service | Route Prefix | Target Env Var | Auth Policy | Timeout | WebSocket |
|---|---|---|---|---|:---:|
| **Auth** | `/api/v1/auth` | `AUTH_SERVICE_URL` | User (Login, register, Google OAuth exempt via `publicRules`) | 8s | No |
| **Profile** | `/api/v1/profiles` | `PROFILE_SERVICE_URL` | User | 8s | No |
| **Mobility** | `/api/v1/mobility` | `MOBILITY_SERVICE_URL` | User | 10s | **Yes** |
| **Ticket** | `/api/v1/tickets` | `TICKET_SERVICE_URL` | User | 10s | No |
| **Payment** | `/api/v1/payments` | `PAYMENT_SERVICE_URL` | User (Chapa webhook is public) | 15s | No |
| **Parking** | `/api/v1/parking` | `PARKING_SERVICE_URL` | User | 8s | No |
| **EV** | `/api/v1/ev` | `EV_SERVICE_URL` | User | 8s | No |
| **Employee**| `/api/v1/employees` | `EMPLOYEE_SERVICE_URL` | Roles: `admin`, `employee` | 8s | No |
| **Notification** | `/api/v1/notifications`| `NOTIFICATION_SERVICE_URL`| User | 8s | No |
| **Reporting** | `/api/v1/reports` | `REPORTING_SERVICE_URL` | Roles: `admin` | 25s | No |

---

## 5. Resilience & Fault Isolation

### 3-State Circuit Breaker
Every upstream microservice is shielded by an independent `CircuitBreaker` instance:

```text
              [ 5 consecutive 5xx errors ]
    ┌──────────────────────────────────────────────┐
    ▼                                              │
┌────────┐    Cooldown (15s)    ┌──────────┐       │
│ CLOSED │ ───────────────────▶ │   OPEN   │ ──────┘
└────────┘                      └──────────┘
    ▲                                │
    │ Success                        │ Probe request
    │                                ▼
    └────────────────────────── ┌───────────┐
                                │ HALF-OPEN │
                                └───────────┘
```

- **CLOSED**: Traffic flows normally to the microservice.
- **OPEN**: Upstream has failed 5 consecutive times (`failureThreshold`). The gateway rejects requests immediately with `503 SERVICE_UNAVAILABLE` without putting load on the failing service.
- **HALF-OPEN**: After a 15-second cooldown (`cooldownMs`), one probe request is permitted through.
  - If it succeeds $\rightarrow$ state resets to **CLOSED**.
  - If it fails $\rightarrow$ breaker reopens for another cooldown period.
- **4xx vs 5xx Behavior**: Client errors (`400 Bad Request`, `404 Not Found`) **never** trip the circuit breaker. Only upstream connection errors (`ECONNREFUSED`, `ETIMEDOUT`) and `5xx` server errors count as breaker failures.

### Upstream Timeout Mapping
- Upstream connection timeouts (`proxyTimeout`) are caught and mapped directly to `504 UPSTREAM_TIMEOUT`.
- Connection refused errors (`ECONNREFUSED`) are mapped to `503 SERVICE_UNAVAILABLE`.
- All errors are formatted into the standardized `@habeshago/api-contracts` JSON envelope:
  ```json
  {
    "error": {
      "code": "UPSTREAM_TIMEOUT",
      "message": "mobility is temporarily unavailable",
      "requestId": "c1f77d85-3e28-485a-a302-36c5617a942b"
    }
  }
  ```

---

## 6. WebSocket Upgrade Flow (Live Tracking)

Because WebSocket upgrade handshakes bypass standard Express route middleware chains, [`src/server.ts`](file:///home/sam/Documents/Code-Project/HabeshaGo/backend/apps/api-gateway/src/server.ts) intercepts HTTP `upgrade` events directly:

```text
Client ──[ Upgrade request + Bearer token ]──▶ Gateway HTTP Server
                                                     │
                                       1. Match route prefix (/api/v1/mobility)
                                       2. Verify JWT token
                                       3. Strip client headers
                                       4. Attach signed x-internal-token
                                                     │
                                                     ▼
                                      Proxy Socket to Mobility Service
```

- **Token Sources**: Accepts tokens via `Authorization: Bearer <token>` header (preferred by React Native) or `?access_token=<token>` query parameter.
- **Unauthorized Handling**: If the token is invalid or missing, the socket is immediately terminated with `HTTP/1.1 401 Unauthorized`.

---

## 7. Distributed Rate Limiting (Redis)

Rate limiting is powered by `ioredis` and `rate-limit-redis`:

1. **IP Rate Limit**: Enforced globally across all unauthenticated requests (300 requests per minute).
2. **User Rate Limit**: Enforced per user ID on authenticated endpoints (120 requests per minute).
3. **Strict Auth Rate Limit**: Mounted specifically on `/api/v1/auth/login` and `/api/v1/auth/register` to prevent brute-force attacks (20 requests per 15 minutes).
4. **Resilience**: Configured with `passOnStoreError: true`. If Redis becomes temporarily unreachable, requests are allowed through so that a cache/rate-limiter outage does not take down the entire API Gateway.

---

## 8. Observability & Monitoring

### Metrics (`/metrics`)
Exposes standard Prometheus scrape metrics using `prom-client`:
- `gateway_http_request_duration_seconds`: Histogram measuring latency by `method`, `route`, `status`, and `service`.
- `gateway_circuit_breaker_open`: Gauge showing `1` when a service circuit breaker is tripped open.
- `gateway_rate_limited_total`: Counter tracking rejected requests by `scope` (`ip`, `user`, or `auth`).

### Health Checks
- `GET /health` (Liveness): Returns `200 {"status":"ok"}` immediately to verify the process is alive.
- `GET /ready` (Readiness): Pings Redis. Returns `200 {"status":"ready","checks":{"redis":"up"}}` when healthy, or `503 {"status":"not_ready","checks":{"redis":"down"}}` if Redis is offline.

### Structured Logging
- **Development**: Clean, colored, single-line timestamps and error traces formatted by `pino-pretty`.
- **Production**: High-speed JSON log stream formatted with uppercase severity levels (`INFO`, `WARN`, `ERROR`), ISO timestamps, and automatic redaction of bearer tokens, cookies, and passwords.

---

## 9. Common Operational Commands

```bash
# Navigate to backend workspace
cd backend

# Start development server (with hot reload & pretty logs)
npm run dev

# Run all unit, integration, and contract tests (24/24 tests)
npm test

# Run TypeScript compiler checks
npm run typecheck

# Build compiled production artifacts into dist/
npm run build

# Start production server
npm start
```
