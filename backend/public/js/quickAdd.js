// public/js/quickAdd.js
import { fetchProductsByCategory } from './components.js';

const overlay    = document.getElementById('quickAddOverlay');
const grid       = document.getElementById('productsGrid');
const closeBtn   = document.getElementById('closeQuickAdd');
const priceRange = document.getElementById('priceRange');
const compOnly   = document.getElementById('compatibilityOnly');
const only3d     = document.getElementById('only3d');

let currentCategory = null;
let cachedProducts  = [];

/**
 * Генерирует список ключевых характеристик в зависимости от категории
 */
function getKeySpecs(specs, category) {
  const map = {
    Case: [
      ['Form Factor', specs.form_factor || specs.formFactor],
      ['Side Panel', specs.side_panel],
      ['Max GPU Length', specs.max_gpu_length]
    ],
    CPU: [
      ['Cores', specs.cores],
      ['Threads', specs.threads],
      ['Base Clock', specs.base_clock ? specs.base_clock + ' GHz' : null],
      ['Socket', specs.socket]
    ],
    Motherboard: [
      ['Form Factor', specs.form_factor],
      ['Socket', specs.socket],
      ['Chipset', specs.chipset]
    ],
    GPU: [
      ['Memory', specs.memory_size ? specs.memory_size + ' GB' : null],
      ['Length', specs.length_mm ? specs.length_mm + ' mm' : null]
    ],
    RAM: [
      ['Capacity', specs.capacity ? specs.capacity + ' GB' : null],
      ['Type', specs.type]
    ],
    Storage: [
      ['Capacity', specs.capacity ? specs.capacity + ' GB' : null],
      ['Interface', specs.interface]
    ],
    'Power Supply': [
      ['Wattage', specs.wattage ? specs.wattage + ' W' : null],
      ['Modular', specs.modular]
    ]
    // Добавьте другие категории по аналогии
  };
  return (map[category] || []).filter(([_, v]) => v).map(([k, v]) => ({ k, v }));
}

/**
 * Создаёт HTML карточки
 */
// public/js/quickAdd.js (или components.js)

function getImageUrl(specs) {
  // 1) если есть amazon_sku – строим Amazon URL
  if (specs?.general_product_information?.amazon_sku) {
    return `https://images-na.ssl-images-amazon.com/images/P/${specs?.general_product_information?.amazon_sku}._SL500_.jpg`;
  }

  if (specs?.general_product_information?.newegg_sku) {
    return `https://c1.neweggimages.com/ProductImageCompressAll1280/${specs?.general_product_information?.newegg_sku}.jpg`;
  }
  // 3) иначе – плейсхолдер
  return '/js/placeholder.png';
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.map(p => {
    const s     = p.specs || {};
    const title = p.specs.metadata.name;
    const price = p.prices?.rozetka ?? 'N/A';
    const img   = getImageUrl(s);

    return `
      <div class="card" data-id="${p.opendb_id}">
        <div class="card-img">
          <img src="${img}" alt="${title}"
               onerror="this.src='/js/placeholder.png'" />
        </div>
        <h4 class="card-title">${title}</h4>
        <p class="card-price">${price} грн</p>
        <!-- … -->
      </div>
    `;
  }).join('');
}

// Открытие модалки и загрузка данных
document.body.addEventListener('click', async e => {
  if (e.target.matches('.add-btn')) {
    console.log('👉 Quick Add opened for category:', currentCategory);
    currentCategory = e.target.closest('.part-category').dataset.cat;
    console.log('   Detected category:', currentCategory);
    overlay.classList.add('active');
    cachedProducts = await fetchProductsByCategory(currentCategory);
    console.log('   Products fetched:', cachedProducts.length);
    applyFiltersAndRender();
  }
});

// Фильтры: диапазон цены, совместимость, только 3D
[priceRange, compOnly, only3d].forEach(el =>
  el.addEventListener('input', applyFiltersAndRender)
);

function applyFiltersAndRender() {
  // отключаем все фильтры, просто отрисуем cachedProducts
  renderProducts(cachedProducts);
}



// Закрытие
closeBtn.addEventListener('click', () => overlay.classList.remove('active'));

// Добавление в сборку
grid.addEventListener('click', e => {
  if (e.target.matches('.add-to-build')) {
    const id = e.target.closest('.card').dataset.id;
    window.dispatchEvent(new CustomEvent('add-component', {
      detail: { id, category: currentCategory }
    }));
    overlay.classList.remove('active');
  }
});
