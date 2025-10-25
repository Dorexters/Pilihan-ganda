// storage.js
// Abstraksi penyimpanan & file utilitas untuk seluruh aplikasi
// Menyediakan: getUserKey, readJSON, writeJSON, exportJSON, dan helper untuk localStorage per user

import { showToast } from './ui.js';

// === Konstanta ===
const STORAGE_PREFIX = 'ujianonline_';

// === Key Generator ===
export function getUserKey(email, keySuffix) {
  return `${STORAGE_PREFIX}${email}_${keySuffix}`;
}

// === JSON Reader ===
export async function readJSON(filename) {
  try {
    const cached = localStorage.getItem(STORAGE_PREFIX + filename);
    if (cached) return JSON.parse(cached);

    // Jika belum ada di localStorage, ambil dari file asli (mode lokal dev)
    const response = await fetch(filename);
    if (!response.ok) throw new Error('Gagal membaca ' + filename);
    const data = await response.json();

    localStorage.setItem(STORAGE_PREFIX + filename, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(err);
    showToast('Gagal memuat ' + filename);
    return [];
  }
}

// === JSON Writer ===
export async function writeJSON(filename, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + filename, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('writeJSON error:', err);
    showToast('Gagal menyimpan ' + filename);
    return false;
  }
}

// === JSON Exporter ===
export function exportJSON(data, filename) {
  try {
    const blob =
      typeof data === 'string'
        ? new Blob([data], { type: 'application/json' })
        : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('exportJSON error:', err);
    showToast('Gagal mengekspor data');
  }
}

// === Data Helpers ===
export function readUserData(email, key) {
  const val = localStorage.getItem(getUserKey(email, key));
  return val ? JSON.parse(val) : null;
}

export function writeUserData(email, key, data) {
  localStorage.setItem(getUserKey(email, key), JSON.stringify(data));
}

export function deleteUserData(email, key) {
  localStorage.removeItem(getUserKey(email, key));
}

// === Reset Data (untuk testing/QA) ===
export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
  showToast('Semua data dihapus dari localStorage.');
  }
