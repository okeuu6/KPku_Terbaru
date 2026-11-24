# Hasil Pengujian Komprehensif (FR-01 s.d. FR-24 & Fitur Keren KPKu)

Lingkungan uji: PHP 8.2 (XAMPP CLI) + MySQL/MariaDB & Browser Modern (Google Chrome, Microsoft Edge).

| No | Fitur | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| 1 | FR-01 | Siswa input kode kelas tidak terdaftar | Muncul pesan galat "Kode kelas tidak ditemukan" | Sesuai | Lulus |
| 2 | FR-01/02 | Siswa input kode kelas valid (mis. `KLS4A`) | Menampilkan nama kelas dan daftar siswa yang terdaftar | Sesuai | Lulus |
| 3 | FR-03 | Siswa pilih nama & masukkan PIN salah | Muncul pesan "Sandi / PIN salah" | Sesuai | Lulus |
| 4 | FR-03 | Siswa pilih nama & masukkan PIN 4 angka benar | Berhasil masuk ke Menu Utama siswa | Sesuai | Lulus |
| 5 | FR-04 | Staf login dengan username/password salah | Pesan galat informatif | Sesuai | Lulus |
| 6 | FR-04 | Staf login dengan username/password benar | Masuk ke dashboard sesuai peran masing-masing | Sesuai | Lulus |
| 7 | FR-05 | Mode Belajar: menampilkan kartu kosa kata guru | Gambar kartun, kata Inggris, dan arti Indonesia tampil | Sesuai | Lulus |
| 8 | FR-06 | Pelafalan suara kosa kata (Web Speech API) | Suara bahasa Inggris jernih terdengar dengan pilihan kecepatan | Sesuai | Lulus |
| 9 | FR-07 | Mode Mencocokkan: 4 pilihan kata per gambar | Tampil gambar soal + 4 tombol opsi kata benda | Sesuai | Lulus |
| 10 | FR-08 | Jawaban benar pada kuis | Tombol hijau, efek suara chime gembira, skor +10 | Sesuai | Lulus |
| 11 | FR-08 | Jawaban salah pada kuis | Tombol merah bergoyang, efek suara boing, kunci ditampilkan | Sesuai | Lulus |
| 12 | FR-08 | Anti Poin Ganda | Refresh halaman / kirim ulang sesi tidak menggandakan poin | Sesuai | Lulus |
| 13 | FR-09 | Tampilan total poin & riwayat | Total poin bintang terakumulasi rapi di Menu dan Poin Saya | Sesuai | Lulus |
| 14 | FR-10 | Guru melihat Kelas Tersedia | Kartu kelas yang diampu tampil dengan jumlah siswa | Sesuai | Lulus |
| 15 | FR-11 | Guru melihat data siswa & PIN terenkripsi | Guru melihat PIN asli yang terdekripsi dari AES-256 | Sesuai | Lulus |
| 16 | FR-12 | Guru tambah soal kuis (gambar < 1 MB) | Tersimpan ke database, nama berkas acak aman | Sesuai | Lulus |
| 17 | FR-12 | Validasi gambar > 1 MB atau format ilegal | Ditolak otomatis di klien dan server | Sesuai | Lulus |
| 18 | FR-13 | Guru ubah kosa kata & arti | Perubahan tersimpan | Sesuai | Lulus |
| 19 | FR-14 | Guru hapus soal kuis | Record database dan berkas fisik gambar terhapus | Sesuai | Lulus |
| 20 | FR-15 | Kepala Sekolah melihat seluruh kelas | Tabel seluruh kelas beserta guru pengampu tampil | Sesuai | Lulus |
| 21 | FR-16 | Kepala Sekolah melihat siswa poin tertinggi | Podium juara 3 besar (🥇🥈🥉) & tabel peringkat tampil | Sesuai | Lulus |
| 22 | FR-17 | Kepala Sekolah melihat nama guru | Daftar seluruh guru dan kelas yang diampu tampil | Sesuai | Lulus |
| 23 | FR-18-22| Operator CRUD Guru, Siswa, Kepsek, Operator, Kelas | Seluruh modul CRUD berfungsi dengan validasi unik | Sesuai | Lulus |
| 24 | FR-23 | Keamanan RBAC di sisi server | Akses URL lintas peran diblokir dengan HTTP 403/Redirect | Sesuai | Lulus |
| 25 | FR-24 | Logout aman dengan proteksi CSRF | Sesi hancur dan dialihkan ke beranda | Sesuai | Lulus |
| 26 | Non-Fung | Kehandalan: Koneksi database terputus | Menampilkan halaman pesan ramah 503 tanpa PHP trace bocor | Sesuai | Lulus |
| 27 | Non-Fung | Auto Logout 30 Menit | Sesi kedaluwarsa setelah 30 menit tanpa aktivitas | Sesuai | Lulus |
| 28 | Fitur Baru| Web Audio Synthesizer (Tanpa MP3) | Suara sintetis bekerja offline tanpa latency | Sesuai | Lulus |
| 29 | Fitur Baru| Animasi Konfeti Perayaan | Partikel konfeti meluncur mulus di kanvas saat kuis tuntas | Sesuai | Lulus |
| 30 | Fitur Baru| Virtual PIN Pad Ramah Anak | Tombol angka 0-9 dapat diklik di layar sentuh HP / laptop | Sesuai | Lulus |
| 31 | Fitur Baru| Netlify Live Demo Simulator (`index.html`) | Berjalan 100% di Netlify tanpa server PHP | Sesuai | Lulus |
| 32 | Responsif | Tampilan Layar HP (360px - 768px) & Laptop (>= 900px) | Layout bertransformasi sempurna (mobile kartu, laptop sidebar)| Sesuai | Lulus |
