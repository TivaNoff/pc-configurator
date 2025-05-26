const axios = require("axios");

async function fetchPriceRozetka(rozetkaId) {
  if (!rozetkaId) return null;
  try {
    const url = `https://api.rozetka.com.ua/api/product-card/v2/get-product-details?front-type=xl&country=UA&product_id=${rozetkaId}`;
    const { data } = await axios.get(url);
    return data.data?.primary_prices?.price != null
      ? Number(data.data.primary_prices.price)
      : null;
  } catch {
    return null;
  }
}

module.exports = { fetchPriceRozetka };
