const mongoose = require("mongoose");
const Component = require("../models/Component");
const { fetchPriceRozetka } = require("./priceFetchers/rozetka");
const { fetchPriceTelemart } = require("./priceFetchers/telemart");
const { fetchPriceCompX } = require("./priceFetchers/compx");
const { fetchPriceItbox } = require("./priceFetchers/itbox");

async function updateAllPrices() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  console.log("🔄 Starting price update…");
  const comps = await Component.find({});
  for (const c of comps) {
    const ids = c.storeIds || {};
    const [rz, tm, cx, ib] = await Promise.all([
      fetchPriceRozetka(ids.rozetka),
      fetchPriceTelemart(ids.telemart),
      fetchPriceCompX(ids.compx),
      fetchPriceItbox(ids.itbox),
    ]);
    const newPrices = { rozetka: rz, telemart: tm, compx: cx, itbox: ib };
    if (Object.values(newPrices).some((v) => typeof v === "number")) {
      c.prices = newPrices;
      await c.save();
      console.log(`✅ ${c.opendb_id}:`, newPrices);
    }
  }
  console.log("🎉 Price update completed.");
}

module.exports = { updateAllPrices };
