// public/js/build.js

// Контейнер модалки, кнопка сохранения и отображение суммы
const overlay = document.getElementById("quickAddOverlay");
const saveBtn = document.getElementById("saveBtn");
const totalPriceSpan = document.getElementById("totalPrice");

// Хранилище выбранных частей: { [category]: product }
const selectedParts = {};

/**
 * Собираем человеко-читаемое название из specs
 */
function getBuildTitle(specs) {
  return (
    [specs.manufacturer, specs.series, specs.model, specs.metadata?.name]
      .filter(Boolean)
      .join(" ") ||
    specs.id ||
    "Unnamed"
  );
}

/**
 * Получаем URL картинки: сперва OpenDB images, потом Amazon, иначе placeholder
 */
function getBuildImage(specs) {
  if (specs?.general_product_information?.amazon_sku) {
    return `https://images-na.ssl-images-amazon.com/images/P/${specs?.general_product_information?.amazon_sku}._SL500_.jpg`;
  }
  return "/img/placeholder.png";
}

/**
 * Ссылка “Buy” только для Amazon
 */
function getBuyLink(specs) {
  return specs?.general_product_information?.amazon_sku
    ? `https://www.amazon.com/dp/${specs?.general_product_information?.amazon_sku}`
    : null;
}

/**
 * Иконка магазина — только Amazon
 */
function getStoreIcon(specs) {
  return specs?.general_product_information?.amazon_sku
    ? '<img src="/img/placeholder.png" class="store-icon" alt="Amazon"/>'
    : "";
}

/**
 * Пересчитываем общую стоимость и рисуем в шапке
 */
function updateTotal() {
  let sum = 0;
  for (const p of Object.values(selectedParts)) {
    const prices = Object.values(p.prices || {}).filter(
      (v) => typeof v === "number"
    );
    if (prices.length) {
      sum += Math.min(...prices);
    }
  }
  totalPriceSpan.textContent = `₴ ${sum}`;
}

/**
 * Рендерим одну выбранную часть внутри её .part-category
 */
function renderPart(category, product) {
  selectedParts[category] = product;

  // Ищем контейнер категории
  const container = document.querySelector(
    `.part-category[data-cat="${category}"]`
  );

  // Удаляем старую разметку, если была
  container.querySelectorAll(".selected-part").forEach((el) => el.remove());

  // Преобразуем кнопку
  const addBtn = container.querySelector(".add-btn");
  addBtn.textContent = "Swap Part";

  // Собираем данные
  const { specs, prices } = product;
  const title = getBuildTitle(specs);
  const imgUrl = getBuildImage(specs);
  const price = "N/A";
  const link = getBuyLink(specs);
  const icon = getStoreIcon(specs);

  // Создаём элемент
  const partDiv = document.createElement("div");
  partDiv.className = "selected-part";
  partDiv.innerHTML = `
    <img src="${imgUrl}" alt="${title}" class="sp-thumb"
         onerror="this.src='/img/placeholder.png'" />
    <div class="sp-info">
      <div class="sp-title">${title}</div>
      <div class="sp-price">${price}₴ ${icon}</div>
    </div>
    <div class="sp-actions">
      ${link ? `<a href="${link}" target="_blank" class="sp-buy">Buy</a>` : ""}
      <button class="sp-remove" title="Remove">&times;</button>
    </div>
  `;

  container.append(partDiv);
  updateTotal();
}

// Обработчик кликов для удаления и swap
document.body.addEventListener("click", (e) => {
  // Удалить часть
  if (e.target.matches(".sp-remove")) {
    const category = e.target.closest(".part-category").dataset.cat;
    delete selectedParts[category];
    e.target.closest(".selected-part").remove();
    // Возвращаем кнопку в исходное состояние
    const container = document.querySelector(
      `.part-category[data-cat="${category}"]`
    );
    const addBtn = container.querySelector(".add-btn");
    addBtn.textContent = `+ Add ${container.querySelector("h3").textContent}`;
    updateTotal();
  }

  // Повторно открыть Quick Add при Swap
  if (
    e.target.matches(".add-btn") &&
    selectedParts[e.target.closest(".part-category").dataset.cat]
  ) {
    overlay.classList.add("active");
  }
});

// Слушаем событие из quickAdd.js
// detail: { category: string, product: object }
window.addEventListener("add-component", ({ detail }) => {
  renderPart(detail.category, detail.product);
});

/**
 * Сохраняем сборку на сервер
 */
saveBtn.addEventListener("click", async () => {
  const parts = Object.values(selectedParts);
  if (parts.length === 0) {
    return alert("Додайте хоча б один компонент перед збереженням.");
  }
  const name = prompt("Назва збірки", "Моя збірка");
  if (!name) return;

  const components = parts.map((p) => p.opendb_id);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/configs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ name, components }),
    });
    if (res.ok) {
      alert("Сборка збережена!");
      window.location.href = "/saved.html";
    } else {
      const err = await res.json();
      alert("Помилка збереження: " + (err.message || res.statusText));
    }
  } catch (err) {
    console.error(err);
    alert("Сетева помилка при збереженні.");
  }
});

/**
 * Пришел параметр ?config=<ID> — загружаем эту сборку
 */
(function loadFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const cfgId = params.get("config");
  if (!cfgId) return;

  saveBtn.textContent = "Update Build";

  (async () => {
    const token = localStorage.getItem("token");
    try {
      // Получаем конфиг
      const cfgRes = await fetch(`/api/configs/${cfgId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!cfgRes.ok) throw new Error("Не вдалося завантажити конфігурацію");
      const cfg = await cfgRes.json();

      // Для каждого opendb_id запрашиваем полный объект
      const proms = cfg.components.map((id) =>
        fetch(`/api/components/${id}`, {
          headers: { Authorization: "Bearer " + token },
        }).then((r) => r.json())
      );
      const products = await Promise.all(proms);

      // Добавляем их в сборку
      products.forEach((p) => {
        window.dispatchEvent(
          new CustomEvent("add-component", {
            detail: { category: p.category, product: p },
          })
        );
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  })();
})();
