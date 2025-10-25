// ui.js
// API UI global untuk toast, modal, spinner, dan transisi halaman

export const ui = {
  showToast,
  showModal,
  hideModal,
  showSpinner,
  hideSpinner,
  pageTransition,
  revealOnScroll,
  animateRowChange
};

// --- Toast Message ---
function showToast(message, type = 'info', duration = 2500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- Modal ---
function showModal(content, options = {}) {
  let modal = document.querySelector('.animated-modal');
  if (!modal) {
    console.warn('animated-modal.html belum dimuat.');
    return;
  }
  const body = modal.querySelector('.modal-body');
  const title = modal.querySelector('.modal-title');

  title.textContent = options.title || 'Konfirmasi';
  body.innerHTML = content;

  modal.classList.add('open');
  modal.querySelector('[data-close-modal]').onclick = () => hideModal();

  if (options.onConfirm) {
    const confirmBtn = modal.querySelector('[data-confirm-modal]');
    confirmBtn.onclick = () => {
      options.onConfirm();
      hideModal();
    };
  }
}

function hideModal() {
  const modal = document.querySelector('.animated-modal');
  if (modal) modal.classList.remove('open');
}

// --- Loading Spinner ---
function showSpinner(text = 'Memuat...') {
  let spinner = document.querySelector('.loading-spinner');
  if (!spinner) {
    console.warn('loading-spinner.html belum dimuat.');
    return;
  }
  spinner.querySelector('.spinner-text').textContent = text;
  spinner.classList.add('visible');
}

function hideSpinner() {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) spinner.classList.remove('visible');
}

// --- Transisi Halaman ---
function pageTransition(type = 'fade', callback) {
  const overlay = document.createElement('div');
  overlay.className = `page-transition ${type}`;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('active'));

  setTimeout(() => {
    if (callback) callback();
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 500);
  }, 400);
}

// --- Reveal On Scroll (animasi masuk saat elemen muncul di layar) ---
function revealOnScroll() {
  const elements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// --- Animasi perubahan baris tabel (digunakan di admin dan leaderboard) ---
function animateRowChange(row) {
  row.classList.add('flash-change');
  setTimeout(() => row.classList.remove('flash-change'), 1000);
}

// Event inisialisasi global
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
});
