import { describe, it, expect, afterAll, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/prisma";
import { generateTOTP } from "../src/utils/crypto";

describe("auth-service register/login with OTP and MFA (Web & Mobile)", () => {
  const app = createApp();
  const createdUserIds: string[] = [];

  const uniqueEmail = (prefix: string) =>
    `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  });

  it("handles unified continue-with-email: registers new user with isNewUser=true", async () => {
    const email = uniqueEmail("driver.sam");
    const res = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("OTP sent to email");
    expect(res.body.email).toBe(email);
    expect(res.body.isNewUser).toBe(true);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);

    // Verify user created in DB with default PASSENGER role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roleGrants: true },
    });
    expect(user).toBeDefined();
    if (user) createdUserIds.push(user.id);
    expect(user?.roleGrants[0].role).toBe("PASSENGER");
  });

  it("handles unified continue-with-email for existing user: returns isNewUser=false", async () => {
    const email = uniqueEmail("existing.user");
    // Create user in DB first
    const created = await prisma.user.create({
      data: {
        email,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
      },
    });
    createdUserIds.push(created.id);

    const res = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isNewUser).toBe(false);
    expect(res.body.devOtp).toMatch(/^\d{6}$/);
  });

  it("rejects invalid email address format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email: "invalid-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_EMAIL");
  });

  it("verifies OTP for WEB: sets HttpOnly cookie and issues tokens", async () => {
    const email = uniqueEmail("webuser");

    // 1. Initiate login
    const initRes = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email, clientType: "web" });

    const otpCode = initRes.body.devOtp;
    expect(otpCode).toBeDefined();

    // 2. Verify OTP as web client
    const verifyRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: otpCode, clientType: "web" });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.refreshToken).toBeDefined();
    expect(verifyRes.body.user.email).toBe(email);
    if (verifyRes.body.user?.id) createdUserIds.push(verifyRes.body.user.id);

    // Check that cookie was set for web
    const setCookie = verifyRes.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain("refreshToken=");
    expect(setCookie[0]).toContain("HttpOnly");

    // Check user email is verified in DB
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });
    expect(dbUser?.emailVerifiedAt).not.toBeNull();
  });

  it("verifies OTP for MOBILE: does NOT set cookie and returns tokens in JSON body", async () => {
    const email = uniqueEmail("mobileuser");

    // 1. Initiate login
    const initRes = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const otpCode = initRes.body.devOtp;

    // 2. Verify OTP as mobile client (header + body)
    const verifyRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .set("x-client-type", "mobile")
      .send({
        email,
        code: otpCode,
        clientType: "mobile",
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.refreshToken).toBeDefined();
    expect(verifyRes.body.user.email).toBe(email);
    if (verifyRes.body.user?.id) createdUserIds.push(verifyRes.body.user.id);

    // Mobile MUST NOT receive a refreshToken cookie
    const setCookie = verifyRes.headers["set-cookie"];
    expect(setCookie).toBeUndefined();
  });

  it("enforces max attempts and lockout on incorrect OTP", async () => {
    const email = uniqueEmail("testlockout");

    await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    // Submit wrong OTP 4 times
    for (let i = 0; i < 4; i++) {
      const failRes = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({ email, code: "000000" });

      expect(failRes.status).toBe(400);
      expect(failRes.body.error.code).toBe("INVALID_OTP");
    }

    // 5th attempt locks the OTP
    const lockRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: "000000" });

    expect(lockRes.status).toBe(429);
    expect(lockRes.body.error.code).toBe("OTP_LOCKED");
  });

  it("handles MFA flow: OTP returns challenge token -> TOTP code finishes login", async () => {
    const email = uniqueEmail("mfatest");

    // 1. Setup user & login first time
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const verifyInit = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init.body.devOtp });

    const token = verifyInit.body.accessToken;
    if (verifyInit.body.user?.id) createdUserIds.push(verifyInit.body.user.id);

    // 2. Setup MFA
    const mfaSetup = await request(app)
      .post("/api/v1/auth/mfa/setup")
      .set("Authorization", `Bearer ${token}`);

    expect(mfaSetup.status).toBe(200);
    expect(mfaSetup.body.secret).toBeDefined();
    expect(mfaSetup.body.otpauthUri).toBeDefined();
    const secret = mfaSetup.body.secret;

    // 3. Confirm and enable MFA with verify-setup -> returns recovery codes once
    const totpCode = generateTOTP(secret);
    const enableRes = await request(app)
      .post("/api/v1/auth/mfa/verify-setup")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: totpCode });

    expect(enableRes.status).toBe(200);
    expect(enableRes.body.success).toBe(true);
    expect(enableRes.body.recoveryCodes).toHaveLength(8);

    // 4. Now, simulate NEW login for this MFA-enabled user
    const loginAgain = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const otpAgain = loginAgain.body.devOtp;

    // 5. Verify email OTP -> should require MFA!
    const mfaChallengeRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: otpAgain, clientType: "mobile" });

    expect(mfaChallengeRes.status).toBe(200);
    expect(mfaChallengeRes.body.mfaRequired).toBe(true);
    expect(mfaChallengeRes.body.mfaToken).toBeDefined();
    expect(mfaChallengeRes.body.mfaMethod).toBe("TOTP");
    // Full access/refresh token MUST NOT be issued yet!
    expect(mfaChallengeRes.body.accessToken).toBeUndefined();

    const mfaToken = mfaChallengeRes.body.mfaToken;

    // 6. Complete MFA challenge with TOTP
    const freshTotp = generateTOTP(secret, Date.now() + 30000);
    const mfaVerifyRes = await request(app)
      .post("/api/v1/auth/mfa/verify")
      .send({
        mfaToken,
        code: freshTotp,
        clientType: "mobile",
      });

    expect(mfaVerifyRes.status).toBe(200);
    expect(mfaVerifyRes.body.success).toBe(true);
    expect(mfaVerifyRes.body.accessToken).toBeDefined();
    expect(mfaVerifyRes.body.refreshToken).toBeDefined();
  });

  it("handles MFA recovery code authentication", async () => {
    const email = uniqueEmail("recovery");

    // 1. Setup user
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const verifyInit = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init.body.devOtp });

    const token = verifyInit.body.accessToken;
    if (verifyInit.body.user?.id) createdUserIds.push(verifyInit.body.user.id);

    // 2. Setup and enable MFA
    const mfaSetup = await request(app)
      .post("/api/v1/auth/mfa/setup")
      .set("Authorization", `Bearer ${token}`);

    const secret = mfaSetup.body.secret;

    const enableRes = await request(app)
      .post("/api/v1/auth/mfa/verify-setup")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: generateTOTP(secret) });

    expect(enableRes.body.recoveryCodes).toHaveLength(8);
    const recoveryCode = enableRes.body.recoveryCodes[0];

    // 3. Login again -> get mfaToken
    const loginRes = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const challengeRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: loginRes.body.devOtp });

    const mfaToken = challengeRes.body.mfaToken;

    // 4. Verify using recovery code via POST /api/v1/auth/mfa/recovery
    const recoveryVerifyRes = await request(app)
      .post("/api/v1/auth/mfa/recovery")
      .send({
        mfaToken,
        recoveryCode,
        clientType: "mobile",
      });

    expect(recoveryVerifyRes.status).toBe(200);
    expect(recoveryVerifyRes.body.accessToken).toBeDefined();

    // 5. Reusing the same single-use recovery code must fail
    const loginAgain = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const challenge2 = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: loginAgain.body.devOtp });

    const reuseRes = await request(app)
      .post("/api/v1/auth/mfa/recovery")
      .send({
        mfaToken: challenge2.body.mfaToken,
        recoveryCode,
      });

    expect(reuseRes.status).toBe(400);
    expect(reuseRes.body.error.code).toBe("INVALID_RECOVERY_CODE");
  });

  it("supports token refresh for mobile (via body) with token rotation", async () => {
    const email = uniqueEmail("refreshtest");

    // 1. Mobile login
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const verify = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({
        email,
        code: init.body.devOtp,
        clientType: "mobile",
      });

    const oldRefreshToken = verify.body.refreshToken;
    expect(oldRefreshToken).toBeDefined();
    if (verify.body.user?.id) createdUserIds.push(verify.body.user.id);

    // 2. Refresh token via POST body
    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefreshToken, clientType: "mobile" });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();
    expect(refreshRes.body.refreshToken).not.toBe(oldRefreshToken);

    const newRefreshToken = refreshRes.body.refreshToken;

    // 3. Security: Attempting to reuse old refresh token triggers reuse detection
    const reuseRes = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefreshToken, clientType: "mobile" });

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe("TOKEN_REUSE_DETECTED");

    // 4. Because reuse was detected, session is terminated and even newRefreshToken is now invalid
    const invalidAfterReuse = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: newRefreshToken, clientType: "mobile" });

    expect(invalidAfterReuse.status).toBe(401);
  });

  it("supports profile retrieval via /me and session revocation via /logout", async () => {
    const email = uniqueEmail("userprofile");

    // 1. Login
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const verify = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init.body.devOtp });

    const accessToken = verify.body.accessToken;
    const refreshToken = verify.body.refreshToken;
    if (verify.body.user?.id) createdUserIds.push(verify.body.user.id);

    // 2. Get /me
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.mfaEnabled).toBe(false);

    // 3. Logout
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Refresh token should now be rejected as session revoked
    const refreshAfterLogout = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });

  it("handles mobile logout via body refreshToken: revokes session without cookies", async () => {
    const email = uniqueEmail("mobilelogout");

    // Login on mobile
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email, clientType: "mobile" });

    const verify = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init.body.devOtp, clientType: "mobile" });

    const refreshToken = verify.body.refreshToken;
    if (verify.body.user?.id) createdUserIds.push(verify.body.user.id);

    // Logout from mobile using refreshToken in body
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken, clientType: "mobile" });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(logoutRes.body.message).toBe("Logged out successfully");

    // Refreshing should now fail
    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken, clientType: "mobile" });

    expect(refreshRes.status).toBe(401);
  });

  it("handles web logout via HttpOnly cookie: clears cookie and revokes session", async () => {
    const email = uniqueEmail("weblogout");

    // Login on web
    const init = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email, clientType: "web" });

    const verify = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init.body.devOtp, clientType: "web" });

    const cookieHeader = verify.headers["set-cookie"];
    expect(cookieHeader).toBeDefined();
    const refreshCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
    if (verify.body.user?.id) createdUserIds.push(verify.body.user.id);

    // Logout on web passing only the cookie
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", refreshCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Cookie is cleared on response
    const clearedCookies = logoutRes.headers["set-cookie"];
    expect(clearedCookies).toBeDefined();
    const clearedStr = Array.isArray(clearedCookies) ? clearedCookies.join(";") : clearedCookies;
    expect(clearedStr).toContain("refreshToken=;");

    // Refreshing with original cookie now fails
    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie);

    expect(refreshRes.status).toBe(401);
  });

  it("handles logout-all: revokes all active sessions for current user across multiple devices", async () => {
    const email = uniqueEmail("logoutall");

    // Device 1: Mobile login
    const init1 = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email, clientType: "mobile" });

    const verify1 = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init1.body.devOtp, clientType: "mobile" });

    const token1 = verify1.body.refreshToken;
    const access1 = verify1.body.accessToken;
    const userId = verify1.body.user.id;
    if (userId) createdUserIds.push(userId);

    // Device 2: Web login
    const init2 = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email, clientType: "web" });

    const verify2 = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: init2.body.devOtp, clientType: "web" });

    const token2 = verify2.body.refreshToken;

    // Both sessions should be valid and active in DB
    const activeSessionsBefore = await prisma.session.count({
      where: { userId, revokedAt: null },
    });
    expect(activeSessionsBefore).toBe(2);

    // Call /logout-all from Device 1 with Authorization header
    const logoutAllRes = await request(app)
      .post("/api/v1/auth/logout-all")
      .set("Authorization", `Bearer ${access1}`);

    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.success).toBe(true);
    expect(logoutAllRes.body.message).toBe("All sessions revoked successfully");
    expect(logoutAllRes.body.revokedCount).toBe(2);

    // Both sessions should now be revoked in DB
    const activeSessionsAfter = await prisma.session.count({
      where: { userId, revokedAt: null },
    });
    expect(activeSessionsAfter).toBe(0);

    // Both device refresh tokens must now be rejected
    const refresh1 = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: token1 });
    expect(refresh1.status).toBe(401);

    const refresh2 = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: token2 });
    expect(refresh2.status).toBe(401);
  });

  it("rejects unauthenticated logout-all request", async () => {
    const res = await request(app).post("/api/v1/auth/logout-all");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects non-staff user or non-existent user when attempting staff login", async () => {
    // Non-existent user
    const nonExistentRes = await request(app)
      .post("/api/v1/auth/staff/login")
      .send({ email: uniqueEmail("ghost.staff") });

    expect(nonExistentRes.status).toBe(403);
    expect(nonExistentRes.body.error.code).toBe("STAFF_ACCESS_DENIED");

    // Passenger user (not a staff role)
    const email = uniqueEmail("passenger.only");
    const user = await prisma.user.create({
      data: {
        email,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
      },
    });
    createdUserIds.push(user.id);

    const passengerRes = await request(app)
      .post("/api/v1/auth/staff/login")
      .send({ email });

    expect(passengerRes.status).toBe(403);
    expect(passengerRes.body.error.code).toBe("STAFF_ACCESS_DENIED");
  });

  it("handles staff login: starts up MFA if not enabled, then prompts for TOTP once enabled", async () => {
    const email = uniqueEmail("admin.staff");
    const user = await prisma.user.create({
      data: {
        email,
        status: "ACTIVE",
        roleGrants: { create: { role: "ADMIN" } },
      },
    });
    createdUserIds.push(user.id);

    // Step 1: Staff Login -> dispatches OTP
    const loginRes = await request(app)
      .post("/api/v1/auth/staff/login")
      .send({ email });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.devOtp).toMatch(/^\d{6}$/);

    // Step 2: Staff Verify OTP -> MFA is NOT yet enabled, so it automatically starts up MFA
    const verifyRes = await request(app)
      .post("/api/v1/auth/staff/verify-otp")
      .send({ email, code: loginRes.body.devOtp });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.mfaRequired).toBe(true);
    expect(verifyRes.body.mfaSetupRequired).toBe(true);
    expect(verifyRes.body.secret).toBeDefined();
    expect(verifyRes.body.otpauthUri).toBeDefined();
    expect(verifyRes.body.recoveryCodes).toHaveLength(8);
    expect(verifyRes.body.mfaToken).toBeDefined();

    const mfaSecret = verifyRes.body.secret;
    const mfaToken1 = verifyRes.body.mfaToken;

    // Step 3: Complete Staff Login via MFA Setup verification at /mfa/enroll/verify
    const totp1 = generateTOTP(mfaSecret);
    const mfaRes = await request(app)
      .post("/api/v1/auth/mfa/enroll/verify")
      .send({
        mfaToken: mfaToken1,
        code: totp1,
      });

    expect(mfaRes.status).toBe(200);
    expect(mfaRes.body.accessToken).toBeDefined();
    expect(mfaRes.body.refreshToken).toBeDefined();
    expect(mfaRes.body.recoveryCodes).toHaveLength(8);
    expect(mfaRes.body.user.primaryRole).toBe("ADMIN");
    expect(mfaRes.body.user.defaultRedirect).toBe("/admin");

    // Subsequent Login: MFA is now enabled, so staff user is prompted to type numbers (mfaSetupRequired: false)
    const login2 = await request(app)
      .post("/api/v1/auth/staff/login")
      .send({ email });

    expect(login2.status).toBe(200);
    expect(login2.body.devOtp).toBeDefined();

    const verify2 = await request(app)
      .post("/api/v1/auth/staff/verify-otp")
      .send({ email, code: login2.body.devOtp });

    expect(verify2.status).toBe(200);
    expect(verify2.body.mfaRequired).toBe(true);
    expect(verify2.body.mfaSetupRequired).toBe(false);
    expect(verify2.body.mfaMethod).toBe("TOTP");
    expect(verify2.body.mfaToken).toBeDefined();

    // Verify existing MFA challenge with authenticator numbers at /mfa/verify (next 30s window to avoid replay prevention)
    const totp2 = generateTOTP(mfaSecret, Date.now() + 30000);
    const mfaRes2 = await request(app)
      .post("/api/v1/auth/mfa/verify")
      .send({
        mfaToken: verify2.body.mfaToken,
        code: totp2,
      });

    expect(mfaRes2.status).toBe(200);
    expect(mfaRes2.body.accessToken).toBeDefined();
    expect(mfaRes2.body.refreshToken).toBeDefined();
  });
});

describe("auth-service Google Sign-In & OAuth Code Exchange", () => {
  const app = createApp();
  const createdUserIds: string[] = [];

  const uniqueEmail = (prefix: string) =>
    `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  });

  it("generates Google OAuth URL via /google/url and redirects via /google", async () => {
    const resUrl = await request(app).get("/api/v1/auth/google/url");
    expect(resUrl.status).toBe(200);
    expect(resUrl.body.success).toBe(true);
    expect(resUrl.body.url).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(resUrl.body.url).toContain("client_id=");
    expect(resUrl.body.url).toContain("redirect_uri=");
    expect(resUrl.body.url).toContain("scope=openid+email+profile");

    const resRedirect = await request(app).get("/api/v1/auth/google");
    expect(resRedirect.status).toBe(302);
    expect(resRedirect.header.location).toContain("accounts.google.com/o/oauth2/v2/auth");
  });

  it("authenticates new user with Google token: creates user, role grant, and OAuthAccount", async () => {
    const googleEmail = uniqueEmail("google.new");
    const googleSub = `google_${Date.now()}`;

    // Mock global fetch for Google verification
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes("tokeninfo") || urlStr.includes("userinfo")) {
        return {
          ok: true,
          json: async () => ({
            sub: googleSub,
            email: googleEmail,
            email_verified: "true",
            name: "New Google User",
            picture: "https://example.com/photo.jpg",
          }),
        } as any;
      }
      return { ok: false, status: 400, json: async () => ({}) } as any;
    });

    try {
      const res = await request(app)
        .post("/api/v1/auth/google")
        .send({
          token: "mock_google_id_token",
          clientType: "mobile",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(googleEmail);
      expect(res.body.user.role).toBe("PASSENGER");
      createdUserIds.push(res.body.user.id);

      // Verify DB record
      const dbUser = await prisma.user.findUnique({
        where: { id: res.body.user.id },
        include: { roleGrants: true, oauthAccounts: true },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(googleEmail);
      expect(dbUser?.emailVerifiedAt).not.toBeNull();
      expect(dbUser?.roleGrants[0].role).toBe("PASSENGER");
      expect(dbUser?.oauthAccounts).toHaveLength(1);
      expect(dbUser?.oauthAccounts[0].provider).toBe("GOOGLE");
      expect(dbUser?.oauthAccounts[0].providerAccountId).toBe(googleSub);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("links Google account to existing user with same email", async () => {
    const existingEmail = uniqueEmail("google.existing");
    const googleSub = `google_${Date.now()}`;

    // Create user manually first
    const created = await prisma.user.create({
      data: {
        email: existingEmail,
        status: "ACTIVE",
        roleGrants: { create: { role: "PASSENGER" } },
      },
    });
    createdUserIds.push(created.id);

    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({
          sub: googleSub,
          email: existingEmail,
          email_verified: true,
          name: "Linked Google User",
        }),
      } as any;
    });

    try {
      const res = await request(app)
        .post("/api/v1/auth/google")
        .send({ token: "valid_token" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(created.id);

      // Check that OAuthAccount was linked in DB
      const oauth = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "GOOGLE",
            providerAccountId: googleSub,
          },
        },
      });
      expect(oauth).toBeDefined();
      expect(oauth?.userId).toBe(created.id);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("rejects Google token with unverified email", async () => {
    const unverifiedEmail = uniqueEmail("unverified");
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({
          sub: "sub_unverified",
          email: unverifiedEmail,
          email_verified: false,
        }),
      } as any;
    });

    try {
      const res = await request(app)
        .post("/api/v1/auth/google")
        .send({ token: "unverified_token" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("GOOGLE_EMAIL_NOT_VERIFIED");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("handles Google OAuth callback with authorization code: redirects with one-time exchange code", async () => {
    const callbackEmail = uniqueEmail("google.callback");
    const googleSub = `google_${Date.now()}`;

    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "google_access_token_123" }),
        } as any;
      }
      if (urlStr.includes("userinfo")) {
        return {
          ok: true,
          json: async () => ({
            sub: googleSub,
            email: callbackEmail,
            email_verified: true,
            name: "Callback User",
          }),
        } as any;
      }
      return { ok: false, status: 400, json: async () => ({}) } as any;
    });

    try {
      const res = await request(app)
        .get("/api/v1/auth/google/callback?code=mock_google_auth_code");

      expect(res.status).toBe(302);
      expect(res.header.location).toContain("/user?code=");

      // Verify user was registered
      const user = await prisma.user.findUnique({ where: { email: callbackEmail } });
      expect(user).toBeDefined();
      if (user) createdUserIds.push(user.id);

      // Extract code and test /exchange
      const url = new URL(res.header.location);
      const code = url.searchParams.get("code");
      expect(code).toBeDefined();

      // Exchange code for token
      const exchangeRes = await request(app).get(`/api/v1/auth/exchange?code=${code}`);
      expect(exchangeRes.status).toBe(200);
      expect(exchangeRes.body.success).toBe(true);
      expect(exchangeRes.body.accessToken).toBeDefined();

      // Second exchange attempt must fail (one-time use)
      const replayRes = await request(app).get(`/api/v1/auth/exchange?code=${code}`);
      expect(replayRes.status).toBe(400);
      expect(replayRes.body.error.code).toBe("INVALID_OAUTH_CODE");
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
