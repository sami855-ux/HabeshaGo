import { prisma } from "../prisma";
import { type Prisma } from "@prisma/client";
import { AuthError } from "./token.service";

export interface ListOutboxEventsParams {
  status?: "pending" | "failed" | "dead_letter" | "all";
  type?: string;
  cursor?: string;
  limit?: number;
}

/**
 * List pending or failed outbox events to watch the dead letter state
 */
export async function listOutboxEvents(params: ListOutboxEventsParams) {
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
  const where: Prisma.OutboxEventWhereInput = {};

  if (params.status === "pending") {
    where.publishedAt = null;
    where.failedAt = null;
  } else if (params.status === "failed" || params.status === "dead_letter") {
    where.OR = [
      { failedAt: { not: null } },
      { attempts: { gte: 5 } },
    ];
  } else if (params.status !== "all") {
    // Default: all unpublished (either pending or failed)
    where.publishedAt = null;
  }

  if (params.type) {
    where.type = params.type;
  }

  const events = await prisma.outboxEvent.findMany({
    where,
    take: limit + 1,
    ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
    orderBy: { occurredAt: "desc" },
  });

  const hasNextPage = events.length > limit;
  const items = hasNextPage ? events.slice(0, limit) : events;
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  return {
    items: items.map((e) => ({
      id: e.id,
      seq: e.seq.toString(),
      type: e.type,
      version: e.version,
      aggregateId: e.aggregateId,
      payload: e.payload,
      correlationId: e.correlationId,
      occurredAt: e.occurredAt,
      attempts: e.attempts,
      nextAttemptAt: e.nextAttemptAt,
      lockedAt: e.lockedAt,
      lockedBy: e.lockedBy,
      lastError: e.lastError,
      failedAt: e.failedAt,
      publishedAt: e.publishedAt,
    })),
    pagination: {
      cursor: nextCursor,
      nextCursor,
      hasNextPage,
      limit,
    },
  };
}

/**
 * Clears failedAt, resets attempts, sets nextAttemptAt to now
 */
export async function retryOutboxEvent(eventId: string) {
  const event = await prisma.outboxEvent.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new AuthError("EVENT_NOT_FOUND", "Outbox event not found", 404);
  }

  const now = new Date();
  const updated = await prisma.outboxEvent.update({
    where: { id: eventId },
    data: {
      failedAt: null,
      attempts: 0,
      lastError: null,
      lockedAt: null,
      lockedBy: null,
      nextAttemptAt: now,
    },
  });

  return {
    success: true,
    message: "Outbox event queued for retry",
    event: {
      id: updated.id,
      seq: updated.seq.toString(),
      type: updated.type,
      attempts: updated.attempts,
      nextAttemptAt: updated.nextAttemptAt,
      failedAt: updated.failedAt,
    },
  };
}
