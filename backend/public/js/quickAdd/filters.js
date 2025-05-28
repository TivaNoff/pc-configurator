// filters.js

import { renderCheckboxList, getCheckedValues } from "./helpers.js";
import {
  renderProductsPage,
  setCurrentPage,
  getPageSize,
} from "./productFlow.js";

let allProducts = [];
let filteredProducts = [];
let currentCategory = "";
let defaultMinPrice = 0;
let defaultMaxPrice = 0;

export function setAllProducts(data) {
  allProducts = data;
}

export function setCurrentCategory(cat) {
  currentCategory = cat;
}

export function getFilteredProducts() {
  return filteredProducts;
}

export function initFilters() {
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceMinVal = document.getElementById("priceMinVal");
  const priceMaxVal = document.getElementById("priceMaxVal");

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

  document.getElementById("compatibilityOnly").checked = false;
  document.getElementById("only3d").checked = false;
  document.getElementById("component-search").value = "";

  const cpuFilterBlock = document.getElementById("cpu-filters");
  cpuFilterBlock.style.display = currentCategory === "CPU" ? "block" : "none";

  if (currentCategory === "CPU") {
    const socketSet = new Set();
    const archSet = new Set();
    const igpuSet = new Set();

    for (const p of allProducts) {
      const specs = p.specs || {};
      if (specs.socket) socketSet.add(specs.socket);
      if (specs.microarchitecture) archSet.add(specs.microarchitecture);
      if (specs.specifications?.integratedGraphics?.model)
        igpuSet.add(specs.specifications.integratedGraphics.model);
    }

    renderCheckboxList("socketFilter", socketSet, applyFiltersAndRender);
    renderCheckboxList(
      "microarchitectureFilter",
      archSet,
      applyFiltersAndRender
    );
    renderCheckboxList(
      "integratedGraphicsFilter",
      igpuSet,
      applyFiltersAndRender
    );
  }
  // Показываем/прячем блок GPU-фильтров
  const gpuFilterBlock = document.getElementById("gpu-filters");
  gpuFilterBlock.style.display = currentCategory === "GPU" ? "block" : "none";

  if (currentCategory === "GPU") {
    const chipsetSet = new Set();
    const memoryTypeSet = new Set();
    const interfaceSet = new Set();
    const manufacturerSet = new Set();

    for (const p of allProducts) {
      const specs = p.specs || {};
      if (specs.chipset) chipsetSet.add(specs.chipset);
      if (specs.memory_type) memoryTypeSet.add(specs.memory_type);
      if (specs.interface) interfaceSet.add(specs.interface);
      if (specs.metadata?.manufacturer)
        manufacturerSet.add(specs.metadata.manufacturer);
    }

    renderCheckboxList("chipsetFilter", chipsetSet, applyFiltersAndRender);
    renderCheckboxList(
      "memoryTypeFilter",
      memoryTypeSet,
      applyFiltersAndRender
    );
    renderCheckboxList("interfaceFilter", interfaceSet, applyFiltersAndRender);
    renderCheckboxList(
      "manufacturerFilter",
      manufacturerSet,
      applyFiltersAndRender
    );
  }
}

export function applyFiltersAndRender() {
  const minP = Number(document.getElementById("priceMin").value);
  const maxP = Number(document.getElementById("priceMax").value);
  const defaultMin = defaultMinPrice;
  const defaultMax = defaultMaxPrice;
  const query = document
    .getElementById("component-search")
    .value.trim()
    .toLowerCase();
  const compOnly = document.getElementById("compatibilityOnly").checked;
  const only3d = document.getElementById("only3d").checked;

  const filtered = allProducts.filter((p) => {
    const price = p.prices?.Ekua ?? 0;
    if (price < minP || price > maxP) return false;
    if (compOnly && p.specs?.compatible === false) return false;
    if (only3d && !p.specs?.has_3d_model) return false;

    const name = (p.specs?.metadata?.name || "").toLowerCase();
    if (query && !name.includes(query)) return false;

    if (currentCategory === "CPU") {
      const sockets = getCheckedValues("socketFilter");
      const archs = getCheckedValues("microarchitectureFilter");
      const igpus = getCheckedValues("integratedGraphicsFilter");

      if (
        (sockets.length && !sockets.includes(p.specs?.socket)) ||
        (archs.length && !archs.includes(p.specs?.microarchitecture)) ||
        (igpus.length &&
          !igpus.includes(p.specs?.specifications?.integratedGraphics?.model))
      ) {
        return false;
      }
    }

    // GPU-фильтрация
    if (currentCategory === "GPU") {
      const chipsets = getCheckedValues("chipsetFilter");
      const memoryTypes = getCheckedValues("memoryTypeFilter");
      const interfaces = getCheckedValues("interfaceFilter");
      const manufacturers = getCheckedValues("manufacturerFilter");

      if (
        (chipsets.length && !chipsets.includes(p.specs?.chipset)) ||
        (memoryTypes.length && !memoryTypes.includes(p.specs?.memory_type)) ||
        (interfaces.length && !interfaces.includes(p.specs?.interface)) ||
        (manufacturers.length &&
          !manufacturers.includes(p.specs?.metadata?.manufacturer))
      ) {
        return false;
      }
    }

    return true;
  });

  const filtersApplied =
    minP > defaultMin ||
    maxP < defaultMax ||
    query !== "" ||
    compOnly ||
    only3d;

  filteredProducts = filtersApplied
    ? filtered
    : [
        ...filtered.filter((p) => p.prices?.Ekua !== 0),
        ...filtered.filter((p) => p.prices?.Ekua === 0),
      ];

  setCurrentPage(1);
  renderProductsPage(filteredProducts);
}
