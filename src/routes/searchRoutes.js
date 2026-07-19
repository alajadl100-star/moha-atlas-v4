const express = require('express');
const SearchController = require('../controllers/searchController');

const router = express.Router();

// طرق البحث والعطور

// البحث عن العطور
router.get('/search', SearchController.searchPerfumes);

// جميع العطور
router.get('/perfumes', SearchController.getAllPerfumes);

// عطر واحد بـ ID
router.get('/perfumes/:id', SearchController.getPerfumeById);

// العطور حسب المتجر
router.get('/stores/:store', SearchController.getPerfumesByStore);

// الماركات المتاحة
router.get('/brands', SearchController.getBrands);

// نطاق الأسعار
router.get('/price-range', SearchController.getPriceRange);

// الإحصائيات العامة
router.get('/statistics', SearchController.getStatistics);

module.exports = router;
