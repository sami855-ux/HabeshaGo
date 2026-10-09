import { prisma } from "../prisma";
import { UserStatus, UserRole, type Prisma } from "@prisma/client";
import { AuthError } from "./token.service";

export interface UserSearchParams {
  email?: string;
  status?: string;
  role?: string;
  createdFrom?: string;
  createdTo?: string;
  cursor?: string;
  limit?: number;
}

export interface UserSearchResponse {
  items: Array<{
    id: string;
    email: string;
    status: UserStatus;
    roles: UserRole[];
    mfaEnabled: boolean;
    activeSessionsCount: number;
    createdAt: Date;
    lastLoginAt: Date | null;
    suspendedAt: Date | null;
    suspensionReason: string | null;
    deletedAt: Date | null;
  }>;
  pagination: {
    cursor: string | null;
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}

/**
 * Search users by email prefix, status, role and created date with cursor paging (max 100)
 */
export async function searchUsers(params: UserSearchParams): Promise<UserSearchResponse> {
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
  const where: Prisma.UserWhereInput = {};

  if (params.email && typeof params.email === "string" && params.email.trim().length > 0) {
    where.email = {
      startsWith: params.email.trim().toLowerCase(),
      mode: "insensitive",
    };
  }

  if (params.status && typeof params.status === "string") {
    const normalizedStatus = params.status.toUpperCase();
    if (Object.values(UserStatus).includes(normalizedStatus as UserStatus)) {
      where.status = normalizedStatus as UserStatus;
    }
  }

  if (params.role && typeof params.role === "string") {
    const normalizedRole = params.role.toUpperCase();
    if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
      where.roleGrants = {
        some: {
          role: normalizedRole as UserRole,
          revokedAt: null,
        },
      };
    }
  }

  if (params.createdFrom || params.createdTo) {
    where.createdAt = {};
    if (params.createdFrom) {
      const fromDate = new Date(params.createdFrom);
      if (!isNaN(fromDate.getTime())) {
        where.createdAt.gte = fromDate;
      }
    }
    if (params.createdTo) {
      const toDate = new Date(params.createdTo);
      if (!isNaN(toDate.getTime())) {
        where.createdAt.lte = toDate;
      }
    }
  }

  const users = await prisma.user.findMany({
    where,
    take: limit + 1,
    ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
    orderBy: { id: "asc" },
    include: {
      roleGrants: { where: { revokedAt: null } },
      mfa: { select: { enabledAt: true } },
      _count: {
        select: {
          sessions: { where: { revokedAt: null } },
        },
      },
    },
  });

  const hasNextPage = users.length > limit;
  const items = hasNextPage ? users.slice(0, limit) : users;
  const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  return {
    items: items.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      roles: u.roleGrants.map((r) => r.role),
      mfaEnabled: Boolean(u.mfa?.enabledAt),
      activeSessionsCount: u._count.sessions,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      suspendedAt: u.suspendedAt,
      suspensionReason: u.suspensionReason,
      deletedAt: u.deletedAt,
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
 * Account detail, MFA enabled and recovery codes left, linked providers, session count
 * Audit action: ADMIN_VIEWED_USER
 */
export async function getUserDetail(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roleGrants: { where: { revokedAt: null } },
      oauthAccounts: {
        select: {
          provider: true,
          providerAccountId: true,
          email: true,
          createdAt: true,
        },
      },
      mfa: true,
      _count: {
        select: {
          sessions: { where: { revokedAt: null } },
        },
      },
    },
  });

  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }

  // Audit action: ADMIN_VIEWED_USER
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_VIEWED_USER" as any,
      actorId: adminId,
      targetUserId: userId,
      reason: "Admin viewed account details",
      ipAddress,
    },
  }).catch(() => undefined);

  return {
    id: user.id,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    status: user.status,
    suspendedAt: user.suspendedAt,
    suspendedById: user.suspendedById,
    suspensionReason: user.suspensionReason,
    deletedAt: user.deletedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roleGrants.map((r) => r.role),
    mfa: {
      enabled: Boolean(user.mfa?.enabledAt),
      enabledAt: user.mfa?.enabledAt || null,
      recoveryCodesLeft: user.mfa?.recoveryCodeHashes?.length || 0,
    },
    linkedProviders: user.oauthAccounts.map((oa) => ({
      provider: oa.provider,
      providerAccountId: oa.providerAccountId,
      email: oa.email,
      linkedAt: oa.createdAt,
    })),
    sessionCount: user._count.sessions,
    activeSessionsCount: user._count.sessions,
  };
}

/**
 * ACTIVE to SUSPENDED, sets suspendedAt, suspendedById, suspensionReason, revokes all sessions
 * Audit action: USER_SUSPENDED
 * Event: UserSuspended
 */
export async function suspendUser(
  userId: string,
  adminId: string,
  reason?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }
  if (user.status === UserStatus.DELETED) {
    throw new AuthError("CANNOT_SUSPEND_DELETED", "Deleted accounts cannot be suspended", 400);
  }

  const now = new Date();
  const suspensionReason = reason?.trim() || "Suspended by administrator";

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.SUSPENDED,
        suspendedAt: now,
        suspendedById: adminId,
        suspensionReason,
      },
    });

    // Revoke all active sessions
    await tx.session.updateMany({
      where: { userId, revokedAt: null },
      data: {
        revokedAt: now,
        revokedReason: "USER_SUSPENDED",
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        action: "USER_SUSPENDED",
        actorId: adminId,
        targetUserId: userId,
        reason: suspensionReason,
        oldValue: { status: user.status },
        newValue: { status: UserStatus.SUSPENDED, suspendedAt: now },
        ipAddress,
      },
    }).catch(() => undefined);

    // Outbox event
    await tx.outboxEvent.create({
      data: {
        type: "UserSuspended",
        aggregateId: userId,
        payload: {
          userId,
          suspendedById: adminId,
          reason: suspensionReason,
          suspendedAt: now.toISOString(),
        },
      },
    }).catch(() => undefined);

    return updated;
  });

  return {
    success: true,
    message: "User suspended successfully and active sessions revoked",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
      suspendedAt: updatedUser.suspendedAt,
      suspendedById: updatedUser.suspendedById,
      suspensionReason: updatedUser.suspensionReason,
    },
  };
}

/**
 * SUSPENDED to ACTIVE, clears the suspension fields
 * Audit action: USER_REACTIVATED
 * Event: UserReactivated
 */
export async function reactivateUser(
  userId: string,
  adminId: string,
  reason?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }
  if (user.status === UserStatus.DELETED) {
    throw new AuthError("CANNOT_REACTIVATE_DELETED", "Deleted accounts cannot be reactivated", 400);
  }

  const now = new Date();
  const reactivateReason = reason?.trim() || "Reactivated by administrator";

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        suspendedAt: null,
        suspendedById: null,
        suspensionReason: null,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        action: "USER_REACTIVATED",
        actorId: adminId,
        targetUserId: userId,
        reason: reactivateReason,
        oldValue: { status: user.status, suspendedAt: user.suspendedAt },
        newValue: { status: UserStatus.ACTIVE },
        ipAddress,
      },
    }).catch(() => undefined);

    // Outbox event
    await tx.outboxEvent.create({
      data: {
        type: "UserReactivated",
        aggregateId: userId,
        payload: {
          userId,
          reactivatedById: adminId,
          reactivatedAt: now.toISOString(),
        },
      },
    }).catch(() => undefined);

    return updated;
  });

  return {
    success: true,
    message: "User reactivated successfully",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
      suspendedAt: null,
      suspensionReason: null,
    },
  };
}

/**
 * Sets DELETED and deletedAt, rewrites the email, removes OAuth links and MFA, revokes sessions
 * Audit action: USER_DELETED
 * Event: UserDeleted
 */
export async function deleteUser(
  userId: string,
  adminId: string,
  reason?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }

  const now = new Date();
  const deleteReason = reason?.trim() || "Account deleted by administrator";
  // Rewrite email so original email is released for re-registration if needed
  const sanitizedEmail = `deleted_${Date.now()}_${userId}@deleted.habeshago.internal`;

  const updatedUser = await prisma.$transaction(async (tx) => {
    // 1. Remove OAuth accounts
    await tx.oAuthAccount.deleteMany({ where: { userId } });

    // 2. Remove MFA
    await tx.userMfa.deleteMany({ where: { userId } });

    // 3. Revoke all active sessions
    await tx.session.updateMany({
      where: { userId, revokedAt: null },
      data: {
        revokedAt: now,
        revokedReason: "USER_DELETED",
      },
    });

    // 4. Update user record: DELETED status, rewrite email, set deletedAt
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        email: sanitizedEmail,
        status: UserStatus.DELETED,
        deletedAt: now,
        suspendedAt: null,
        suspensionReason: deleteReason,
      },
    });

    // 5. Audit log
    await tx.auditLog.create({
      data: {
        action: "USER_DELETED",
        actorId: adminId,
        targetUserId: userId,
        reason: deleteReason,
        oldValue: { email: user.email, status: user.status },
        newValue: { email: sanitizedEmail, status: UserStatus.DELETED, deletedAt: now },
        ipAddress,
      },
    }).catch(() => undefined);

    // 6. Outbox event
    await tx.outboxEvent.create({
      data: {
        type: "UserDeleted",
        aggregateId: userId,
        payload: {
          userId,
          deletedById: adminId,
          originalEmail: user.email,
          deletedAt: now.toISOString(),
        },
      },
    }).catch(() => undefined);

    return updated;
  });

  return {
    success: true,
    message: "User deleted successfully, email rewritten, and all credentials revoked",
    user: {
      id: updatedUser.id,
      status: updatedUser.status,
      deletedAt: updatedUser.deletedAt,
    },
  };
}

/**
 * Removes the user_mfa row and revokes sessions, so staff must re-enroll at next login
 * Audit action: MFA_RESET
 */
export async function resetUserMfaByAdmin(
  userId: string,
  adminId: string,
  reason?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }

  const now = new Date();
  const resetReason = reason?.trim() || "Admin reset user MFA";

  await prisma.$transaction(async (tx) => {
    // 1. Remove user MFA row
    await tx.userMfa.deleteMany({ where: { userId } });

    // 2. Revoke active sessions
    await tx.session.updateMany({
      where: { userId, revokedAt: null },
      data: {
        revokedAt: now,
        revokedReason: "ADMIN_MFA_RESET",
      },
    });

    // 3. Audit log
    await tx.auditLog.create({
      data: {
        action: "MFA_RESET",
        actorId: adminId,
        targetUserId: userId,
        reason: resetReason,
        ipAddress,
      },
    }).catch(() => undefined);
  });

  return {
    success: true,
    message: "User MFA has been reset successfully. Staff member must re-enroll at next login.",
    data: {
      userId,
      reset: true,
    },
  };
}
