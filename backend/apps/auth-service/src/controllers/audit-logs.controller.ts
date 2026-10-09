import type { Request, Response } from "express";
import { listAuditLogs } from "../services/audit-log.service";
import { sendError } from "./base.controller";

/**
 * Global log filtered by actor, target, action and dates
 * GET /api/v1/admin/audit-logs
 */
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { actorId, targetUserId, action, from, to, cursor, limit } = req.query as Record<
      string,
      string | undefined
    >;

    const result = await listAuditLogs({
      actorId,
      targetUserId,
      action,
      from,
      to,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    return sendError(res, err);
  }
}
