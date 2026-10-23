import type { Request, Response, NextFunction } from "express";
import * as internalService from "../services/internal.service";
import { sendSuccess } from "./base.controller";

export async function getProfileById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const profile = await internalService.getInternalProfile(userId);
    return sendSuccess(res, profile);
  } catch (err) {
    return next(err);
  }
}

export async function getBatchProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    const { userIds } = req.body;
    const { data, meta } = await internalService.getBatchProfiles(userIds);
    return sendSuccess(res, data, meta);
  } catch (err) {
    return next(err);
  }
}

export async function getPreferencesById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const preferences = await internalService.getInternalPreferences(userId);
    return sendSuccess(res, preferences);
  } catch (err) {
    return next(err);
  }
}

export async function getContactsById(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const contacts = await internalService.getInternalEmergencyContacts(userId);
    return sendSuccess(res, contacts);
  } catch (err) {
    return next(err);
  }
}
