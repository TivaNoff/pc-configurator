// public/js/quickAdd.js

import { fetchProductsByCategory } from "./components.js";

const overlay = document.getElementById("quickAddOverlay");
const grid = document.getElementById("productsGrid");
const closeBtn = document.getElementById("closeQuickAdd");
const priceRange = document.getElementById("priceRange");
const compOnly = document.getElementById("compatibilityOnly");
const only3d = document.getElementById("only3d");

// Pagination controls container
const pagination = document.createElement("div");
pagination.className = "pagination-controls";
grid.parentNode.appendChild(pagination);

// State
let currentCategory = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const PAGE_SIZE = 20;

// 1) Генерация ключевых спецификаций по категории
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
    // Добавьте другие категории по аналогии
  };
  return (map[category] || [])
    .filter(([_, v]) => v != null)
    .map(([k, v]) => ({ k, v }));
}

// 2) Подбор URL картинки
function getImageUrl(specs) {
  // Amazon
  if (specs?.general_product_information?.amazon_sku) {
    return `https://images-na.ssl-images-amazon.com/images/P/${specs?.general_product_information?.amazon_sku}._SL500_.jpg`;
  }
  // Плейсхолдер
  return "/img/placeholder.png";
}

// 3) Рендер карточек текущей страницы
function renderProductsPage() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredProducts.slice(start, start + PAGE_SIZE);

  console.log("── renderProductsPage, items:", pageItems.length);

  grid.innerHTML = pageItems
    .map((p) => {
      const s = p.specs || {};
      const title = p.specs?.metadata?.name;
      const price = p.prices?.rozetka ?? "N/A";
      const imgUrl = getImageUrl(s);
      const specsLis = getKeySpecs(s, currentCategory)
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
        <ul class="card-specs">${specsLis}</ul>
        <button class="add-to-build">Add to build</button>
      </div>
    `;
    })
    .join("");

  console.log("── grid.innerHTML snippet:", grid.innerHTML.slice(0, 200));
  renderPagination();
}

// 4) Рендер кнопок пагинации
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  pagination.innerHTML = `
    <button ${currentPage === 1 ? "disabled" : ""} id="prevPage">Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button ${
      currentPage === totalPages ? "disabled" : ""
    } id="nextPage">Next</button>
  `;
  document.getElementById("prevPage").onclick = () => {
    currentPage = Math.max(1, currentPage - 1);
    renderProductsPage();
  };
  document.getElementById("nextPage").onclick = () => {
    currentPage = Math.min(totalPages, currentPage + 1);
    renderProductsPage();
  };
}

// 5) Фильтрация и повторный рендер
function applyFiltersAndRender() {
  const minPrice = Number(priceRange.value);
  filteredProducts = allProducts.filter((p) => {
    const price = p.prices?.rozetka ?? 0;
    if (price < minPrice) return false;
    if (compOnly.checked && p.specs?.compatible === false) return false;
    if (only3d.checked && !p.specs?.has_3d_model) return false;
    return true;
  });
  currentPage = 1;
  renderProductsPage();
}

// 6) Открытие Quick Add и загрузка данных
document.body.addEventListener("click", async (e) => {
  if (e.target.matches(".add-btn")) {
    currentCategory = e.target.closest(".part-category").dataset.cat;
    overlay.classList.add("active");
    allProducts = await fetchProductsByCategory(currentCategory);
    filteredProducts = [...allProducts];
    priceRange.value = priceRange.min;
    compOnly.checked = false;
    only3d.checked = false;
    currentPage = 1;
    renderProductsPage();
  }
});

// 7) Слушатели фильтров
[priceRange, compOnly, only3d].forEach((el) =>
  el.addEventListener("input", applyFiltersAndRender)
);

// 8) Закрытие модалки
closeBtn.addEventListener("click", () => overlay.classList.remove("active"));

// 9) Добавление товара в сборку
grid.addEventListener("click", (e) => {
  if (e.target.matches(".add-to-build")) {
    const card = e.target.closest(".card");
    const id = card.dataset.id;
    const product = filteredProducts.find((p) => p.opendb_id === id);
    window.dispatchEvent(
      new CustomEvent("add-component", {
        detail: { category: currentCategory, product },
      })
    );
    overlay.classList.remove("active");
  }
});
