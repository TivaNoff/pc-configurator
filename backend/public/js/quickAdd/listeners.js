// listeners.js

import {
  applyFiltersAndRender,
  initFilters,
  getFilteredProducts,
  setAllProducts,
  setCurrentCategory,
} from "./filters.js";
import { fetchProductsByCategory } from "../components.js";
import {
  renderProductsPage,
  setCurrentPage,
  setPageSize,
  setCurrentCategory as setFlowCategory,
} from "./productFlow.js";

export function setupListeners() {
  const overlay = document.getElementById("quickAddOverlay");
  const grid = document.getElementById("productsGrid");
  const compOnly = document.getElementById("compatibilityOnly");
  const only3d = document.getElementById("only3d");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceMinVal = document.getElementById("priceMinVal");
  const priceMaxVal = document.getElementById("priceMaxVal");
  const rowsPerPageSel = document.getElementById("rowsPerPage");
  const closeBtn = document.getElementById("closeQuickAdd");
  const searchInput = document.getElementById("component-search");

  // Кнопка открытия окна
  document.body.addEventListener("click", async (e) => {
    if (e.target.matches(".add-btn")) {
      const cat = e.target.closest(".part-category").dataset.cat;
      overlay.classList.add("active");

      setCurrentCategory(cat);
      setFlowCategory(cat);

      const data = await fetchProductsByCategory(cat);
      setAllProducts(data);
      initFilters();
      applyFiltersAndRender();
    }
  });

  // Основные фильтры
  compOnly.addEventListener("input", applyFiltersAndRender);
  only3d.addEventListener("input", applyFiltersAndRender);
  searchInput.addEventListener("input", applyFiltersAndRender);

  // Ползунки цен
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

  // Переключение количества строк
  rowsPerPageSel.addEventListener("change", () => {
    const size = parseInt(rowsPerPageSel.value, 10);
    setPageSize(size);
    setCurrentPage(1);
    renderProductsPage(getFilteredProducts());
  });

  // Закрытие окна
  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    initFilters();
  });

  // Добавление компонента в сборку
  grid.addEventListener("click", (e) => {
    if (e.target.matches(".add-to-build")) {
      const id = e.target.closest(".card").dataset.id;
      const product = getFilteredProducts().find((p) => p.opendb_id === id);

      window.dispatchEvent(
        new CustomEvent("add-component", {
          detail: {
            category:
              document.querySelector(".part-category.selected")?.dataset.cat ||
              "",
            product,
          },
        })
      );

      window.dispatchEvent(new Event("buildUpdated"));
      overlay.classList.remove("active");
    }
  });
}
