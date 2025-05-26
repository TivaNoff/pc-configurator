// public/js/build.js
const selected = {};   // { category: opendb_id }

// Обновляем UI при выборе детали
window.addEventListener('add-component', ({ detail }) => {
  selected[detail.category] = detail.id;
  updatePartList(detail.category, detail.id);
  recalcTotal();
});

// Заменяем кнопку на название выбранного компонента
function updatePartList(cat, id) {
  const pc = document.querySelector(`.part-category[data-cat="${cat}"]`);
  const nameEl = document.createElement('span');
  nameEl.textContent = id;             // позже можно показать имя из specs.name
  pc.querySelector('button').replaceWith(nameEl);
}

// Пересчёт общей цены
async function recalcTotal() {
  let sum = 0;
  const token = localStorage.getItem('token');
  for (const [cat, id] of Object.entries(selected)) {
    // Получаем детали одного компонента, чтобы взять цену
    const res = await fetch(`/api/components/${encodeURIComponent(id)}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) continue;
    const comp = await res.json();
    // берем минимальную цену среди магазинов
    const vals = Object.values(comp.prices).filter(v => typeof v === 'number');
    if (vals.length) sum += Math.min(...vals);
  }
  document.getElementById('totalPrice').textContent = `₴ ${sum}`;
}

// Сохранение сборки
document.getElementById('saveBtn').addEventListener('click', async () => {
  if (!Object.keys(selected).length) {
    alert('Додайте хоча б один компонент');
    return;
  }
  const name = prompt('Назва збірки', 'Моя збірка');
  const token = localStorage.getItem('token');
  const res = await fetch('/api/configs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name,
      components: Object.values(selected)
    })
  });
  if (res.ok) {
    alert('Збережено');
    location.href = '/saved.html';
  } else {
    const { message } = await res.json();
    alert('Помилка: ' + message);
  }
});
