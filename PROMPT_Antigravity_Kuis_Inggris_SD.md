# PROMPT ANTIGRAVITY: Website Media Belajar Inggris SD (Aplikasi + Landing Page)

## 0. Cara Anda Bekerja (Antigravity)

Anda adalah software engineer senior (PHP, MySQL, HTML/CSS/JS, keamanan web, dan UX untuk anak) yang bekerja di workspace saya. Bangun **satu proyek lengkap**: aplikasi web pembelajaran **dan** landing page-nya, mengikuti dokumen ini secara persis.

Aturan kerja:

1. **Workspace:** kerjakan di folder `kuis-inggris-sd/` (buat jika belum ada). Saya meletakkan lampiran di `kuis-inggris-sd/lampiran/`: SRS final (`.docx`), ERD (`.drawio`), wireframe mobile (`.drawio`), wireframe Windows (`.drawio`). Baca semuanya. Jika ada yang tidak terbaca, pakai ringkasan di dokumen ini (Bagian 4 sampai 7) dan catat di "Temuan dan Asumsi".
2. **Mulai dengan rencana:** tulis dulu Implementation Plan (artifact) berisi rencana kerja, daftar "Temuan dan Asumsi", dan risiko. Setelah itu **langsung kerjakan tanpa menunggu persetujuan**, kecuali ada keputusan yang akan mengubah isi SRS, ERD, atau wireframe; untuk hal itu berhenti dan tanyakan.
3. **Uji sungguhan:** jalankan aplikasi (XAMPP atau server PHP bawaan + MySQL/MariaDB di komputer ini), lalu uji lewat terminal dan browser agent. Simpan bukti uji (tabel hasil dan tangkapan layar) di `docs/pengujian/`. **Jangan mengklaim sesuatu sudah diuji atau berhasil tanpa bukti.** Jika sesuatu tidak dapat diuji di lingkungan ini, tulis "Belum diuji" beserta alasannya.
4. **Aman:** hanya ubah file di dalam folder proyek. Jangan menjalankan perintah yang menghapus data di luar folder proyek, jangan mengirim data ke layanan eksternal, dan jangan memasang paket global yang tidak diperlukan.
5. **Jujur dan lengkap:** setiap file harus berisi dan berfungsi. Tidak boleh ada tombol, menu, atau halaman yang hanya tampilan tanpa fungsi.
6. **Bahasa:** seluruh tampilan aplikasi, landing page, komentar penting, dan dokumentasi dalam **bahasa Indonesia**.

## 1. Ringkasan Proyek

| Item | Isi |
|---|---|
| Nama sistem | Sistem Informasi Media Pembelajaran Interaktif Bahasa Inggris Berbasis Web untuk Siswa Sekolah Dasar. Nama tampilan: **Media Belajar Inggris SD** |
| Masalah | Pembelajaran kosa kata bahasa Inggris di SD masih konvensional (buku, papan tulis, kartu gambar fisik), sehingga interaksi, pelafalan, dan penilaian latihan terbatas; rekap nilai dan poin dilakukan manual oleh guru |
| Tujuan | Media belajar kosa kata benda yang menarik (gambar, suara, permainan berpoin) serta memudahkan guru dan kepala sekolah memantau perkembangan siswa |
| Pengguna | Siswa (kelas 1 sampai 6, usia 6 sampai 12 tahun), Guru, Kepala Sekolah, Operator |
| Fitur utama | Mode Belajar, Mode Mencocokkan (poin), login siswa lewat kode kelas, pemantauan kelas dan poin, pengelolaan soal oleh Guru, pengelolaan data oleh Operator |
| Instansi | Satu sekolah dasar. Nama sekolah adalah konfigurasi yang mudah diganti |
| Visual | Ceria, bersih, ramah anak: tombol besar, ikon, gambar kartun, teks singkat. Palet warna sebagai variabel CSS |
| AI | **Tidak ada fitur AI** di SRS. Jangan menambahkannya. Pelafalan memakai Web Speech API milik browser |
| Deployment | XAMPP (lokal) lalu hosting PHP + MySQL gratis agar guru bisa mencoba lewat tautan |

## 2. Aturan Prioritas dan Larangan

- **SRS lebih utama daripada ERD, ERD lebih utama daripada wireframe.** Jangan mengubah fitur, peran, nama tabel, nama kolom, atau alur yang sudah ada di lampiran.
- Jika menemukan ketidaksesuaian, **jangan memilih diam-diam**: catat di "Temuan dan Asumsi" lalu pilih opsi yang paling dekat dengan SRS.
- Jangan membuat ulang atau mengubah diagram di SRS (flowchart, use case, class, sequence, activity).
- **Dilarang:** Laravel atau framework PHP lain, React, Vue, Angular, Node.js sebagai backend, Supabase, Netlify (tidak mendukung PHP), serta CDN, font, atau skrip pihak ketiga. Semua aset dimuat lokal.
- Jangan menambah fitur di luar SRS (termasuk registrasi mandiri, chat, AI, integrasi Dapodik, mode offline, aplikasi native).
- Jika saya nanti hanya meminta perbaikan atau tambahan, **jangan membuat aplikasi baru dari awal**: pertahankan fitur yang ada, periksa dampaknya pada navigasi, database, autentikasi, dan modul lain, dan buat skrip SQL perubahan yang aman bila database berubah.

## 3. Teknologi Wajib

| Komponen | Teknologi |
|---|---|
| Backend | PHP 8 native terstruktur (pisahkan konfigurasi, koneksi database, autentikasi, fungsi, halaman) |
| Frontend | HTML5, CSS3, JavaScript ES6+ murni |
| Database | MySQL / MariaDB lewat PDO dan prepared statement, InnoDB, utf8mb4 |
| Server | Apache lewat XAMPP (Windows); VS Code; Git dan GitHub |
| Hosting publikasi | Hosting PHP + MySQL gratis (contoh: InfinityFree) yang mendukung PHP 8, MySQL, dan unggah via File Manager atau FTP |
| Suara | Web Speech API (SpeechSynthesis), bahasa Inggris, tanpa biaya |
| Gambar | Aset bawaan SVG/WebP ringan; unggahan guru JPG/PNG/WebP maks. 1 MB |
| Perangkat | Chrome, Firefox, Edge terbaru di Android dan Windows (iOS dan macOS di luar cakupan) |

## 4. Peran, Hak Akses, dan Kebutuhan Fungsional (SRS)

### 4.1 Peran

| Peran | Cara login | Hak akses |
|---|---|---|
| Siswa | Kode Kelas, pilih nama dari daftar kelas, lalu Sandi/PIN 4 digit | Mode Belajar, Mode Mencocokkan, melihat poin sendiri |
| Guru | Username + sandi | Kelas Tersedia (kelas yang diampu), data siswa + poin + sandi/PIN siswa di kelasnya, tambah/ubah/hapus soal miliknya |
| Kepala Sekolah | Username + sandi | **Hanya melihat**: data seluruh kelas, siswa poin tertinggi, nama guru |
| Operator | Username + sandi | CRUD data Guru, Siswa, Kepala Sekolah, Operator, dan Kelas |

Tidak ada registrasi mandiri. Semua akun dibuat oleh Operator.

### 4.2 Kebutuhan fungsional FR-01 s.d. FR-24

| ID | Kebutuhan | Aktor |
|---|---|---|
| FR-01 | Validasi kode kelas; pesan kesalahan jika tidak ditemukan | Siswa |
| FR-02 | Tampilkan daftar nama siswa pada kelas dengan kode valid | Siswa |
| FR-03 | Verifikasi nama + sandi/PIN, lalu menu utama atau pesan login gagal | Siswa |
| FR-04 | Login username + sandi; menu sesuai peran | Guru / Kepsek / Operator |
| FR-05 | Kartu kosa kata Mode Belajar: gambar, kata Inggris, arti Indonesia | Siswa |
| FR-06 | Putar pelafalan kata lewat Web Speech API saat tombol ditekan | Siswa |
| FR-07 | Tampilkan soal bergambar + pilihan kata Inggris pada Mode Mencocokkan dan periksa jawaban | Siswa |
| FR-08 | Poin untuk jawaban benar; jawaban salah menampilkan jawaban benar tanpa poin; simpan dan tampilkan total poin setelah soal selesai | Siswa |
| FR-09 | Tampilkan total poin siswa yang sedang login | Siswa |
| FR-10 | Tampilkan Kelas Tersedia (kelas yang diampu Guru yang login) | Guru |
| FR-11 | Tampilkan data siswa, poin, dan sandi siswa pada kelas terpilih | Guru |
| FR-12 | Tambah soal kuis (kata Inggris, arti, gambar) dengan validasi data, format, dan ukuran gambar maks. 1 MB | Guru |
| FR-13 | Ubah soal kuis milik Guru dengan validasi yang sama | Guru |
| FR-14 | Hapus soal beserta gambarnya setelah konfirmasi | Guru |
| FR-15 | Tampilkan data seluruh kelas; pesan jika kosong | Kepala Sekolah |
| FR-16 | Tampilkan siswa dengan poin tertinggi | Kepala Sekolah |
| FR-17 | Tampilkan nama guru | Kepala Sekolah |
| FR-18 | Tambah, ubah, hapus, tampil data Guru | Operator |
| FR-19 | Tambah, ubah, hapus, tampil data Siswa | Operator |
| FR-20 | Tambah, ubah, hapus, tampil data Kepala Sekolah | Operator |
| FR-21 | Tambah, ubah, hapus, tampil data Operator | Operator |
| FR-22 | Tambah, ubah, hapus, tampil data Kelas | Operator |
| FR-23 | Batasi akses fitur berdasarkan peran (RBAC) | Semua |
| FR-24 | Logout yang mengakhiri sesi | Semua |

### 4.3 Non-fungsional kunci

- **Keamanan:** sandi staf disimpan sebagai hash (`password_hash`); sandi/PIN siswa hanya terlihat oleh Guru pengampu kelasnya; validasi input; gambar hanya format diizinkan dan maks. 1 MB; auto logout; akses hanya untuk akun yang didaftarkan Operator.
- **Performa:** halaman login dan menu maks. 3 detik pada 2 Mbps; kartu dan soal bergambar maks. 3 detik; simpan poin dan soal kurang dari 5 detik; pelafalan mulai maks. 2 detik; minimal 30 pengguna bersamaan (satu kelas).
- **Kehandalan:** poin tidak boleh ganda saat halaman dimuat ulang; pesan jelas jika koneksi server atau database gagal (bukan halaman kosong); panduan backup lewat ekspor phpMyAdmin.
- **Kemudahan:** untuk anak 6 sampai 12 tahun (gambar, tombol besar, teks singkat); mobile-first; siswa login dengan memilih nama dan PIN 4 digit tanpa mengetik username; pesan kesalahan informatif.

### 4.4 Batasan sistem

Hanya kosa kata benda; tidak ada integrasi Dapodik, rapor, atau pembayaran; tidak ada mode offline; tidak ada aplikasi native; hanya Android dan Windows; satu sekolah; poin hanya dari Mode Mencocokkan (Mode Belajar tidak memberi poin).

## 5. Database (Sesuai ERD, Nama Tabel dan Kolom Harus Persis)

| Tabel | Kolom (tipe; keterangan) |
|---|---|
| operator | id_operator (INT AI, PK); nama (VARCHAR 100); username (VARCHAR 50, UNIQUE); password (VARCHAR 255, hash); dibuat_oleh (INT, FK ke operator, NULL untuk Operator pertama) |
| guru | id_guru (INT AI, PK); nama; username (UNIQUE); password (hash); dibuat_oleh (FK operator) |
| kepala_sekolah | id_kepsek (INT AI, PK); nama; username (UNIQUE); password (hash); dibuat_oleh (FK operator) |
| siswa | nisn (VARCHAR 10, PK, bukan AI); nama; sandi_hash (VARCHAR 255); sandi_terenkripsi (VARCHAR 255); id_kelas (FK kelas); dibuat_oleh (FK operator) |
| soal | id_soal (INT AI, PK); kata_inggris (VARCHAR 100); arti_indonesia (VARCHAR 100); gambar (VARCHAR 255, path berkas); id_guru (FK guru); dibuat_pada, diubah_pada (DATETIME otomatis) |
| kelas | id_kelas (INT AI, PK); nama_kelas (VARCHAR 50, mis. Kelas 4A); kode_kelas (VARCHAR 10, UNIQUE, mis. KLS4A); id_guru (FK guru, pengampu); id_kepsek (FK kepala_sekolah); dibuat_oleh (FK operator) |
| poin | id_poin (INT AI, PK); nisn (FK siswa); nilai (INT, poin satu sesi); tanggal (DATETIME, waktu sesi) |

Relasi: operator 1:0..* guru, kepala_sekolah, siswa, kelas, dan operator (diri sendiri); kepala_sekolah 1:0..* kelas (memantau); guru 1:1..* kelas (mengampu); guru 1:0..* soal; kelas 1:0..* siswa; siswa 1:0..* poin.

Aturan database:

- `sandi_hash` untuk verifikasi login siswa; `sandi_terenkripsi` (enkripsi dua arah, mis. AES-256-GCM lewat `openssl_encrypt`) agar Guru pengampu dapat melihat sandi siswa (FR-11). Kunci enkripsi disimpan di `config.php` lokal, **bukan** di source code yang diunggah ke GitHub.
- Tabel `soal` dipakai sebagai kartu Mode Belajar dan soal Mode Mencocokkan.
- Buat `database/kuis_inggris.sql` lengkap: CREATE TABLE, PK, FK, UNIQUE, indeks (nisn, id_kelas, kode_kelas, id_guru), InnoDB, utf8mb4. Buat juga **kamus data**.
- Aturan hapus (tulis di Temuan dan Asumsi): Guru yang masih mengampu kelas atau punya soal tidak dapat dihapus (pesan jelas); Kelas yang masih berisi siswa tidak dapat dihapus; poin ikut terhapus jika siswa dihapus (ON DELETE CASCADE); menghapus soal juga menghapus berkas gambarnya; Operator tidak dapat menghapus dirinya sendiri atau Operator terakhir.
- Username harus unik di antara Operator, Guru, dan Kepala Sekolah (satu formulir login untuk ketiganya); validasi di aplikasi.

## 6. Antarmuka (Sesuai Wireframe)

Bangun **satu kode responsif mobile-first**: tampil seperti wireframe mobile di layar kecil dan seperti wireframe Windows di layar lebar (breakpoint sekitar 900 px). Jangan membuat dua aplikasi.

Layout:

- **Mobile:** header "Halo, [nama]" + tombol Keluar; navigasi lewat kartu atau daftar; tombol kembali (←) di halaman dalam.
- **Windows, staf:** header nama aplikasi, nama dan peran pengguna, tombol Keluar; sidebar kiri berisi menu sesuai peran dengan menu aktif disorot. Di layar kecil sidebar menjadi menu horizontal.
- **Windows, siswa:** tanpa sidebar, konten di tengah (lebar maks. sekitar 520 px), gambar dan tombol besar.
- Pesan galat tampil pada formulir (mis. "Kode kelas tidak ditemukan", "Sandi / PIN salah", "Username atau sandi salah").

Daftar halaman:

| Aktor | Halaman dan isi | FR |
|---|---|---|
| Umum | **Halaman Awal / Landing Page** (lihat Bagian 7) | 01, 04 |
| Siswa | **Masuk Kelas:** isian Kode Kelas (contoh KLS4A), tombol Masuk Kelas, pesan galat | 01 |
| Siswa | **Pilih Nama dan PIN:** judul kelas, daftar nama untuk dipilih, PIN 4 digit (tampil bintang), tombol Masuk | 02, 03 |
| Staf | **Login Staf:** Username, Sandi, tombol Masuk; menu menyesuaikan peran | 04 |
| Siswa | **Menu Utama:** "Halo, [nama]!", kartu Total Poin Kamu, tombol Mode Belajar, Mode Mencocokkan, Poin Saya, Keluar | 09, 24 |
| Siswa | **Mode Belajar:** penghitung kartu (3 / 10), gambar, kata Inggris (APPLE), arti (Apel), tombol Dengarkan Pelafalan, Sebelumnya, Berikutnya | 05, 06 |
| Siswa | **Mode Mencocokkan:** Soal n / 10, poin berjalan, gambar soal, "Pilih kata yang sesuai dengan gambar", empat pilihan kata (satu kolom di HP, 2×2 di layar lebar) | 07, 08 |
| Siswa | **Hasil:** "Selesai!", jawaban benar x dari 10, poin didapat, total poin, Main Lagi, Kembali ke Menu | 08 |
| Siswa | **Poin Saya:** total poin dan riwayat (tanggal dan nilai, mis. 28 Okt 2026 +80) | 09 |
| Guru | **Dashboard / Kelas Tersedia:** kartu tiap kelas (nama, jumlah siswa, kode kelas, Lihat Data Siswa) dan menu Kelola Soal Kuis | 10 |
| Guru | **Data Siswa per Kelas:** kode kelas; tabel Nama, NISN, Poin, Sandi / PIN | 11 |
| Guru | **Daftar Soal Kuis:** + Tambah Soal; tabel Gambar, Kata Inggris, Arti, aksi Ubah dan Hapus | 12-14 |
| Guru | **Form Tambah / Ubah Soal:** Kata Inggris, Arti Indonesia, Gambar (pilih berkas), catatan "Maksimal 1 MB", pratinjau gambar, Simpan, Batal | 12, 13 |
| Guru | **Konfirmasi Hapus Soal:** "Soal 'Apple - Apel' beserta gambarnya akan dihapus", Batal, Hapus | 14 |
| Kepsek | **Dashboard:** "Pemantauan (hanya lihat)", tiga kartu: Data Kelas (jumlah kelas), Siswa Poin Tertinggi, Nama Guru (jumlah guru), masing-masing tombol Buka | 15-17 |
| Kepsek | **Data Kelas:** tabel Kelas, Guru Pengampu, Jumlah Siswa, Kode Kelas; pesan jika kosong | 15 |
| Kepsek | **Siswa Poin Tertinggi:** tabel Peringkat, Nama Siswa, Kelas, Total Poin | 16 |
| Kepsek | **Nama Guru:** tabel No, Nama Guru, Kelas yang Diampu | 17 |
| Operator | **Dashboard:** "Kelola Data", lima kartu dengan jumlah data (Guru, Siswa, Kepala Sekolah, Operator, Kelas), tombol Kelola | 18-22 |
| Operator | **Daftar Data** (berlaku sama untuk 5 jenis): pencarian, + Tambah, tabel, aksi Ubah dan Hapus, paginasi | 18-22 |
| Operator | **Form Tambah / Ubah Data:** Siswa: NISN, Nama, Kelas (pilihan), Sandi/PIN. Guru, Kepala Sekolah, Operator: Nama, Username, Sandi. Kelas: Nama Kelas, Kode Kelas, Guru Pengampu, Kepala Sekolah | 18-22 |
| Operator | **Konfirmasi Hapus Data:** "Data siswa '[nama]' akan dihapus dari Sistem", Batal, Hapus | 18-22 |

Catatan: wireframe form Operator hanya mencontohkan Siswa; field jenis lain diturunkan dari ERD (catat di Temuan dan Asumsi).

## 7. LANDING PAGE (Wajib Dibuat Bersama Aplikasi)

Buat **landing page profesional** sebagai halaman awal (`index.php`). Landing page ini menggantikan "Halaman Awal" di wireframe, namun **elemen wireframe tetap ada**: logo, judul "Belajar Bahasa Inggris", tombol **Saya Siswa** dan tombol **Guru / Kepala Sekolah / Operator** (di layar lebar boleh berlabel "Masuk Staf").

**Tujuan:** menjelaskan aplikasi kepada guru, kepala sekolah, dan orang tua, sekaligus menjadi pintu masuk ke aplikasi.

**Isi (bahasa Indonesia, jujur, tanpa klaim palsu):**

1. **Header lengket:** logo + nama aplikasi, tautan anchor (Fitur, Cara Kerja, Untuk Siapa, FAQ), tombol "Masuk".
2. **Hero:** judul "Belajar Bahasa Inggris", subjudul singkat (kosa kata benda lewat gambar, suara, dan permainan berpoin), dua tombol masuk sesuai wireframe, dan ilustrasi kartun SVG buatan sendiri (apel, buku, bola, dan sejenisnya). Jika pengunjung sudah login, tombol berubah menjadi "Lanjut ke Dashboard" (jangan dialihkan paksa).
3. **Fitur** (empat kartu dengan ikon SVG): Mode Belajar (gambar, kata, arti, pelafalan), Mode Mencocokkan (tebak kata dari gambar, poin), Poin Saya (riwayat poin), Pemantauan untuk Guru dan Kepala Sekolah.
4. **Cara Kerja** (3 sampai 4 langkah): Operator membuat akun dan kelas; Guru menambahkan soal bergambar; Siswa belajar dan bermain lewat kode kelas; Guru dan Kepala Sekolah memantau poin.
5. **Untuk Siapa:** empat kartu peran (Siswa, Guru, Kepala Sekolah, Operator) berisi ringkasan hak aksesnya sesuai SRS.
6. **Pratinjau tampilan:** mockup HP dan laptop yang dibangun dengan HTML/CSS dari data contoh yang diberi label "Contoh tampilan". Jangan memakai tangkapan layar palsu atau gambar stok.
7. **FAQ** (elemen `<details>`): Perlu memasang aplikasi? (tidak, cukup browser Chrome/Edge di Android atau Windows); Bisa daftar sendiri? (tidak, akun dibuat Operator); Bagaimana keamanan data? (sandi staf di-hash, akses sesuai peran); Bisa di iPhone? (belum, di luar cakupan versi ini); Suara tidak keluar? (periksa volume, gunakan Chrome).
8. **CTA penutup** dan **footer:** nama sekolah (dari konfigurasi), nama aplikasi, tahun otomatis, kontak sekolah opsional (disembunyikan jika kosong di konfigurasi).

**Ketentuan teknis dan desain:**

- Server-rendered PHP, CSS terpisah (`assets/css/landing.css`), JavaScript minimal (menu mobile, smooth scroll). **Tanpa** framework, CDN, font eksternal, analytics, atau pelacak pihak ketiga. Font sistem.
- Gaya ceria, bersih, ramah anak namun tetap profesional; palet dari variabel CSS yang sama dengan aplikasi; konsisten dengan wireframe.
- Responsif dari 360 px sampai 1440 px; semantic HTML; alt text; kontras warna memenuhi WCAG AA; fokus keyboard terlihat; hormati `prefers-reduced-motion`.
- Ringan: gambar SVG/WebP, total transfer halaman di bawah 500 KB; `lang="id"`; meta title, description, dan Open Graph; favicon.
- **Dilarang di landing page:** formulir registrasi, formulir kontak atau newsletter, statistik atau testimoni karangan, fitur AI, klaim yang tidak ada di SRS.
- **Kriteria selesai:** tampil benar di 360 px, 768 px, dan 1366 px; semua tombol dan tautan berfungsi; tidak ada galat di konsol browser; simpan tangkapan layar tiga ukuran tersebut di `docs/pengujian/`. Jika Lighthouse dapat dijalankan, targetkan Performance dan Accessibility minimal 90 dan catat hasilnya.

## 8. Aturan Bisnis dan Asumsi (Semua Dapat Diubah di `config.php`)

- **Sumber soal siswa:** soal milik Guru pengampu kelas siswa (kelas.id_guru = soal.id_guru), untuk Mode Belajar maupun Mencocokkan.
- **Satu sesi permainan:** 10 soal acak dari soal guru itu (jika kurang dari 10, pakai semua). Tiap soal punya 4 pilihan: 1 benar + 3 pengecoh dari kata_inggris soal lain. Jika soal kurang dari 4, tampilkan pesan.
- **Poin:** 10 poin per jawaban benar, 0 jika salah (8 benar dari 10 = 80). Jawaban salah menampilkan jawaban benar. Satu sesi = satu baris tabel poin; total poin = jumlah nilai.
- **Penilaian di server:** kunci jawaban **tidak** dikirim ke browser. Server memilih soal, memeriksa jawaban, dan menyimpan poin.
- **Anti poin ganda:** poin disimpan sekali per sesi (token sesi permainan); memuat ulang atau mengirim ulang permintaan tidak menggandakan poin.
- **PIN siswa:** 4 digit angka; diverifikasi dengan sandi_hash dan ditampilkan ke Guru dari sandi_terenkripsi hanya untuk kelas yang diampunya.
- **Auto logout:** 30 menit tanpa aktivitas.
- **Kepala Sekolah:** hanya membaca; server menolak semua permintaan tambah, ubah, hapus dari peran ini.
- **Gambar soal:** hanya JPG, PNG, atau WebP, maks. 1 MB, nama berkas diganti acak, divalidasi MIME di server (bukan hanya ekstensi). SVG unggahan tidak diizinkan (risiko XSS); aset SVG bawaan boleh.

## 9. Keamanan

- Setiap halaman terlindungi memeriksa sesi dan peran **di sisi server**; mengubah URL tidak boleh melewati hak akses (FR-23).
- `password_hash` dan `password_verify` untuk staf; tidak ada kata sandi teks biasa, tidak ada kredensial di log, dan **tidak ada akun default dengan sandi umum**. Operator pertama dibuat lewat halaman setup dengan sandi pilihan sendiri; setup otomatis menolak jika Operator sudah ada.
- Lindungi dari SQL Injection (PDO prepared statement), XSS (`htmlspecialchars` pada semua output), dan CSRF (token di semua formulir POST dan permintaan API). Regenerasi session ID saat login; cookie sesi HttpOnly dan SameSite.
- Guru hanya dapat melihat kelas, siswa, dan soal miliknya; Siswa hanya dapat melihat poinnya sendiri.
- Batasi percobaan login beruntun (kode kelas, PIN, login staf).
- Folder unggahan tidak boleh menjalankan PHP (`.htaccess`). Folder `includes/`, `database/`, `docs/` tidak boleh dapat diakses langsung lewat URL.
- `config.php` (kredensial database dan kunci enkripsi) **tidak** masuk ZIP atau GitHub; sediakan `config.example.php` dan `.gitignore`.
- Pesan jelas jika koneksi database gagal.

## 10. Struktur File

```
kuis-inggris-sd/
├── index.php            (Landing Page + Halaman Awal)
├── login.php            (Login Guru / Kepala Sekolah / Operator)
├── logout.php           (POST + CSRF)
├── siswa/    masuk-kelas, pilih-nama, menu, belajar, mencocokkan, hasil, poin
├── guru/     dashboard, data-siswa, soal, soal-form, soal-hapus
├── kepsek/   dashboard, data-kelas, poin-tertinggi, nama-guru
├── operator/ dashboard, daftar, form, hapus (5 jenis data)
├── api/      mulai-sesi, jawab, selesai (JSON)
├── includes/ config.example.php, koneksi, auth, csrf, fungsi, layout (header, sidebar, footer)
├── assets/   css/ (style.css, landing.css), js/, img/ (logo, ilustrasi, gambar contoh)
├── uploads/soal/        (+ .htaccess)
├── database/ kuis_inggris.sql
├── setup/    buat-operator.php, data-contoh.php
├── lampiran/ (SRS, ERD, wireframe: dari saya)
├── docs/     analisis-ringkas, erd, kamus-data, wireframe, panduan-*, pengujian/
├── .gitignore
└── README.md
```

Data contoh (kosa kata benda, mis. benda di kelas dan di rumah, dengan gambar SVG kartun buatan sendiri, berlabel jelas sebagai data contoh) dibuat lewat `setup/data-contoh.php` yang hanya dapat dijalankan Operator dan menampilkan sandi acak **sekali saja**. Jangan menyimpan akun contoh bersandi tetap di file SQL.

## 11. Urutan Kerja Wajib

1. Baca lampiran, verifikasi konsistensi SRS, ERD, wireframe; tulis Temuan dan Asumsi serta Implementation Plan.
2. Database: `kuis_inggris.sql`, kamus data.
3. Struktur proyek, konfigurasi, tema CSS (variabel warna).
4. Autentikasi dan RBAC: login siswa (kode kelas, nama, PIN), login staf, sesi, auto logout, logout, pembatasan peran.
5. Modul Operator (FR-18 s.d. FR-22).
6. Modul Guru (FR-10 s.d. FR-14).
7. Modul Siswa (FR-01 s.d. FR-09), termasuk Web Speech API dan permainan.
8. Modul Kepala Sekolah (FR-15 s.d. FR-17).
9. **Landing page** (Bagian 7) dan penyempurnaan tampilan responsif sesuai wireframe mobile dan Windows.
10. Pengujian dan perbaikan.
11. Dokumentasi dan panduan.
12. Kemas ZIP.

Semua fitur harus terintegrasi: data Operator tampil di modul Guru dan Kepala Sekolah, soal Guru muncul di permainan Siswa, poin Siswa muncul di data Guru dan peringkat Kepala Sekolah.

## 12. Pengujian

Buat tabel pengujian: Nomor, Fitur, Skenario, Hasil yang Diharapkan, Hasil Aktual, Status (Lulus / Gagal / Belum diuji). Minimal:

- FR-01 s.d. FR-24 (satu skenario normal dan satu skenario gagal untuk fitur yang punya validasi).
- **Hak akses:** Siswa tidak dapat membuka halaman Guru, Kepala Sekolah, Operator lewat URL; Guru tidak dapat melihat kelas atau soal Guru lain; Kepala Sekolah tidak dapat menambah, mengubah, menghapus; pengguna tanpa login dialihkan ke login.
- **Validasi:** kode kelas salah, PIN salah, username atau sandi salah, gambar lebih dari 1 MB, format gambar tidak diizinkan, NISN atau username ganda.
- Poin tidak bertambah dua kali saat halaman dimuat ulang.
- Tampilan di lebar layar telepon dan Windows; landing page di 360, 768, 1366 px; Chrome, Firefox, Edge bila memungkinkan.
- Pesan yang sesuai saat database tidak dapat dihubungi.

Perbaiki setiap error lalu ulangi pengujiannya. Sertakan daftar masalah yang ditemukan dan diperbaiki serta daftar keterbatasan. **Jangan mengklaim bebas error jika belum diuji.**

## 13. Deployment

Netlify tidak dipakai (tidak mendukung PHP dan MySQL). Tulis panduan langkah demi langkah untuk pemula.

**XAMPP:** pasang XAMPP dan jalankan Apache + MySQL; salin proyek ke `htdocs`; buat database dan impor `kuis_inggris.sql` lewat phpMyAdmin; salin `config.example.php` menjadi `config.php` dan isi data database serta kunci enkripsi (cara membuat kunci: `php -r "echo bin2hex(random_bytes(32));"`); jalankan `setup/buat-operator.php`; buka `http://localhost/kuis-inggris-sd/`.

**Hosting PHP + MySQL gratis:** buat akun dan situs, catat host, nama database, user, dan sandi dari panel; impor SQL lewat phpMyAdmin hosting; unggah semua file (tanpa config lokal) ke `htdocs` atau `public_html`; buat `config.php` di server; pastikan `uploads/soal` dapat ditulis dan `.htaccess` aktif; jalankan setup Operator lalu hapus atau kunci folder `setup/`; uji seluruh alur di URL produksi termasuk Web Speech API di Chrome Android. Jelaskan batasan hosting gratis (ruang, lalu lintas, ketersediaan, kebijakan penyedia yang dapat berubah).

## 14. ZIP dan Dokumentasi

Hasilkan satu file **`kuis-inggris-sd.zip`** berisi seluruh aplikasi, `database/`, `config.example.php`, `docs/`, dan panduan. **Jangan** menyertakan `config.php`, kunci enkripsi, atau sandi apa pun. Pastikan ZIP dapat diekstrak dan hasil ekstraknya berjalan. Jangan mengklaim ZIP sudah dibuat jika file belum ada.

Dokumentasi bahasa Indonesia yang mudah dipahami mahasiswa pemula:

- Pendahuluan singkat (merujuk ke SRS, tanpa menyalin ulang).
- ERD, kamus data, penjelasan relasi.
- Struktur kode dan fungsi utama.
- Tabel penelusuran FR-01 s.d. FR-24 ke file dan halaman yang mengimplementasikannya.
- Pemetaan wireframe ke halaman nyata, termasuk landing page.
- Panduan instalasi XAMPP, penggunaan per peran, pengujian, dan hosting.
- Panduan modifikasi: ganti nama sekolah dan logo, warna (variabel CSS), tambah kosa kata, ubah jumlah soal per sesi dan poin per jawaban, ubah waktu auto logout, ubah isi landing page.
- Hasil pengujian, kesimpulan, dan saran pengembangan (SRS 2.8: ekspor laporan PDF/Excel, pencarian soal, kosa kata non-benda, mode offline, dukungan iOS dan macOS).

## 15. Hasil Akhir yang Wajib Ada

1. Aplikasi web PHP + MySQL + HTML + CSS + JavaScript yang berjalan sesuai SRS, ERD, dan wireframe.
2. Landing page profesional (Bagian 7).
3. File SQL database dan skrip data contoh.
4. Dokumentasi dan tabel pengujian beserta bukti (tangkapan layar).
5. `kuis-inggris-sd.zip` yang dapat diunduh dan diekstrak.
6. Panduan XAMPP dan hosting PHP gratis.
7. **Temuan dan Asumsi:** ketidaksesuaian lampiran, asumsi yang dipakai, bagian yang belum diverifikasi, dan konfigurasi yang harus saya isi sendiri.

## INSTRUKSI TERAKHIR

Mulailah dengan membaca lampiran dan menulis Implementation Plan serta daftar Temuan dan Asumsi singkat. Setelah itu bangun aplikasi dan landing page sesuai urutan kerja. Ikuti SRS yang sudah disetujui dosen, jangan menambah fitur di luar SRS (termasuk AI), jangan mengubah ERD, dan jaga tampilan sesuai wireframe. Hasilnya harus ramah anak, profesional, aman, dan mudah dimodifikasi. Di akhir, berikan ringkasan: apa yang sudah jadi, apa yang sudah diuji beserta buktinya, apa yang belum diuji, dan apa yang perlu saya isi sendiri.
