import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError } from "../utils/errors";
import { toAvatarUrl } from "../utils/avatar";
import { logger } from "../observability/logger";
import { enqueue } from "./outbox.service";

export interface SearchProfilesParams {
  q?: string;
  city?: string;
  completed?: boolean | string;
  includeDeleted?: boolean | string;
  page?: number | string;
  limit?: number | string;
}

export interface AdminActorInfo {
  actorId?: string;
  actorRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function searchProfiles(params: SearchProfilesParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ProfileWhereInput = {};

  const includeDeleted =
    params.includeDeleted === true || params.includeDeleted === "true";
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (params.city) {
    where.city = { equals: String(params.city).trim(), mode: "insensitive" };
  }

  if (params.completed !== undefined) {
    const isCompleted =
      params.completed === true || params.completed === "true";
    if (isCompleted) {
      where.profileCompletedAt = { not: null };
    } else {
      where.profileCompletedAt = null;
    }
  }

  if (params.q) {
    const query = String(params.q).trim();
    where.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  const [total, profiles] = await Promise.all([
    prisma.profile.count({ where }),
    prisma.profile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  const data = profiles.map((p) => ({
    userId: p.userId,
    email: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    city: p.city,
    profileCompleted: Boolean(p.profileCompletedAt),
    deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getAdminProfile(
  userId: string,
  actorInfo?: AdminActorInfo,
  correlationId?: string,
) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      preferences: true,
      emergencyContacts: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!profile) {
    throw new NotFoundError("Profile does not exist");
  }

  // Audit log staff profile view
  logger.info(
    {
      action: "ADMIN_VIEWED_USER",
      actorId: actorInfo?.actorId,
      actorRole: actorInfo?.actorRole,
      targetUserId: userId,
      ipAddress: actorInfo?.ipAddress,
      userAgent: actorInfo?.userAgent,
    },
    "Staff viewed user profile",
  );

  // Publish profile.admin_viewed outbox event
  try {
    await prisma.$transaction(async (tx) => {
      await enqueue(
        tx,
        "profile.admin_viewed" as any,
        userId,
        {
          actorId: actorInfo?.actorId,
          actorRole: actorInfo?.actorRole,
          targetUserId: userId,
          ipAddress: actorInfo?.ipAddress,
          userAgent: actorInfo?.userAgent,
          viewedAt: new Date().toISOString(),
        } as any,
        correlationId,
      );
    });
  } catch (err) {
    logger.warn({ err, userId }, "Failed to enqueue admin viewed outbox event");
  }

  const preferences = profile.preferences || {
    language: "EN",
    timezone: "Africa/Addis_Ababa",
    currency: "ETB",
    theme: "SYSTEM",
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    marketingOptIn: false,
  };

  return {
    profile: {
      userId: profile.userId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      avatarUrl: toAvatarUrl(profile.avatarKey),
      dateOfBirth: profile.dateOfBirth
        ? profile.dateOfBirth.toISOString().slice(0, 10)
        : null,
      gender: profile.gender,
      city: profile.city,
      profileCompletedAt: profile.profileCompletedAt
        ? profile.profileCompletedAt.toISOString()
        : null,
      deletedAt: profile.deletedAt ? profile.deletedAt.toISOString() : null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    preferences: {
      language: preferences.language,
      timezone: preferences.timezone,
      currency: preferences.currency,
      theme: preferences.theme,
      pushEnabled: preferences.pushEnabled,
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      marketingOptIn: preferences.marketingOptIn,
    },
    emergencyContacts: profile.emergencyContacts.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      isPrimary: c.isPrimary,
    })),
  };
}
