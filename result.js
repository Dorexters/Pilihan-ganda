// result.js
import { getUser, getExamResult } from './storage.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  const resultContainer = document.getElementById('result-container');
  const scoreText = document.getElementById('score');
  const summaryText = document.getElementById('summary');
  const retryBtn = document.getElementById('retry-btn');
  const backBtn = document.getElementById('back-btn');

  if (!user) {
    showToast('Harap login terlebih dahulu.');
    window.location.href = 'login.html';
    return;
  }

  const result = getExamResult(user.username);
  if (!result) {
    resultContainer.innerHTML = '<p>Belum ada hasil ujian.</p>';
    return;
  }

  // Hitung nilai dan tampilkan
  const { correct, total, date } = result;
  const score = ((correct / total) * 100).toFixed(2);

  scoreText.textContent = `${score}`;
  summaryText.innerHTML = `
    <p>Benar: ${correct}</p>
    <p>Total Soal: ${total}</p>
    <p>Tanggal: ${new Date(date).toLocaleString()}</p>
  `;

  // Simpan ke leaderboard
  updateLeaderboard(user.username, score);

  retryBtn.addEventListener('click', () => {
    window.location.href = 'exam.html';
  });

  backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});

function updateLeaderboard(username, score) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ username, score, date: new Date().toISOString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}
