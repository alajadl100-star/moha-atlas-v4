const express = require('express');
const router = express.Router();
const Perfume = require('../models/Perfume');
const PriceHistory = require('../models/PriceHistory');

// الحصول على جميع العطور
router.get('/', async (req, res) => {
  try {
    const { search, sort, store } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { name_ar: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (store) {
      query['stores.store_name'] = store;
    }

    let perfumes = await Perfume.find(query).limit(100);

    // تصفية حسب الترتيب
    if (sort === 'price_asc') {
      perfumes = perfumes.sort((a, b) => {
        const priceA = Math.min(...a.stores.map((s) => s.price));
        const priceB = Math.min(...b.stores.map((s) => s.price));
        return priceA - priceB;
      });
    } else if (sort === 'price_desc') {
      perfumes = perfumes.sort((a, b) => {
        const priceA = Math.min(...a.stores.map((s) => s.price));
        const priceB = Math.min(...b.stores.map((s) => s.price));
        return priceB - priceA;
      });
    }

    res.json(perfumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// الحصول على عطر واحد
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    const priceHistory = await PriceHistory.find({
      perfume_id: req.params.id,
    }).sort({ date: -1 }).limit(30);

    res.json({ perfume, priceHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// البحث الفوري
router.get('/search/instant', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await Perfume.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// أرخص عطور
router.get('/deals/cheapest', async (req, res) => {
  try {
    const perfumes = await Perfume.find().limit(50);
    
    const cheapest = perfumes.map((p) => {
      const cheapestStore = p.stores.reduce((min, store) =>
        store.price < min.price ? store : min
      );
      return {
        _id: p._id,
        name_en: p.name_en,
        brand: p.brand,
        image_url: p.image_url,
        cheapest_price: cheapestStore.price,
        cheapest_store: cheapestStore.store_name,
        affiliate_link: cheapestStore.affiliate_link,
      };
    }).sort((a, b) => a.cheapest_price - b.cheapest_price).slice(0, 20);

    res.json(cheapest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
