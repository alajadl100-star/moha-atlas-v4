const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PerfumeScraper = require('./src/scrapers/perfumeScraper');

dotenv.config();

// الاتصال بـ MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// تشغيل المكاشط
async function runAllScrapers() {
  try {
    console.log('\n🚀 بدء سحب البيانات من جميع المتاجر...\n');
    console.log('⏱️  وقت البدء:', new Date().toLocaleString('ar-QA'));
    console.log('━'.repeat(60));

    // تشغيل جميع المكاشط
    const perfumes = await PerfumeScraper.scrapeAll();

    console.log('━'.repeat(60));
    console.log('\n✅ تم إكمال السحب بنجاح!');
    console.log(`📊 إجمالي العطور المضافة: ${perfumes.length}`);
    console.log('⏱️  وقت الانتهاء:', new Date().toLocaleString('ar-QA'));
    console.log('\n✨ جميع البيانات جاهزة في قاعدة البيانات!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في تشغيل المكاشط:', error.message);
    process.exit(1);
  }
}

// البدء
connectDB().then(() => {
  runAllScrapers();
});
