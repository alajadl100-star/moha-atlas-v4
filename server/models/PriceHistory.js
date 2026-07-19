const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    perfume_id: mongoose.Schema.Types.ObjectId,
    store_name: String,
    price: Number,
    currency: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

perfumeSchema.index({ date: -1 });
perfumeSchema.index({ perfume_id: 1, store_name: 1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
