const cron = require("node-cron");
const { updateAllPrices } = require("../services/priceService");

cron.schedule(
  "0 3 * * *",
  () => {
    updateAllPrices().catch((err) => console.error("Price update error:", err));
  },
  {
    timezone: process.env.TIMEZONE || "Europe/Kyiv",
  }
);
