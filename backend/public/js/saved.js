// public/js/saved.js
const token = localStorage.getItem('token');
if (!token) location.href = '/login.html';

(async () => {
  const container = document.getElementById('savedList');
  try {
    const res = await fetch('/api/configs', {
      headers: { 'Authorization':'Bearer '+token }
    });
    const configs = await res.json();
    container.innerHTML = '<ul>' + configs.map(c => `
      <li data-id="${c._id}">
        ${c.name} — ${c.totalPrice} грн
        <button class="delBtn">Видалити</button>
      </li>
    `).join('') + '</ul>';
    // навесим удаление
    container.querySelectorAll('.delBtn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const li = e.target.closest('li');
        const id = li.dataset.id;
        const del = await fetch('/api/configs/'+id, {
          method:'DELETE',
          headers: { 'Authorization':'Bearer '+token }
        });
        if (del.ok) li.remove();
      });
    });
  } catch {
    container.textContent = 'Помилка завантаження';
  }
})();
