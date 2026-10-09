import { prisma } from "../prisma";
import { AuditAction, type Prisma } from "@prisma/client";

export interface ListAuditLogsParams {
  actorId?: string;
  targetUserId?: string;
  action?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

/**
 * Global audit log filtered by actor, target, action and dates (cursor paging, max 100)
 */
export async function listAuditLogs(params: ListAuditLogsParams) {
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
  const where: Prisma.AuditLogWhereInput = {};

  if (params.actorId) {
    where.actorId = params.actorId;
  }

  if (params.targetUserId) {
    where.targetUserId = params.targetUserId;
  }

  if (params.action) {
    const normalized = params.action.toUpperCase();
    if (Object.values(AuditAction).includes(normalized as AuditAction)) {
      where.action = normalized as AuditAction;
    }
  }

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) {
      const fromDate = new Date(params.from);
      if (!isNaN(fromDate.getTime())) {
        where.createdAt.gte = fromDate;
      }
    }
    if (params.to) {
      const toDate = new Date(params.to);
      if (!isNaN(toDate.getTime())) {
        where.createdAt.lte = toDate;
      }
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    take: limit + 1,
    ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = logs.length > limit;
  const items = hasNextPage ? logs.slice(0, limit) : logs;
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  return {
    items,
    pagination: {
      cursor: nextCursor,
      nextCursor,
      hasNextPage,
      limit,
    },
  };
}
