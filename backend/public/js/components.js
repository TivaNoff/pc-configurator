// backend/public/js/components.js

const API_BASE = ''; // пусто, т.к. запросы идут на тот же хост

/**
 * Запрашивает список компонентов по категории
 * @param {string} category — название категории, точно как в базе (Case, CPU, GPU...)
 * @returns {Promise<Array>} — массив объектов { opendb_id, specs, prices }
 */
export async function fetchProductsByCategory(category) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('🚨 No token, redirect to login');
    window.location = '/login.html';
    return [];
  }
  const res = await fetch(
    `/api/components?category=${encodeURIComponent(category)}&limit=100`,
    { headers: { 'Authorization': 'Bearer ' + token } }
  );
  console.log('   fetchProductsByCategory → HTTP', res.status);
  const json = await res.json();
  console.log('   fetchProductsByCategory → JSON keys:', Object.keys(json));
  return json.data || [];
}

