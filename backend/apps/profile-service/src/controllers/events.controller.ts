import type { Request, Response, NextFunction } from "express";
import * as eventConsumerService from "../services/event-consumer.service";
import { sendSuccess } from "./base.controller";
import { ValidationError } from "../utils/errors";

export async function ingestEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, type, aggregateId, payload } = req.body;
    if (!id || !type) {
      throw new ValidationError("Missing required event fields (id, type)", [
        { field: "id", issue: "Event id required" },
        { field: "type", issue: "Event type required" },
      ]);
    }

    const result = await eventConsumerService.processEvent(req.body);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
