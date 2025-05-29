// uiSetup.js

export function setupSearchInput() {
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
  const gridParent = document.getElementById("productsGrid").parentNode;
  gridParent.insertBefore(searchInput, document.getElementById("productsGrid"));
}

export function setupCpuFiltersHTML() {
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
}

// Добавляем HTML для фильтров GPU
export function setupGpuFiltersHTML() {
  const gpuFiltersHTML = `
    <hr>
    <div id="gpu-filters" style="display:none">
      <h5>Chipset</h5>
      <div id="chipsetFilter"></div>
      <h5>Memory Type</h5>
      <div id="memoryTypeFilter"></div>
      <h5>Interface</h5>
      <div id="interfaceFilter"></div>
      <h5>Manufacturer</h5>
      <div id="manufacturerFilter"></div>
    </div>
  `;
  document
    .querySelector(".filter-sidebar")
    .insertAdjacentHTML("beforeend", gpuFiltersHTML);
}

// Додаємо HTML для фільтрів Motherboard
export function setupMbFiltersHTML() {
  const mbFiltersHTML = `
    <hr>
    <div id="mb-filters" style="display:none">
      <h5>Socket</h5>
      <div id="socketFilter-mb"></div>
      <h5>Form Factor</h5>
      <div id="formFactorFilter"></div>
      <h5>Chipset</h5>
      <div id="mbChipsetFilter"></div>
      <h5>RAM Type</h5>
      <div id="ramTypeFilter"></div>
      <h5>Manufacturer</h5>
      <div id="mbManufacturerFilter"></div>
    </div>
  `;
  document
    .querySelector(".filter-sidebar")
    .insertAdjacentHTML("beforeend", mbFiltersHTML);
}

// Додаём HTML для фильтров PC Case
export function setupCaseFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupCaseFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="case-filters" style="display:none">
      <h5>Form Factor</h5>    <div id="caseFormFactorFilter"></div>
      <h5>Side Panel</h5>     <div id="sidePanelFilter"></div>
      <h5>Manufacturer</h5>   <div id="caseManufacturerFilter"></div>
    </div>
  `
  );
}

// Додаємо HTML для фільтрів CPUCooler
export function setupCoolerFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupCoolerFiltersHTML: .filter-sidebar не знайдено");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="cooler-filters" style="display:none">
      <h5>Manufacturer</h5>
      <div id="coolerManufacturerFilter"></div>
      <h5>Water Cooled</h5>
      <div id="waterCooledFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров RAM
export function setupRamFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupRamFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="ram-filters" style="display:none">
      <h5>RAM Type</h5>       <div id="ramTypeFilter-RAM"></div>
      <h5>Form Factor</h5>    <div id="ramFormFactorFilter"></div>
      <h5>ECC</h5>            <div id="eccFilter"></div>
      <h5>Registered</h5>     <div id="registeredFilter"></div>
      <h5>Manufacturer</h5>   <div id="ramManufacturerFilter"></div>
      <h5>Heat Spreader</h5>  <div id="heatSpreaderFilter"></div>
      <h5>RGB</h5>            <div id="rgbFilter"></div>
    </div>
  `
  );
}

// ———————————————————————————————————————————————————
// Добавляем HTML для фильтров Storage
export function setupStorageFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupStorageFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="storage-filters" style="display:none">
      <h5>Type</h5>         <div id="storageTypeFilter"></div>
      <h5>Form Factor</h5>  <div id="storageFormFactorFilter"></div>
      <h5>Interface</h5>    <div id="storageInterfaceFilter"></div>
      <h5>Manufacturer</h5><div id="storageManufacturerFilter"></div>
      <h5>NVMe</h5>         <div id="nvmeFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров PSU
export function setupPsuFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupPsuFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="psu-filters" style="display:none">
      <h5>Form Factor</h5>       <div id="psuFormFactorFilter"></div>
      <h5>Efficiency Rating</h5> <div id="efficiencyRatingFilter"></div>
      <h5>Modularity</h5>        <div id="modularFilter"></div>
      <h5>Manufacturer</h5>      <div id="psuManufacturerFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров Monitor
export function setupMonitorFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupMonitorFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <hr>
    <div id="monitor-filters" style="display:none">
      <h5>Brand</h5>               <div id="monitorBrandFilter"></div>
      <h5>Refresh Rate</h5>        <div id="refreshRateFilter"></div>
      <h5>Screen Size</h5>         <div id="screenSizeFilter"></div>
      <h5>Vertical Resolution</h5> <div id="verticalResFilter"></div>
      <h5>Horizontal Resolution</h5><div id="horizontalResFilter"></div>
    </div>
  `
  );
}
