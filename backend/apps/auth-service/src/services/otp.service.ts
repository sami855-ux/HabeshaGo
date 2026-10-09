import { env } from "../config/env";
import { prisma } from "../prisma";
import { logger } from "../observability/logger";
import { generateOtpCode, hashOtpCode, verifyOtpCode } from "../utils/crypto";
import { AuthError, extractActiveRoles } from "./token.service";
import type { User } from "@prisma/client";

export interface RequestOtpResult {
  user: User;
  rawOtp: string;
  isNewUser: boolean;
  expiresInSeconds: number;
}

export interface VerifyOtpResult {
  user: User;
  roles: string[];
  mfaRequired: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate and normalize an email address
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new AuthError("INVALID_EMAIL", "A valid email address is required", 400);
  }
  const normalized = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(normalized)) {
    throw new AuthError("INVALID_EMAIL", "Invalid email format", 400);
  }
  return normalized;
}

/**
 * Initiate OTP for user registration or login
 */
export async function requestLoginOtp(
  rawEmail: string,
  ipAddress?: string,
  userName?: string
): Promise<RequestOtpResult> {
  const email = normalizeEmail(rawEmail);

  // Rate limiting check: check if an OTP was issued recently
  const cooldownPeriod = new Date(Date.now() - env.OTP_RATE_LIMIT_SECONDS * 1000);
  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "LOGIN",
      consumedAt: null,
      createdAt: { gt: cooldownPeriod },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    const retryAfter = env.OTP_RATE_LIMIT_SECONDS - elapsedSeconds;
    throw new AuthError(
      "OTP_RATE_LIMIT",
      `Please wait ${retryAfter > 0 ? retryAfter : 1} seconds before requesting a new OTP`,
      429
    );
  }

  let isNewUser = false;

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email },
    include: { roleGrants: true },
  });

  if (!user) {
    isNewUser = true;
    // Create new user with PASSENGER role grant
    user = await prisma.user.create({
      data: {
        email,
        status: "ACTIVE",
        roleGrants: {
          create: {
            role: "PASSENGER",
            reason: "Initial registration",
          },
        },
      },
      include: { roleGrants: true },
    });
  } else {
    // Check account status
    if (user.status === "SUSPENDED") {
      throw new AuthError(
        "ACCOUNT_SUSPENDED",
        user.suspensionReason || "Account suspended. Please contact customer support.",
        403
      );
    }
    if (user.status === "DELETED") {
      throw new AuthError("ACCOUNT_DELETED", "Account has been deleted.", 403);
    }
  }

  // Invalidate any existing unconsumed OTPs for this email to prevent replay
  await prisma.otpCode.updateMany({
    where: {
      email,
      purpose: "LOGIN",
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const rawOtp = generateOtpCode(6);
  const codeHash = await hashOtpCode(rawOtp);
  const ttlMs = env.OTP_TTL_MINUTES * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.otpCode.create({
    data: {
      email,
      purpose: "LOGIN",
      userId: user.id,
      codeHash,
      attempts: 0,
      maxAttempts: env.OTP_MAX_ATTEMPTS,
      expiresAt,
      ipAddress,
    },
  });

  // Outbox / Notification dispatch
  logger.info({ email, userId: user.id, isNewUser }, "OTP generated successfully");

  return {
    user,
    rawOtp,
    isNewUser,
    expiresInSeconds: env.OTP_TTL_MINUTES * 60,
  };
}

/**
 * Verify OTP code submitted by the user
 */
export async function verifyLoginOtp(
  rawEmail: string,
  rawCode: string,
  ipAddress?: string
): Promise<VerifyOtpResult> {
  const email = normalizeEmail(rawEmail);
  const code = (rawCode || "").trim();

  if (!code || !/^\d{6}$/.test(code)) {
    throw new AuthError("INVALID_OTP", "OTP must be a 6-digit numeric code", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roleGrants: true,
      mfa: true,
    },
  });

  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "No user found with the provided email", 404);
  }

  if (user.status === "SUSPENDED" || user.status === "DELETED") {
    throw new AuthError("ACCOUNT_UNAVAILABLE", "Account is not active", 403);
  }

  // Find latest active OTP
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "LOGIN",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AuthError("OTP_EXPIRED_OR_NOT_FOUND", "OTP expired or not found. Please request a new one.", 400);
  }

  // Check attempt limit
  if (otp.attempts >= otp.maxAttempts) {
    await prisma.auditLog.create({
      data: {
        action: "OTP_LOCKED",
        targetUserId: user.id,
        reason: "Max OTP verification attempts exceeded",
        ipAddress,
      },
    });
    throw new AuthError("OTP_LOCKED", "Too many incorrect attempts. Please request a new OTP.", 429);
  }

  // Verify code hash
  const isValid = await verifyOtpCode(code, otp.codeHash);
  if (!isValid) {
    const newAttempts = otp.attempts + 1;
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: newAttempts },
    });

    if (newAttempts >= otp.maxAttempts) {
      await prisma.auditLog.create({
        data: {
          action: "OTP_LOCKED",
          targetUserId: user.id,
          reason: "Max OTP verification attempts exceeded",
          ipAddress,
        },
      });
      throw new AuthError("OTP_LOCKED", "Too many incorrect attempts. Please request a new OTP.", 429);
    }

    const remaining = otp.maxAttempts - newAttempts;
    throw new AuthError("INVALID_OTP", `Invalid OTP code. ${remaining} attempt(s) remaining.`, 400);
  }

  // Mark OTP as consumed
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  // Verify email timestamp if not already set
  if (!user.emailVerifiedAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  const roles = extractActiveRoles(user.roleGrants);
  const mfaRequired = Boolean(user.mfa && user.mfa.enabledAt);

  return {
    user,
    roles,
    mfaRequired,
  };
}

export const STAFF_ROLES: string[] = [
  "ADMIN",
  "EV_CHARGER_MANAGER",
  "PARKING_MANAGER",
  "EMPLOYEE",
];

/**
 * Initiate OTP for authorized staff members only
 */
export async function requestStaffLoginOtp(
  rawEmail: string,
  ipAddress?: string
): Promise<RequestOtpResult> {
  const email = normalizeEmail(rawEmail);

  // Rate limiting check
  const cooldownPeriod = new Date(Date.now() - env.OTP_RATE_LIMIT_SECONDS * 1000);
  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      email,
      purpose: "LOGIN",
      consumedAt: null,
      createdAt: { gt: cooldownPeriod },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    const retryAfter = env.OTP_RATE_LIMIT_SECONDS - elapsedSeconds;
    throw new AuthError(
      "OTP_RATE_LIMIT",
      `Please wait ${retryAfter > 0 ? retryAfter : 1} seconds before requesting a new OTP`,
      429
    );
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roleGrants: true },
  });

  if (!user) {
    throw new AuthError("STAFF_ACCESS_DENIED", "Access restricted to authorized staff members", 403);
  }

  const activeRoles = extractActiveRoles(user.roleGrants);
  const isStaff = activeRoles.some((r) => STAFF_ROLES.includes(r));
  if (!isStaff) {
    throw new AuthError("STAFF_ACCESS_DENIED", "Access restricted to authorized staff members", 403);
  }

  if (user.status === "SUSPENDED") {
    throw new AuthError(
      "ACCOUNT_SUSPENDED",
      user.suspensionReason || "Account suspended. Contact administrator.",
      403
    );
  }
  if (user.status === "DELETED") {
    throw new AuthError("ACCOUNT_DELETED", "Account has been deleted.", 403);
  }

  // Invalidate any existing unconsumed OTPs for this email
  await prisma.otpCode.updateMany({
    where: { email, purpose: "LOGIN", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const rawOtp = generateOtpCode(6);
  const codeHash = await hashOtpCode(rawOtp);
  const ttlMs = env.OTP_TTL_MINUTES * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.otpCode.create({
    data: {
      email,
      purpose: "LOGIN",
      userId: user.id,
      codeHash,
      attempts: 0,
      maxAttempts: env.OTP_MAX_ATTEMPTS,
      expiresAt,
      ipAddress,
    },
  });

  logger.info({ email, userId: user.id }, "Staff OTP generated successfully");

  return {
    user,
    rawOtp,
    isNewUser: false,
    expiresInSeconds: env.OTP_TTL_MINUTES * 60,
  };
}

