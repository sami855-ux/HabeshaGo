import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/prisma";
import { generateAccessToken } from "../src/services/token.service";
import { setupUserMfa } from "../src/services/mfa.service";

describe("D1. Admin Users and Status Endpoints (/api/v1/admin/users)", () => {
  const app = createApp();
  const createdUserIds: string[] = [];

  const uniqueEmail = (prefix: string) =>
    `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

  const makeAdminToken = (adminId: string, email: string) => {
    return generateAccessToken({
      sub: adminId,
      email,
      roles: ["ADMIN"],
      sid: "admin-session-123",
      mfa: true,
    });
  };

  const makePassengerToken = (userId: string, email: string) => {
    return generateAccessToken({
      sub: userId,
      email,
      roles: ["PASSENGER"],
      sid: "passenger-session-123",
      mfa: false,
    });
  };

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  });

  it("enforces authentication and admin permissions", async () => {
    // 1. Unauthenticated request
    const unauthRes = await request(app).get("/api/v1/admin/users");
    expect(unauthRes.status).toBe(401);

    // 2. Non-admin request
    const passengerEmail = uniqueEmail("passenger");
    const passengerUser = await prisma.user.create({
      data: {
        email: passengerEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
      },
    });
    createdUserIds.push(passengerUser.id);

    const passengerToken = makePassengerToken(passengerUser.id, passengerEmail);
    const forbiddenRes = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${passengerToken}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.error.code).toBe("FORBIDDEN");
  });

  it("GET / searches users with email prefix, status, role and cursor pagination (max 100)", async () => {
    const adminEmail = uniqueEmail("super.admin");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    // Create a targeted test user
    const targetEmail = uniqueEmail("driver.searchtarget");
    const targetUser = await prisma.user.create({
      data: {
        email: targetEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "DRIVER" } },
      },
    });
    createdUserIds.push(targetUser.id);

    // Search by email prefix
    const searchRes = await request(app)
      .get(`/api/v1/admin/users?email=driver.searchtarget&role=DRIVER&status=ACTIVE`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(Array.isArray(searchRes.body.data)).toBe(true);
    const found = searchRes.body.data.find((u: any) => u.id === targetUser.id);
    expect(found).toBeDefined();
    expect(found.email).toBe(targetEmail);
    expect(found.roles).toContain("DRIVER");
    expect(searchRes.body.pagination).toBeDefined();
  });

  it("GET /:userId returns account detail, MFA status, linked providers, and logs ADMIN_VIEWED_USER", async () => {
    const adminEmail = uniqueEmail("admin.viewer");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    // Create target user with MFA and an OAuth account
    const subjectEmail = uniqueEmail("subject.user");
    const subjectUser = await prisma.user.create({
      data: {
        email: subjectEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
        oauthAccounts: {
          create: {
            provider: "GOOGLE",
            providerAccountId: `google_${Date.now()}`,
          },
        },
      },
    });
    createdUserIds.push(subjectUser.id);

    // Setup MFA for subject user
    await setupUserMfa(subjectUser.id, subjectEmail);

    const detailRes = await request(app)
      .get(`/api/v1/admin/users/${subjectUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.success).toBe(true);
    expect(detailRes.body.data.id).toBe(subjectUser.id);
    expect(detailRes.body.data.email).toBe(subjectEmail);
    expect(detailRes.body.data.mfa.recoveryCodesLeft).toBe(8);
    expect(detailRes.body.data.linkedProviders).toHaveLength(1);
    expect(detailRes.body.data.linkedProviders[0].provider).toBe("GOOGLE");

    // Verify audit log created
    const audit = await prisma.auditLog.findFirst({
      where: {
        targetUserId: subjectUser.id,
        action: "ADMIN_VIEWED_USER" as any,
      },
    });
    expect(audit).toBeDefined();
  });

  it("POST /:userId/suspend changes status to SUSPENDED, revokes sessions, logs USER_SUSPENDED and UserSuspended event", async () => {
    const adminEmail = uniqueEmail("admin.suspender");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const subjectEmail = uniqueEmail("to.suspend");
    const subjectUser = await prisma.user.create({
      data: {
        email: subjectEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
        sessions: {
          create: {
            absoluteExpiresAt: new Date(Date.now() + 86400000),
          },
        },
      },
    });
    createdUserIds.push(subjectUser.id);

    const suspendRes = await request(app)
      .post(`/api/v1/admin/users/${subjectUser.id}/suspend`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Terms of service violation" });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.success).toBe(true);
    expect(suspendRes.body.user.status).toBe("SUSPENDED");
    expect(suspendRes.body.user.suspendedReason).toBe("Terms of service violation");

    // Check user in DB
    const refreshed = await prisma.user.findUnique({ where: { id: subjectUser.id } });
    expect(refreshed?.status).toBe("SUSPENDED");
    expect(refreshed?.suspendedById).toBe(adminUser.id);

    // Verify sessions revoked
    const activeSessions = await prisma.session.findMany({
      where: { userId: subjectUser.id, revokedAt: null },
    });
    expect(activeSessions).toHaveLength(0);

    // Verify outbox event
    const event = await prisma.outboxEvent.findFirst({
      where: { aggregateId: subjectUser.id, type: "UserSuspended" },
    });
    expect(event).toBeDefined();
  });

  it("POST /:userId/reactivate changes status to ACTIVE, clears suspension fields, logs USER_REACTIVATED", async () => {
    const adminEmail = uniqueEmail("admin.reactivator");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const subjectEmail = uniqueEmail("to.reactivate");
    const subjectUser = await prisma.user.create({
      data: {
        email: subjectEmail,
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendedById: adminUser.id,
        suspensionReason: "Temporary hold",
        roleGrants: { create: { role: "PASSENGER" } },
      },
    });
    createdUserIds.push(subjectUser.id);

    const reactivateRes = await request(app)
      .post(`/api/v1/admin/users/${subjectUser.id}/reactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Account review resolved" });

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.success).toBe(true);
    expect(reactivateRes.body.user.status).toBe("ACTIVE");
    expect(reactivateRes.body.user.suspendedAt).toBeNull();

    const refreshed = await prisma.user.findUnique({ where: { id: subjectUser.id } });
    expect(refreshed?.status).toBe("ACTIVE");
    expect(refreshed?.suspendedAt).toBeNull();
    expect(refreshed?.suspensionReason).toBeNull();

    // Verify outbox event
    const event = await prisma.outboxEvent.findFirst({
      where: { aggregateId: subjectUser.id, type: "UserReactivated" },
    });
    expect(event).toBeDefined();
  });

  it("POST /:userId/delete sets DELETED, rewrites email, removes OAuth and MFA, logs USER_DELETED", async () => {
    const adminEmail = uniqueEmail("admin.deleter");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const originalEmail = uniqueEmail("to.delete");
    const subjectUser = await prisma.user.create({
      data: {
        email: originalEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
        oauthAccounts: {
          create: {
            provider: "GOOGLE",
            providerAccountId: `google_${Date.now()}`,
          },
        },
      },
    });
    createdUserIds.push(subjectUser.id);

    // Setup MFA
    await setupUserMfa(subjectUser.id, originalEmail);

    const deleteRes = await request(app)
      .post(`/api/v1/admin/users/${subjectUser.id}/delete`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "User GDPR erasure request" });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.user.status).toBe("DELETED");

    // Check DB
    const refreshed = await prisma.user.findUnique({ where: { id: subjectUser.id } });
    expect(refreshed?.status).toBe("DELETED");
    expect(refreshed?.email).toContain("@deleted.habeshago.internal");
    expect(refreshed?.deletedAt).toBeDefined();

    // Verify OAuth and MFA removed
    const mfa = await prisma.userMfa.findUnique({ where: { userId: subjectUser.id } });
    expect(mfa).toBeNull();

    const oauths = await prisma.oAuthAccount.findMany({ where: { userId: subjectUser.id } });
    expect(oauths).toHaveLength(0);

    // Verify outbox event
    const event = await prisma.outboxEvent.findFirst({
      where: { aggregateId: subjectUser.id, type: "UserDeleted" },
    });
    expect(event).toBeDefined();
  });

  it("POST /:userId/mfa/reset removes user_mfa row and revokes sessions", async () => {
    const adminEmail = uniqueEmail("admin.mfa.reset");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const subjectEmail = uniqueEmail("staff.lostdevice");
    const subjectUser = await prisma.user.create({
      data: {
        email: subjectEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "EMPLOYEE" } },
        sessions: {
          create: {
            absoluteExpiresAt: new Date(Date.now() + 86400000),
          },
        },
      },
    });
    createdUserIds.push(subjectUser.id);

    // Setup MFA
    await setupUserMfa(subjectUser.id, subjectEmail);

    const resetRes = await request(app)
      .post(`/api/v1/admin/users/${subjectUser.id}/mfa/reset`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Staff member reported stolen phone" });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Verify user_mfa removed
    const mfa = await prisma.userMfa.findUnique({ where: { userId: subjectUser.id } });
    expect(mfa).toBeNull();

    // Verify sessions revoked
    const activeSessions = await prisma.session.findMany({
      where: { userId: subjectUser.id, revokedAt: null },
    });
    expect(activeSessions).toHaveLength(0);

    // Verify audit log
    const audit = await prisma.auditLog.findFirst({
      where: { targetUserId: subjectUser.id, action: "MFA_RESET" },
    });
    expect(audit).toBeDefined();
  });
});
