import type { Request, Response } from "express";
import {
  createStaffInvite,
  listStaffInvites,
  cancelStaffInvite,
  acceptStaffInvite,
} from "../services/staff-invite.service";
import { sendError } from "./base.controller";

/**
 * Create an invite for an email and a staff role, email the link
 * POST /api/v1/admin/staff-invites
 * Audit action: STAFF_INVITED
 */
export async function createInvite(req: Request, res: Response) {
  try {
    const adminId = (req as any).user?.id;
    const { email, role } = req.body || {};

    const result = await createStaffInvite({
      email,
      role,
      adminId,
      ipAddress: req.ip,
    });

    return res.status(201).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * List invites filtered by pending, accepted or expired
 * GET /api/v1/admin/staff-invites
 */
export async function listInvites(req: Request, res: Response) {
  try {
    const { status, role, cursor, limit } = req.query as Record<string, string | undefined>;

    const result = await listStaffInvites({
      status,
      role,
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
 * Cancel by expiring it now (the table has no cancelled column)
 * DELETE /api/v1/admin/staff-invites/:inviteId
 * Audit action: STAFF_INVITE_CANCELLED
 */
export async function cancelInvite(req: Request, res: Response) {
  try {
    const adminId = (req as any).user?.id;
    const { inviteId } = req.params;

    const result = await cancelStaffInvite(inviteId, adminId, req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Public. Marks acceptedAt, creates the user if needed, grants the role,
 * then the person signs in with email OTP and enrolls MFA.
 * POST /api/v1/auth/staff-invites/accept
 * Audit action: STAFF_INVITE_ACCEPTED, ROLE_GRANTED
 */
export async function acceptInvite(req: Request, res: Response) {
  try {
    const token = (req.body?.token || req.query?.token) as string | undefined;

    const result = await acceptStaffInvite(token || "", req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}
