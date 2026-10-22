import { prisma } from "../prisma";
import { hashToken } from "../utils/crypto";

async function seed() {
  console.log("Seeding staff accounts and active invitations...");

  // 1. Ensure root admin user exists
  const adminEmail = "admin@habeshago.et";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Created root admin user: ${adminEmail} (${admin.id})`);
  } else {
    console.log(`Root admin user already exists: ${adminEmail} (${admin.id})`);
  }

  // Grant ADMIN role
  await prisma.userRoleGrant.upsert({
    where: {
      userId_role: {
        userId: admin.id,
        role: "ADMIN",
      },
    },
    create: {
      userId: admin.id,
      role: "ADMIN",
      reason: "Initial system bootstrap",
    },
    update: {
      revokedAt: null,
      reason: "Initial system bootstrap",
    },
  });
  console.log(`Granted ADMIN role to ${adminEmail}`);

  // 2. Create a demo pending staff invitation for quick onboarding test
  const testInviteToken = "habeshago_staff_demo_invite_token_2026";
  const testInviteHash = hashToken(testInviteToken);
  const testInviteEmail = "dispatcher.addis@habeshago.et";

  await prisma.staffInvite.upsert({
    where: { tokenHash: testInviteHash },
    create: {
      email: testInviteEmail,
      role: "EV_CHARGER_MANAGER",
      tokenHash: testInviteHash,
      invitedById: admin.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    update: {
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("\n========================================================");
  console.log("STAFF SEED COMPLETE:");
  console.log(`1. Root Admin: ${adminEmail} (Role: ADMIN)`);
  console.log(`2. Demo Invite URL: http://localhost:3000/staff/accept-invite?token=${testInviteToken}`);
  console.log(`   Invited Email: ${testInviteEmail} (Role: EV_CHARGER_MANAGER)`);
  console.log("========================================================\n");

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Failed to seed staff:", err);
  process.exit(1);
});
