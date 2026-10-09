import type { Request, Response } from "express";
import {
  listOutboxEvents,
  retryOutboxEvent,
} from "../services/outbox.service";
import { sendError } from "./base.controller";

/**
 * Pending or failed events, to watch the dead letter state
 * GET /api/v1/admin/outbox-events
 */
export async function getOutboxEvents(req: Request, res: Response) {
  try {
    const { status, type, cursor, limit } = req.query as Record<string, string | undefined>;

    const result = await listOutboxEvents({
      status: status as any,
      type,
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

/**
 * Clears failedAt, resets attempts, sets nextAttemptAt to now
 * POST /api/v1/admin/outbox-events/:eventId/retry
 */
export async function retryEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const result = await retryOutboxEvent(eventId);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}
