const axios = require('axios');
const cheerio = require('cheerio');

const STORE_NAME = 'Saieco Perfume';
const BASE_URL = 'https://www.saiecoperfume.com';

async function scrapeSaieco() {
  try {
    console.log(`[${STORE_NAME}] Starting scrape...`);
    const response = await axios.get(`${BASE_URL}/en/products`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const perfumes = [];

    // استخراج المنتجات من الموقع
    $('.item-product').each((index, element) => {
      const name = $(element).find('.item-title').text().trim();
      const price = parseFloat(
        $(element).find('.item-price').text().replace(/[^0-9.]/g, '')
      );
      const image_url = $(element).find('img').attr('src');
      const product_url = $(element).find('a').attr('href');
      const brand = $(element).find('.item-brand').text().trim();

      if (name && price) {
        perfumes.push({
          name_en: name,
          brand: brand || 'Unknown',
          price: price,
          currency: 'QAR',
          image_url: image_url,
          store_url: product_url,
          store_name: STORE_NAME,
          last_updated: new Date(),
        });
      }
    });

    console.log(`[${STORE_NAME}] Found ${perfumes.length} perfumes`);
    return perfumes;
  } catch (error) {
    console.error(`[${STORE_NAME}] Scraping error:`, error.message);
    return [];
  }
}

module.exports = { scrapeSaieco };
