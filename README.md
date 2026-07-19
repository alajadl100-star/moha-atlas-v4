# MOHA-ATLAS - أرخص عطر في قطر

## نظرة عامة
موقع ويب متخصص في مقارنة أسعار العطور في قطر، يجمع بين Web Scraping والروابط التحويلية والإعلانات للحصول على دخل.

## الميزات

✨ **Web Scraping التلقائي**
- سحب بيانات الأسعار من 3 متاجر عطور قطرية رسمية
- تحديث البيانات كل ساعة تلقائياً

💰 **نموذج الربح**
- روابط تحويل Affiliate من المتاجر
- إعلانات Google AdSense

🔍 **محرك بحث قوي**
- بحث فوري عن العطور
- عرض أرخص سعر لكل عطر
- مقارنة الأسعار بين المتاجر

📊 **قاعدة بيانات**
- تخزين تاريخ الأسعار
- تتبع التغييرات في الأسعار

## المتاجر المدعومة
1. **Perfume Gallery** - https://perfumegallery.qa
2. **Alfazal Perfume** - https://alfazalperfume.com
3. **Saieco Perfume** - https://www.saiecoperfume.com

## التثبيت والتشغيل

### المتطلبات
- Node.js (v14+)
- MongoDB
- npm أو yarn

### الخطوات

1. **استنساخ المستودع**
```bash
git clone https://github.com/alajadl100-star/moha-atlas-v4.git
cd moha-atlas-v4
```

2. **تثبيت الحزم**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env
```

4. **ملء بيانات البيئة في `.env`**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moha-atlas
PORT=5000
GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
PERFUME_GALLERY_AFFILIATE=your_link
ALFAZAL_AFFILIATE=your_link
SAIEECO_AFFILIATE=your_link
```

5. **تشغيل الخادم**
```bash
npm start
```

6. **تشغيل الـ Scraper**
```bash
npm run scrape
```

## API الرئيسية

### الحصول على العطور
```
GET /api/perfumes?search=عطر&sort=price_asc
```

### أرخص العطور
```
GET /api/perfumes/deals/cheapest
```

### بيانات عطر محدد
```
GET /api/perfumes/:id
```

### تشغيل الـ Scraper يدويًا (Admin)
```
POST /api/admin/scrape
```

### الإحصائيات (Admin)
```
GET /api/admin/stats
```

## هيكل المشروع

```
moha-atlas-v4/
├── server/
│   ├── models/           # نماذج MongoDB
│   ├── routes/           # API routes
│   ├── scrapers/         # Web scrapers
│   └── index.js          # نقطة البداية
├── public/
│   ├── index.html        # الصفحة الرئيسية
│   ├── js/               # جافاسكريبت عميل
│   └── styles/           # أنماط CSS
├── .env.example          # متغيرات البيئة
├── package.json          # الحزم والمتطلبات
└── README.md             # هذا الملف
```

## نموذج الربح

### 1. روابط التحويل (Affiliate)
- كل عطر موجود برابط تحويل من المتجر الأصلي
- عند شراء المستخدم من الرابط، تحصل على عمولة

### 2. إعلانات Google AdSense
- إعلانات موضوعة في أعلى وأسفل الصفحة
- دخل من كل نقرة على الإعلان

## التطور المستقبلي

- [ ] نظام تنبيهات الأسعار
- [ ] تطبيق جوال
- [ ] نظام التقييمات والمراجعات
- [ ] متابعة قائمة المفضلة (Wishlist)
- [ ] دعم دول عربية أخرى

## المساهمة

نرحب بمساهماتك! يرجى:
1. Fork المستودع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل

## التواصل

- GitHub: [@alajadl100-star](https://github.com/alajadl100-star)

---

**ملاحظة:** هذا المشروع تم بناؤه باستخدام GitHub Copilot بالذكاء الاصطناعي
