# Media Belajar Inggris SD - KPKu 🎓✨

Sistem Informasi Media Pembelajaran Interaktif Bahasa Inggris Berbasis Web untuk Siswa Sekolah Dasar (Kerja Praktik / KPku).
Dibangun dengan **PHP 8 Native + MySQL / MariaDB (PDO Prepared Statement) + HTML5, CSS3 & JavaScript Modern (ES6+)**.

Sistem ini memiliki arsitektur ganda (**Dual-Mode**):
1. **Full Database Edition (XAMPP / Apache + MySQL)**: Menjalankan seluruh kebutuhan fungsional (FR-01 s.d. FR-24), autentikasi staf, enkripsi AES-256 PIN siswa, sesi aman, dan penyimpanan poin ke database.
2. **Netlify Web Live Demo Edition (`index.html`)**: Siap di-deploy langsung ke **Netlify** (drag-and-drop / GitHub) dengan *Client-Side Demo Simulator* interaktif (Web Speech API audio, Web Audio sound effects, confetti, dan penyimpanan lokal) tanpa memerlukan server PHP!

---

## 🌟 Fitur-Fitur Keren & Keunggulan
- **Tampilan Sangat Menarik & Ramah Anak**: Palet warna ceria, kartu melengkung (*soft rounded cards* 20px), ikon kartun SVG buatan sendiri, dan tata letak responsif untuk Laptop dan Smartphone.
- **Efek Suara Sintetis (Web Audio API)**: Suara instan untuk jawaban benar (chime melodi), jawaban salah (boing kartun), klik tombol, dan fanfare kemenangan. 100% native tanpa file MP3 eksternal!
- **Animasi Konfeti Perayaan**: Kembang api konfeti ceria saat siswa menyelesaikan kuis dengan nilai bagus.
- **Virtual PIN Pad Ramah Anak**: Tombol angka interaktif di layar agar siswa SD (usia 6-12 tahun) mudah memasukkan PIN 4 digit baik lewat layar sentuh HP maupun mouse laptop.
- **Papan Peringkat Podium Juara (🥇🥈🥉)**: Tampilan visual podium 3 besar untuk Kepala Sekolah dan Siswa.
- **Live Preview & Validasi Gambar Guru**: Guru dapat melihat pratinjau gambar kartun secara langsung dengan validasi ukuran (< 1 MB).
- **Cetak Laporan / Rekap Nilai**: Tombol cetak dengan stylesheet rapi (`@media print`) untuk mencetak rekap nilai kelas atau daftar guru.

---

## 🚀 Panduan Menjalankan di XAMPP (Lokal)
1. **Nyalakan XAMPP**: Buka *XAMPP Control Panel*, lalu klik **Start** pada modul **Apache** dan **MySQL**.
2. **Letakkan Folder `KPku`**: Salin folder `KPku` ke dalam direktori:
   ```text
   C:\xampp\htdocs\KPku
   ```
3. **Impor Database**:
   - Buka peramban ke: `http://localhost/phpmyadmin/`
   - Buat database baru bernama: `kuis_inggris` (Collation: `utf8mb4_general_ci`).
   - Masuk ke tab **Import**, pilih berkas `database/kuis_inggris.sql`, lalu klik **Import**.
4. **Konfigurasi `config.php`**:
   - Pastikan berkas `includes/config.php` sudah terisi dengan kredensial database Anda (default XAMPP: host `127.0.0.1`, user `root`, pass kosong).
   - Kunci enkripsi AES-256 (`ENC_KEY`) sudah di-generate secara acak.
5. **Setup Operator Pertama**:
   - Buka peramban ke: `http://localhost/KPku/setup/`
   - Buat akun Operator pertama dengan nama, username, dan kata sandi pilihan Anda.
6. **Mulai Menggunakan Aplikasi**:
   - Buka alamat: `http://localhost/KPku/`
   - Masuk sebagai Operator, lalu klik **Muat Data Contoh** di dashboard untuk membuat akun Guru contoh, Kepsek contoh, Kelas `KLS4A`, dan materi kosa kata awal!

---

## 🌐 Panduan Hosting di Netlify (Instan Tanpa Konfigurasi)
Aplikasi ini sudah dilengkapi berkas `index.html` dan `netlify.toml` sehingga dapat langsung di-hosting di Netlify:
1. Buka laman [Netlify Drop](https://app.netlify.com/drop) atau login ke dashboard Netlify Anda.
2. Cukup tarik (*drag-and-drop*) folder `KPku` ke area upload Netlify Drop.
3. Netlify akan langsung menerbitkan situs Anda dalam hitungan detik (contoh: `https://kpku-sd.netlify.app`).
4. Pengunjung dapat menikmati Landing Page profesional dan mencoba **Mode Simulasi Demo Interaktif** untuk seluruh peran (Siswa, Guru, Kepsek, Operator) secara langsung di web!

---

## 📁 Struktur Direktori `KPku`
```text
KPku/
├── index.html            (Netlify Web Live Demo Simulator)
├── index.php             (Landing Page & Pintu Masuk PHP MySQL)
├── login.php             (Pengarah Login Staf)
├── logout.php            (Logout Aman CSRF)
├── netlify.toml          (Konfigurasi Deployment Netlify)
├── .htaccess             (Konfigurasi Apache & Keamanan)
├── siswa/                (Menu Utama, Belajar, Mencocokkan, Hasil, Poin)
├── guru/                 (Dashboard, Data Siswa, Kelola Soal Form & Hapus)
├── kepsek/               (Dashboard, Data Kelas, Poin Tertinggi, Nama Guru)
├── operator/             (Dashboard, Daftar, Form, Hapus 5 Jenis Data Master)
├── api/                  (soal.php, poin.php - API Sesi Kuis Aman Server)
├── includes/             (config, koneksi, auth, csrf, fungsi, layout)
├── assets/
│   ├── css/              (app.css, landing.css)
│   ├── js/               (belajar.js, kuis.js, efek.js)
│   └── img/              (logo.svg, contoh/*.svg)
├── database/             (kuis_inggris.sql)
├── uploads/soal/         (Direktori gambar kosa kata + .htaccess)
├── setup/                (index.php, buat-operator.php, data-contoh.php)
└── docs/                 (kamus-data.md, penelusuran-fr.md, pengujian.md, dll.)
```

---

## 🔒 Keamanan & Pemenuhan Standar
- **SQL Injection**: Dilindungi 100% menggunakan PDO Prepared Statements pada setiap query.
- **XSS**: Seluruh output dinetralisir menggunakan `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.
- **CSRF**: Token rahasia diverifikasi pada setiap request POST dan panggilan API kuis.
- **Enkripsi Kredensial**: Sandi staf di-hash dengan `password_hash` (Bcrypt). PIN 4 digit siswa dienkripsi dua arah dengan AES-256-GCM sehingga hanya guru pengampu kelasnya yang dapat melihatnya.
- **Anti Poin Ganda**: Kuis menggunakan token sesi dinamis; memuat ulang halaman tidak akan menggandakan perolehan poin.
- **Validasi Unggahan Berkas**: Pemeriksaan MIME server-side pada gambar (JPG, PNG, WebP) dengan batas maksimal 1 MB dan penamaan berkas acak demi mencegah eksekusi skrip berbahaya.

---
Dikembangkan dengan dedikasi untuk **Media Pembelajaran Bahasa Inggris Sekolah Dasar (KPKu)**.
