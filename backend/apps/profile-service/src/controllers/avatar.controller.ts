import type { Request, Response, NextFunction } from "express";
import * as avatarService from "../services/avatar.service";
import { sendSuccess, getUserId, getCorrelationId } from "./base.controller";
import { ValidationError } from "../utils/errors";

export async function getUploadUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { contentType, sizeBytes } = req.body;

    if (!contentType || sizeBytes === undefined) {
      throw new ValidationError("contentType and sizeBytes are required", [
        { field: "contentType", issue: "Required" },
        { field: "sizeBytes", issue: "Required" },
      ]);
    }

    const result = await avatarService.requestAvatarUploadUrl(userId, contentType, Number(sizeBytes));
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function confirmAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { avatarKey } = req.body;
    const correlationId = getCorrelationId(req);

    if (!avatarKey) {
      throw new ValidationError("avatarKey is required", [
        { field: "avatarKey", issue: "Required" },
      ]);
    }

    const result = await avatarService.confirmAvatar(userId, avatarKey, correlationId);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

/**
 * Direct file upload handler via multipart/form-data (Cloudinary)
 */
export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const correlationId = getCorrelationId(req);
    const file = req.file;

    if (!file) {
      throw new ValidationError("No file uploaded", [
        { field: "file", issue: "A file must be provided in form-data ('file' or 'avatar')" },
      ]);
    }

    const result = await avatarService.uploadAvatarDirect(
      userId,
      file.buffer,
      file.mimetype,
      correlationId,
    );
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function deleteAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const correlationId = getCorrelationId(req);
    const result = await avatarService.removeAvatar(userId, correlationId);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
