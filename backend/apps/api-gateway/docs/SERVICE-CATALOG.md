# HabeshaGo Service Catalog

**Status:** Required implementation reference  
**Scope:** Target microservices backend under `backend/apps/`

This file defines what each HabeshaGo service must contain and own. It prevents a service from becoming a copy of the old monolith or from taking ownership of another service's data.

## 1. Rule for every service

Every service must contain:

```text
src/api/             Routes, controllers, request/response schemas, API middleware
src/application/     Use cases: commands, queries, orchestration
src/domain/          Entities, value objects, state machines, domain errors/rules
src/infrastructure/  Prisma/database repositories, Redis, broker, provider clients
src/auth/            Authentication, authorization, service-identity checks
src/events/          Event consumers, publishers, inbox, transactional outbox worker
src/observability/   Structured logger, tracing, metrics, health/readiness
src/shared/          Service-local constants, types, safe utilities
prisma/              This service's schema, migrations, and seed only
tests/               Unit, integration, API, and contract tests
Dockerfile
.env.example
README.md
```

Every service must also have:

- its own database/schema and least-privilege database user;
- `/health` and `/ready` endpoints;
- request/correlation IDs in logs and outgoing calls;
- input validation, authentication, resource-level authorization, and centralized errors;
- versioned APIs and events;
- idempotency for retryable external effects;
- an outbox for state changes that publish events;
- an inbox/processed-event table for event deduplication;
- independently deployable configuration and tests.

No service may directly read/write another service's database, import its repositories, reuse its Prisma models, or use its secret values.

## 2. API Gateway

**Folder:** `apps/api-gateway`  
**Database:** none for business data

### Must contain

- Public route mapping for `/api/v1/*`.
- TLS/CORS, request-size controls, rate limiting, and security headers.
- Request ID and trace-context middleware.
- Authentication-token validation or safe forwarding of validated user context.
- Internal service client/routing configuration with timeouts.
- Upstream error mapping and service-availability handling.
- `/health` and `/ready` checks.

### Must not contain

- Ticket, payment, vehicle, parking, EV, or employee domain logic.
- Prisma models/repositories for domain services.
- Chapa credentials or webhook logic.

### Routes it forwards

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

## 3. Auth Service

**Folder:** `apps/auth-service`  
**Database:** `auth_db`  
**Existing implementation:** retain and extract behind this boundary.

### Owns

- Identities and credentials.
- Registration, login, logout, password changes/reset.
- OTP, MFA/TOTP enrollment and recovery phrases.
- Access tokens, refresh tokens, sessions, revocation, and token rotation.
- Roles and identity verification state.

### Required domain modules

```text
domain/entities/UserIdentity.ts
domain/entities/Session.ts
domain/entities/OtpChallenge.ts
domain/entities/StaffMfa.ts
application/commands/RegisterUser.ts
application/commands/VerifyOtp.ts
application/commands/RefreshSession.ts
application/commands/Logout.ts
application/commands/EnrollMfa.ts
application/commands/VerifyMfa.ts
```

### Required APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/mfa/*
```

### Emits

```text
identity.created.v1
identity.role-changed.v1
identity.session-revoked.v1
```

### Must not own

- Profile preferences, emergency contacts, tickets, payments, trips, or parking/EV sessions.

## 4. Profile Service

**Folder:** `apps/profile-service`  
**Database:** `profile_db`

### Owns

- First/last name, profile image, address, preferences, emergency contacts.
- User-facing account profile settings.

### Required APIs

```text
GET   /api/v1/profiles/me
PATCH /api/v1/profiles/me
POST  /api/v1/profiles/me/image
PATCH /api/v1/profiles/me/preferences
PATCH /api/v1/profiles/me/emergency-contact
```

### Consumes

```text
identity.created.v1
```

It creates an empty profile projection for a newly created identity. It stores the Auth user ID as an external reference, not a foreign key to `auth_db`.

### Must not own

- Passwords, refresh tokens, OTPs, MFA secrets, or role/session truth.

## 5. Mobility Service

**Folder:** `apps/mobility-service`  
**Database:** `mobility_db`

### Owns

- Vehicles, drivers, routes, stops, trip schedules, trip instances, and durable location history.
- Driver assignment, vehicle status, route status, capacity, trip lifecycle.
- Live vehicle tracking Socket.IO/WebSocket gateway.

### Required domain modules

```text
Vehicle, Driver, Route, Stop, Trip, Schedule, VehicleLocation
AssignDriverToVehicle
StartTrip, EndTrip, CancelTrip
UpdateVehicleLocation
CheckTripAvailability
```

### Required APIs

```text
GET  /api/v1/mobility/routes
GET  /api/v1/mobility/trips
GET  /api/v1/mobility/trips/:tripId
POST /api/v1/mobility/driver/trips/:tripId/start
POST /api/v1/mobility/driver/trips/:tripId/end
POST /api/v1/mobility/vehicles/:vehicleId/location

GET  /internal/v1/trips/:tripId/availability
POST /internal/v1/trips/:tripId/holds
DELETE /internal/v1/trips/:tripId/holds/:holdId
```

### Emits

```text
trip.started.v1
trip.completed.v1
trip.cancelled.v1
vehicle.location-updated.v1     # only when durable consumers need it
```

### Uses Redis

- Latest position cache: `vehicle:{vehicleId}:location`.
- Socket.IO adapter when horizontally scaled.
- Never Redis as the sole durable trip/location record.

### Must not own

- Ticket issuance, payment status, Chapa integration, notification delivery.

## 6. Ticket Service

**Folder:** `apps/ticket-service`  
**Database:** `ticket_db`

### Owns

- Bookings, trip reservations, seat/capacity holds, fares, tickets, QR identifiers, validation/usage state.
- Cancellation policy and ticket eligibility rules.

### Required domain modules

```text
Booking, Ticket, Reservation, Fare, CapacityHold
CreateBooking
CreatePaymentForBooking
IssueTicketAfterPayment
CancelTicket
ValidateTicketQr
ExpireCapacityHold
```

### Required APIs

```text
POST /api/v1/tickets/bookings
GET  /api/v1/tickets/bookings/:bookingId
GET  /api/v1/tickets
GET  /api/v1/tickets/:ticketId
POST /api/v1/tickets/:ticketId/cancel
POST /api/v1/tickets/:ticketId/validate
```

### Calls

- Mobility internal availability/hold APIs.
- Payment internal create-payment API.

### Consumes

```text
payment.completed.v1
payment.failed.v1
payment.refunded.v1
trip.cancelled.v1
```

### Emits

```text
booking.created.v1
ticket.issued.v1
ticket.cancelled.v1
ticket.used.v1
```

### Required invariants

- Payment success is accepted only from a verified `payment.completed.v1` event.
- One successful payment reference creates at most one ticket.
- A used/cancelled/expired ticket cannot be validated again.
- Retried booking/payment requests must use idempotency keys.

## 7. Payment Service

**Folder:** `apps/payment-service`  
**Database:** `payment_db`

### Owns

- Payments, provider references, payment status, provider webhook receipts, refunds, reconciliation records, financial audit records.
- The only Chapa provider client and Chapa secrets.

### Required domain modules

```text
Payment, Refund, WebhookReceipt, ReconciliationRecord
CreatePayment
InitializeChapaCheckout
VerifyProviderPayment
HandleChapaWebhook
RefundPayment
ReconcilePayment
```

### Required APIs

```text
POST /api/v1/payments
GET  /api/v1/payments/:paymentId
POST /api/v1/payments/:paymentId/verify
POST /api/v1/payments/:paymentId/refund
POST /api/v1/payments/webhooks/chapa

POST /internal/v1/payments
GET  /internal/v1/payments/:paymentId
```

### Required fields

```text
paymentId, userId, amountMinor, currency, provider,
providerReference, status, purpose, referenceType,
referenceId, idempotencyKey, metadata, createdAt, updatedAt
```

### Emits

```text
payment.created.v1
payment.completed.v1
payment.failed.v1
payment.cancelled.v1
payment.refunded.v1
```

### Required invariants

- Verify provider webhook signature and provider result before `SUCCESS`.
- Persist/uniquely deduplicate provider event and reference IDs.
- Use integer minor amounts or defined decimal strings, never floats.
- Write an outbox record in the same transaction as each published state change.
- Never contain `TicketController`, `ParkingController`, or `EVController`.

## 8. Parking Service

**Folder:** `apps/parking-service`  
**Database:** `parking_db`

### Owns

- Facilities, parking slots, rates, reservations, parking sessions, availability.

### Required APIs

```text
GET  /api/v1/parking/facilities
GET  /api/v1/parking/facilities/:facilityId
POST /api/v1/parking/reservations
POST /api/v1/parking/sessions
POST /api/v1/parking/sessions/:sessionId/end
GET  /api/v1/parking/sessions/:sessionId
```

### Calls and events

- Calls Payment to create a payment for `PARKING_RESERVATION` or `PARKING_SESSION`.
- Consumes `payment.completed.v1`, `payment.failed.v1`, `payment.refunded.v1`.
- Emits `parking.started.v1`, `parking.completed.v1`, `parking.reservation-created.v1`.

### Must not own

- Chapa credentials, payment rows, or direct payment-provider calls.

## 9. EV Service

**Folder:** `apps/ev-service`  
**Database:** `ev_db`

### Owns

- Charging stations, ports, rates, reservations, charging sessions, meter readings/status.

### Required APIs

```text
GET  /api/v1/ev/stations
GET  /api/v1/ev/stations/:stationId
POST /api/v1/ev/reservations
POST /api/v1/ev/sessions
POST /api/v1/ev/sessions/:sessionId/stop
GET  /api/v1/ev/sessions/:sessionId
```

### Calls and events

- Calls Payment for `EV_CHARGING`/`CHARGING_SESSION` payment references.
- Consumes `payment.completed.v1`, `payment.failed.v1`, `payment.refunded.v1`.
- Emits `charging.started.v1`, `charging.completed.v1`.

### Must not own

- Payment-provider integration, tickets, or parking slot state.

## 10. Employee Transport Service

**Folder:** `apps/employee-service`  
**Database:** `employee_db`

### Owns

- Organizations, employee enrollment, employee routes, pickup points, schedules, subscriptions, monthly-fee policy.

### Required APIs

```text
POST /api/v1/employee/organizations
POST /api/v1/employee/organizations/:organizationId/employees
GET  /api/v1/employee/me/route
GET  /api/v1/employee/me/subscription
POST /api/v1/employee/subscriptions/:subscriptionId/payments
```

### Calls and events

- Calls Payment using `EMPLOYEE_TRANSPORT` references.
- Consumes payment success/failure/refund events.
- Emits `employee.subscription-created.v1`, `employee.transport-assigned.v1`.

### Must not own

- General user credentials, Auth sessions, Chapa integration, or general public trip inventory.

## 11. Notification Service

**Folder:** `apps/notification-service`  
**Database:** `notification_db`

### Owns

- Notification requests, templates, delivery attempts, provider result/status, preferences only if explicitly assigned from Profile.
- Push, SMS, email, and in-app delivery adapters.

### Required modules

```text
NotificationRequest, DeliveryAttempt, Template
SendEmail, SendSms, SendPush, CreateInAppNotification
RetryDelivery, RecordProviderOutcome
```

### Consumes

```text
payment.completed.v1
payment.failed.v1
ticket.issued.v1
ticket.cancelled.v1
trip.started.v1
trip.cancelled.v1
parking.started.v1
parking.completed.v1
charging.completed.v1
```

### Emits

```text
notification.delivered.v1
notification.failed.v1
```

### Required invariants

- Notification delivery is asynchronous and cannot roll back a payment, ticket, parking, or EV state.
- It deduplicates source event IDs and records each provider attempt.
- It never includes OTPs, full tokens, or provider secrets in logs/events.

## 12. Reporting Service

**Folder:** `apps/reporting-service`  
**Database:** `reporting_db`

### Owns

- Read-only projections: revenue, ticket sales, trip/vehicle/parking/EV utilization, payment failures, daily/weekly/monthly aggregates.
- Projection checkpoints and rebuild/backfill tools.

### Consumes

- All domain events required for reports, especially payment, ticket, trip, parking, and charging events.

### Required APIs

```text
GET /api/v1/admin/reports/revenue
GET /api/v1/admin/reports/tickets
GET /api/v1/admin/reports/utilization
GET /api/v1/admin/reports/payment-failures
```

### Must not do

- Write payment, ticket, trip, parking, or EV source-of-truth records.
- Query other services' transactional tables for live report generation.
- Cause user-facing transactions to fail when a projection is delayed.

## 13. Admin capability is not a standalone data owner

Admin is a set of permission-protected operations exposed by the owning domain service:

```text
Vehicle administration -> Mobility Service
Ticket support         -> Ticket Service
Payment reconciliation -> Payment Service
Parking administration -> Parking Service
EV administration      -> EV Service
User identity actions  -> Auth Service
Profile moderation     -> Profile Service
Reporting              -> Reporting Service
```

The gateway can route `/api/v1/admin/*`, but it must not become an Admin database or a second monolith. Every admin action needs role/capability checks, resource scope, structured audit records, and a clear owning service.

## 14. Services added later

Future capabilities—ride hailing, taxis, bike sharing, delivery, fleet management, insurance, loyalty, and advertising—become a separate service only after they have a bounded domain, independent data ownership, a clear API/event contract, and a reason to deploy/scale separately. Do not create a service merely because a folder can be created.

## 15. Service completion checklist

- [ ] Responsibility, owner, database, APIs, events, and exclusions are documented.
- [ ] Database credentials cannot access another service's data.
- [ ] All public and internal requests are authenticated and authorized.
- [ ] State changes and emitted events use the transactional outbox.
- [ ] Event consumers deduplicate with an inbox/unique event ID.
- [ ] Money/provider/webhook operations are idempotent and audited.
- [ ] Health, readiness, logs, metrics, and tracing are present.
- [ ] Unit, integration, API, contract, and relevant end-to-end tests exist.
- [ ] The service can be deployed and rolled back independently.
