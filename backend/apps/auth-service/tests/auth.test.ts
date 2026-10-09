import { describe, it, expect, afterAll } from "vitest";
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
    expect(mfaSetup.body.recoveryCodes).toHaveLength(8);
    const secret = mfaSetup.body.secret;

    // 3. Enable MFA with first TOTP code
    const totpCode = generateTOTP(secret);
    const enableRes = await request(app)
      .post("/api/v1/auth/mfa/enable")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: totpCode });

    expect(enableRes.status).toBe(200);
    expect(enableRes.body.success).toBe(true);

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
    const recoveryCode = mfaSetup.body.recoveryCodes[0];

    await request(app)
      .post("/api/v1/auth/mfa/enable")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: generateTOTP(secret) });

    // 3. Login again -> get mfaToken
    const loginRes = await request(app)
      .post("/api/v1/auth/continue-with-email")
      .send({ email });

    const challengeRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email, code: loginRes.body.devOtp });

    const mfaToken = challengeRes.body.mfaToken;

    // 4. Verify using recovery code
    const recoveryVerifyRes = await request(app)
      .post("/api/v1/auth/mfa/verify")
      .send({
        mfaToken,
        code: recoveryCode,
        isRecoveryCode: true,
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
      .post("/api/v1/auth/mfa/verify")
      .send({
        mfaToken: challenge2.body.mfaToken,
        code: recoveryCode,
        isRecoveryCode: true,
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
    expect(verifyRes.body.recoveryCodes).toHaveLength(10);
    expect(verifyRes.body.mfaToken).toBeDefined();

    const mfaSecret = verifyRes.body.secret;
    const mfaToken1 = verifyRes.body.mfaToken;

    // Step 3: Complete Staff Login via MFA Setup verification
    const totp1 = generateTOTP(mfaSecret);
    const mfaRes = await request(app)
      .post("/api/v1/auth/staff/mfa/verify")
      .send({
        mfaToken: mfaToken1,
        code: totp1,
      });

    expect(mfaRes.status).toBe(200);
    expect(mfaRes.body.accessToken).toBeDefined();
    expect(mfaRes.body.refreshToken).toBeDefined();
    expect(mfaRes.body.user.primaryRole).toBe("ADMIN");
    expect(mfaRes.body.user.defaultRedirect).toBe("/admin/dashboard");

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

    // Verify existing MFA challenge with authenticator numbers
    const totp2 = generateTOTP(mfaSecret);
    const mfaRes2 = await request(app)
      .post("/api/v1/auth/staff/mfa/verify")
      .send({
        mfaToken: verify2.body.mfaToken,
        code: totp2,
      });

    expect(mfaRes2.status).toBe(200);
    expect(mfaRes2.body.accessToken).toBeDefined();
    expect(mfaRes2.body.refreshToken).toBeDefined();
  });
});
