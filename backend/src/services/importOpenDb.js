require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Component = require("../models/Component");

const OPEN_DB_PATH = path.resolve(__dirname, "../../../open-db");

async function importComponents() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected for import");
  let count = 0;
  for (const category of fs.readdirSync(OPEN_DB_PATH)) {
    const catPath = path.join(OPEN_DB_PATH, category);
    if (!fs.statSync(catPath).isDirectory()) continue;
    for (const file of fs
      .readdirSync(catPath)
      .filter((f) => f.endsWith(".json"))) {
      const data = JSON.parse(
        fs.readFileSync(path.join(catPath, file), "utf-8")
      );
      const doc = {
        opendb_id: data.id || path.basename(file, ".json"),
        category,
        specs: data,
        storeIds: {},
        prices: {},
        storeImg: {},
      };
      await Component.updateOne(
        { opendb_id: doc.opendb_id },
        { $set: doc },
        { upsert: true }
      );
      count++;
    }
  }
  console.log(`✅ Imported or updated ${count} components.`);
  process.exit(0);
}

importComponents().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
