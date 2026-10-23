import type { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { sendSuccess, getCorrelationId } from "./base.controller";

export async function searchProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, meta } = await adminService.searchProfiles(req.query);
    return sendSuccess(res, data, meta);
  } catch (err) {
    return next(err);
  }
}

export async function getProfileById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const actorInfo: adminService.AdminActorInfo = {
      actorId: req.user?.id,
      actorRole: req.user?.roles?.[0],
      ipAddress: req.ip || req.header("x-forwarded-for"),
      userAgent: req.header("user-agent"),
    };
    const correlationId = getCorrelationId(req);
    const profile = await adminService.getAdminProfile(userId, actorInfo, correlationId);
    return sendSuccess(res, profile);
  } catch (err) {
    return next(err);
  }
}
