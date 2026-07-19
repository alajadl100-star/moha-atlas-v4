const API_BASE = '/api';

// عناصر DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dealsContainer = document.getElementById('deals-container');

// البحث
searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (!query) return;
  
  await fetchPerfumes(query);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// جلب أرخص العطور عند التحميل
async function loadCheapestDeals() {
  try {
    dealsContainer.innerHTML = '<p class="loading">جاري التحميل...</p>';
    const response = await fetch(`${API_BASE}/perfumes/deals/cheapest`);
    const perfumes = await response.json();
    
    displayPerfumes(perfumes);
  } catch (error) {
    console.error('Error loading deals:', error);
    dealsContainer.innerHTML = '<p>حدث خطأ في تحميل البيانات</p>';
  }
}

// جلب العطور بناءً على البحث
async function fetchPerfumes(query) {
  try {
    dealsContainer.innerHTML = '<p class="loading">جاري البحث...</p>';
    const response = await fetch(`${API_BASE}/perfumes?search=${encodeURIComponent(query)}`);
    const perfumes = await response.json();
    
    if (perfumes.length === 0) {
      dealsContainer.innerHTML = '<p>لم يتم العثور على عطور</p>';
      return;
    }
    
    displayPerfumes(perfumes);
  } catch (error) {
    console.error('Error fetching perfumes:', error);
    dealsContainer.innerHTML = '<p>حدث خطأ في البحث</p>';
  }
}

// عرض العطور
function displayPerfumes(perfumes) {
  if (!perfumes.length) {
    dealsContainer.innerHTML = '<p>لا توجد نتائج</p>';
    return;
  }
  
  dealsContainer.innerHTML = perfumes.map(perfume => {
    const cheapestStore = perfume.stores?.reduce((min, store) => 
      store.price < min.price ? store : min
    );
    
    const cheapestPrice = cheapestStore?.price || 'N/A';
    const cheapestStoreName = cheapestStore?.store_name || 'N/A';
    const affiliateLink = cheapestStore?.affiliate_link || '#';
    
    return `
      <div class="perfume-card">
        <img src="${perfume.image_url || 'https://via.placeholder.com/280x200?text=No+Image'}" alt="${perfume.name_en}">
        <div class="perfume-info">
          <h3>${perfume.name_en}</h3>
          <div class="perfume-brand">${perfume.brand}</div>
          <div class="price-badge">QAR ${cheapestPrice}</div>
          <div class="store-info">متوفر في: ${cheapestStoreName}</div>
          <a href="${affiliateLink}" target="_blank" class="buy-btn">🛍️ اشتر الآن</a>
        </div>
      </div>
    `;
  }).join('');
}

// تحميل البيانات عند فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
  loadCheapestDeals();
});
