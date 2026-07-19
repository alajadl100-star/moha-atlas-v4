const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema(
  {
    name_ar: String,
    name_en: String,
    brand: String,
    image_url: String,
    description: String,
    stores: [
      {
        store_name: String,
        store_url: String,
        price: Number,
        currency: String,
        affiliate_link: String,
        last_updated: Date,
        in_stock: Boolean,
      },
    ],
    category: String,
    rating: Number,
    reviews_count: Number,
  },
  { timestamps: true }
);

perfumeSchema.index({ name_en: 'text', brand: 'text' });
perfumeSchema.index({ 'stores.store_name': 1 });

module.exports = mongoose.model('Perfume', perfumeSchema);
