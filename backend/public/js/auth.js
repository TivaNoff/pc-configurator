// public/js/auth.js
const apiBase = ''; // пусто, т.к. всё проксируется на тот же домен

// Общая функция POST
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return res.json();
}

// Обработка формы логина
if (location.pathname.endsWith('login.html')) {
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { token, message } = await postJSON('/api/auth/login', { email, password });
      if (token) {
        localStorage.setItem('token', token);
        location.href = '/index.html';
      } else {
        throw new Error(message || 'Login failed');
      }
    } catch (err) {
      document.getElementById('error').textContent = err.message;
    }
  });
}

// Обработка формы регистрации
if (location.pathname.endsWith('register.html')) {
  document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { message } = await postJSON('/api/auth/register', { email, password });
      if (message) {
        location.href = '/login.html';
      }
    } catch (err) {
      document.getElementById('error').textContent = err.message || 'Register failed';
    }
  });
}
