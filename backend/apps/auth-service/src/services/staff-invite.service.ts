import { prisma } from "../prisma";
import { UserStatus, UserRole, type Prisma } from "@prisma/client";
import { generateSecureToken, hashToken } from "../utils/crypto";
import { AuthError } from "./token.service";
import { STAFF_ROLES } from "./otp.service";
import { env } from "../config/env";

export interface CreateInviteParams {
  email: string;
  role: string;
  adminId: string;
  ipAddress?: string;
}

export interface ListInvitesParams {
  status?: "pending" | "accepted" | "expired" | string;
  role?: string;
  cursor?: string;
  limit?: number;
}

/**
 * Create a staff invite for an email and a staff role, email the link
 * Audit action: STAFF_INVITED
 */
export async function createStaffInvite({
  email,
  role,
  adminId,
  ipAddress,
}: CreateInviteParams) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new AuthError("INVALID_EMAIL", "A valid email address is required", 400);
  }

  const normalizedRole = role?.trim().toUpperCase();
  if (!normalizedRole || !STAFF_ROLES.includes(normalizedRole as any)) {
    throw new AuthError(
      "INVALID_ROLE",
      `Invalid staff role. Permitted staff roles: ${STAFF_ROLES.join(", ")}`,
      400
    );
  }

  // Check if active pending invite already exists
  const existingPending = await prisma.staffInvite.findFirst({
    where: {
      email: normalizedEmail,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingPending) {
    throw new AuthError(
      "PENDING_INVITE_EXISTS",
      "An active pending invite already exists for this email",
      409
    );
  }

  // Generate secure token and hash
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.staffInvite.create({
    data: {
      email: normalizedEmail,
      role: normalizedRole as UserRole,
      tokenHash,
      invitedById: adminId,
      expiresAt,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "STAFF_INVITED",
      actorId: adminId,
      reason: `Invited ${normalizedEmail} for staff role ${normalizedRole}`,
      ipAddress,
    },
  }).catch(() => undefined);

  const inviteUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/staff/accept-invite?token=${rawToken}`;

  return {
    success: true,
    message: "Staff invite created successfully",
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      inviteUrl,
      token: rawToken,
    },
  };
}

/**
 * List invites filtered by pending, accepted or expired
 */
export async function listStaffInvites(params: ListInvitesParams) {
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
  const where: Prisma.StaffInviteWhereInput = {};

  const now = new Date();
  if (params.status) {
    const status = params.status.toLowerCase();
    if (status === "pending") {
      where.acceptedAt = null;
      where.expiresAt = { gt: now };
    } else if (status === "accepted") {
      where.acceptedAt = { not: null };
    } else if (status === "expired") {
      where.acceptedAt = null;
      where.expiresAt = { lte: now };
    }
  }

  if (params.role) {
    const normalizedRole = params.role.toUpperCase();
    if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
      where.role = normalizedRole as UserRole;
    }
  }

  const invites = await prisma.staffInvite.findMany({
    where,
    take: limit + 1,
    ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = invites.length > limit;
  const items = hasNextPage ? invites.slice(0, limit) : invites;
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  return {
    items: items.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedById: inv.invitedById,
      expiresAt: inv.expiresAt,
      acceptedAt: inv.acceptedAt,
      isExpired: !inv.acceptedAt && inv.expiresAt <= now,
      status: inv.acceptedAt ? "accepted" : inv.expiresAt <= now ? "expired" : "pending",
      createdAt: inv.createdAt,
    })),
    pagination: {
      cursor: nextCursor,
      nextCursor,
      hasNextPage,
      limit,
    },
  };
}

/**
 * Cancel by expiring it now (the table has no cancelled column)
 * Audit action: STAFF_INVITE_CANCELLED
 */
export async function cancelStaffInvite(
  inviteId: string,
  adminId: string,
  ipAddress?: string
) {
  const invite = await prisma.staffInvite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    throw new AuthError("INVITE_NOT_FOUND", "Staff invite not found", 404);
  }

  if (invite.acceptedAt) {
    throw new AuthError(
      "INVITE_ALREADY_ACCEPTED",
      "Cannot cancel an invite that has already been accepted",
      400
    );
  }

  const now = new Date(Date.now() - 1000); // 1 second in the past to expire immediately

  const updated = await prisma.staffInvite.update({
    where: { id: inviteId },
    data: { expiresAt: now },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "STAFF_INVITE_CANCELLED" as any,
      actorId: adminId,
      reason: `Cancelled invite for ${invite.email} (${invite.role})`,
      ipAddress,
    },
  }).catch(() => undefined);

  return {
    success: true,
    message: "Staff invite cancelled successfully",
    invite: {
      id: updated.id,
      email: updated.email,
      status: "cancelled",
      expiresAt: updated.expiresAt,
    },
  };
}

/**
 * Public. Marks acceptedAt, creates the user if needed, grants the role,
 * then the person signs in with email OTP and enrolls MFA.
 * Audit action: STAFF_INVITE_ACCEPTED, ROLE_GRANTED
 */
export async function acceptStaffInvite(rawToken: string, ipAddress?: string) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new AuthError("TOKEN_REQUIRED", "Invite token is required", 400);
  }

  const tokenHash = hashToken(rawToken.trim());
  const invite = await prisma.staffInvite.findUnique({ where: { tokenHash } });

  if (!invite) {
    throw new AuthError("INVALID_INVITE_TOKEN", "Invalid or unknown staff invitation token", 404);
  }

  if (invite.acceptedAt) {
    throw new AuthError("INVITE_ALREADY_ACCEPTED", "This invitation has already been accepted", 400);
  }

  if (invite.expiresAt <= new Date()) {
    throw new AuthError("INVITE_EXPIRED", "This staff invitation has expired", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();

    // 1. Mark invite as accepted
    await tx.staffInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: now },
    });

    // 2. Find or create user
    let user = await tx.user.findUnique({ where: { email: invite.email } });
    if (!user) {
      user = await tx.user.create({
        data: {
          email: invite.email,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: now,
        },
      });
    } else if (user.status === UserStatus.SUSPENDED) {
      throw new AuthError("ACCOUNT_SUSPENDED", "Account is suspended. Contact administrator.", 403);
    } else if (user.status === UserStatus.DELETED) {
      throw new AuthError("ACCOUNT_DELETED", "Account is deleted. Contact administrator.", 403);
    }

    // 3. Grant the staff role
    await tx.userRoleGrant.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role: invite.role,
        },
      },
      create: {
        userId: user.id,
        role: invite.role,
        grantedById: invite.invitedById,
        reason: "Staff invite accepted",
      },
      update: {
        revokedAt: null,
        revokedById: null,
        reason: "Staff invite accepted",
      },
    });

    // 4. Audit logs
    await tx.auditLog.create({
      data: {
        action: "STAFF_INVITE_ACCEPTED",
        targetUserId: user.id,
        reason: `Accepted staff invite for role ${invite.role}`,
        ipAddress,
      },
    }).catch(() => undefined);

    await tx.auditLog.create({
      data: {
        action: "ROLE_GRANTED",
        targetUserId: user.id,
        reason: `Granted ${invite.role} via staff invite acceptance`,
        ipAddress,
      },
    }).catch(() => undefined);

    // 5. Outbox events
    await tx.outboxEvent.create({
      data: {
        type: "StaffInviteAccepted",
        aggregateId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          role: invite.role,
          inviteId: invite.id,
          acceptedAt: now.toISOString(),
        },
      },
    }).catch(() => undefined);

    return { user, invite };
  });

  return {
    success: true,
    message: "Invitation accepted successfully. Please proceed to staff login with your email OTP to set up MFA.",
    data: {
      email: result.user.email,
      role: result.invite.role,
      requiresMfaSetup: true,
      nextStep: "POST /api/v1/auth/staff/login",
    },
  };
}
