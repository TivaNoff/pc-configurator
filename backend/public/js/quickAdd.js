// public/js/quickAdd.js

import { fetchProductsByCategory } from "./components.js";

const overlay = document.getElementById("quickAddOverlay");
const grid = document.getElementById("productsGrid");
const closeBtn = document.getElementById("closeQuickAdd");
const priceRange = document.getElementById("priceRange");
const compOnly = document.getElementById("compatibilityOnly");
const only3d = document.getElementById("only3d");
const rowsPerPageSel = document.getElementById("rowsPerPage");
const paginationCtrls = document.getElementById("paginationControls");

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
    // добавьте остальные при необходимости
  };
  return (map[category] || [])
    .filter(([_, v]) => v != null)
    .map(([k, v]) => ({ k, v }));
}

/** 2) Выбор URL картинки */
function getImageUrl(specs) {
  if (specs?.general_product_information?.amazon_sku) {
    return `https://images-na.ssl-images-amazon.com/images/P/${specs?.general_product_information?.amazon_sku}._SL500_.jpg`;
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
      const price = p.prices?.rozetka ?? "N/A";
      const imgUrl = getImageUrl(s);
      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => `<li><strong>${e.k}:</strong> ${e.v}</li>`)
        .join("");

      return `
      <div class="card" data-id="${p.opendb_id}">
        <div class="card-img">
          <img src="${imgUrl}" alt="${title}"
               onerror="this.src='/img/placeholder.png'" />
        </div>
        <h4 class="card-title">${title}</h4>
        <p class="card-price">${price} грн</p>
        <ul class="card-specs">${specsLi}</ul>
        <button class="add-to-build">Add to build</button>
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

// 5) Фильтрация по цене/совместимости/3D
function applyFiltersAndRender() {
  const minP = Number(priceRange.value);
  filteredProducts = allProducts.filter((p) => {
    const price = p.prices?.rozetka ?? 0;
    if (price < minP) return false;
    if (compOnly.checked && p.specs?.compatible === false) return false;
    if (only3d.checked && !p.specs?.has_3d_model) return false;
    return true;
  });
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
    renderProductsPage();
  }
});

// 7) Навешиваем слушатели на фильтры и селект “Rows per page”
priceRange.addEventListener("input", applyFiltersAndRender);
compOnly.addEventListener("input", applyFiltersAndRender);
only3d.addEventListener("input", applyFiltersAndRender);
rowsPerPageSel.addEventListener("change", () => {
  pageSize = parseInt(rowsPerPageSel.value, 10);
  currentPage = 1;
  renderProductsPage();
});

// 8) Закрытие модалки
closeBtn.addEventListener("click", () => overlay.classList.remove("active"));

// 9) Добавление товара в сборку
grid.addEventListener("click", (e) => {
  if (e.target.matches(".add-to-build")) {
    const id = e.target.closest(".card").dataset.id;
    const product = filteredProducts.find((p) => p.opendb_id === id);
    window.dispatchEvent(
      new CustomEvent("add-component", {
        detail: { category: currentCategory, product },
      })
    );
    // нотификация для авто-сохранения
    window.dispatchEvent(new Event("buildUpdated"));
    overlay.classList.remove("active");
  }
});
