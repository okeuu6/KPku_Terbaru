# Penelusuran FR-01 s.d. FR-24 ke Berkas

| FR | Berkas / halaman |
|---|---|
| FR-01 Validasi kode kelas | `index.php` (tab Siswa, langkah 1) |
| FR-02 Daftar nama siswa | `index.php` (tab Siswa, langkah 2) |
| FR-03 Login siswa (nama + PIN) | `index.php`, `includes/auth.php` (`mulai_sesi`) |
| FR-04 Login staf | `index.php` (tab Guru / Kepala Sekolah / Operator), `includes/auth.php` (`login_staf`) |
| FR-05 Kartu kosa kata | `siswa/belajar.php`, `assets/js/belajar.js` |
| FR-06 Pelafalan (Web Speech API) | `assets/js/belajar.js` |
| FR-07 Soal bergambar + pilihan | `siswa/mencocokkan.php`, `api/soal.php`, `assets/js/kuis.js` |
| FR-08 Poin, kunci jawaban, simpan total | `api/poin.php` (aksi `jawab` dan `selesai`), `siswa/hasil.php` |
| FR-09 Total poin siswa | `siswa/menu.php`, `siswa/poin.php` |
| FR-10 Kelas Tersedia | `guru/index.php` |
| FR-11 Data siswa, poin, PIN | `guru/data-siswa.php` |
| FR-12 Tambah soal | `guru/soal-form.php`, `includes/fungsi.php` (`simpan_gambar`) |
| FR-13 Ubah soal | `guru/soal-form.php?id=` |
| FR-14 Hapus soal + gambar | `guru/soal-hapus.php` |
| FR-15 Data seluruh kelas | `kepsek/data-kelas.php` |
| FR-16 Siswa poin tertinggi | `kepsek/poin-tertinggi.php` |
| FR-17 Nama guru | `kepsek/nama-guru.php` |
| FR-18 CRUD Guru | `operator/daftar.php`, `form.php`, `hapus.php` (`jenis=guru`) |
| FR-19 CRUD Siswa | idem (`jenis=siswa`) |
| FR-20 CRUD Kepala Sekolah | idem (`jenis=kepsek`) |
| FR-21 CRUD Operator | idem (`jenis=operator`) |
| FR-22 CRUD Kelas | idem (`jenis=kelas`) |
| FR-23 RBAC | `includes/auth.php` (`wajib_peran`) dipanggil di setiap halaman terlindungi dan API |
| FR-24 Logout | `logout.php` |

Pemetaan wireframe: Halaman Awal + Masuk Kelas + Pilih Nama dan PIN + Login Staf = satu halaman `index.php` dengan pilihan peran (`login.php`, `siswa/masuk-kelas.php`, `siswa/pilih-nama.php` hanya mengalihkan ke sana); Menu, Belajar, Mencocokkan, Hasil, Poin Saya = `siswa/*`; Dashboard dan halaman Guru, Kepala Sekolah, Operator = `guru/*`, `kepsek/*`, `operator/*`. Satu kode responsif: layar kecil seperti wireframe Android, layar lebar (>= 900 px) memakai sidebar seperti wireframe Windows.
