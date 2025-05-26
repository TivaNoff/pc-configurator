// public/js/quickAdd.js
import { fetchProductsByCategory } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  const overlay    = document.getElementById('quickAddOverlay');
  const grid       = document.getElementById('productsGrid');
  const closeBtn   = document.getElementById('closeQuickAdd');
  const priceRange = document.getElementById('priceRange');
  const compOnly   = document.getElementById('compatibilityOnly');
  const only3d     = document.getElementById('only3d');
  const pagination = document.getElementById('paginationControls');

  let currentCategory   = null;
  let allProducts       = [];
  let filteredProducts  = [];
  let currentPage       = 1;
  const PAGE_SIZE       = 20;

  // 1) Ключевые спецификации по категории
  function getKeySpecs(specs, category) {
    const map = {
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
      // …добавьте остальные категории…
    };
    return (map[category] || [])
      .filter(([, v]) => v != null)
      .map(([k, v]) => ({ k, v }));
  }

  // 2) URL картинки
  function getImageUrl(specs) {
    if (specs.general_product_information?.amazon_sku) {
      return `https://images-na.ssl-images-amazon.com/images/P/${specs.general_product_information.amazon_sku}._SL500_.jpg`;
    }
    return specs.images?.[0] || '/img/placeholder.png';
  }

  // 3) Рендер одной страницы карточек
  function renderProductsPage() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredProducts.slice(start, start + PAGE_SIZE);

    grid.innerHTML = pageItems.map(p => {
      const s       = p.specs || {};
      const title   = p.specs.metadata?.name || p.opendb_id;
      const price   = 'N/A';
      const img     = getImageUrl(s);
      const specsUI = getKeySpecs(s, currentCategory)
        .map(e => `<li><strong>${e.k}:</strong> ${e.v}</li>`)
        .join('');
      return `
        <div class="card" data-id="${p.opendb_id}">
          <div class="card-img">
            <img src="${img}" alt="${title}"
                 onerror="this.src='/img/placeholder.png'" />
          </div>
          <h4 class="card-title">${title}</h4>
          <p class="card-price">${price} грн</p>
          <ul class="card-specs">${specsUI}</ul>
          <button class="add-to-build">Add to build</button>
        </div>`;
    }).join('');

    renderPagination();
  }

  // 4) Пагинация
  function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    pagination.innerHTML = `
      <button ${currentPage === 1 ? 'disabled' : ''} data-dir="-1">Prev</button>
      <span>${currentPage} / ${totalPages}</span>
      <button ${currentPage === totalPages ? 'disabled' : ''} data-dir="1">Next</button>
    `;
    pagination.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = Math.min(
          totalPages,
          Math.max(1, currentPage + Number(btn.dataset.dir))
        );
        renderProductsPage();
      });
    });
  }

  // 5) Фильтрация
  function applyFilters() {
    const minPrice = Number(priceRange.value);
    filteredProducts = allProducts.filter(p => {
      const pr = p.prices?.rozetka ?? 0;
      if (pr < minPrice) return false;
      if (compOnly.checked && p.specs?.compatible === false) return false;
      if (only3d.checked && !p.specs?.has_3d_model) return false;
      return true;
    });
    currentPage = 1;
    renderProductsPage();
  }
  [priceRange, compOnly, only3d].forEach(el =>
    el.addEventListener('input', applyFilters)
  );

  // 6) Открытие Quick Add
  document.body.addEventListener('click', async e => {
    if (e.target.matches('.add-btn')) {
      currentCategory = e.target.closest('.part-category').dataset.cat;
      overlay.classList.add('active');
      allProducts      = await fetchProductsByCategory(currentCategory);
      filteredProducts = [...allProducts];
      priceRange.value = priceRange.min;
      compOnly.checked = only3d.checked = false;
      currentPage = 1;
      renderProductsPage();
    }
  });

  // 7) Закрытие
  closeBtn.addEventListener('click', () => overlay.classList.remove('active'));

  // 8) Добавление в сборку
  grid.addEventListener('click', e => {
    if (e.target.matches('.add-to-build')) {
      const id = e.target.closest('.card').dataset.id;
      const product = filteredProducts.find(p => p.opendb_id === id);
      window.dispatchEvent(new CustomEvent('add-component', {
        detail: { category: currentCategory, product }
      }));
      overlay.classList.remove('active');
    }
  });
});
