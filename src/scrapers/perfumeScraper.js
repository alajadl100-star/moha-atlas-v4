const axios = require('axios');
const cheerio = require('cheerio');
const Perfume = require('../models/Perfume');

// Web Scraper للعطور من المتاجر المختلفة

class PerfumeScraper {
  // سحب البيانات من Perfume Gallery
  static async scrapePerfumeGallery() {
    try {
      console.log('🔄 جاري سحب البيانات من Perfume Gallery...');
      
      const url = 'https://perfumegallery.qa';
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      const perfumes = [];
      
      $('div.product-item').each((index, element) => {
        const name = $(element).find('h2.product-name').text().trim();
        const price = $(element).find('span.price').text().trim();
        const image = $(element).find('img').attr('src');
        const link = $(element).find('a').attr('href');
        const description = $(element).find('p.description').text().trim();
        
        if (name && price) {
          perfumes.push({
            name,
            price: this.parsePrice(price),
            image,
            description,
            link,
            source: 'Perfume Gallery',
            store: 'perfume-gallery'
          });
        }
      });
      
      console.log(`✅ تم سحب ${perfumes.length} عطر من Perfume Gallery`);
      return perfumes;
    } catch (error) {
      console.error('❌ خطأ في سحب بيانات Perfume Gallery:', error.message);
      return [];
    }
  }

  // سحب البيانات من Alfazal
  static async scrapeAlfazal() {
    try {
      console.log('🔄 جاري سحب البيانات من Alfazal...');
      
      const url = 'https://alfazalperfume.com';
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      const perfumes = [];
      
      $('div.product-card').each((index, element) => {
        const name = $(element).find('h3.title').text().trim();
        const price = $(element).find('span.amount').text().trim();
        const image = $(element).find('img.product-image').attr('src');
        const link = $(element).find('a.product-link').attr('href');
        const description = $(element).find('p.product-desc').text().trim();
        
        if (name && price) {
          perfumes.push({
            name,
            price: this.parsePrice(price),
            image,
            description,
            link,
            source: 'Alfazal',
            store: 'alfazal'
          });
        }
      });
      
      console.log(`✅ تم سحب ${perfumes.length} عطر من Alfazal`);
      return perfumes;
    } catch (error) {
      console.error('❌ خطأ في سحب بيانات Alfazal:', error.message);
      return [];
    }
  }

  // سحب البيانات من Saieeco
  static async scrapeSaieeco() {
    try {
      console.log('🔄 جاري سحب البيانات من Saieeco...');
      
      const url = 'https://www.saiecoperfume.com';
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      const perfumes = [];
      
      $('div.item-product').each((index, element) => {
        const name = $(element).find('span.item-name').text().trim();
        const price = $(element).find('span.item-price').text().trim();
        const image = $(element).find('img.item-image').attr('src');
        const link = $(element).find('a.item-link').attr('href');
        const description = $(element).find('p.item-description').text().trim();
        
        if (name && price) {
          perfumes.push({
            name,
            price: this.parsePrice(price),
            image,
            description,
            link,
            source: 'Saieeco',
            store: 'saieeco'
          });
        }
      });
      
      console.log(`✅ تم سحب ${perfumes.length} عطر من Saieeco`);
      return perfumes;
    } catch (error) {
      console.error('❌ خطأ في سحب بيانات Saieeco:', error.message);
      return [];
    }
  }

  // دالة لتحويل السعر إلى رقم
  static parsePrice(priceText) {
    const numbers = priceText.match(/\d+/g);
    return numbers ? parseInt(numbers.join('')) : 0;
  }

  // تشغيل جميع المكاشط
  static async scrapeAll() {
    try {
      console.log('🚀 بدء سحب البيانات من جميع المتاجر...');
      
      const [galleryPerfumes, alfazalPerfumes, saieecoPerfumes] = await Promise.all([
        this.scrapePerfumeGallery(),
        this.scrapeAlfazal(),
        this.scrapeSaieeco()
      ]);
      
      const allPerfumes = [...galleryPerfumes, ...alfazalPerfumes, ...saieecoPerfumes];
      
      // حفظ البيانات في MongoDB
      await this.savePerfumesToDB(allPerfumes);
      
      console.log(`✅ تم إكمال السحب! إجمالي العطور: ${allPerfumes.length}`);
      return allPerfumes;
    } catch (error) {
      console.error('❌ خطأ في السحب الكامل:', error.message);
    }
  }

  // حفظ البيانات في قاعدة البيانات
  static async savePerfumesToDB(perfumes) {
    try {
      // حذف البيانات القديمة
      await Perfume.deleteMany({});
      
      // إدراج البيانات الجديدة
      const savedPerfumes = await Perfume.insertMany(perfumes);
      
      console.log(`💾 تم حفظ ${savedPerfumes.length} عطر في قاعدة البيانات`);
      return savedPerfumes;
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error.message);
    }
  }
}

module.exports = PerfumeScraper;
