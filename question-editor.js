// question-editor.js
// Editor soal: upload batch, tambah/edit satuan, validasi format, simpan ke questions.json

import { readJSON, writeJSON } from './storage.js';
import { showToast, showModal } from './ui.js';

let questionsWorking = [];

document.addEventListener('DOMContentLoaded', async () => {
  const table = document.getElementById('questionsTable');
  if (!table) return;

  questionsWorking = await readJSON('questions.json');
  renderQuestions();

  const addBtn = document.getElementById('addQuestionBtn');
  const batchBtn = document.getElementById('batchUploadBtn');
  const saveBtn = document.getElementById('saveQuestionsBtn');

  if (addBtn) addBtn.addEventListener('click', addQuestionForm);
  if (batchBtn) batchBtn.addEventListener('click', handleBatchUpload);
  if (saveBtn) saveBtn.addEventListener('click', saveQuestions);
});

// === RENDER ===
function renderQuestions() {
  const table = document.getElementById('questionsTable');
  if (!table) return;
  table.innerHTML = questionsWorking
    .map(
      (q, i) => `
    <tr data-animate="fade">
      <td>${q.id}</td>
      <td>${q.type}</td>
      <td>${q.text.slice(0, 60)}...</td>
      <td>
        <button class="btn small" onclick="editQuestion(${i})">Edit</button>
        <button class="btn small danger" onclick="deleteQuestion(${i})">Hapus</button>
      </td>
    </tr>`
    )
    .join('');
}

// === TAMBAH SOAL ===
function addQuestionForm() {
  const id = prompt('Masukkan ID soal:');
  if (!id) return;
  const type = prompt('Tipe soal (single/multiple/essay):');
  if (!['single', 'multiple', 'essay'].includes(type)) {
    showToast('Tipe soal tidak valid.');
    return;
  }
  const text = prompt('Teks pertanyaan:');
  const question = { id, type, text, choices: [], correct: [], explanation: { correct: '', incorrect: '' } };

  if (type !== 'essay') {
    const choiceCount = parseInt(prompt('Berapa pilihan jawaban?'), 10);
    for (let i = 0; i < choiceCount; i++) {
      const c = prompt(`Pilihan ${i + 1}:`);
      question.choices.push(c);
    }
    const correctIndex = prompt('Indeks jawaban benar (pisahkan koma untuk multiple):');
    question.correct = correctIndex.split(',').map((x) => parseInt(x.trim(), 10));
  }

  question.explanation.correct = prompt('Penjelasan jika benar:') || '';
  question.explanation.incorrect = prompt('Penjelasan jika salah:') || '';

  const mediaUrl = prompt('URL media (kosongkan jika tidak ada):');
  if (mediaUrl) question.media = mediaUrl;

  questionsWorking.push(question);
  renderQuestions();
  showToast('Soal baru ditambahkan.');
}

// === EDIT SOAL ===
window.editQuestion = async function (index) {
  const q = questionsWorking[index];
  const newText = prompt('Edit teks pertanyaan:', q.text);
  if (newText && newText !== q.text) {
    q.text = newText;
    await writeJSON('questions.json', questionsWorking);
    renderQuestions();
    showToast('Teks soal diperbarui.');
  }
};

// === HAPUS SOAL ===
window.deleteQuestion = async function (index) {
  showModal(
    'Konfirmasi',
    'Anda yakin ingin menghapus soal ini? Semua hasil terkait tidak akan terhapus.',
    async () => {
      questionsWorking.splice(index, 1);
      await writeJSON('questions.json', questionsWorking);
      renderQuestions();
      showToast('Soal dihapus.');
    }
  );
};

// === BATCH UPLOAD ===
function handleBatchUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.click();

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const batch = JSON.parse(text);
      if (!Array.isArray(batch)) throw new Error('File tidak berisi array soal');

      const valid = batch.every(validateQuestionFormat);
      if (!valid) throw new Error('Struktur salah pada salah satu soal');

      questionsWorking = batch;
      await writeJSON('questions.json', questionsWorking);
      renderQuestions();
      showToast('Batch soal berhasil diunggah.');
    } catch (err) {
      showToast('Gagal memproses file: ' + err.message);
    }
  };
}

// === VALIDASI ===
function validateQuestionFormat(q) {
  return (
    q.id &&
    q.type &&
    typeof q.text === 'string' &&
    q.explanation &&
    typeof q.explanation.correct === 'string' &&
    typeof q.explanation.incorrect === 'string'
  );
}

// === SIMPAN ===
async function saveQuestions() {
  await writeJSON('questions.json', questionsWorking);
  showToast('Semua soal disimpan ke database.');
}
