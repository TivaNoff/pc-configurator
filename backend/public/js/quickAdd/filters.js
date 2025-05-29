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

  defaultMinPrice = 0;
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

  // Motherboard
  const mbFilterBlock = document.getElementById("mb-filters");
  mbFilterBlock.style.display =
    currentCategory === "Motherboard" ? "block" : "none";
  if (currentCategory === "Motherboard") {
    const socketSet = new Set();
    const formFactorSet = new Set();
    const chipsetSet = new Set();
    const ramTypeSet = new Set();
    const manufacturerSet = new Set();

    for (const p of allProducts) {
      const s = p.specs || {};
      if (p.specs?.socket) socketSet.add(s.socket);
      if (s.form_factor) formFactorSet.add(s.form_factor);
      if (s.chipset) chipsetSet.add(s.chipset);
      if (s.memory?.ram_type) ramTypeSet.add(s.memory.ram_type);
      if (s.metadata?.manufacturer)
        manufacturerSet.add(s.metadata.manufacturer);
    }

    renderCheckboxList("socketFilter-mb", socketSet, applyFiltersAndRender);
    renderCheckboxList(
      "formFactorFilter",
      formFactorSet,
      applyFiltersAndRender
    );
    renderCheckboxList("mbChipsetFilter", chipsetSet, applyFiltersAndRender);
    renderCheckboxList("ramTypeFilter", ramTypeSet, applyFiltersAndRender);
    renderCheckboxList(
      "mbManufacturerFilter",
      manufacturerSet,
      applyFiltersAndRender
    );
  }

  // PC Case
  const caseFilterBlock = document.getElementById("case-filters");
  if (!caseFilterBlock) {
    console.error("initFilters: #case-filters не найден");
  } else {
    const isCase = currentCategory.toLowerCase() === "pccase";
    caseFilterBlock.style.display = isCase ? "block" : "none";

    if (isCase) {
      const formFactorSet = new Set();
      const sidePanelSet = new Set();
      const manufacturerSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.form_factor) formFactorSet.add(s.form_factor);
        if (s.side_panel) sidePanelSet.add(s.side_panel);
        if (s.metadata?.manufacturer)
          manufacturerSet.add(s.metadata.manufacturer);
      }

      renderCheckboxList(
        "caseFormFactorFilter",
        formFactorSet,
        applyFiltersAndRender
      );
      renderCheckboxList(
        "sidePanelFilter",
        sidePanelSet,
        applyFiltersAndRender
      );
      renderCheckboxList(
        "caseManufacturerFilter",
        manufacturerSet,
        applyFiltersAndRender
      );
    }
  }

  // CPUCooler
  const coolerFilterBlock = document.getElementById("cooler-filters");
  if (!coolerFilterBlock) {
    console.error("initFilters: #cooler-filters не знайдено");
  } else {
    const isCooler = currentCategory.toLowerCase() === "cpucooler";
    coolerFilterBlock.style.display = isCooler ? "block" : "none";

    if (isCooler) {
      const manSet = new Set();
      const waterSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.metadata?.manufacturer) {
          manSet.add(s.metadata.manufacturer);
        }
        // булеве → текст
        if (typeof s.water_cooled === "boolean") {
          waterSet.add(s.water_cooled ? "Yes" : "No");
        }
      }

      renderCheckboxList(
        "coolerManufacturerFilter",
        manSet,
        applyFiltersAndRender
      );
      renderCheckboxList("waterCooledFilter", waterSet, applyFiltersAndRender);
    }
  }

  // RAM
  const ramFilterBlock = document.getElementById("ram-filters");
  if (!ramFilterBlock) {
    console.error("initFilters: #ram-filters не найден");
  } else {
    const isRam = currentCategory.toLowerCase() === "ram";
    ramFilterBlock.style.display = isRam ? "block" : "none";

    if (isRam) {
      const typeSet = new Set();
      const formFactorSet = new Set();
      const eccSet = new Set();
      const regSet = new Set();
      const manSet = new Set();
      const heatSet = new Set();
      const rgbSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.ram_type) typeSet.add(s.ram_type);
        if (s.form_factor) formFactorSet.add(s.form_factor);
        if (typeof s.ecc === "boolean") eccSet.add(s.ecc ? "Yes" : "No");
        else if (s.ecc != null) eccSet.add(String(s.ecc));
        if (typeof s.registered === "boolean")
          regSet.add(s.registered ? "Yes" : "No");
        else if (s.registered != null) regSet.add(String(s.registered));
        if (s.metadata?.manufacturer) manSet.add(s.metadata.manufacturer);
        if (typeof s.heat_spreader === "boolean")
          heatSet.add(s.heat_spreader ? "Yes" : "No");
        if (typeof s.rgb === "boolean") rgbSet.add(s.rgb ? "Yes" : "No");
      }

      renderCheckboxList("ramTypeFilter-RAM", typeSet, applyFiltersAndRender);
      renderCheckboxList(
        "ramFormFactorFilter",
        formFactorSet,
        applyFiltersAndRender
      );
      renderCheckboxList("eccFilter", eccSet, applyFiltersAndRender);
      renderCheckboxList("registeredFilter", regSet, applyFiltersAndRender);
      renderCheckboxList(
        "ramManufacturerFilter",
        manSet,
        applyFiltersAndRender
      );
      renderCheckboxList("heatSpreaderFilter", heatSet, applyFiltersAndRender);
      renderCheckboxList("rgbFilter", rgbSet, applyFiltersAndRender);
    }
  }

  // Storage
  const storageFilterBlock = document.getElementById("storage-filters");
  if (!storageFilterBlock) {
    console.error("initFilters: #storage-filters не найден");
  } else {
    const isStorage = currentCategory.toLowerCase() === "storage";
    storageFilterBlock.style.display = isStorage ? "block" : "none";

    if (isStorage) {
      const typeSet = new Set();
      const ffSet = new Set();
      const ifaceSet = new Set();
      const manSet = new Set();
      const nvmeSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.type) typeSet.add(s.type);
        if (s.form_factor) ffSet.add(s.form_factor);
        if (s.interface) ifaceSet.add(s.interface);
        if (s.metadata?.manufacturer) manSet.add(s.metadata.manufacturer);
        if (typeof s.nvme === "boolean") nvmeSet.add(s.nvme ? "Yes" : "No");
      }

      renderCheckboxList("storageTypeFilter", typeSet, applyFiltersAndRender);
      renderCheckboxList(
        "storageFormFactorFilter",
        ffSet,
        applyFiltersAndRender
      );
      renderCheckboxList(
        "storageInterfaceFilter",
        ifaceSet,
        applyFiltersAndRender
      );
      renderCheckboxList(
        "storageManufacturerFilter",
        manSet,
        applyFiltersAndRender
      );
      renderCheckboxList("nvmeFilter", nvmeSet, applyFiltersAndRender);
    }
  }

  // PSU
  const psuFilterBlock = document.getElementById("psu-filters");
  if (!psuFilterBlock) {
    console.error("initFilters: #psu-filters не найден");
  } else {
    const isPsu = currentCategory.toLowerCase() === "psu";
    psuFilterBlock.style.display = isPsu ? "block" : "none";

    if (isPsu) {
      const ffSet = new Set();
      const effSet = new Set();
      const modSet = new Set();
      const manSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.form_factor) ffSet.add(s.form_factor);
        if (s.efficiency_rating) effSet.add(s.efficiency_rating);
        if (typeof s.modular === "boolean")
          modSet.add(s.modular ? "Yes" : "No");
        else if (s.modular != null) modSet.add(String(s.modular));
        if (s.metadata?.manufacturer) manSet.add(s.metadata.manufacturer);
      }

      renderCheckboxList("psuFormFactorFilter", ffSet, applyFiltersAndRender);
      renderCheckboxList(
        "efficiencyRatingFilter",
        effSet,
        applyFiltersAndRender
      );
      renderCheckboxList("modularFilter", modSet, applyFiltersAndRender);
      renderCheckboxList(
        "psuManufacturerFilter",
        manSet,
        applyFiltersAndRender
      );
    }
  }

  // Monitor
  const monitorFilterBlock = document.getElementById("monitor-filters");
  if (!monitorFilterBlock) {
    console.error("initFilters: #monitor-filters не найден");
  } else {
    const isMonitor = currentCategory.toLowerCase() === "monitor";
    monitorFilterBlock.style.display = isMonitor ? "block" : "none";

    if (isMonitor) {
      const brandSet = new Set();
      const refreshSet = new Set();
      const sizeSet = new Set();
      const vertSet = new Set();
      const horizSet = new Set();

      for (const p of allProducts) {
        const s = p.specs || {};
        if (s.metadata?.manufacturer) brandSet.add(s.metadata.manufacturer);
        if (s.refresh_rate != null) refreshSet.add(String(s.refresh_rate));
        if (s.screen_size != null) sizeSet.add(String(s.screen_size));
        if (s.resolution?.verticalRes != null)
          vertSet.add(String(s.resolution.verticalRes));
        if (s.resolution?.horizontalRes != null)
          horizSet.add(String(s.resolution.horizontalRes));
      }

      renderCheckboxList("monitorBrandFilter", brandSet, applyFiltersAndRender);
      renderCheckboxList(
        "refreshRateFilter",
        refreshSet,
        applyFiltersAndRender
      );
      renderCheckboxList("screenSizeFilter", sizeSet, applyFiltersAndRender);
      renderCheckboxList("verticalResFilter", vertSet, applyFiltersAndRender);
      renderCheckboxList(
        "horizontalResFilter",
        horizSet,
        applyFiltersAndRender
      );
    }
  }
}

export function applyFiltersAndRender() {
  // 1) стартуем с полного списка
  let prods = allProducts.slice();

  // 2) читаем общие фильтры
  const minP = Number(document.getElementById("priceMin").value);
  const maxP = Number(document.getElementById("priceMax").value);
  const query = document
    .getElementById("component-search")
    .value.trim()
    .toLowerCase();
  const compOnly = document.getElementById("compatibilityOnly").checked;
  const only3d = document.getElementById("only3d").checked;

  // 3) фильтрация по цене
  if (!isNaN(minP)) {
    prods = prods.filter((p) => {
      const price = p.prices?.Ekua ?? 0;
      return price !== null && price >= minP;
    });
  }
  if (!isNaN(maxP)) {
    prods = prods.filter((p) => {
      const price = p.prices?.Ekua ?? 0;
      return price !== null && price <= maxP;
    });
  }

  // 4) фильтр совместимости
  if (compOnly) {
    prods = prods.filter((p) => p.specs?.compatible !== false);
  }

  // 5) фильтр 3D
  if (only3d) {
    prods = prods.filter((p) => p.specs?.supports3D);
  }

  // 6) текстовый поиск по имени
  if (query) {
    const words = query.split(/\s+/);
    prods = prods.filter((p) => {
      const name = (p.specs?.metadata?.name || "").toLowerCase();
      return words.every((w) => name.includes(w));
    });
  }

  // 7) категорийные фильтры
  if (currentCategory === "CPU") {
    const sockets = getCheckedValues("socketFilter");
    const archs = getCheckedValues("microarchitectureFilter");
    const igpus = getCheckedValues("integratedGraphicsFilter");
    if (sockets.length) {
      prods = prods.filter((p) => sockets.includes(p.specs?.socket));
    }
    if (archs.length) {
      prods = prods.filter((p) => archs.includes(p.specs?.microarchitecture));
    }
    if (igpus.length) {
      prods = prods.filter((p) =>
        igpus.includes(p.specs?.specifications?.integratedGraphics?.model || "")
      );
    }
  } else if (currentCategory === "GPU") {
    const chipsets = getCheckedValues("chipsetFilter");
    const memTypes = getCheckedValues("memoryTypeFilter");
    const interfaces = getCheckedValues("interfaceFilter");
    const manufacturers = getCheckedValues("manufacturerFilter");
    if (chipsets.length) {
      prods = prods.filter((p) => chipsets.includes(p.specs?.chipset));
    }
    if (memTypes.length) {
      prods = prods.filter((p) => memTypes.includes(p.specs?.memory_type));
    }
    if (interfaces.length) {
      prods = prods.filter((p) => interfaces.includes(p.specs?.interface));
    }
    if (manufacturers.length) {
      prods = prods.filter((p) =>
        manufacturers.includes(p.specs?.metadata?.manufacturer)
      );
    }
  }

  // 8) сортировка: сначала с ценой, потом без
  const withPrice = prods.filter((p) => p.prices?.Ekua != null);
  const withoutPrice = prods.filter((p) => p.prices?.Ekua == null);
  const sorted = [...withPrice, ...withoutPrice];

  // 9) финальный рендер
  filteredProducts = sorted;
  setCurrentPage(1);
  renderProductsPage(sorted);
}
