const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPriceTelemart(telemartId) {
  if (!telemartId) return null;
  try {
    const url = `https://telemart.ua/ru/product/${telemartId}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const text = $("div.product-price__main > span").first().text();
    const price = parseInt(text.replace(/\D/g, ""), 10);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

module.exports = { fetchPriceTelemart };
