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
