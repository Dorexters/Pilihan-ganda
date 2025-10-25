// app.js
// Inisialisasi tema, komponen global, dan transisi halaman

import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadTheme();
  await includePartials();
  ui.pageTransition('fade');
  setupDarkMode();
  setupNavRouting();
});

// Memuat theme.json dan terapkan ke :root
async function loadTheme() {
  try {
    const res = await fetch('theme.json');
    const data = await res.json();
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? data.theme.dark
      : data.theme.light;

    const font = data.theme.font;
    const radius = data.theme.radius;
    const shadow = data.theme.shadow;
    const transition = data.theme.transition;

    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }

    for (const [key, value] of Object.entries(font)) {
      document.documentElement.style.setProperty(`--font-${key}`, value);
    }

    for (const [key, value] of Object.entries(radius)) {
      document.documentElement.style.setProperty(`--radius-${key}`, value);
    }

    for (const [key, value] of Object.entries(shadow)) {
      document.documentElement.style.setProperty(`--shadow-${key}`, value);
    }

    for (const [key, value] of Object.entries(transition)) {
      document.documentElement.style.setProperty(`--transition-${key}`, value);
    }
  } catch (err) {
    console.error('Gagal memuat theme.json:', err);
  }
}

// Muat komponen global (header, footer, modal, toast, dsb)
async function includePartials() {
  const partials = [
    'header.html',
    'footer.html',
    'loading-spinner.html',
    'toast-message.html',
    'animated-modal.html'
  ];

  for (const file of partials) {
    try {
      const el = document.querySelector(`[data-include="${file}"]`);
      if (el) {
        const res = await fetch(file);
        const html = await res.text();
        el.innerHTML = html;
      }
    } catch (err) {
      console.warn(`Gagal memuat ${file}:`, err);
    }
  }
}

// Mode gelap otomatis dan toggle manual
function setupDarkMode() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  prefersDark.addEventListener('change', () => loadTheme());

  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      ui.showToast('Tema diubah');
    });
  }
}

// Routing internal sederhana antar halaman
function setupNavRouting() {
  document.querySelectorAll('a[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.getAttribute('href');
      ui.pageTransition('fade', () => {
        window.location.href = target;
      });
    });
  });
}
