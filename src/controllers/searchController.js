const Perfume = require('../models/Perfume');

// Search Controller للبحث عن العطور

class SearchController {
  // البحث عن العطور
  static async searchPerfumes(req, res) {
    try {
      const { query, store, minPrice, maxPrice, brand, sort } = req.query;
      
      // بناء الفلاتر
      let filter = {};
      
      // البحث بالاسم أو الماركة أو الوصف
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
      
      // الفلتر بالمتجر
      if (store) {
        filter.store = store;
      }
      
      // الفلتر بالماركة
      if (brand) {
        filter.brand = { $regex: brand, $options: 'i' };
      }
      
      // الفلتر بنطاق السعر
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseInt(minPrice);
        if (maxPrice) filter.price.$lte = parseInt(maxPrice);
      }
      
      // ترتيب النتائج
      let sortObj = { createdAt: -1 }; // الافتراضي: الأحدث أولاً
      
      if (sort === 'price-low') {
        sortObj = { price: 1 };
      } else if (sort === 'price-high') {
        sortObj = { price: -1 };
      } else if (sort === 'rating') {
        sortObj = { rating: -1 };
      } else if (sort === 'newest') {
        sortObj = { createdAt: -1 };
      }
      
      // البحث في قاعدة البيانات
      const perfumes = await Perfume.find(filter)
        .sort(sortObj)
        .limit(50)
        .lean();
      
      // عد النتائج
      const total = await Perfume.countDocuments(filter);
      
      return res.status(200).json({
        success: true,
        total,
        results: perfumes,
        message: `تم العثور على ${total} عطر`
      });
      
    } catch (error) {
      console.error('❌ خطأ في البحث:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في البحث',
        error: error.message
      });
    }
  }

  // الحصول على جميع العطور
  static async getAllPerfumes(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      
      const perfumes = await Perfume.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      const total = await Perfume.countDocuments();
      
      return res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        results: perfumes
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب العطور:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب العطور',
        error: error.message
      });
    }
  }

  // الحصول على عطر واحد
  static async getPerfumeById(req, res) {
    try {
      const { id } = req.params;
      
      const perfume = await Perfume.findById(id);
      
      if (!perfume) {
        return res.status(404).json({
          success: false,
          message: 'العطر غير موجود'
        });
      }
      
      return res.status(200).json({
        success: true,
        result: perfume
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب العطر:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب العطر',
        error: error.message
      });
    }
  }

  // الحصول على العطور حسب المتجر
  static async getPerfumesByStore(req, res) {
    try {
      const { store } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      
      const perfumes = await Perfume.find({ store })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      const total = await Perfume.countDocuments({ store });
      
      return res.status(200).json({
        success: true,
        store,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        results: perfumes
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب العطور:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب العطور',
        error: error.message
      });
    }
  }

  // الحصول على الماركات المتاحة
  static async getBrands(req, res) {
    try {
      const brands = await Perfume.distinct('brand');
      
      return res.status(200).json({
        success: true,
        total: brands.length,
        brands: brands.filter(b => b) // إزالة القيم الفارغة
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب الماركات:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب الماركات',
        error: error.message
      });
    }
  }

  // الحصول على نطاق الأسعار
  static async getPriceRange(req, res) {
    try {
      const priceData = await Perfume.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);
      
      const prices = priceData[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 };
      
      return res.status(200).json({
        success: true,
        priceRange: {
          min: Math.floor(prices.minPrice),
          max: Math.ceil(prices.maxPrice),
          average: Math.floor(prices.avgPrice)
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب نطاق الأسعار:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب نطاق الأسعار',
        error: error.message
      });
    }
  }

  // الإحصائيات العامة
  static async getStatistics(req, res) {
    try {
      const total = await Perfume.countDocuments();
      const stores = await Perfume.aggregate([
        {
          $group: {
            _id: '$store',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const avgRating = await Perfume.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ]);
      
      return res.status(200).json({
        success: true,
        statistics: {
          totalPerfumes: total,
          storeBreakdown: stores,
          averageRating: avgRating[0]?.avgRating || 0
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error.message);
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإحصائيات',
        error: error.message
      });
    }
  }
}

module.exports = SearchController;
