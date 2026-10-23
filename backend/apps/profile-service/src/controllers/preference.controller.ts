import type { Request, Response, NextFunction } from "express";
import * as preferenceService from "../services/preference.service";
import { sendSuccess, getUserId, getCorrelationId } from "./base.controller";

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const preferences = await preferenceService.getPreferences(userId);
    return sendSuccess(res, preferences);
  } catch (err) {
    return next(err);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const correlationId = getCorrelationId(req);
    const updated = await preferenceService.updatePreferences(userId, req.body, correlationId);
    return sendSuccess(res, updated);
  } catch (err) {
    return next(err);
  }
}
