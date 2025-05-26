// backend/src/models/Component.js

const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  opendb_id: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  specs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  storeIds: {               // сюда позже запишем id/URL из магазинов
    rozetka: String,
    telemart: String,
    compx: String,
    itbox: String
  },
  prices: {                  // тут будут актуальные цены
    rozetka: Number,
    telemart: Number,
    compx: Number,
    itbox: Number
  }
});

module.exports = mongoose.model('Component', componentSchema);
