import type { Request, Response, NextFunction } from "express";
import * as emergencyContactService from "../services/emergency-contact.service";
import { sendSuccess, getUserId } from "./base.controller";

export async function listContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { contacts, count, limit } = await emergencyContactService.listEmergencyContacts(userId);
    return sendSuccess(res, contacts, { count, limit });
  } catch (err) {
    return next(err);
  }
}

export async function addContact(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const contact = await emergencyContactService.addEmergencyContact(userId, req.body);
    return sendSuccess(res, contact, undefined, 201);
  } catch (err) {
    return next(err);
  }
}

export async function updateContact(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { contactId } = req.params;
    const contact = await emergencyContactService.updateEmergencyContact(userId, contactId, req.body);
    return sendSuccess(res, contact);
  } catch (err) {
    return next(err);
  }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { contactId } = req.params;
    const result = await emergencyContactService.deleteEmergencyContact(userId, contactId);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}
