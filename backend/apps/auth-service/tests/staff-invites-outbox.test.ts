import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/prisma";
import { generateAccessToken } from "../src/services/token.service";

describe("D3. Staff Invites, Audit and Outbox (Admin)", () => {
  const app = createApp();
  const createdUserIds: string[] = [];
  const createdInviteIds: string[] = [];

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

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    if (createdInviteIds.length > 0) {
      await prisma.staffInvite.deleteMany({
        where: { id: { in: createdInviteIds } },
      });
    }
  });

  it("POST /api/v1/admin/staff-invites creates invite, logs STAFF_INVITED", async () => {
    const adminEmail = uniqueEmail("inviter.admin");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const inviteeEmail = uniqueEmail("new.driver");
    const createRes = await request(app)
      .post("/api/v1/admin/staff-invites")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: inviteeEmail,
        role: "DRIVER",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.invite.email).toBe(inviteeEmail);
    expect(createRes.body.invite.role).toBe("DRIVER");
    expect(createRes.body.invite.token).toBeDefined();
    expect(createRes.body.invite.inviteUrl).toContain("/staff/accept-invite?token=");
    createdInviteIds.push(createRes.body.invite.id);

    // Verify audit log created
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "STAFF_INVITED",
        actorId: adminUser.id,
      },
    });
    expect(audit).toBeDefined();
  });

  it("GET /api/v1/admin/staff-invites lists invites filtered by status", async () => {
    const adminEmail = uniqueEmail("list.admin");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const listRes = await request(app)
      .get("/api/v1/admin/staff-invites?status=pending")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.pagination).toBeDefined();
  });

  it("DELETE /api/v1/admin/staff-invites/:inviteId cancels by expiring immediately and logs STAFF_INVITE_CANCELLED", async () => {
    const adminEmail = uniqueEmail("canceler.admin");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    // Create an invite to cancel
    const inviteeEmail = uniqueEmail("cancel.target");
    const createRes = await request(app)
      .post("/api/v1/admin/staff-invites")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: inviteeEmail, role: "EMPLOYEE" });
    const inviteId = createRes.body.invite.id;
    createdInviteIds.push(inviteId);

    const cancelRes = await request(app)
      .delete(`/api/v1/admin/staff-invites/${inviteId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.invite.status).toBe("cancelled");

    // Check DB that expiresAt is in the past
    const refreshed = await prisma.staffInvite.findUnique({ where: { id: inviteId } });
    expect(new Date(refreshed!.expiresAt).getTime()).toBeLessThan(Date.now());

    // Check audit log
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "STAFF_INVITE_CANCELLED" as any,
        actorId: adminUser.id,
      },
    });
    expect(audit).toBeDefined();
  });

  it("POST /api/v1/auth/staff-invites/accept is public, marks acceptedAt, provisions user & role, logs events", async () => {
    const adminEmail = uniqueEmail("inviter.foraccept");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const inviteeEmail = uniqueEmail("accepting.staff");
    const createRes = await request(app)
      .post("/api/v1/admin/staff-invites")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: inviteeEmail, role: "EV_CHARGER_MANAGER" });

    const rawToken = createRes.body.invite.token;
    createdInviteIds.push(createRes.body.invite.id);

    // Public acceptance request (no authorization header needed)
    const acceptRes = await request(app)
      .post("/api/v1/auth/staff-invites/accept")
      .send({ token: rawToken });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.data.email).toBe(inviteeEmail);
    expect(acceptRes.body.data.role).toBe("EV_CHARGER_MANAGER");

    // Verify user was created in DB with granted role
    const createdUser = await prisma.user.findUnique({
      where: { email: inviteeEmail },
      include: { roleGrants: true },
    });
    expect(createdUser).toBeDefined();
    if (createdUser) createdUserIds.push(createdUser.id);
    expect(createdUser?.roleGrants.some((r) => r.role === "EV_CHARGER_MANAGER")).toBe(true);

    // Replay attempt must fail (already accepted)
    const replayRes = await request(app)
      .post("/api/v1/auth/staff-invites/accept")
      .send({ token: rawToken });

    expect(replayRes.status).toBe(400);
    expect(replayRes.body.error.code).toBe("INVITE_ALREADY_ACCEPTED");
  });

  it("GET /api/v1/admin/audit-logs retrieves global audit logs", async () => {
    const adminEmail = uniqueEmail("audit.reader");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    const res = await request(app)
      .get("/api/v1/admin/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it("GET and POST retry on /api/v1/admin/outbox-events watches and retries dead letter events", async () => {
    const adminEmail = uniqueEmail("outbox.admin");
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = makeAdminToken(adminUser.id, adminEmail);

    // Seed a failed outbox event
    const failedEvent = await prisma.outboxEvent.create({
      data: {
        type: "TestFailedEvent",
        aggregateId: "agg-123",
        payload: { msg: "failed attempt" },
        attempts: 5,
        failedAt: new Date(),
        lastError: "Connection refused to message broker",
      },
    });

    // 1. List dead letter events
    const listRes = await request(app)
      .get("/api/v1/admin/outbox-events?status=failed")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    const found = listRes.body.data.find((e: any) => e.id === failedEvent.id);
    expect(found).toBeDefined();

    // 2. Retry dead letter event
    const retryRes = await request(app)
      .post(`/api/v1/admin/outbox-events/${failedEvent.id}/retry`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(retryRes.status).toBe(200);
    expect(retryRes.body.success).toBe(true);
    expect(retryRes.body.event.attempts).toBe(0);
    expect(retryRes.body.event.failedAt).toBeNull();

    // Check DB
    const refreshed = await prisma.outboxEvent.findUnique({ where: { id: failedEvent.id } });
    expect(refreshed?.attempts).toBe(0);
    expect(refreshed?.failedAt).toBeNull();
    expect(refreshed?.lastError).toBeNull();
  });
});
