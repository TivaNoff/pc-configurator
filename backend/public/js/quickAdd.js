// public/js/quickAdd.js

import { fetchProductsByCategory } from "./components.js";

const overlay = document.getElementById("quickAddOverlay");
const grid = document.getElementById("productsGrid");
const closeBtn = document.getElementById("closeQuickAdd");

const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const priceMinVal = document.getElementById("priceMinVal");
const priceMaxVal = document.getElementById("priceMaxVal");

let defaultMinPrice = 0;
let defaultMaxPrice = 0;

/**
 * Ініціалізує фільтри:
 * - обчислює мінімальну й максимальну ціну в allProducts
 * - підставляє їх у повзунки
 * - очищує поле пошуку й чекбокси
 */
function initFilters() {
  const prices = allProducts
    .map((p) => p.prices?.Ekua)
    .filter((v) => v != null);

  // якщо цін не знайдено — виходимо
  if (prices.length === 0) return;

  defaultMinPrice = Math.min(...prices);
  defaultMaxPrice = Math.max(...prices);

  // встановлюємо межі й значення повзунків
  priceMin.min = priceMax.min = defaultMinPrice;
  priceMin.max = priceMax.max = defaultMaxPrice;

  priceMin.value = defaultMinPrice;
  priceMax.value = defaultMaxPrice;

  // підпис під повзунками
  priceMinVal.textContent = `$${defaultMinPrice}`;
  priceMaxVal.textContent = `$${defaultMaxPrice}`;

  // скидати інші фільтри
  searchInput.value = "";
  compOnly.checked = false;
  only3d.checked = false;
}

const compOnly = document.getElementById("compatibilityOnly");
const only3d = document.getElementById("only3d");
const rowsPerPageSel = document.getElementById("rowsPerPage");
const paginationCtrls = document.getElementById("paginationControls");

// Поле поиска
const searchInput = document.createElement("input");
searchInput.id = "component-search";
searchInput.type = "text";
searchInput.placeholder = "Search by name...";
searchInput.style.cssText = `
  display: block;
  width: 90%;
  margin: 8px auto;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;
const gridParent = grid.parentNode;
gridParent.insertBefore(searchInput, grid);
searchInput.addEventListener("input", applyFiltersAndRender);

let currentCategory = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = parseInt(rowsPerPageSel.value, 10);

/** 1) Ключевые спецификации по категории */
function getKeySpecs(specs, category) {
  const map = {
    Case: [
      ["Form Factor", specs.form_factor || specs.formFactor],
      ["Side Panel", specs.side_panel],
      ["Max GPU Length", specs.max_gpu_length],
    ],
    CPU: [
      ["Cores", specs.cores],
      ["Threads", specs.threads],
      ["Base Clock", specs.base_clock ? specs.base_clock + " GHz" : null],
      ["Socket", specs.socket],
    ],
    Motherboard: [
      ["Form Factor", specs.form_factor],
      ["Socket", specs.socket],
      ["Chipset", specs.chipset],
    ],
    GPU: [
      ["Memory", specs.memory_size ? specs.memory_size + " GB" : null],
      ["Length", specs.length_mm ? specs.length_mm + " mm" : null],
    ],
    RAM: [
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null],
      ["Type", specs.type],
    ],
    Storage: [
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null],
      ["Interface", specs.interface],
    ],
    PSU: [
      ["Wattage", specs.wattage ? specs.wattage + " W" : null],
      ["Modular", specs.modular],
    ],
  };
  return (map[category] || [])
    .filter(([_, v]) => v != null)
    .map(([k, v]) => ({ k, v }));
}

/** 2) Выбор URL картинки */
function getImageUrl(p, specs) {
  if (p?.storeImg?.Ekua) {
    return p.storeImg.Ekua;
  }
  if (specs?.general_product_information?.amazon_sku) {
    return `https://images-na.ssl-images-amazon.com/images/P/${specs.general_product_information.amazon_sku}._SL500_.jpg`;
  }
  return "/img/placeholder.png";
}

// 3) Отрисовка карточек текущей страницы
function renderProductsPage() {
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredProducts.slice(start, start + pageSize);

  grid.innerHTML = pageItems
    .map((p) => {
      const s = p.specs || {};
      const title =
        p.specs?.metadata?.name ||
        [s.manufacturer, s.series, s.model].filter(Boolean).join(" ") ||
        p.opendb_id;
      const price = p.prices?.Ekua ?? "N/A";
      const imgUrl = getImageUrl(p, s);
      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => `<li><strong>${e.k}:</strong> ${e.v}</li>`)
        .join("");

      return `
      <div class="card" data-id="${p.opendb_id}">
        <div class="card-img">
          <img src="${imgUrl}" alt="${title}" onerror="this.src='/img/placeholder.png'" />
        </div>
        <div class="card-info">
          <h4 class="card-title">${title}</h4>
          <p class="card-price">${price} грн</p>
          <ul class="card-specs">${specsLi}</ul>
          <button class="add-to-build">Add to build</button>
        </div>
      </div>`;
    })
    .join("");

  renderPagination();
}

// 4) Отрисовка кнопок First ‹ Prev Page X of Y Next › Last
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  paginationCtrls.innerHTML = `
    <button id="firstPage" ${
      currentPage === 1 ? "disabled" : ""
    }>&laquo;</button>
    <button id="prevPage"  ${
      currentPage === 1 ? "disabled" : ""
    }>&lsaquo;</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button id="nextPage"  ${
      currentPage === totalPages ? "disabled" : ""
    }>&rsaquo;</button>
    <button id="lastPage"  ${
      currentPage === totalPages ? "disabled" : ""
    }>&raquo;</button>
  `;
  paginationCtrls.querySelector("#firstPage").onclick = () => {
    currentPage = 1;
    renderProductsPage();
  };
  paginationCtrls.querySelector("#prevPage").onclick = () => {
    currentPage = Math.max(1, currentPage - 1);
    renderProductsPage();
  };
  paginationCtrls.querySelector("#nextPage").onclick = () => {
    currentPage = Math.min(totalPages, currentPage + 1);
    renderProductsPage();
  };
  paginationCtrls.querySelector("#lastPage").onclick = () => {
    currentPage = totalPages;
    renderProductsPage();
  };
}

// 5) Фильтрация по цене/совместимости/3D и поиску с приоритетом стоимости
function applyFiltersAndRender() {
  // замість одного priceRange.value
  const minP = Number(priceMin.value);
  const maxP = Number(priceMax.value);
  const defaultMin = Number(priceMin.min);
  const defaultMax = Number(priceMax.max);
  const query = searchInput.value.trim().toLowerCase();
  const filtersApplied =
    minP > defaultMin ||
    maxP < defaultMax ||
    query !== "" ||
    compOnly.checked ||
    only3d.checked;

  // фільтрація по діапазону
  const temp = allProducts.filter((p) => {
    const price = p.prices?.Ekua;
    if (price < minP || price > maxP) return false;
    if (compOnly.checked && p.specs?.compatible === false) return false;
    if (only3d.checked && !p.specs?.has_3d_model) return false;
    const name = (p.specs?.metadata?.name || "").toLowerCase();
    if (query && !name.includes(query)) return false;
    return true;
  });

  // Если нет примененных фильтров, сначала компоненты с ценой, потом без цены
  if (!filtersApplied) {
    const withPrice = temp.filter((p) => p.prices?.Ekua != 0);
    const withoutPrice = temp.filter((p) => p.prices?.Ekua == 0);
    filteredProducts = [...withPrice, ...withoutPrice];
  } else {
    filteredProducts = temp;
  }

  currentPage = 1;
  renderProductsPage();
}

// 6) Открываем Quick Add и подгружаем данные
document.body.addEventListener("click", async (e) => {
  if (e.target.matches(".add-btn")) {
    currentCategory = e.target.closest(".part-category").dataset.cat;
    overlay.classList.add("active");
    allProducts = await fetchProductsByCategory(currentCategory);
    filteredProducts = [...allProducts];
    currentPage = 1;

    initFilters();

    applyFiltersAndRender();
  }
});

// 7) Навешиваем слушатели на фильтры и селект “Rows per page”
compOnly.addEventListener("input", applyFiltersAndRender);
only3d.addEventListener("input", applyFiltersAndRender);
searchInput.addEventListener("input", applyFiltersAndRender);
priceMin.addEventListener("input", () => {
  if (+priceMin.value > +priceMax.value) priceMin.value = priceMax.value;
  priceMinVal.textContent = `$${priceMin.value}`;
  applyFiltersAndRender();
});
priceMax.addEventListener("input", () => {
  if (+priceMax.value < +priceMin.value) priceMax.value = priceMin.value;
  priceMaxVal.textContent = `$${priceMax.value}`;
  applyFiltersAndRender();
});

rowsPerPageSel.addEventListener("change", () => {
  pageSize = parseInt(rowsPerPageSel.value, 10);
  currentPage = 1;
  renderProductsPage();
});

// 8) Закрытие модалки
closeBtn.addEventListener("click", () => {
  initFilters();
  overlay.classList.remove("active");
});

// 9) Добавление товара в сборку
grid.addEventListener("click", (e) => {
  searchInput.value = "";
  if (e.target.matches(".add-to-build")) {
    const id = e.target.closest(".card").dataset.id;
    const product = filteredProducts.find((p) => p.opendb_id === id);
    window.dispatchEvent(
      new CustomEvent("add-component", {
        detail: { category: currentCategory, product },
      })
    );
    window.dispatchEvent(new Event("buildUpdated"));
    overlay.classList.remove("active");
  }
});
