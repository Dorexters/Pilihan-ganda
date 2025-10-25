// utils.js
// Berisi fungsi umum: hashing, waktu, validasi, format, dan random ID

// === Hashing (SHA-256) ===
export async function hashString(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// === Validasi Email ===
export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

// === Validasi Password ===
export function isStrongPassword(password) {
  return password.length >= 6;
}

// === Format Tanggal & Waktu ===
export function formatDateTime(date = new Date()) {
  return date.toLocaleString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// === Format Waktu Singkat (untuk log aktivitas) ===
export function shortTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

// === ID Generator (untuk user, soal, hasil ujian) ===
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

// === Copy ke Clipboard ===
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert('Teks disalin ke clipboard');
  } catch (err) {
    console.error('Clipboard error:', err);
    alert('Gagal menyalin teks');
  }
}

// === Ambil Parameter URL ===
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// === Random Pilihan (acak urutan jawaban) ===
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// === Konversi Nilai ke Huruf ===
export function scoreToGrade(score) {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

// === Delay (untuk simulasi loading async) ===
export function delay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
                                        }
