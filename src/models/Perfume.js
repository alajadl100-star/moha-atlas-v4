const mongoose = require('mongoose');

// نموذج العطور
const perfumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Perfume Gallery', 'Alfazal', 'Saieeco']
  },
  store: {
    type: String,
    required: true,
    enum: ['perfume-gallery', 'alfazal', 'saieeco']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    default: 'عطور'
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// فهرس للبحث السريع
perfumeSchema.index({ name: 'text', brand: 'text', description: 'text' });
perfumeSchema.index({ store: 1 });
perfumeSchema.index({ price: 1 });
perfumeSchema.index({ rating: 1 });

module.exports = mongoose.model('Perfume', perfumeSchema);
