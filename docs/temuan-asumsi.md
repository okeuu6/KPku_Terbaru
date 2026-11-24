# Temuan dan Asumsi

## Temuan (ketidaksesuaian / bahan lampiran)
1. Lampiran yang diterima hanya: prompt (docx), SRS (PDF), dan `kuis_inggris.sql`. Berkas ERD dan wireframe `.drawio` tidak ikut, sehingga tampilan mengikuti ringkasan di prompt (Bagian E) dan struktur tabel mengikuti SQL (yang sesuai tabel pada Bagian D prompt).
2. SRS: daftar isi masih memuat "Error! Bookmark not defined" untuk Context Diagram dan DFD, dan penomoran bab/gambar diagram tidak berurutan (mis. use case 3.4.3 vs gambar 3.24). Tidak memengaruhi aplikasi, tetapi sebaiknya dirapikan sebelum dikumpulkan.
3. SRS 1.6.2 menyebut Guru "menambahkan dan mengedit soal"; FR-14 menambahkan hapus soal. Diimplementasikan lengkap (tambah, ubah, hapus).
4. FR-17 hanya "menampilkan nama guru"; wireframe menambah kolom "Kelas yang Diampu". Kolom itu dimasukkan.
5. Kolom `kelas.id_kepsek` boleh kosong pada SQL; formulir Kelas menyediakan pilihan "Tidak diatur". Kepala Sekolah tetap melihat seluruh kelas (satu sekolah).

## Asumsi
- Satu sesi = 10 soal acak dari soal Guru pengampu; 4 pilihan (1 benar + 3 pengecoh dari kata lain); 10 poin per jawaban benar. Semua dapat diubah di `includes/config.php`.
- Soal harus memiliki minimal 4 kata berbeda agar permainan berjalan; jika kurang, siswa melihat pesan.
- Auto logout 30 menit. Pembatas percobaan login: 5 gagal -> tunggu 30 detik (per sesi).
- NISN harus 10 digit angka; PIN 4 digit; sandi staf minimal 8 karakter; username 3-50 karakter.
- Unggahan gambar: JPG, PNG, WebP (SVG sengaja tidak diizinkan demi keamanan), divalidasi MIME di server, nama berkas acak.
- Username staf dijaga unik di ketiga tabel staf agar login tidak ambigu.
- Aturan hapus: Guru yang mengampu kelas dan Kelas yang berisi siswa tidak dapat dihapus; hapus siswa menghapus poinnya; hapus guru menghapus soal dan gambarnya; Operator tidak dapat menghapus akunnya sendiri.
- `database/data_contoh.sql` diganti `setup/data-contoh.php` karena hash sandi dan PIN terenkripsi bergantung kunci Anda dan tidak boleh memakai sandi bawaan. Data contoh bersifat opsional: hanya dimuat jika Operator menekan tombolnya, dan diberi label "contoh".
- Berkas `database/kuis_inggris.sql` memakai dump Anda apa adanya; buat database kosong lebih dulu lalu impor.
- Beranda dan login digabung dalam satu form dengan tab peran. Untuk staf, akun harus cocok dengan tab yang dipilih; siswa tetap 2 langkah (kode kelas, lalu nama + PIN) di halaman yang sama.

## Belum diverifikasi / perlu Anda isi
- Uji visual di browser dan perangkat Android nyata, serta suara Web Speech API (perlu suara bahasa Inggris pada perangkat).
- Uji beban 30 pengguna dan waktu respons pada hosting gratis.
- Isi sendiri `includes/config.php` (database, `ENC_KEY`, nama sekolah). Ganti logo/nama sekolah sesuai kebutuhan.

---

## Laporan Review Mandiri Kepatuhan Aturan Visual E.3

Pemeriksaan mandiri menyeluruh terhadap seluruh halaman terhadap daftar larangan dan standar E.3:

| Elemen yang Diperiksa | Status Kepatuhan | Perbaikan yang Dilakukan |
|---|---|---|
| **Gradient & Warna Neon** | **Bersih 100%** | Seluruh gradien (`linear-gradient`, `radial-gradient`) dan warna neon dihapus total. Warna murni menggunakan palet flat solid: `#2A7F62`, `#E8962E`, `#FFF9EF`, `#FFFFFF`, `#2B2B2B`, `#D9D2C3`, `#2E8B57`, `#C8453B`. |
| **Glassmorphism & Shadow Blur** | **Bersih 100%** | Efek `backdrop-filter: blur()` dan bayangan lembut dihapus total. Zona siswa menggunakan bayangan padat tanpa blur (`box-shadow: 0 4px 0 #1B5A44`), saat ditekan tombol turun 4px (`transform: translateY(4px); box-shadow: 0 0 0 #1B5A44`). Zona staf tanpa bayangan (`box-shadow: none`). |
| **Penggunaan Emoji** | **Bersih 100%** | Seluruh emoji dekoratif (seperti 🧒, 👩‍🏫, 🏛️, 🛠️, 📚, ⭐, 🎉, 🍎, dll.) telah dihapus dari seluruh tampilan navigasi, tombol, alert, dan form. Ikon diganti dengan SVG inline sederhana atau teks baku. |
| **Tipografi & Font** | **Sesuai Standar** | Font utama diatur ke `"Andika"` (font literasi pembaca pemula) dengan cadangan sans-serif sistem (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`). Tidak memuat dari CDN pihak ketiga. Ukuran dasar siswa 18px, staf 16px. |
| **Teks Promosi & Motivasi Generik** | **Bersih 100%** | Teks seperti "Revolusioner", "Seamless", "Hebat sekali!!!", "Luar biasa! Kamu pembelajar sejati!" dihapus seluruhnya. Digantikan teks lugas sekolah nyata. |
| **Umpan Balik Siswa (Feedback Kuis)** | **Sesuai Standar** | Umpan balik dibuat singkat dan tenang: Benar: `✓ Betul! +10`. Salah: `✗ Belum tepat. Jawabannya: [KATA]`. Warna benar/salah selalu disertai simbol teks `✓`/`✗` dan teks penjelasan, bukan hanya warna. |
| **Zona Siswa (siswa/*)** | **Sesuai Standar** | Satu tugas per layar, satu kolom, banyak ruang kosong. Tombol minimal tinggi 56px, teks 20px, sudut 12px, border 2px padat. Kata bahasa Inggris berukuran 44px (minimal 40px) dan huruf kapital. |
| **Zona Staf (guru/, kepsek/, operator/)** | **Sesuai Standar** | Tampilan tenang dan fungsional seperti aplikasi administrasi sekolah negeri. Sudut maksimal 6px, tanpa bayangan, pemisah garis 1px. Tabel rapat dengan header tebal dan baris belang tipis. Dashboard berupa kartu angka sederhana tanpa ikon lingkaran warna. Sidebar solid dengan penanda menu aktif border-left 4px. |
| **Ilustrasi Kosa Kata** | **Seragam & Rapi** | 8 gambar kosa kata (`apple`, `book`, `ball`, `bag`, `pencil`, `clock`, `chair`, `table`) dan logo dibuat ulang dengan bentuk datar, garis tepi padat 3px (`stroke="#2B2B2B" stroke-width="3"`), 4–5 warna dari palet, tanpa 3D/realistis. |
| **Animasi** | **Tenang** | Animasi konfeti canvas, bouncing, dan parallax dihilangkan sepenuhnya. Transisi hanya berupa perubahan status 150 ms (`--transisi: 150ms ease`). |
