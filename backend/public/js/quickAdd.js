// public/js/quickAdd.js

import { fetchProductsByCategory } from "./components.js";

const overlay = document.getElementById("quickAddOverlay");
const grid = document.getElementById("productsGrid");
const closeBtn = document.getElementById("closeQuickAdd");

const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const priceMinVal = document.getElementById("priceMinVal");
const priceMaxVal = document.getElementById("priceMaxVal");

const compOnly = document.getElementById("compatibilityOnly");
const only3d = document.getElementById("only3d");
const rowsPerPageSel = document.getElementById("rowsPerPage");
const paginationCtrls = document.getElementById("paginationControls");

let defaultMinPrice = 0;
let defaultMaxPrice = 0;
let currentCategory = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = parseInt(rowsPerPageSel.value, 10);

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

// Дополнительные фильтры CPU
const cpuFiltersHTML = `
  <hr>
  <div id="cpu-filters" style="display:none">
    <h5>Socket</h5>
    <div id="socketFilter"></div>
    <h5>Microarchitecture</h5>
    <div id="microarchitectureFilter"></div>
    <h5>Integrated Graphics</h5>
    <div id="integratedGraphicsFilter"></div>
  </div>
`;
document
  .querySelector(".filter-sidebar")
  .insertAdjacentHTML("beforeend", cpuFiltersHTML);

function renderCheckboxList(containerId, valuesSet) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  Array.from(valuesSet)
    .sort()
    .forEach((value) => {
      const label = String(value);
      const id = `${containerId}-${label.replace(/[^a-zA-Z0-9]/g, "_")}`;
      container.innerHTML += `
      <label>
        <input type="checkbox" id="${id}" value="${label}">
        ${label}
      </label><br>
    `;
    });
  container.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("input", applyFiltersAndRender);
  });
}

function initFilters() {
  const prices = allProducts
    .map((p) => p.prices?.Ekua)
    .filter((v) => v != null);
  if (prices.length === 0) return;

  defaultMinPrice = Math.min(...prices);
  defaultMaxPrice = Math.max(...prices);

  priceMin.min = priceMax.min = defaultMinPrice;
  priceMin.max = priceMax.max = defaultMaxPrice;

  priceMin.value = defaultMinPrice;
  priceMax.value = defaultMaxPrice;

  priceMinVal.textContent = `$${defaultMinPrice}`;
  priceMaxVal.textContent = `$${defaultMaxPrice}`;

  searchInput.value = "";
  compOnly.checked = false;
  only3d.checked = false;

  // Показываем фильтры CPU
  const cpuFilterBlock = document.getElementById("cpu-filters");
  cpuFilterBlock.style.display = currentCategory === "CPU" ? "block" : "none";
  if (currentCategory === "CPU") {
    const socketSet = new Set();
    const archSet = new Set();
    const igpuSet = new Set();

    for (const p of allProducts) {
      const specs = p.specs || {};
      const socket = specs.socket;
      const arch = specs.microarchitecture;
      const igpu = specs.specifications?.integratedGraphics?.model;

      if (socket) socketSet.add(socket);
      if (arch) archSet.add(arch);
      if (igpu) igpuSet.add(igpu);
    }

    renderCheckboxList("socketFilter", socketSet);
    renderCheckboxList("microarchitectureFilter", archSet);
    renderCheckboxList("integratedGraphicsFilter", igpuSet);
  }
}

function applyFiltersAndRender() {
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

  const temp = allProducts.filter((p) => {
    const price = p.prices?.Ekua ?? 0;
    if (price < minP || price > maxP) return false;
    if (compOnly.checked && p.specs?.compatible === false) return false;
    if (only3d.checked && !p.specs?.has_3d_model) return false;
    const name = (p.specs?.metadata?.name || "").toLowerCase();
    if (query && !name.includes(query)) return false;

    if (currentCategory === "CPU") {
      const getChecked = (id) =>
        Array.from(document.querySelectorAll(`#${id} input:checked`)).map(
          (cb) => cb.value
        );
      const selectedSockets = getChecked("socketFilter");
      const selectedArch = getChecked("microarchitectureFilter");
      const selectedIGPU = getChecked("integratedGraphicsFilter");

      if (
        (selectedSockets.length &&
          !selectedSockets.includes(p.specs?.socket)) ||
        (selectedArch.length &&
          !selectedArch.includes(p.specs?.microarchitecture)) ||
        (selectedIGPU.length &&
          !selectedIGPU.includes(
            p.specs?.specifications?.integratedGraphics?.model
          ))
      )
        return false;
    }

    return true;
  });

  filteredProducts = filtersApplied
    ? temp
    : [
        ...temp.filter((p) => p.prices?.Ekua != 0),
        ...temp.filter((p) => p.prices?.Ekua == 0),
      ];

  currentPage = 1;
  renderProductsPage();
}

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
      const imgUrl = p?.storeImg?.Ekua || "/img/placeholder.png";
      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => `<li><strong>${e.k}:</strong> ${e.v}</li>`)
        .join("");

      return `
      <div class="card" data-id="${p.opendb_id}">
        <div class="card-img">
          <img src="${imgUrl}" alt="${title}" onerror="this.src='/img/placeholder.png'" />
        </div>
        <div class="card-info">
          <h4 class="card-title multiline-truncate">${title}</h4>
          <p class="card-price">${price} грн</p>
          <ul class="card-specs">${specsLi}</ul>
          <button class="add-to-build">Add to build</button>
        </div>
      </div>`;
    })
    .join("");
  renderPagination();
}

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
closeBtn.addEventListener("click", () => {
  initFilters();
  overlay.classList.remove("active");
});
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
