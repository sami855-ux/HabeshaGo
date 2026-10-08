# Infrastructure

This directory holds local-development and deployment infrastructure definitions. It does not contain application domain code or secrets.

```text
compose/          Docker Compose files and local orchestration
postgres/         Local PostgreSQL initialization and role setup
redis/            Redis configuration for local development
message-broker/   RabbitMQ, Redis Streams, or NATS local configuration
deployment/       Deployment manifests, templates, and runbooks
```

Each production service will receive distinct least-privilege credentials for its own database boundary. Real secret values must remain in the deployment secret manager, never in this repository.
