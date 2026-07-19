const express = require('express');
const router = express.Router();
const Perfume = require('../models/Perfume');
const { runScraper } = require('../scrapers/scraper');

// تشغيل الـ scraper يدويًا
router.post('/scrape', async (req, res) => {
  try {
    await runScraper();
    res.json({ message: 'Scraping completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// إحصائيات
router.get('/stats', async (req, res) => {
  try {
    const totalPerfumes = await Perfume.countDocuments();
    const totalStores = await Perfume.aggregate([
      { $group: { _id: null, count: { $sum: { $size: '$stores' } } } },
    ]);

    res.json({
      total_perfumes: totalPerfumes,
      total_store_listings: totalStores[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
