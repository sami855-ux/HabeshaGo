import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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