// auth.js
// Registrasi, login, dan session siswa + admin

import { ui } from './ui.js';
import { readJSON, writeJSON } from './storage.js';
import { sha256 } from './utils.js';

const USERS_FILE = 'users.json';
const ADMIN_FILE = 'admin-config.json';
const SESSION_KEY = 'currentSession';

// --- Registrasi siswa ---
export async function registerUser(name, email, password) {
  try {
    if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      ui.showToast('Gunakan email .com yang valid', 'error');
      return false;
    }
    if (password.length < 6) {
      ui.showToast('Password minimal 6 karakter', 'error');
      return false;
    }

    const users = await readJSON(USERS_FILE) || [];
    if (users.find(u => u.email === email)) {
      ui.showToast('Email sudah terdaftar', 'error');
      return false;
    }

    const passwordHash = await sha256(password);
    users.push({ name, email, passwordHash });
    await writeJSON(USERS_FILE, users);

    ui.showToast('Registrasi berhasil. Silakan login.', 'success');
    ui.pageTransition('fade', () => location.href = 'login.html');
    return true;
  } catch (err) {
    console.error(err);
    ui.showToast('Gagal registrasi', 'error');
    return false;
  }
}

// --- Login (siswa / admin) ---
export async function loginUser(email, password) {
  try {
    const passwordHash = await sha256(password);
    const admins = await readJSON(ADMIN_FILE);
    const admin = admins && admins.username === email && admins.passwordHash === passwordHash;

    if (admin) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        role: 'admin',
        email,
        name: 'Administrator'
      }));
      ui.showToast('Login admin berhasil', 'success');
      ui.pageTransition('fade', () => location.href = 'admin-dashboard.html');
      return;
    }

    const users = await readJSON(USERS_FILE) || [];
    const user = users.find(u => u.email === email && u.passwordHash === passwordHash);

    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        role: 'student',
        email: user.email,
        name: user.name
      }));
      ui.showToast('Login berhasil', 'success');
      ui.pageTransition('fade', () => location.href = 'dashboard.html');
    } else {
      ui.showToast('Email atau password salah', 'error');
    }
  } catch (err) {
    console.error(err);
    ui.showToast('Gagal login', 'error');
  }
}

// --- Logout ---
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  ui.pageTransition('fade', () => location.href = 'login.html');
}

// --- Cek session aktif ---
export function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// --- Middleware role guard ---
export function requireAuth(role = null) {
  const session = getSession();
  if (!session) {
    ui.pageTransition('fade', () => location.href = 'login.html');
    return null;
  }
  if (role && session.role !== role) {
    ui.showToast('Akses ditolak', 'error');
    ui.pageTransition('fade', () => location.href = 'login.html');
    return null;
  }
  return session;
}

// --- Auto inisialisasi form (login & register) ---
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.onsubmit = async e => {
      e.preventDefault();
      const name = regForm.name.value.trim();
      const email = regForm.email.value.trim();
      const password = regForm.password.value.trim();
      await registerUser(name, email, password);
    };
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = async e => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
      await loginUser(email, password);
    };
  }
});
