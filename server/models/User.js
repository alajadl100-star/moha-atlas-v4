const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    watchlist: [mongoose.Schema.Types.ObjectId],
    price_alerts: [
      {
        perfume_id: mongoose.Schema.Types.ObjectId,
        target_price: Number,
        notified: Boolean,
      },
    ],
    preferred_stores: [String],
    currency: { type: String, default: 'QAR' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
