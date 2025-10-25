// exam.js
// Logika ujian siswa: navigasi soal, autosave jawaban, submit hasil

import { ui } from './ui.js';
import { requireAuth, getSession } from './auth.js';
import { readJSON, writeJSON, getUserKey } from './storage.js';
import { sha256 } from './utils.js';

const EXAM_FILE = 'questions.json';
const CONFIG_FILE = 'exam-config.json';
const RESULTS_FILE = 'examResults';
let currentIndex = 0;
let questions = [];
let answers = {};
let examId = 'exam1';
let session;

// --- Inisialisasi halaman ujian ---
document.addEventListener('DOMContentLoaded', async () => {
  session = requireAuth('student');
  if (!session) return;

  ui.showSpinner('Memuat soal...');
  await loadExam();
  ui.hideSpinner();

  renderQuestion(currentIndex);
  setupNavigator();
  setupSubmitButton();
});

// --- Load soal dari questions.json ---
async function loadExam() {
  const config = await readJSON(CONFIG_FILE);
  if (!config || !config.published) {
    ui.showToast('Ujian belum dipublikasikan oleh admin', 'error');
    ui.pageTransition('fade', () => location.href = 'dashboard.html');
    return;
  }

  const data = await readJSON(EXAM_FILE);
  if (!data || !data[examId]) {
    ui.showToast('Bank soal kosong', 'error');
    return;
  }

  questions = data[examId].questions;
  const saved = localStorage.getItem(getUserKey(session.email, `answers_${examId}`));
  answers = saved ? JSON.parse(saved) : {};
}

// --- Render soal ke layar ---
function renderQuestion(index) {
  const q = questions[index];
  if (!q) return;

  const container = document.getElementById('question-container');
  container.dataset.transition = 'slide';
  container.innerHTML = generateQuestionHTML(q, index + 1, questions.length);

  ui.revealOnScroll();
  setupChoices(q);
}

// --- Generate HTML tiap soal ---
function generateQuestionHTML(q, number, total) {
  let html = `<div class="question" data-animate="fade-up">
      <h2>Soal ${number}/${total}</h2>
      <p class="question-text">${q.text}</p>`;

  if (q.media)
    html += `<div class="question-media"><img src="${q.media}" alt="media"></div>`;

  if (q.type === 'single') {
    html += q.choices.map((c, i) => `
      <label class="choice">
        <input type="radio" name="q${q.id}" value="${i}" ${answers[q.id] == i ? 'checked' : ''}>
        ${c}
      </label>`).join('');
  }

  if (q.type === 'multiple') {
    const selected = answers[q.id] || [];
    html += q.choices.map((c, i) => `
      <label class="choice">
        <input type="checkbox" name="q${q.id}" value="${i}" ${selected.includes(i) ? 'checked' : ''}>
        ${c}
      </label>`).join('');
  }

  if (q.type === 'essay') {
    html += `<textarea name="q${q.id}" rows="4" placeholder="Ketik jawaban Anda">${answers[q.id] || ''}</textarea>`;
  }

  html += `<div class="nav-buttons">
      <button id="prev-btn" ${number === 1 ? 'disabled' : ''}>Sebelumnya</button>
      <button id="next-btn" ${number === total ? 'disabled' : ''}>Berikutnya</button>
  </div></div>`;

  return html;
}

// --- Event listener pilihan ---
function setupChoices(q) {
  const container = document.getElementById('question-container');
  const inputs = container.querySelectorAll('input, textarea');

  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (q.type === 'single') {
        answers[q.id] = parseInt(input.value);
      } else if (q.type === 'multiple') {
        const selected = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
          .map(cb => parseInt(cb.value));
        answers[q.id] = selected;
      } else if (q.type === 'essay') {
        answers[q.id] = input.value.trim();
      }

      localStorage.setItem(getUserKey(session.email, `answers_${examId}`), JSON.stringify(answers));
      flashAutosave();
    });
  });

  container.querySelector('#prev-btn')?.addEventListener('click', () => changeQuestion(-1));
  container.querySelector('#next-btn')?.addEventListener('click', () => changeQuestion(1));
}

// --- Navigasi antar soal ---
function changeQuestion(direction) {
  const next = currentIndex + direction;
  if (next >= 0 && next < questions.length) {
    currentIndex = next;
    ui.pageTransition('slide', () => renderQuestion(currentIndex));
  }
}

// --- Setup navigator nomor soal (question-navigator.html) ---
function setupNavigator() {
  const nav = document.getElementById('question-navigator');
  if (!nav) return;

  nav.innerHTML = questions.map((_, i) =>
    `<button class="nav-num ${i === currentIndex ? 'active' : ''}" data-index="${i}">${i + 1}</button>`
  ).join('');

  nav.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      currentIndex = parseInt(btn.dataset.index);
      renderQuestion(currentIndex);
    };
  });
}

// --- Flash autosave visual cue ---
function flashAutosave() {
  const el = document.querySelector('#autosave-indicator');
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 600);
}

// --- Tombol submit ujian ---
function setupSubmitButton() {
  const btn = document.getElementById('submit-exam');
  if (!btn) return;
  btn.addEventListener('click', () => {
    ui.showModal('Apakah kamu yakin ingin mengakhiri ujian ini?', {
      title: 'Konfirmasi Selesai',
      onConfirm: submitExam
    });
  });
}

// --- Grading otomatis dan simpan hasil ---
async function submitExam() {
  let correct = 0;
  const details = [];

  for (const q of questions) {
    let isCorrect = false;
    if (q.type === 'single') {
      isCorrect = parseInt(answers[q.id]) === q.correct;
    } else if (q.type === 'multiple') {
      isCorrect = JSON.stringify(answers[q.id]?.sort()) === JSON.stringify(q.correct.sort());
    } else if (q.type === 'essay') {
      isCorrect = false; // Essay tidak otomatis dinilai
    }

    details.push({
      id: q.id,
      type: q.type,
      userAnswer: answers[q.id],
      correctAnswer: q.correct,
      isCorrect
    });

    if (isCorrect) correct++;
  }

  const score = Math.round((correct / questions.length) * 100);

  const results = await readJSON(RESULTS_FILE) || [];
  results.push({
    userEmail: session.email,
    name: session.name,
    examId,
    score,
    details
  });

  await writeJSON(RESULTS_FILE, results);
  ui.showToast(`Ujian selesai. Skor kamu: ${score}`, 'success');

  ui.pageTransition('fade', () => location.href = 'result.html');
}
