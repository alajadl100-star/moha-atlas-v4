// === إعداد: ضع معرف الـGoogle Sheet هنا ===
const SHEET_ID = "REPLACE_WITH_SHEET_ID"; // مثال: 1AbCdeFGhIJ_kLmNoPqRst...
// العرض الافتراضي: 'ar' أو 'en'
let lang = 'ar';

const PRODUCTS_CONTAINER = document.getElementById('products');
const SEARCH = document.getElementById('search');
const BTN_AR = document.getElementById('btn-ar');
const BTN_EN = document.getElementById('btn-en');
const TITLE = document.getElementById('title');
const FOOTER = document.getElementById('footer-note');

BTN_AR.onclick = () => setLang('ar');
BTN_EN.onclick = () => setLang('en');
SEARCH.oninput = () => render(currentData);

function setLang(l){
  lang = l;
  BTN_AR.classList.toggle('active', l==='ar');
  BTN_EN.classList.toggle('active', l==='en');
  document.documentElement.lang = (l==='ar') ? 'ar' : 'en';
  document.documentElement.dir = (l==='ar') ? 'rtl' : 'ltr';
  render(currentData);
}

function gvizUrl(sheetId){
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
}

async function fetchSheet(){
  if(!SHEET_ID || SHEET_ID.includes('REPLACE')) {
    PRODUCTS_CONTAINER.innerHTML = `<p class="note-small">ضع معرف Google Sheet في app.js ثم أعد تحميل الصفحة.</p>`;
    return [];
  }
  try{
    const res = await fetch(gvizUrl(SHEET_ID));
    const text = await res.text();
    // gviz يلف النتيجة، فنستخرج JSON داخل القوسين
    const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([[\s\S\w]+)\)/)[1];
    const data = JSON.parse(jsonText);
    const cols = data.table.cols.map(c => c.label);
    const rows = data.table.rows.map(r => {
      const obj = {};
      r.c.forEach((cell,i) => {
        obj[cols[i]] = cell ? cell.v : '';
      });
      return obj;
    });
    return rows;
  }catch(e){
    PRODUCTS_CONTAINER.innerHTML = `<p class="note-small">حدث خطأ في جلب البيانات. تأكد من نشر الورقة وأن المعرف صحيح.</p>`;
    console.error(e);
    return [];
  }
}

// سنحَوّل الصفوف إلى منتجات مجمعة حسب id أو brand+product_name_en
function groupProducts(rows){
  const map = new Map();
  for(const r of rows){
    const key = (r.id && r.id !== '') ? r.id : `${r.brand}||${r.product_name_en}||${r.size}`;
    if(!map.has(key)){
      map.set(key,{
        id: key,
        brand: r.brand || '',
        product_name_en: r.product_name_en || '',
        product_name_ar: r.product_name_ar || '',
        size: r.size || '',
        image_url: r.image_url || '',
        stores: []
      });
    }
    // store row
    if(r.store_name && r.store_name.trim() !== ''){
      map.get(key).stores.push({
        store_name: r.store_name,
        store_price: r.store_price ? parseFloat(r.store_price) : null,
        currency: r.currency || '',
        store_link: r.store_link || '',
        last_updated: r.last_updated || '',
        notes: r.notes || ''
      });
    }
  }
  return Array.from(map.values());
}

function formatPrice(p, currency){
  if(p === null || p === undefined || Number.isNaN(p)) return '-';
  return `${p} ${currency||''}`.trim();
}

function render(rawRows){
  if(!rawRows || rawRows.length === 0){
    PRODUCTS_CONTAINER.innerHTML = `<p class="note-small">لا توجد بيانات للعرض — افتح Google Sheet واملأ الصفوف ثم انشرها.</p>`;
    return;
  }
  const query = SEARCH.value.trim().toLowerCase();
  const products = groupProducts(rawRows);
  let html = '';
  for(const prod of products){
    const name = (lang==='ar' && prod.product_name_ar) ? prod.product_name_ar : prod.product_name_en;
    if(query && !(name||'').toLowerCase().includes(query) && !(prod.brand||'').toLowerCase().includes(query)) continue;
    // إيجاد أقل سعر
    const validStores = prod.stores.filter(s => s.store_price !== null && !Number.isNaN(s.store_price));
    let cheapest = null;
    if(validStores.length) cheapest = validStores.reduce((a,b)=> a.store_price <= b.store_price ? a : b);
    html += `<article class="card">
      <img src="${prod.image_url || 'https://via.placeholder.com/90?text=No+Image'}" alt="${name}">
      <div class="info">
        <h2>${name} <small class="note-small"> - ${prod.brand} ${prod.size ? '• '+prod.size : ''}</small></h2>
        <ul class="store-list">`;
    if(prod.stores.length === 0){
      html += `<li class="note-small">لا توجد متاجر مسجلة لهذا المنتج.</li>`;
    } else {
      for(const s of prod.stores){
        const isCheap = cheapest && s.store_price === cheapest.store_price;
        html += `<li${isCheap ? ' class="cheapest"' : ''}>
          <span>${s.store_name}${s.notes ? ' • '+s.notes : ''}</span>
          <span>${formatPrice(s.store_price, s.currency)} ${s.store_link ? `<a class="store-link" href="${s.store_link}" target="_blank">زيارة</a>` : ''}</span>
        </li>`;
      }
    }
    if(cheapest){
      html += `</ul><div class="note-small">الأرخص الآن: <strong>${formatPrice(cheapest.store_price, cheapest.currency)}</strong> — ${cheapest.store_name} (تم التحديث: ${cheapest.last_updated || '—'})</div>`;
    } else {
      html += `</ul><div class="note-small">لا توجد أسعار صالحة لهذا المنتج.</div>`;
    }
    html += `</div></article>`;
  }
  PRODUCTS_CONTAINER.innerHTML = html || `<p class="note-small">لا توجد منتجات بعد التطابق مع البحث.</p>`;
}

// قيمة حالية للصفوف
let currentData = [];

async function init(){
  TITLE.innerText = (lang==='ar') ? 'دليل العطور — أين الأرخص؟' : 'Perfume Guide — Where is it cheapest?';
  FOOTER.innerText = (lang==='ar') ? 'مصدر البيانات: Google Sheet (تقوم بتعديله)' : 'Data source: Google Sheet (you edit)';
  currentData = await fetchSheet();
  render(currentData);
}

// حاول إعادة الجلب كل 2 دقيقة (يمكنك تغييرها)
init();
setInterval(async () => {
  currentData = await fetchSheet();
  render(currentData);
}, 120000);
