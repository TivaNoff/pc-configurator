// backend/src/services/importOpenDb.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Component = require('../models/Component');

// Путь к папке open-db (склонированной в корне)
const OPEN_DB_PATH = path.resolve(__dirname, '../../../open-db');

async function importComponents() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for import');

  let count = 0;

  // Перебираем все каталоги (CPU, GPU, ...)
  for (const category of fs.readdirSync(OPEN_DB_PATH)) {
    const categoryPath = path.join(OPEN_DB_PATH, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    // Все JSON-файлы в папке категории
    for (const file of fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'))) {
      const filePath = path.join(categoryPath, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const doc = {
          opendb_id: data.id || path.basename(file, '.json'),
          category,
          specs: data,
          storeIds: {},
          prices: {}
        };
        await Component.updateOne(
          { opendb_id: doc.opendb_id },
          { $set: doc },
          { upsert: true }
        );
        count++;
      } catch (err) {
        console.error(`✖ Error importing ${category}/${file}:`, err.message);
      }
    }
  }

  console.log(`✅ Imported or updated ${count} components.`);
  process.exit(0);
}

importComponents().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
