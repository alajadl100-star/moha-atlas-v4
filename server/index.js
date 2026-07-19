const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const dotenv = require('dotenv');
const { runScraper } = require('./scrapers/scraper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/perfumes', require('./routes/perfumes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('../src/routes/searchRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    setTimeout(connectDB, 5000);
  }
}

// Scheduled scraping - every hour
cron.schedule('0 * * * *', () => {
  console.log('⏰ Running scheduled scraper...');
  runScraper().catch((err) => console.error('Scraper error:', err));
});

// Start server
connectDB();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Search API available at http://localhost:${PORT}/api/search`);
});
