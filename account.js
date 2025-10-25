// account.js
import { getUser, updateUser, deleteUser } from './storage.js';
import { showToast, showModal, showSpinner } from './ui.js';

export function initAccountPage() {
  const user = getUser();
  const form = document.getElementById('accountForm');
  const usernameField = document.getElementById('username');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  const deleteBtn = document.getElementById('deleteAccountBtn');
  const saveBtn = document.getElementById('saveAccountBtn');

  if (!user) {
    showToast('Harap login terlebih dahulu.');
    window.location.href = 'login.html';
    return;
  }

  // Isi data user
  usernameField.value = user.username || '';
  emailField.value = user.email || '';
  passwordField.value = user.password || '';

  // Simpan perubahan akun
  form.addEventListener('submit', e => {
    e.preventDefault();
    const updated = {
      ...user,
      username: usernameField.value.trim(),
      email: emailField.value.trim(),
      password: passwordField.value.trim(),
    };

    if (!updated.username || !updated.email.includes('.com') || !updated.password) {
      showToast('Lengkapi data dengan benar.');
      return;
    }

    showSpinner(true);
    updateUser(updated);
    showSpinner(false);
    showToast('Akun berhasil diperbarui.');
  });

  // Hapus akun
  deleteBtn.addEventListener('click', () => {
    showModal({
      title: 'Konfirmasi Hapus Akun',
      message: 'Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak bisa dibatalkan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        deleteUser(user.username);
        showToast('Akun dihapus.');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'register.html';
      },
    });
  });

  // Logout
  saveBtn.addEventListener('click', () => {
    showToast('Perubahan disimpan.');
  });
}

document.addEventListener('DOMContentLoaded', initAccountPage);
