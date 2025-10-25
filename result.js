// result.js
import { getUser, getExamResult } from './storage.js';
import { showToast } from './ui.js';

export function initResultPage() {
  const user = getUser();
  const scoreDisplay = document.getElementById('scoreDisplay');
  const resultDetails = document.getElementById('resultDetails');

  if (!user) {
    showToast('Harap login terlebih dahulu.');
    window.location.href = 'login.html';
    return;
  }

  const result = getExamResult(user.username);
  if (!result) {
    scoreDisplay.textContent = 'Belum ada hasil ujian.';
    return;
  }

  const { correct, total, date } = result;
  const score = ((correct / total) * 100).toFixed(2);

  scoreDisplay.textContent = `Skor Anda: ${score}`;
  resultDetails.innerHTML = `
    <p>Jawaban Benar: ${correct}</p>
    <p>Total Soal: ${total}</p>
    <p>Tanggal Ujian: ${new Date(date).toLocaleString()}</p>
  `;

  updateLeaderboard(user.username, score);
}

function updateLeaderboard(username, score) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ username, score, date: new Date().toISOString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}
