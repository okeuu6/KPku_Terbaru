# Kamus Data

Sumber: `database/kuis_inggris.sql` (tujuh tabel sesuai ERD; InnoDB, utf8mb4).


## guru
Akun Guru

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_guru | int(11) | Ya |  |
| nama | varchar(100) | Ya |  |
| username | varchar(50) | Ya |  |
| password | varchar(255) | Ya | Hash sandi (password_hash) |
| dibuat_oleh | int(11) | Tidak | Operator yang menambahkan data; NULL untuk Operator pertama |

## kelas
Kelas dan guru pengampu

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_kelas | int(11) | Ya |  |
| nama_kelas | varchar(50) | Ya |  |
| kode_kelas | varchar(10) | Ya | Kode unik untuk login siswa (contoh KLS4A) |
| id_guru | int(11) | Ya |  |
| id_kepsek | int(11) | Tidak | Kepala sekolah pemantau (boleh kosong) |
| dibuat_oleh | int(11) | Tidak | Operator yang menambahkan data; NULL untuk Operator pertama |

## kepala_sekolah
Akun Kepala Sekolah

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_kepsek | int(11) | Ya | Kepala sekolah pemantau (boleh kosong) |
| nama | varchar(100) | Ya |  |
| username | varchar(50) | Ya |  |
| password | varchar(255) | Ya | Hash sandi (password_hash) |
| dibuat_oleh | int(11) | Tidak | Operator yang menambahkan data; NULL untuk Operator pertama |

## operator
Akun Operator

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_operator | int(11) | Ya |  |
| nama | varchar(100) | Ya |  |
| username | varchar(50) | Ya |  |
| password | varchar(255) | Ya | Hash sandi (password_hash) |
| dibuat_oleh | int(11) | Tidak | Operator yang menambahkan data; NULL untuk Operator pertama |

## poin
Poin tiap sesi Mode Mencocokkan

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_poin | int(11) | Ya |  |
| nisn | varchar(10) | Ya | Kunci utama siswa, 10 digit |
| nilai | int(11) | Tidak | Poin satu sesi (jumlah benar x POIN_PER_BENAR) |
| tanggal | datetime | Tidak | Waktu sesi, otomatis |

## siswa
Data Siswa (PK = NISN)

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| nisn | varchar(10) | Ya | Kunci utama siswa, 10 digit |
| nama | varchar(100) | Ya |  |
| sandi_hash | varchar(255) | Ya | Hash PIN (password_hash), dipakai verifikasi login |
| sandi_terenkripsi | varchar(255) | Ya | PIN dienkripsi AES-256-GCM agar Guru pengampu dapat melihatnya (FR-11) |
| id_kelas | int(11) | Ya |  |
| dibuat_oleh | int(11) | Tidak | Operator yang menambahkan data; NULL untuk Operator pertama |

## soal
Soal kuis: kartu Mode Belajar + soal Mode Mencocokkan

| Field | Tipe | Wajib | Penjelasan |
|---|---|---|---|
| id_soal | int(11) | Ya |  |
| kata_inggris | varchar(100) | Ya |  |
| arti_indonesia | varchar(100) | Ya |  |
| gambar | varchar(255) | Ya | Nama berkas acak di uploads/soal/ (atau contoh/xxx.svg untuk data contoh) |
| id_guru | int(11) | Ya |  |
| dibuat_pada | datetime | Tidak | Otomatis |
| diubah_pada | datetime | Tidak | Otomatis saat diubah |

## Kunci dan relasi
- PK: id_* pada tiap tabel; `siswa.nisn` bukan AUTO_INCREMENT.
- UNIQUE: `username` (guru, kepala_sekolah, operator), `kelas.kode_kelas`.
- FK: `dibuat_oleh` -> operator (ON DELETE SET NULL); `kelas.id_guru` -> guru; `kelas.id_kepsek` -> kepala_sekolah (SET NULL); `siswa.id_kelas` -> kelas; `soal.id_guru` -> guru (CASCADE); `poin.nisn` -> siswa (CASCADE).
- Aturan hapus di aplikasi: Guru yang masih mengampu kelas dan Kelas yang masih berisi siswa tidak dapat dihapus (pesan jelas ke Operator).
