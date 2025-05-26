const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPriceItbox(productUrl) {
  if (!productUrl) return null;
  try {
    const { data: html } = await axios.get(productUrl);
    const $ = cheerio.load(html);
    const text = $("div.product__price .price").first().text();
    const price = parseInt(text.replace(/\D/g, ""), 10);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

module.exports = { fetchPriceItbox };
