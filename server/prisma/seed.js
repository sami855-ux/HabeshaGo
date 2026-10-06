import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "node:crypto";
import { hashPassword } from "../src/services/password.service.js";

const prisma = new PrismaClient();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedUsers = [
  {
    name: "Demo Passenger",
    email: "passenger.demo@habeshago.local",
    role: "PASSENGER",
  },
  {
    name: "Demo Administrator",
    email: "admin.demo@habeshago.local",
    role: "ADMIN",
  },
  {
    name: "Demo EV Charger Manager",
    email: "ev.manager.demo@habeshago.local",
    role: "EV_CHARGER_MANAGER",
  },
];

const generateSeedPassword = () =>
  `${crypto.randomBytes(18).toString("base64url")}Aa1!`;

async function seedDemoUsers() {
  console.log("Seeding demo users...");

  const credentials = [];
  for (const definition of seedUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: definition.email },
      select: { id: true, role: true },
    });

    if (existing) {
      credentials.push({
        email: definition.email,
        role: existing.role,
        status: "already existed; credentials unchanged",
      });
      continue;
    }

    const password =
      definition.role === "PASSENGER" ? null : generateSeedPassword();
    const user = await prisma.user.create({
      data: {
        ...definition,
        emailVerified: definition.role !== "PASSENGER",
        ...(password ? { password: await hashPassword(password) } : {}),
        wallet: { create: {} },
      },
      select: { id: true, email: true, role: true },
    });

    credentials.push({
      ...user,
      password: password || "Email OTP (development OTP is returned by the API)",
      status: "created",
    });
  }

  console.log("Demo user seed result:");
  console.table(credentials);
}

// Map JSON filenames (plural) to Prisma client properties (singular)
const modelMap = {
  chargingStations: "chargingStation",
  chargingPoints: "chargingPoint",
  tariffs: "tariff",
  vehicles: "vehicle",
  users: "user",
  ratings: "rating",
  chargingSessions: "chargingSession",
  energyMeterLogs: "energyMeterLog",
  reservations: "reservation"
};

/**
 * Seed a specific model
 * @param {string} modelName - Prisma client property
 * @param {Array} data - array of records
 */
async function seedModel(modelName, data) {
  if (!data || data.length === 0) return;

  console.log(`Seeding ${modelName} (${data.length} records)...`);

  for (const record of data) {
    try {
      await prisma[modelName].create({ data: record });
    } catch (err) {
      console.error(`Error seeding ${modelName}:`, err.message);
    }
  }
}

/**
 * Main seeding function
 */
async function main() {
  await seedDemoUsers();

  const dataDir = path.join(__dirname, "data");
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    const ext = path.extname(file);
    if (ext !== ".json") continue;

    const fileKey = path.basename(file, ext);
    const modelName = modelMap[fileKey];
    if (!modelName) {
      console.warn(`No Prisma model mapped for file ${file}`);
      continue;
    }

    const filePath = path.join(dataDir, file);
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    await seedModel(modelName, data);
  }

  console.log("✅ Seeding complete!");
}

// Run seeder
main()
  .catch((e) => {
    console.error("Seeder failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
