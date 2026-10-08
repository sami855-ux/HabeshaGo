# Shared Packages

Shared packages contain versioned technical primitives and contracts only. They must not contain service-owned Prisma clients, repositories, ORM models, domain rules, or secrets.

```text
config/           Environment schema and safe configuration helpers
logger/           Structured logging and correlation/trace helpers
event-contracts/  Versioned event envelope and payload schemas
api-contracts/    Versioned request/response schemas for HTTP contracts
test-kit/         Test factories, fakes, and contract-test helpers
```
