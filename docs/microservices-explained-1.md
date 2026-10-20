# HabeshaGo Microservices Architecture and Implementation Blueprint

**Status:** Normative target architecture  
**Applies to:** every new backend service, migration, API, event, deployment, and integration  
**Source:** HabeshaGo Microservices Requirements Specification v1.1

This document is the practical implementation reference for the intended HabeshaGo microservices architecture. It expands the Microservices Requirements Specification into the rules developers follow when building, deploying, connecting, operating, and changing services.

It is a target architecture, not a claim that the current single backend has already been split into these services.

## 1. The simple idea

A microservice is a small backend application that owns one business capability from start to finish:

```text
Ticket Service owns bookings and tickets.
Payment Service owns payment attempts and payment status.
Mobility Service owns vehicles, routes, trips, and live locations.
```

Each service has its own code, API, data store, deployment, logs, and team responsibility. It can be changed or scaled without redeploying unrelated services.

The important rule is not “many small servers.” It is **clear ownership**:

> A service owns its business capability, its data, and the rules that change that data. Other services use its API or its published events; they never edit its database directly.

For example, a ticket is paid only when Ticketing receives an authoritative payment outcome from Payment. Ticketing must not update a `payments` table itself, and Payment must not insert an `issued` ticket itself.

## 2. The HabeshaGo system at a glance

```text
 Web App / Mobile App / Driver App / Admin App
                    |
                 HTTPS
                    v
          api.habeshago.com (API Gateway)
                    |
     +--------------+------------------------------+
     |              |                              |
     v              v                              v
 Auth Service   Mobility Service              Ticket Service
     |              |                              |
  Auth DB      Mobility DB                   Ticket DB
     |                                             |
     |                              synchronous request when needed
     |                                             v
     |                                      Payment Service ----> Chapa
     |                                             |
     |                                        Payment DB
     |                                             |
     +-------------------- published event --------+
                                                   v
                                          Message Broker
                                           /       |       \
                                          v        v        v
                                   Ticketing  Notification Reporting
```

The client normally knows only one public address: `https://api.habeshago.com`. The gateway sends a request to the correct internal service. Browser and mobile clients must not call internal service addresses or databases.

## 3. What each service owns

| Service | Owns | Does not own |
| --- | --- | --- |
| API Gateway | Public routing, rate limits, CORS, request IDs, coarse token checks | Ticket, payment, route, or parking business rules |
| Auth | Identity, credentials, OTP/MFA, sessions, roles, token issue/refresh/revocation | Profiles, tickets, payments |
| Profile | Display profile, preferences, emergency contacts, profile image | Passwords, OTPs, token sessions |
| Mobility | Vehicles, drivers, routes, stops, schedules, trips, live vehicle locations | Ticket sales and payment records |
| Ticketing | Bookings, reservations, fares, ticket lifecycle, QR validation | Chapa integration and payment ledger |
| Payment | Payment attempts, provider references, webhook verification, refunds, reconciliation | Ticket issuance, parking session completion, charging-session rules |
| Parking | Facilities, slots, reservations, parking sessions, parking rates | Payment-provider secrets and transactions |
| EV | Stations, ports, reservations, charging sessions and rates | Payment-provider secrets and transactions |
| Employee Transport | Organizations, employee routes, pickup points, subscriptions | General authentication credentials |
| Notification | Delivery requests and delivery outcomes for email, SMS, push, and in-app notices | The source business record it announces |
| Reporting | Read-only reporting projections and aggregates | Transactional source-of-truth records |

One domain should have one owner. If a future Ride-Hailing service needs payments, it uses Payment Service; it does not copy Chapa code into its own service.

## 4. Separate databases: what it really means

### 4.1 Ownership is the requirement

Each service gets its own database boundary and a database credential that has access only to that boundary.

```text
auth-service       -> auth_db
mobility-service   -> mobility_db
ticket-service     -> ticket_db
payment-service    -> payment_db
parking-service    -> parking_db
ev-service         -> ev_db
```

On day one these may be separate databases on one managed PostgreSQL cluster. Later they can move to separate PostgreSQL instances without changing the service contract. The essential protections are:

1. Payment Service's database user can access only `payment_db`.
2. Ticket Service's database user can access only `ticket_db`.
3. No service imports another service's Prisma schema, ORM repository, migration, or connection string.
4. Only the owning service runs migrations for its database.

Using one PostgreSQL server is an infrastructure decision. Using a shared table such as `payments` from Ticket Service is a broken service boundary.

### 4.2 Why not use one shared database?

A shared database makes services appear independent while keeping them tightly coupled. A payment schema change can silently break ticket creation; a developer can bypass validation rules; and deployments cannot be safely independent.

Correct interaction:

```text
Ticket Service -- POST /internal/v1/payments --> Payment Service --> payment_db
```

Incorrect interaction:

```text
Ticket Service -- SQL UPDATE payments ... --> payment_db
```

### 4.3 How services refer to each other’s data

Services store stable external IDs, not foreign keys into another service database.

```text
Ticket DB booking
  id: booking_123
  passengerId: usr_456       # Auth user ID, not a foreign key into auth_db
  tripId: trip_789           # Mobility ID, not a foreign key into mobility_db
  paymentId: pay_987         # Payment ID, not a foreign key into payment_db
```

The application checks cross-service validity through an API call or event. PostgreSQL cannot enforce foreign keys across independently owned databases, so services must design for missing, delayed, or repeated messages.

## 5. How services communicate over the internet

There are two valid communication styles. Choose based on whether the caller needs an answer immediately.

### 5.1 Synchronous HTTP/REST: use it when the answer is needed now

Example: Ticket Service needs to create a payment checkout for a booking. It makes an authenticated request to Payment Service and waits for a result.

```text
Ticket Service
    |
    | POST https://payment.internal/v1/payments
    | Authorization: Bearer <service token>
    | X-Request-Id: req_abc
    | Idempotency-Key: booking_123:payment:1
    v
Payment Service
    |
    v
Payment DB
```

The response can return a `paymentId`, its current status, and the Chapa checkout URL. HTTP is appropriate because the user cannot continue payment without this result.

Rules for internal HTTP calls:

- Use private/internal URLs or private networking; do not expose service ports publicly.
- Use HTTPS/TLS even on private networks where supported.
- Authenticate the calling service with short-lived audience-scoped service JWTs, mTLS, or a managed workload identity.
- Set a short timeout, usually a few seconds; never wait forever.
- Retry only safe/idempotent requests with bounded exponential backoff.
- Send `X-Request-Id` / trace context on every hop.
- Validate request and response schemas. An HTTP 200 with malformed data is still a failure.
- Do not forward a raw browser access token blindly as service identity. Keep the end-user context separate from the service credential.

### 5.2 Asynchronous events: use them when the work can happen later

Example: Chapa confirms payment. Payment Service commits its local result, publishes `payment.completed`, and does not wait for Ticketing or Notification to finish.

```text
Payment Service -> Payment DB -> Message Broker -> Ticket Service
                                            |        Notification Service
                                            |        Reporting Service
```

This keeps the payment webhook fast and prevents a notification outage from blocking ticket issuance. Candidate brokers for the first version are RabbitMQ, Redis Streams, or NATS. Kafka is not required initially.

An event is a statement of fact in the past: `payment.completed`, not a command such as `issueTicketNow`.

Every event must include a stable ID and a version:

```json
{
  "eventId": "evt_01J...",
  "eventType": "payment.completed",
  "version": 1,
  "source": "payment-service",
  "occurredAt": "2026-10-08T10:00:00.000Z",
  "correlationId": "req_abc",
  "payload": {
    "paymentId": "pay_987",
    "userId": "usr_456",
    "amount": 10000,
    "currency": "ETB",
    "referenceType": "BUS_TICKET",
    "referenceId": "booking_123"
  }
}
```

Amounts should be stored and exchanged in minor units (for example, cents/santim equivalent) or as carefully defined decimal strings—never JavaScript floating-point values.

## 6. Reliable events: the outbox pattern

The hardest microservice problem is not sending a message; it is ensuring the database write and the message agree.

Bad sequence:

```text
1. Mark payment SUCCESS in payment_db
2. Publish payment.completed
3. Broker is down -> no event
```

Ticketing never learns that the customer paid.

Use a transactional outbox instead:

```text
1. In one Payment DB transaction:
   - update Payment to SUCCESS
   - insert an outbox row containing payment.completed
2. Commit once.
3. An outbox worker reads unpublished rows and publishes them to the broker.
4. It marks the row published only after broker acknowledgement.
```

Consumers must be idempotent because brokers normally provide **at-least-once** delivery. A consumer may see the same event more than once.

```text
Ticket Service receives payment.completed(evt_01J...)
  -> insert eventId into processed_events with a unique constraint
  -> if already present, acknowledge and do nothing
  -> otherwise issue ticket and commit
```

Do not promise “exactly once” across databases and a broker. Build idempotent producers and consumers instead.

## 7. Detailed example: buying a bus ticket

This is the most important example because it shows HTTP, events, independent databases, and failure recovery together.

```text
1. Passenger -> Gateway -> Ticketing: create booking for a trip.
2. Ticketing -> Mobility (HTTP): verify trip and seat availability.
3. Mobility replies available; Ticketing records BOOKING_CREATED / PAYMENT_PENDING in ticket_db.
4. Ticketing -> Payment (HTTP): create payment with referenceType=BUS_TICKET,
   referenceId=booking_123, and an idempotency key.
5. Payment records PENDING in payment_db and returns Chapa checkout details.
6. Passenger pays on Chapa.
7. Chapa -> Payment webhook: Payment verifies signature and provider result.
8. Payment changes only its own payment to SUCCESS and writes payment.completed to its outbox.
9. Broker delivers payment.completed to Ticketing.
10. Ticketing idempotently changes its booking to PAID/ISSUED and creates the ticket.
11. Ticketing writes ticket.issued to its outbox.
12. Notification sends the passenger confirmation; Reporting updates sales totals.
```

If Ticketing is temporarily unavailable at step 9, Payment remains correct. The broker redelivers the event later. The passenger must not be charged again, and the ticket must be issued only once.

### Booking and payment state should be explicit

```text
Booking: CREATED -> PAYMENT_PENDING -> PAID -> ISSUED
                                  \-> PAYMENT_FAILED / EXPIRED / CANCELLED

Payment: PENDING -> PROCESSING -> SUCCESS
                              \-> FAILED / CANCELLED / REFUNDED
```

Ticketing does not infer payment success from a client redirect. Only a verified Payment Service result is authoritative.

## 8. Payment, Parking, and EV use the same payment boundary

Payment is generic. It knows an amount, user, provider, status, idempotency key, and reference—not the business rules of a bus seat, parking slot, or charging port.

```text
Ticketing -> Payment: referenceType=BUS_TICKET, referenceId=booking_123
Parking   -> Payment: referenceType=PARKING_SESSION, referenceId=park_456
EV        -> Payment: referenceType=CHARGING_SESSION, referenceId=charge_789
```

Only Payment Service holds Chapa credentials and accepts Chapa webhooks. This gives one place to enforce provider-signature verification, duplicate-webhook safety, reconciliation, refunds, and financial audit records.

## 9. Authentication and authorization across services

Auth Service answers **who is this person?** It owns registration, login, OTP/MFA, access and refresh tokens, sessions, and roles.

Each business service answers **may this authenticated person perform this action on this resource?** For example:

```text
Auth proves:       user usr_456 has role PASSENGER.
Ticketing decides: usr_456 may cancel booking_123 only if it belongs to usr_456,
                    is cancellable, and has not passed the policy deadline.
```

Recommended request path:

```text
Client -> Gateway: Bearer access token
Gateway -> service: validated user context + service credential / trusted internal header
Service: verifies trusted context and enforces resource-level authorization
```

For a first version, services can verify the Auth Service’s short-lived signed access token with its public key/JWKS. The token must contain only necessary claims, have an audience appropriate to the service, and be checked for issuer, expiry, token type, and session status according to the existing auth contract.

Internal service identity is separate from user identity:

```text
User identity:    usr_456, role PASSENGER
Calling service:  ticket-service
Target audience:  payment-service
```

Never put payment-provider keys, database passwords, refresh tokens, or MFA secrets in a browser, mobile bundle, event payload, or log.

## 10. API Gateway: what it should and should not do

The gateway is the safe front door.

It should:

- terminate public TLS and enforce CORS;
- apply request-size limits and rate limits;
- assign/request a correlation ID;
- route `/api/v1/tickets/*` to Ticketing and so on;
- reject malformed or unauthenticated public requests early;
- expose stable public API versions;
- return controlled service-unavailable responses when an upstream is unhealthy.

It should not:

- own ticket, payment, parking, or route business rules;
- directly query service databases;
- become a second “god backend” containing every controller;
- turn one client request into a large chain of synchronous service calls.

## 11. Redis and Socket.IO

Redis is shared infrastructure, not a shared business database. It is suitable for cache entries, rate limits, OTP temporary state, distributed locks, idempotency coordination, and the latest vehicle location.

```text
vehicle:veh_123:location -> { latitude, longitude, recordedAt }
```

The Mobility database remains the source of truth for durable trip/location history. Redis can be cleared or expire without losing financial or ticket data.

For live tracking:

```text
Driver App -- WebSocket --> Mobility Service -- WebSocket --> subscribed passengers/admins
```

When Mobility has multiple instances, use the Socket.IO Redis adapter so a passenger connected to instance A can receive an update received by instance B. Authenticate the socket handshake and authorize each room; a passenger must not subscribe to arbitrary vehicle or organization streams.

## 12. Deployment and networking

The monorepo can contain all services while each remains independently deployable:

```text
apps/auth-service       -> habeshago-auth-service
apps/mobility-service   -> habeshago-mobility-service
apps/ticket-service     -> habeshago-ticket-service
apps/payment-service    -> habeshago-payment-service
apps/api-gateway        -> habeshago-api-gateway
```

On Render or another cloud platform:

- Only the API Gateway and provider webhook endpoint need public internet ingress.
- Service HTTP endpoints use private network addresses where the platform supports them.
- PostgreSQL, Redis, and the message broker are private; they are not public web services.
- Each service has its own environment variables and its own least-privilege database credential.
- Each service exposes `/health`; `/ready` should fail when it cannot safely accept work.
- A change to Payment Service deploys Payment Service, not every service.

Example local ports are useful for development only:

```text
4000 gateway     4001 auth       4002 mobility
4003 ticketing   4004 payment    4005 parking
4006 ev          4007 employee   4008 notifications
```

## 13. Failure handling rules

In a distributed system, partial failures are normal.

| Failure | Correct behaviour |
| --- | --- |
| Notification is down | Do not roll back a paid ticket; retry notification asynchronously. |
| Ticketing is down after payment | Payment stays successful; `payment.completed` is retained and Ticketing catches up. |
| Chapa webhook is duplicated | Payment processes it once using provider event/reference idempotency. |
| Client retries payment creation | Return the original payment for the same idempotency key. |
| Mobility is unavailable while creating a booking | Fail quickly or offer retry; do not reserve a seat without authoritative availability. |
| Broker is unavailable | Keep the event in the transactional outbox and retry publishing. |
| A consumer receives an event twice | Record the event ID and make the second delivery a no-op. |

Avoid distributed database transactions and two-phase commit between services. Use local database transactions plus idempotency, outbox publishing, compensating actions, and explicit state machines.

## 14. Contracts and versioning

Every public API, internal API, and event needs a documented contract.

```text
HTTP:  POST /api/v1/payments
Event: payment.completed v1
```

Changing a contract must be backward compatible until consumers migrate. Add fields rather than renaming/removing them; publish a new event/API version for breaking changes. Contract tests should run in CI to prove producer and consumer agree.

Shared packages may contain types, logging helpers, configuration parsing, and event schemas. They must not become a backdoor for shared repositories or cross-service business logic.

## 15. Recommended implementation order

Do not split the current backend into every service at once. Start with the smallest group that proves the approach:

1. Establish the monorepo, gateway, service template, PostgreSQL boundaries, Redis, broker, observability, and local Docker Compose.
2. Extract and retain Auth behind a clean service boundary; verify login, refresh, logout, OTP/MFA, and authorization end to end.
3. Build Payment as the sole Chapa integration, including webhook verification, idempotency, outbox, and reconciliation.
4. Build Mobility (routes, vehicles, trips, tracking) and Ticketing (booking, ticket lifecycle) with the payment-completion event flow.
5. Add Notification and Reporting as event consumers.
6. Add Parking, EV, and Employee Transport only when their domain contracts are ready.

Before extracting a service, write its ownership table, database schema, REST contract, events, failure rules, migrations, health checks, dashboards, and test plan. A service is not complete merely because it starts.

## 16. Developer checklist

Before a service is accepted:

- [ ] It has one bounded business responsibility.
- [ ] It owns a separate database/schema and least-privilege database user.
- [ ] No other service reads or writes its tables.
- [ ] Its APIs and events are versioned and documented.
- [ ] It authenticates callers and performs resource-level authorization.
- [ ] Financial and external callback operations are idempotent.
- [ ] State changes that emit events use a transactional outbox.
- [ ] Event consumers deduplicate by event ID.
- [ ] It has structured logs, correlation IDs, metrics, `/health`, and `/ready`.
- [ ] Its secrets are service-local and never committed or logged.
- [ ] Unit, database integration, API, and contract tests run in CI.
- [ ] It has a Dockerfile, `.env.example`, migration procedure, and independent deployment configuration.

## 17. Final mental model

Think of HabeshaGo as a set of accountable businesses operating inside one product:

```text
Auth proves identity.
Mobility runs transport inventory and trips.
Ticketing sells and validates travel rights.
Payment handles money and Chapa.
Parking and EV run their own operational sessions.
Notification delivers messages without deciding business outcomes.
Reporting observes facts without changing them.
```

They cooperate through carefully defined APIs and events, not through shared tables or copied business logic. That separation is what allows HabeshaGo to grow safely without turning one backend into an unmaintainable dependency knot.

## 18. Mandatory architecture decisions

These rules are mandatory. A different approach requires an ADR, security review, migration plan, and explicit approval.

| ID | Decision | Required rule | Reason |
| --- | --- | --- | --- |
| ADR-01 | Public entry | All browser/mobile HTTP traffic enters through API Gateway. | One controlled public edge and no client dependency on internal topology. |
| ADR-02 | Data | Each transactional record has exactly one owning service/database. | Prevents bypassed business rules and coupled deployments. |
| ADR-03 | Payments | Payment Service is the only Chapa integration. | One correct boundary for webhook verification, refunds, and reconciliation. |
| ADR-04 | Sync calls | Use REST only when the caller needs an answer now. | Avoids long, fragile request chains. |
| ADR-05 | Async work | Publish versioned events for downstream work. | Consumers can fail and recover independently. |
| ADR-06 | Reliability | Use transactional outbox and idempotent consumers. | A committed state transition cannot silently lose its event. |
| ADR-07 | Identity | Retain Auth behind Auth Service; each domain owns resource authorization. | Authentication does not grant automatic access to a business resource. |
| ADR-08 | Money | Use integer minor units or explicit decimal strings. | JavaScript floating point cannot safely represent money. |
| ADR-09 | Reporting | Reporting uses event-built projections. | Reports cannot overload or alter operational databases. |
| ADR-10 | Migration | Extract services incrementally, not in one rewrite. | Limits distributed-system risk. |

## 19. Canonical repository and service layout

The backend shall be a monorepo. A monorepo is shared source control and tooling—not a shared runtime, ORM, database, or business layer.

```text
habeshago/
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── profile-service/
│   ├── mobility-service/
│   ├── ticket-service/
│   ├── payment-service/
│   ├── parking-service/
│   ├── ev-service/
│   ├── employee-service/
│   ├── notification-service/
│   └── reporting-service/
├── packages/
│   ├── config/          # environment parsing only
│   ├── logger/          # structured logging primitives only
│   ├── event-contracts/ # versioned schemas, no business logic
│   ├── api-contracts/   # request/response schemas
│   └── test-kit/
├── infrastructure/
│   ├── compose/
│   ├── postgres/
│   ├── redis/
│   ├── broker/
│   └── deployment/
└── docs/
```

Every service shall include `src/api`, `src/application`, `src/domain`, `src/infrastructure`, `src/events`, `src/auth`, `src/observability`, `prisma/`, `tests/`, a `Dockerfile`, and `.env.example`.

Shared packages must never expose a Prisma client, cross-service repositories, private environment variables, or a domain’s business use cases.

## 20. Database contract and migration rules

| Service | Database | Only permitted writer | Durable source-of-truth data |
| --- | --- | --- | --- |
| Auth | `auth_db` | Auth Service | identities, credentials, sessions, OTP/MFA, roles |
| Profile | `profile_db` | Profile Service | display profiles, preferences, emergency contacts |
| Mobility | `mobility_db` | Mobility Service | vehicles, drivers, routes, stops, trips, schedules |
| Ticketing | `ticket_db` | Ticket Service | bookings, reservations, fares, tickets, QR state |
| Payment | `payment_db` | Payment Service | payments, refunds, webhooks, reconciliation |
| Parking | `parking_db` | Parking Service | facilities, slots, parking sessions and rates |
| EV | `ev_db` | EV Service | stations, ports, charging sessions and rates |
| Employee | `employee_db` | Employee Service | organizations, employee transport and subscriptions |
| Notification | `notification_db` | Notification Service | notification requests, attempts, delivery status |
| Reporting | `reporting_db` | Reporting Service | read models and projection checkpoints |

Rules:

1. Each service has a distinct least-privilege database credential.
2. A service owns and runs only its own migration history.
3. Cross-service IDs are opaque external references, never cross-database foreign keys.
4. No service creates views, triggers, scheduled jobs, or SQL queries in another service database.
5. Production migrations follow expand → deploy compatible code → backfill → contract. Destructive migration requires a tested recovery plan.
6. Intentional read duplication is a projection; it records source event/version and can be rebuilt.

## 21. API and event contracts

### 21.1 Public routes

```text
/api/v1/auth/*           -> auth-service
/api/v1/profiles/*       -> profile-service
/api/v1/mobility/*       -> mobility-service
/api/v1/tickets/*        -> ticket-service
/api/v1/payments/*       -> payment-service
/api/v1/parking/*        -> parking-service
/api/v1/ev/*             -> ev-service
/api/v1/employee/*       -> employee-service
/api/v1/notifications/*  -> notification-service
```

Public JSON responses use the standard envelope except health endpoints and provider-required webhook acknowledgements:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Payment already completed",
  "data": { "code": "PAYMENT_ALREADY_COMPLETED", "requestId": "req_01J..." }
}
```

Gateway/services must propagate `X-Request-Id` and tracing context. `Idempotency-Key` is required for payment creation, refund, provider-webhook processing, booking/reservation creation, and other retried side effects. The same key with a different authenticated actor or different body returns conflict; it must not create a second operation.

### 21.2 Internal requests

Internal endpoints are private and require service identity:

```text
POST /internal/v1/payments
GET  /internal/v1/trips/:tripId/availability
POST /internal/v1/notifications
```

Recipients verify credential signature, issuer, audience, expiry, caller-service permission, request schema, and then resource-level user authorization. A browser access token is user identity, not proof that `ticket-service` is allowed to call `payment-service`.

### 21.3 Initial event catalog

| Producer | Event | Consumers |
| --- | --- | --- |
| Payment | `payment.completed.v1` | Ticketing, Parking, EV, Employee, Notification, Reporting |
| Payment | `payment.failed.v1` | Ticketing, Parking, EV, Employee, Notification, Reporting |
| Payment | `payment.refunded.v1` | Ticketing, Parking, EV, Employee, Notification, Reporting |
| Ticketing | `ticket.issued.v1`, `ticket.cancelled.v1` | Notification, Reporting |
| Mobility | `trip.started.v1`, `trip.cancelled.v1` | Ticketing, Notification, Reporting |
| Parking | `parking.started.v1`, `parking.completed.v1` | Notification, Reporting |
| EV | `charging.completed.v1` | Notification, Reporting |

Event envelope:

```json
{
  "eventId": "evt_01JQ4AH9JQ4T2X6K4F7Q0R0Q9A",
  "eventType": "payment.completed.v1",
  "schemaVersion": 1,
  "source": "payment-service",
  "occurredAt": "2026-10-08T10:00:00.000Z",
  "correlationId": "req_01JQ4A...",
  "causationId": "cmd_01JQ49...",
  "payload": {
    "paymentId": "pay_01J...",
    "referenceType": "BUS_TICKET",
    "referenceId": "booking_01J...",
    "userId": "usr_01J...",
    "amountMinor": 10000,
    "currency": "ETB"
  }
}
```

Consumers validate the schema. Unknown or exhausted-retry messages go to a monitored dead-letter queue; they are not silently dropped. Processing is: validate → start local transaction → insert `eventId` in inbox with unique constraint → apply state/outbox → commit → acknowledge broker. Replays preserve the original `eventId`.

## 22. Core state-machine invariants

```text
Booking: BOOKING_CREATED -> PAYMENT_PENDING -> PAID -> TICKET_ISSUED -> USED
                                      |              |
                                      v              v
                           PAYMENT_FAILED/EXPIRED  CANCELLED (policy controlled)

Payment: PENDING -> PROCESSING -> SUCCESS -> REFUNDED
                 \-> FAILED / CANCELLED
```

- Ticketing alone changes booking/ticket state. One successful payment reference issues at most one ticket/entitlement.
- Payment alone changes payment state. A verified provider webhook and provider-side verification are required before `SUCCESS`.
- Late or duplicate provider callbacks cannot overwrite a terminal state without a reviewed reconciliation flow.
- A client redirect after payment is never proof of payment; only Payment’s verified event is authoritative.
- Parking and EV react to verified payment events but never declare an external payment successful themselves.

## 23. Security baseline

- HTTPS is mandatory for public traffic. Internal services are private by default.
- Service-to-service calls use short-lived audience-scoped credentials, mTLS, or managed workload identity; static shared bearer secrets are not a long-term design.
- Auth remains the identity/session authority. Each domain verifies token issuer, audience, expiry, algorithm, token type, session requirements, ownership, and policy.
- Payment Service alone holds Chapa credentials. Webhook signature verification occurs before state change, webhook receipts are persisted, and raw body handling preserves provider-signature requirements.
- Validate all input. Never log passwords, OTPs, authorization headers, tokens, refresh cookies, provider secrets, or sensitive payment data.
- Define retention, access, and deletion rules before storing location, employee, and emergency-contact information.

## 24. Reliability and operational rules

Every outbound dependency needs a finite timeout. Retry only a safe read or an idempotent command with bounded exponential backoff. A broker outage leaves an outbox row for retry; it never rolls back a confirmed payment. A notification outage never changes payment/ticket truth.

Every service exposes:

```text
GET /health  # process is alive
GET /ready   # safe to receive traffic; dependency policy is explicit
```

Structured logs include `timestamp`, `level`, `service`, `environment`, `requestId`, `traceId`, `operation`, `durationMs`, `outcome`, and safe error codes. Metrics/alerts must cover request errors/latency, queue depth, outbox age, retry/dead-letter counts, webhook failures, idempotency conflicts, and database saturation.

## 25. Testing and delivery gate

A service requires unit, database integration, API integration, contract, broker/outbox, external-provider, and critical end-to-end tests as applicable. Static checks are necessary but are not proof of database, broker, Chapa, browser-cookie, or production-network behaviour.

Before a service deploys, it must have:

- an approved ownership/API/event contract;
- a reviewed migration and recovery plan;
- configured deployment secrets outside Git;
- health/readiness checks, logs, metrics, dashboards, and actionable alerts;
- tested idempotency for every retryable external effect;
- compatibility with old and new versions running together;
- an operational owner and incident/replay procedure.

## 26. Required migration order

1. Establish monorepo templates, gateway, private networking, service databases, Redis, broker, Docker Compose, CI, tracing, metrics, and logging.
2. Retain the hardened Auth module behind `auth-service`; prove deployed login, refresh, logout, MFA/OTP, session revocation, and browser/mobile paths.
3. Build `payment-service` as the sole Chapa boundary with verified webhooks, reconciliation, idempotency, audit history, and outbox.
4. Extract Mobility and build Ticketing with explicit booking state, capacity/seat-hold rules, payment creation, and `payment.completed.v1` consumption.
5. Add Notification and Reporting as event consumers.
6. Add Parking, EV, and Employee Transport using the same payment/event contracts—never direct provider/database access.

## 27. Architecture acceptance criteria

The migration is complete only when all points below are true:

- Each production domain has one declared owner and isolated database access.
- Client traffic uses the gateway; clients do not know internal service URLs.
- Payment success survives Ticketing, Notification, or broker temporary failure and safely converges later.
- Duplicate client requests, webhooks, and broker messages cannot duplicate money, tickets, or entitlements.
- APIs, events, and database changes are versioned and contract-tested.
- Each service is independently deployable, observable, backed up, and recoverable.
- Security, retention, restore, failover, and critical end-to-end flows have live evidence—not only source/build evidence.
