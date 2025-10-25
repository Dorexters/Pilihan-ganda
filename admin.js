// admin.js
// Logika utama panel admin: publish ujian, upload/edit soal, aktivitas siswa, leaderboard

import { readJSON, writeJSON, exportJSON } from './storage.js';
import { showToast, showModal, animateRowChange } from './ui.js';
import { sha256 } from './utils.js';

let adminSession = null;
let examConfig = {};
let questionsWorking = [];
let examResults = [];
let users = [];

document.addEventListener('DOMContentLoaded', async () => {
  adminSession = JSON.parse(localStorage.getItem('sessionAdmin') || 'null');
  if (!adminSession) {
    window.location.href = 'login.html';
    return;
  }

  examConfig = await readJSON('exam-config.json');
  questionsWorking = await readJSON('questions.json');
  examResults = JSON.parse(localStorage.getItem('examResults') || '[]');
  users = await readJSON('users.json');

  initAdminDashboard();
});

function initAdminDashboard() {
  const publishBtn = document.getElementById('publishExamBtn');
  const unpublishBtn = document.getElementById('unpublishExamBtn');
  const uploadBtn = document.getElementById('uploadQuestionBtn');
  const exportBtn = document.getElementById('exportQuestionsBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const resetLeaderboardBtn = document.getElementById('resetLeaderboardBtn');

  if (publishBtn) publishBtn.addEventListener('click', publishExam);
  if (unpublishBtn) unpublishBtn.addEventListener('click', unpublishExam);
  if (uploadBtn) uploadBtn.addEventListener('click', handleUpload);
  if (exportBtn) exportBtn.addEventListener('click', exportQuestions);
  if (exportAllBtn) exportAllBtn.addEventListener('click', exportAllData);
  if (resetLeaderboardBtn) resetLeaderboardBtn.addEventListener('click', resetLeaderboard);

  renderLeaderboard();
  renderActivity();
  renderQuestions();
}

// === Dashboard Actions ===

async function publishExam() {
  examConfig.published = true;
  await writeJSON('exam-config.json', examConfig);
  showToast('Ujian dipublikasikan: siswa sekarang dapat memulai.');
}

async function unpublishExam() {
  examConfig.published = false;
  await writeJSON('exam-config.json', examConfig);
  showToast('Ujian dihentikan sementara.');
}

function handleUpload() {
  const input = document.getElementById('batchUploadInput');
  input.click();
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Format batch JSON salah');
      questionsWorking = data;
      await writeJSON('questions.json', questionsWorking);
      renderQuestions();
      showToast('Soal berhasil diunggah.');
    } catch (err) {
      showToast('Gagal memproses file: ' + err.message);
    }
  };
}

function exportQuestions() {
  exportJSON('questions.json', 'questions-backup-' + today() + '.json');
  showToast('Soal berhasil diekspor.');
}

function exportAllData() {
  const backup = {
    users,
    questionsWorking,
    examResults,
  };
  const fileName = 'backup-' + today() + '.json';
  exportJSON(backup, fileName);
  showToast('Data berhasil diekspor.');
}

function resetLeaderboard() {
  showModal('Konfirmasi', 'Yakin ingin menghapus leaderboard?', () => {
    localStorage.removeItem('examResults');
    examResults = [];
    renderLeaderboard();
    showToast('Leaderboard direset.');
  });
}

// === Render Section ===

function renderLeaderboard() {
  const container = document.getElementById('leaderboardTable');
  if (!container) return;
  const sorted = [...examResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  container.innerHTML = sorted
    .map(
      (r, i) =>
        `<tr data-animate="fade">
          <td>${i + 1}</td>
          <td>${r.name || '-'}</td>
          <td>${r.score}</td>
        </tr>`
    )
    .join('');
}

function renderActivity() {
  const container = document.getElementById('activityTable');
  if (!container) return;
  container.innerHTML = examResults
    .map(
      (r) =>
        `<tr data-animate="fade">
          <td>${r.userEmail}</td>
          <td>${r.examId}</td>
          <td>${r.score}</td>
        </tr>`
    )
    .join('');
}

function renderQuestions() {
  const container = document.getElementById('questionsTable');
  if (!container) return;
  container.innerHTML = questionsWorking
    .map(
      (q, i) => `
      <tr data-animate="fade">
        <td>${q.id}</td>
        <td>${q.type}</td>
        <td>${q.text.slice(0, 50)}...</td>
        <td>
          <button class="btn small" onclick="editQuestion(${i})">Edit</button>
          <button class="btn small danger" onclick="deleteQuestion(${i})">Hapus</button>
        </td>
      </tr>`
    )
    .join('');
}

async function editQuestion(index) {
  const q = questionsWorking[index];
  const newText = prompt('Edit teks soal:', q.text);
  if (newText && newText !== q.text) {
    q.text = newText;
    await writeJSON('questions.json', questionsWorking);
    renderQuestions();
    animateRowChange(document.querySelectorAll('#questionsTable tr')[index]);
  }
}

async function deleteQuestion(index) {
  showModal('Konfirmasi', 'Anda yakin ingin menghapus soal ini? Semua hasil terkait tidak akan terhapus.', async () => {
    questionsWorking.splice(index, 1);
    await writeJSON('questions.json', questionsWorking);
    renderQuestions();
    showToast('Soal dihapus.');
  });
}

// === Utility ===
function today() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
    }
