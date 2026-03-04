import cron from "node-cron";

// Import your service functions
import { getUpcomingTrips, sendPassengerReminder } from "./cron-services.js";

// Passenger reminders (24h & 2h before departure)
// Run every 15 mins
cron.schedule(
  "*/15 * * * *",
  async () => {
    try {
      console.log("🕒 Running passenger reminders...");
      const trips = await getUpcomingTrips();
      console.log("🕒 Upcoming trips:", trips.length);

      const now = new Date();
      trips.forEach(async (trip) => {
        const diffMins = (new Date(trip.departureTime) - now) / (1000 * 60); // minutes

        if (diffMins <= 1440 && !trip.reminder24Sent) {
          await sendPassengerReminder(trip, "24h");
        }
        if (diffMins <= 120 && !trip.reminder2hSent) {
          await sendPassengerReminder(trip, "2h");
        }
      });
    } catch (err) {
      console.error("❌ Passenger reminders failed:", err);
    }
  },
  { timezone: "Africa/Addis_Ababa" },
);

// Daily revenue calculation
// Run daily at 2:00 AM
cron.schedule(
  "0 2 * * *",
  async () => {
    try {
      console.log("🕒 Calculating daily revenue...");
      await calculateDailyRevenue();
    } catch (err) {
      console.error("❌ Daily revenue calculation failed:", err);
    }
  },
  { timezone: "Africa/Addis_Ababa" },
);

// Trip updates & driver notifications
// Run every 10 mins
// cron.schedule("*/10 * * * *", async () => {
//   try {
//     console.log("🕒 Sending trip updates & driver notifications...");
//     await notifyTripUpdates();
//     await notifyDrivers();
//   } catch (err) {
//     console.error("❌ Trip updates/driver notifications failed:", err);
//   }
// }, { timezone: "Africa/Addis_Ababa" });

// Promotions / Discounts
// Run daily at 8:00 AM
// cron.schedule("0 8 * * *", async () => {
//   try {
//     console.log("🕒 Sending promotions...");
//     await sendPromotions();
//   } catch (err) {
//     console.error("❌ Promotions failed:", err);
//   }
// }, { timezone: "Africa/Addis_Ababa" });

// Automated refunds
// Run every hour
// cron.schedule("0 * * * *", async () => {
//   try {
//     console.log("🕒 Processing automated refunds...");
//     await processRefunds();
//   } catch (err) {
//     console.error("❌ Refunds processing failed:", err);
//   }
// }, { timezone: "Africa/Addis_Ababa" });

// Payment reminders
// Run every hour
// cron.schedule("0 * * * *", async () => {
//   try {
//     console.log("🕒 Sending payment reminders...");
//     await sendPaymentReminders();
//   } catch (err) {
//     console.error("❌ Payment reminders failed:", err);
//   }
// }, { timezone: "Africa/Addis_Ababa" });

console.log("✅ HabeshaGo cron scheduler started");
