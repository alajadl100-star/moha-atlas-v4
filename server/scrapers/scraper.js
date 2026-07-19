const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Perfume = require('../models/Perfume');
const PriceHistory = require('../models/PriceHistory');
const { scrapePerfumeGallery } = require('./perfumeGalleryScraper');
const { scrapeAlfazal } = require('./alfazalScraper');
const { scrapeSaieco } = require('./saiecoScraper');

dotenv.config();

const AFFILIATE_LINKS = {
  'Perfume Gallery': process.env.PERFUME_GALLERY_AFFILIATE,
  'Alfazal Perfume': process.env.ALFAZAL_AFFILIATE,
  'Saieco Perfume': process.env.SAIEECO_AFFILIATE,
};

async function runScraper() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // تشغيل جميع الـ scrapers
    const [galleryPerfumes, alfazalPerfumes, saieccoPerfumes] = await Promise.all([
      scrapePerfumeGallery(),
      scrapeAlfazal(),
      scrapeSaieco(),
    ]);

    const allPerfumes = [
      ...galleryPerfumes,
      ...alfazalPerfumes,
      ...saieccoPerfumes,
    ];

    console.log(`📊 Total perfumes scraped: ${allPerfumes.length}`);

    // حفظ البيانات في قاعدة البيانات
    for (const perfume of allPerfumes) {
      const key = `${perfume.brand}||${perfume.name_en}`;

      let dbPerfume = await Perfume.findOne({
        $expr: {
          $eq: [
            { $concat: ['$brand', '||', '$name_en'] },
            key,
          ],
        },
      });

      if (!dbPerfume) {
        dbPerfume = new Perfume({
          name_en: perfume.name_en,
          brand: perfume.brand,
          image_url: perfume.image_url,
          category: 'Fragrance',
        });
      }

      // تحديث أو إضافة معلومات المتجر
      const storeIndex = dbPerfume.stores.findIndex(
        (s) => s.store_name === perfume.store_name
      );
      const storeData = {
        store_name: perfume.store_name,
        store_url: perfume.store_url,
        price: perfume.price,
        currency: perfume.currency,
        affiliate_link: AFFILIATE_LINKS[perfume.store_name] || perfume.store_url,
        last_updated: new Date(),
        in_stock: true,
      };

      if (storeIndex >= 0) {
        dbPerfume.stores[storeIndex] = storeData;
      } else {
        dbPerfume.stores.push(storeData);
      }

      await dbPerfume.save();

      // حفظ سجل الأسعار
      await PriceHistory.create({
        perfume_id: dbPerfume._id,
        store_name: perfume.store_name,
        price: perfume.price,
        currency: perfume.currency,
      });
    }

    console.log('✅ Data saved to database successfully');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Scraper error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runScraper();
}

module.exports = { runScraper };
