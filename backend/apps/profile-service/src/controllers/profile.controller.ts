import type { Request, Response, NextFunction } from "express";
import * as profileService from "../services/profile.service";
import { sendSuccess, getUserId, getCorrelationId } from "./base.controller";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const profile = await profileService.getProfile(userId);
    return sendSuccess(res, profile);
  } catch (err) {
    return next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const correlationId = getCorrelationId(req);
    const updated = await profileService.updateProfile(userId, req.body, correlationId);
    return sendSuccess(res, updated);
  } catch (err) {
    return next(err);
  }
}
