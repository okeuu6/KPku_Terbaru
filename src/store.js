import bcrypt from 'bcryptjs';
import { enkripsiPin } from './crypto.js';

// In-memory fallback store mirroring the kuis_inggris schema
// Used only when MySQL is unreachable (e.g. cloud preview).
function createSeedData() {
  const staffHash = bcrypt.hashSync('password123', 10);

  const operator = [
    {
      id_operator: 1,
      nama: 'Cindy Salsabila',
      username: 'Cindy',
      password: staffHash,
      dibuat_oleh: null,
    },
  ];

  const kepsek = [
    {
      id_kepsek: 1,
      nama: 'Drs. Hendra Wijaya, M.Pd.',
      username: 'kepsek.hendra',
      password: staffHash,
      dibuat_oleh: 1,
    },
  ];

  const guru = [
    {
      id_guru: 1,
      nama: 'Dewi Anggraini, S.Pd.',
      username: 'guru.dewi',
      password: staffHash,
      dibuat_oleh: 1,
    },
    {
      id_guru: 2,
      nama: 'Bambang Setiawan, S.Pd.',
      username: 'guru.bambang',
      password: staffHash,
      dibuat_oleh: 1,
    },
  ];

  const kelas = [
    {
      id_kelas: 1,
      nama_kelas: 'Kelas 5A',
      kode_kelas: 'KLS5A',
      id_guru: 1,
      id_kepsek: 1,
      dibuat_oleh: 1,
    },
    {
      id_kelas: 2,
      nama_kelas: 'Kelas 5B',
      kode_kelas: 'KLS5B',
      id_guru: 2,
      id_kepsek: 1,
      dibuat_oleh: 1,
    },
  ];

  const siswaSeeds = [
    ['0015001001', 'Alya Putri Ramadhani', '1234', 1],
    ['0015001002', 'Bagas Pratama Putra', '1234', 1],
    ['0015001003', 'Citra Kirana Sari', '1234', 1],
    ['0015001004', 'Dimas Aditya Nugroho', '1234', 1],
    ['0015001005', 'Eka Wulandari', '1234', 1],
    ['0015002001', 'Fajar Ramadhan Saputra', '1234', 2],
    ['0015002002', 'Gita Permata Hati', '1234', 2],
    ['0015002003', 'Hafiz Alfarizi', '1234', 2],
    ['0015002004', 'Indah Cahaya Lestari', '1234', 2],
    ['0015002005', 'Joko Susilo Wibowo', '1234', 2],
    ['0015002006', 'Layla Nur Cahyani', '1234', 2],
  ];

  const siswaHash = bcrypt.hashSync('1234', 10);
  const siswa = siswaSeeds.map(([nisn, nama, pin, id_kelas]) => ({
    nisn,
    nama,
    sandi_hash: siswaHash,
    sandi_terenkripsi: enkripsiPin(pin),
    id_kelas,
    dibuat_oleh: 1,
  }));

  const soalSeeds = [
    ['Apple', 'Apel', 'contoh/apple.svg', 1],
    ['Book', 'Buku', 'contoh/book.svg', 1],
    ['Chair', 'Kursi', 'contoh/chair.svg', 1],
    ['Table', 'Meja', 'contoh/table.svg', 1],
    ['Ball', 'Bola', 'contoh/ball.svg', 2],
    ['Pencil', 'Pensil', 'contoh/pencil.svg', 2],
    ['Bag', 'Tas', 'contoh/bag.svg', 2],
    ['Clock', 'Jam', 'contoh/clock.svg', 2],
  ];

  const soal = soalSeeds.map(([kata_inggris, arti_indonesia, gambar, id_guru], idx) => ({
    id_soal: idx + 1,
    kata_inggris,
    arti_indonesia,
    gambar,
    id_guru,
    dibuat_pada: '2026-11-22T23:46:07.000Z',
    diubah_pada: null,
  }));

  const poin = [
    { id_poin: 1, nisn: '0015001001', nilai: 90, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 2, nisn: '0015001002', nilai: 80, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 3, nisn: '0015001003', nilai: 100, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 4, nisn: '0015001004', nilai: 70, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 5, nisn: '0015001005', nilai: 80, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 6, nisn: '0015002001', nilai: 85, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 7, nisn: '0015002002', nilai: 95, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 8, nisn: '0015002003', nilai: 75, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 9, nisn: '0015002004', nilai: 90, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 10, nisn: '0015002005', nilai: 80, tanggal: '2026-11-22T23:46:07.000Z' },
    { id_poin: 11, nisn: '0015001001', nilai: 40, tanggal: '2026-11-23T01:00:09.000Z' },
  ];

  return {
    guru,
    kelas,
    kepsek,
    operator,
    siswa,
    soal,
    poin,
    seq: {
      guru: guru.length + 1,
      kelas: kelas.length + 1,
      kepsek: kepsek.length + 1,
      operator: operator.length + 1,
      soal: soal.length + 1,
      poin: poin.length + 1,
    },
  };
}

export const db = createSeedData();

export function nextId(table) {
  const id = db.seq[table] || 1;
  db.seq[table] = id + 1;
  return id;
}

export function resetSeedData() {
  const fresh = createSeedData();
  db.guru = fresh.guru;
  db.kelas = fresh.kelas;
  db.kepsek = fresh.kepsek;
  db.operator = fresh.operator;
  db.siswa = fresh.siswa;
  db.soal = fresh.soal;
  db.poin = fresh.poin;
  db.seq = fresh.seq;
}
