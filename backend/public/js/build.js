// public/js/build.js

// --- API конфигов ---
const API = {
  list: "/api/configs",
  create: "/api/configs",
  load: (id) => `/api/configs/${id}`,
  update: (id) => `/api/configs/${id}`,
};

// --- Состояние ---
let currentBuildId = null;
let isSaving = false;
const selectedParts = {}; // { category: product }

// --- DOM ---
const overlay = document.getElementById("quickAddOverlay");
const buildName = document.getElementById("build-name");
const buildSelector = document.getElementById("build-selector");
const newBuildBtn = document.getElementById("new-build");
const totalPriceSpan = document.getElementById("totalPrice");
const compatibilitySpan = document.getElementById("compatibility");
const totalTdpSpan = document.getElementById("totalTdp");
const mark3dSpan = document.getElementById("mark3d");
const buildDateSpan = document.getElementById("build-date");
const buildAuthorSpan = document.getElementById("build-author");

// --- Утилиты из старого build.js ---
function getBuildTitle(specs) {
  return (
    [specs.manufacturer, specs.series, specs.model, specs.metadata?.name]
      .filter(Boolean)
      .join(" ") ||
    specs.id ||
    "Unnamed"
  );
}
function getBuildImage(product) {
  if (product?.storeImg?.Ekua) {
    return product.storeImg.Ekua;
  }
  return "/img/placeholder.png";
}
function getBuyLink(product) {
  return product?.storeIds?.Ekua;
}
function getStoreIcon(product) {
  '<img src="/img/logo.svg" class="store-icon" alt="Ek"/>';
}
function updateTotal() {
  // ——————————————— 1) Цена — не меняем ———————————————
  let sumPrice = 0;
  for (const p of Object.values(selectedParts)) {
    const vals = Object.values(p.prices || {}).filter(
      (v) => typeof v === "number"
    );
    if (vals.length) sumPrice += Math.min(...vals);
  }
  totalPriceSpan.textContent = sumPrice.toFixed(2).replace(".", ",");

  // ——————————————— 2) TDP с fallback на specs.specifications.tdp ———————————————
  let sumTdp = 0;
  for (const p of Object.values(selectedParts)) {
    if (p.specs) {
      let tdpVal = 0;
      // берём первую очередь из p.specs.tdp
      if (typeof p.specs.tdp === "number") {
        tdpVal = p.specs.tdp;
      }
      // иначе пытаемся найти в p.specs.specifications.tdp
      else if (
        p.specs.specifications &&
        typeof p.specs.specifications.tdp === "number"
      ) {
        tdpVal = p.specs.specifications.tdp;
      }
      sumTdp += tdpVal;
    }
  }
  totalTdpSpan.textContent = sumTdp;

  // ——————————————— 3) Заглушки для остального ———————————————
  compatibilitySpan.textContent = "Compatible";
  mark3dSpan.textContent = "—";
}

function renderPart(category, product) {
  selectedParts[category] = product;
  const container = document.querySelector(
    `.part-category[data-cat="${category}"]`
  );
  container.querySelectorAll(".selected-part").forEach((el) => el.remove());
  const addBtn = container.querySelector(".add-btn");
  addBtn.textContent = "Swap Part";

  const { specs, prices } = product;
  const title = getBuildTitle(specs);
  const imgUrl = getBuildImage(product);
  const price = product.prices?.Ekua ?? 0;
  const link = getBuyLink(product);
  const icon = getStoreIcon(specs);

  const partDiv = document.createElement("div");
  partDiv.className = "selected-part";
  partDiv.innerHTML = `
    <img src="${imgUrl}" alt="${title}" class="sp-thumb"
         onerror="this.src='/img/placeholder.png'" />
    <div class="sp-info">
      <div class="sp-title">${title}</div>
      <div class="sp-price">${price}₴ <img src="/img/logo.svg" class="store-icon" alt="Ek"/>'</div>
    </div>
    <div class="sp-actions">
      ${link ? `<a href="${link}" target="_blank" class="sp-buy">Buy</a>` : ""}
      <button class="sp-remove" title="Remove">&times;</button>
    </div>
  `;
  container.append(partDiv);
  updateTotal();
}

// --- Удаление и замена части ---
document.body.addEventListener("click", (e) => {
  // Удалить часть
  if (e.target.matches(".sp-remove")) {
    const cat = e.target.closest(".part-category").dataset.cat;
    delete selectedParts[cat];
    e.target.closest(".selected-part").remove();
    const container = document.querySelector(
      `.part-category[data-cat="${cat}"]`
    );
    const addBtn = container.querySelector(".add-btn");
    addBtn.textContent = `+ Add ${container.querySelector("h3").textContent}`;
    updateTotal();
    window.dispatchEvent(new Event("buildUpdated"));
  }
  // Swap снова открывает QuickAdd
  if (
    e.target.matches(".add-btn") &&
    selectedParts[e.target.closest(".part-category").dataset.cat]
  ) {
    overlay.classList.add("active");
  }
});

// --- Подписка на добавление из quickAdd.js ---
window.addEventListener("add-component", ({ detail }) => {
  renderPart(detail.category, detail.product);
  // уведомляем систему автосохранения
  window.dispatchEvent(new Event("buildUpdated"));
});

// --- Собираем ID компонентов для отправки ---
function getCurrentPartsData() {
  return Object.values(selectedParts).map((p) => p.opendb_id);
}

// --- Управление списком сборок ---
async function loadBuildList() {
  const token = localStorage.getItem("token");
  const res = await fetch(API.list, {
    headers: { Authorization: "Bearer " + token },
  });
  const list = await res.json();
  buildSelector.innerHTML = list
    .map((b) => `<option value="${b._id}">${b.name}</option>`)
    .join("");
}

// --- ЗАГРУЗКА СБОРКИ ---
async function loadBuild(id) {
  if (!id) return;
  const token = localStorage.getItem("token");

  // 1) Получаем данные сборки
  const res = await fetch(API.load(id), {
    headers: { Authorization: "Bearer " + token },
  });
  const cfg = await res.json();
  currentBuildId = cfg._id;
  buildName.textContent = cfg.name;

  // Дата создания (cfg.createdAt берётся из модели Config)
  const dt = new Date(cfg.createdAt);
  buildDateSpan.textContent = dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Автор — пока как заглушка (у вас в cfg.user только ID)
  buildAuthorSpan.textContent = "Anonymous";

  // 2) Очищаем текущее состояние
  //    — очищаем selectedParts
  Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
  //    — удаляем все DOM-блоки с уже выбранными деталями
  document.querySelectorAll(".selected-part").forEach((el) => el.remove());

  // 3) Сбрасываем текст кнопок для всех категорий в "+ Add <Категория>"
  document.querySelectorAll(".part-category").forEach((cat) => {
    const title = cat.querySelector("h3").textContent.trim();
    const btn = cat.querySelector(".add-btn");
    btn.textContent = `+ Add ${title}`;
  });

  // 4) Загружаем детали из бэкенда и рендерим только их
  const products = await Promise.all(
    cfg.components.map((cid) =>
      fetch(`/api/components/${cid}`, {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json())
    )
  );

  products.forEach((p) => renderPart(p.category, p));

  // 5) Обновляем итоговую цену (на всякий случай)
  updateTotal();
}

// --- Новая сборка ---
newBuildBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name: "Нова збірка", components: [] }),
  });
  const b = await res.json();
  currentBuildId = b._id;

  await loadBuildList();
  buildSelector.value = b._id;
  buildName.textContent = b.name;

  // Очищаем UI: удаляем все выбранные компоненты
  Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
  document.querySelectorAll(".selected-part").forEach((el) => el.remove());
  updateTotal();

  // **Сбрасываем текст всех кнопок Add/Swap обратно на + Add <Категория>**
  document.querySelectorAll(".part-category").forEach((cat) => {
    const title = cat.querySelector("h3").textContent.trim();
    const addBtn = cat.querySelector(".add-btn");
    addBtn.textContent = `+ Add ${title}`;
  });
});

// --- Переключение сборок ---
buildSelector.addEventListener("change", () => {
  loadBuild(buildSelector.value);
});

// --- Переименование сборки ---
buildName.addEventListener("blur", async () => {
  const newName = buildName.textContent.trim() || "Без назви";
  buildName.textContent = newName;
  if (!currentBuildId) return;
  const token = localStorage.getItem("token");
  await fetch(API.update(currentBuildId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name: newName }),
  });
});

// --- Авто-сохранение ---
window.addEventListener("buildUpdated", async () => {
  if (!currentBuildId || isSaving) return;
  isSaving = true;
  const token = localStorage.getItem("token");
  try {
    await fetch(API.update(currentBuildId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ components: getCurrentPartsData() }),
    });
  } catch (e) {
    console.error("Auto-save error:", e);
  } finally {
    isSaving = false;
  }
});

// --- Инициализация при загрузке страницы ---
(async function init() {
  await loadBuildList();
  if (buildSelector.options.length) {
    buildSelector.value = buildSelector.options[0].value;
    await loadBuild(buildSelector.value);
  } else {
    newBuildBtn.click();
  }
})();
