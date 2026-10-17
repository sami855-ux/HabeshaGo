# Profile Service

Location: `backend/apps/profile`

## Ownership

The profile service owns the profile, preferences, emergency contacts and the profile image.

It does not own passwords, OTPs or token sessions. Those stay in the auth service.

A profile row is keyed by the auth user id. There is no default and no foreign key, because the data lives in a separate database.

## Data model

| Table | Purpose |
|---|---|
| `profiles` | Name, phone, date of birth, gender, city, avatar key, completion and deletion timestamps |
| `user_preferences` | Language, timezone, currency, theme, channel toggles, marketing opt in (one row per user) |
| `emergency_contacts` | Name, phone, relationship, primary flag |
| `processed_events` | Inbox table used to dedupe incoming events by event id |
| `outbox_events` | Transactional outbox for events this service publishes |

## Conventions

- The user id always comes from the verified token, never from the URL or body, except on staff and internal routes
- Validate every body with a schema and reject unknown fields so `email` and `userId` cannot be patched
- Every write to profile or preferences runs in a transaction that also enqueues the outbox event
- Normalize `email` and `phone` before writing, the same way auth does
- Only one emergency contact per user can be primary, enforced in code inside one transaction
- Rate limit avatar upload URLs and contact creation

## Endpoints

### Profile

Base path: `/api/v1/profile/me`

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Profile, preferences and a `profileCompleted` flag |
| PATCH | `/` | Update first name, last name, phone, date of birth, gender, city |

### Avatar

Base path: `/api/v1/profile/me/avatar`

| Method | Path | Purpose |
|---|---|---|
| POST | `/upload-url` | Signed upload URL and object key, validating content type and max size |
| PUT | `/` | Body `{ key }`, confirms the upload and saves `avatarKey` |
| DELETE | `/` | Clears `avatarKey` and removes the object |

### Preferences

Base path: `/api/v1/profile/me/preferences`

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Current preferences |
| PATCH | `/` | Partial update of language, timezone, currency, theme, channel toggles, marketing opt in |

### Emergency contacts

Base path: `/api/v1/profile/me/emergency-contacts`

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List, primary first |
| POST | `/` | Create, with a per user cap such as 5 |
| PATCH | `/:id` | Update, scoped to the owner |
| DELETE | `/:id` | Delete, scoped to the owner |
| PUT | `/:id/primary` | Make primary and clear the others in one transaction |

### Staff

Base path: `/api/v1/admin/profiles`

Requires the ADMIN or EMPLOYEE role. Read only.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Search by name, phone or email with pagination |
| GET | `/:userId` | Profile, preferences and emergency contacts |

Reads of emergency contacts by staff are written to a log, since they hold other people's phone numbers.

### Internal

Base path: `/internal`

Service to service auth only. Not routed by the gateway.

| Method | Path | Purpose |
|---|---|---|
| GET | `/profiles/:userId` | Full profile for one user |
| POST | `/profiles/batch` | Body `{ userIds }`, capped at about 100, returns display name and avatar key |
| GET | `/preferences/:userId` | Channel toggles and language, used by notification |
| GET | `/emergency-contacts/:userId` | Used by mobility in an emergency flow |

### Ops

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/ready` | Readiness, checks the database and the broker |

There are no create or delete endpoints for the profile itself. It is created by the `UserCreated` event and cleared by `UserDeleted`, so a profile cannot exist for a user that auth does not know about.

## Events

### Consumed

| Event | Action |
|---|---|
| `UserCreated` | Create the profile and a default preferences row in one transaction |
| `EmailChanged` | Update `profiles.email` |
| `UserDeleted` | Clear names, phone, avatar and emergency contacts, set `deletedAt` |

Every handler checks `processed_events` first and records the event id in the same transaction as its changes.

### Published

| Event | Raised when | Consumers |
|---|---|---|
| `ProfileCreated` | After handling `UserCreated` | reporting |
| `ProfileUpdated` | Name or phone changes | ticket and mobility refresh cached display names |
| `ProfileCompleted` | Required fields filled for the first time | reporting, onboarding flows |
| `AvatarChanged` | Avatar confirmed or removed | anything caching avatars |
| `PreferencesUpdated` | Any preference change | notification reads the channel toggles |
| `ProfileDeleted` | After handling `UserDeleted` | services holding copies of profile data |

### Contracts

These belong in `packages/event-contracts`.

```ts
export const ProfileEventTypes = {
  ProfileCreated: 'ProfileCreated',
  ProfileUpdated: 'ProfileUpdated',
  ProfileCompleted: 'ProfileCompleted',
  AvatarChanged: 'AvatarChanged',
  PreferencesUpdated: 'PreferencesUpdated',
  ProfileDeleted: 'ProfileDeleted',
} as const;

export type ProfileEventType = (typeof ProfileEventTypes)[keyof typeof ProfileEventTypes];

export interface ProfileEventPayloads {
  ProfileCreated: { userId: string; email: string };
  ProfileUpdated: { userId: string; firstName: string | null; lastName: string | null; phone: string | null };
  ProfileCompleted: { userId: string; completedAt: string };
  AvatarChanged: { userId: string; avatarKey: string | null };
  PreferencesUpdated: {
    userId: string;
    language: string;
    timezone: string;
    currency: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    marketingOptIn: boolean;
  };
  ProfileDeleted: { userId: string };
}

export interface EventEnvelope<T extends ProfileEventType = ProfileEventType> {
  id: string;
  type: T;
  version: number;
  aggregateId: string;
  occurredAt: string;
  correlationId: string | null;
  payload: ProfileEventPayloads[T];
}
```

## Outbox

Events are written to `outbox_events` in the same transaction as the change that caused them.

```ts
import { Prisma, PrismaClient } from '@prisma/client';
import { ProfileEventPayloads, ProfileEventType } from '@habeshago/event-contracts';

export function enqueue<T extends ProfileEventType>(
  tx: Prisma.TransactionClient,
  type: T,
  aggregateId: string,
  payload: ProfileEventPayloads[T],
  correlationId?: string,
) {
  return tx.outboxEvent.create({
    data: { type, aggregateId, payload, correlationId },
  });
}

export async function updatePreferences(
  prisma: PrismaClient,
  userId: string,
  data: Prisma.UserPreferenceUpdateInput,
  correlationId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const prefs = await tx.userPreference.update({ where: { userId }, data });
    await enqueue(tx, 'PreferencesUpdated', userId, {
      userId,
      language: prefs.language,
      timezone: prefs.timezone,
      currency: prefs.currency,
      pushEnabled: prefs.pushEnabled,
      emailEnabled: prefs.emailEnabled,
      smsEnabled: prefs.smsEnabled,
      marketingOptIn: prefs.marketingOptIn,
    }, correlationId);
    return prefs;
  });
}
```

### Relay worker

```ts
const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 10;
const LOCK_TIMEOUT_SECONDS = 60;

export async function relayOnce(prisma: PrismaClient, broker: Broker, workerId: string) {
  const rows = await prisma.$queryRaw<OutboxEvent[]>`
    UPDATE outbox_events
    SET "lockedAt" = now(), "lockedBy" = ${workerId}
    WHERE id IN (
      SELECT id FROM outbox_events
      WHERE "publishedAt" IS NULL
        AND "failedAt" IS NULL
        AND "nextAttemptAt" <= now()
        AND ("lockedAt" IS NULL OR "lockedAt" < now() - make_interval(secs => ${LOCK_TIMEOUT_SECONDS}))
      ORDER BY seq
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *`;

  for (const row of rows) {
    try {
      await broker.publish(row.type, {
        id: row.id,
        type: row.type,
        version: row.version,
        aggregateId: row.aggregateId,
        occurredAt: row.occurredAt.toISOString(),
        correlationId: row.correlationId,
        payload: row.payload,
      });
      await prisma.outboxEvent.update({
        where: { id: row.id },
        data: { publishedAt: new Date(), lockedAt: null, lockedBy: null },
      });
    } catch (err) {
      const attempts = row.attempts + 1;
      await prisma.outboxEvent.update({
        where: { id: row.id },
        data: {
          attempts,
          lastError: err instanceof Error ? err.message : String(err),
          lockedAt: null,
          lockedBy: null,
          nextAttemptAt: new Date(Date.now() + Math.min(2 ** attempts * 1000, 300_000)),
          failedAt: attempts >= MAX_ATTEMPTS ? new Date() : null,
        },
      });
    }
  }

  return rows.length;
}
```

Run `relayOnce` in a loop with a short sleep when it returns 0. Keep `broker.publish` behind a thin interface so the RabbitMQ or Redis Streams choice stays out of the service code.

Delivery is at least once, so consumers dedupe on the envelope `id`. For strict ordering per user, run one relay instance or partition by `aggregateId`, since parallel workers can publish two events for the same user out of order.

## Operations

- Retention job deletes published outbox rows after a few days and old `processed_events` rows after a longer window
- `DIRECT_URL` points at the migrator database role and `DATABASE_URL` at the limited app role
- Keep the channel toggle contract in `api-contracts` so profile and notification do not drift