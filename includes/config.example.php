<?php
// SALIN file ini menjadi config.php lalu isi sesuai lingkungan Anda.
// JANGAN unggah config.php ke GitHub (sudah ada di .gitignore).

define('DB_HOST', '127.0.0.1');          // XAMPP: 127.0.0.1 | Hosting: lihat panel hosting
define('DB_NAME', 'kuis_inggris');
define('DB_USER', 'root');               // XAMPP default: root
define('DB_PASS', '');                   // XAMPP default: kosong

// Kunci enkripsi PIN siswa (AES-256-GCM). Isi teks acak panjang (min. 32 karakter).
// Jika kunci diganti, PIN siswa lama tidak dapat ditampilkan lagi ke Guru.
define('ENC_KEY', 'GANTI-DENGAN-KUNCI-ACAK-MINIMAL-32-KARAKTER');

define('NAMA_SEKOLAH', 'SD Contoh');     // nama sekolah (konfigurasi)
define('NAMA_APLIKASI', 'Media Belajar Inggris SD');
define('SOAL_PER_SESI', 10);             // jumlah soal tiap sesi Mode Mencocokkan
define('POIN_PER_BENAR', 10);            // poin tiap jawaban benar
define('AUTO_LOGOUT_MENIT', 30);         // sesi berakhir jika tidak aktif
define('MAX_GAMBAR_BYTE', 1048576);      // 1 MB
define('BASE_URL', '');                  // kosongkan = deteksi otomatis. Contoh manual: '/kuis-inggris-sd'
