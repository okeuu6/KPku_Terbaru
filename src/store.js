import bcrypt from 'bcryptjs';
import { enkripsiPin } from './crypto.js';

// In-memory store replicating database/kuis_inggris.sql schema
// Pre-seeded with sample school data so all roles work immediately out-of-the-box.
function createSeedData() {
  const staffHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  const operator = [
    {
      id_operator: 1,
      nama: 'Ahmad Fauzan, S.Kom.',
      username: 'admin_sekolah',
      password: staffHash,
      dibuat_oleh: null,
    },
  ];

  const kepsek = [
    {
      id_kepsek: 1,
      nama: 'Dr. H. Sulaiman, M.Pd.',
      username: 'kepsek_sulaiman',
      password: staffHash,
      dibuat_oleh: 1,
    },
  ];

  const guru = [
    {
      id_guru: 1,
      nama: 'Ibu Ratna Sari, S.Pd.',
      username: 'guru_ratna',
      password: staffHash,
      dibuat_oleh: 1,
    },
    {
      id_guru: 2,
      nama: 'Bapak Hendra Wijaya, M.Pd.',
      username: 'guru_hendra',
      password: staffHash,
      dibuat_oleh: 1,
    },
  ];

  const kelas = [
    {
      id_kelas: 1,
      nama_kelas: 'Kelas 4A',
      kode_kelas: 'KLS4A',
      id_guru: 1,
      id_kepsek: 1,
      dibuat_oleh: 1,
    },
    {
      id_kelas: 2,
      nama_kelas: 'Kelas 4B',
      kode_kelas: 'KLS4B',
      id_guru: 2,
      id_kepsek: 1,
      dibuat_oleh: 1,
    },
    {
      id_kelas: 3,
      nama_kelas: 'Kelas 5A',
      kode_kelas: 'KLS5A',
      id_guru: 1,
      id_kepsek: 1,
      dibuat_oleh: 1,
    },
  ];

  const siswaSeeds = [
    ['0000000001', 'Budi Santoso', '1234', 1],
    ['0000000002', 'Siti Nurhaliza', '5678', 1],
    ['0000000003', 'Ahmad Rizki', '1122', 1],
    ['0000000004', 'Dewi Anggraini', '3344', 2],
    ['0000000005', 'Fajar Nugraha', '5566', 2],
    ['0000000006', 'Putri Ayu', '7788', 3],
  ];

  const siswa = siswaSeeds.map(([nisn, nama, pin, id_kelas]) => ({
    nisn,
    nama,
    sandi_hash: bcrypt.hashSync(pin, 10),
    sandi_terenkripsi: enkripsiPin(pin),
    id_kelas,
    dibuat_oleh: 1,
  }));

  const soalSeeds = [
    ['Apple', 'Apel', 'contoh/apple.svg', 1],
    ['Book', 'Buku', 'contoh/book.svg', 1],
    ['Chair', 'Kursi', 'contoh/chair.svg', 1],
    ['Table', 'Meja', 'contoh/table.svg', 1],
    ['Ball', 'Bola', 'contoh/ball.svg', 1],
    ['Pencil', 'Pensil', 'contoh/pencil.svg', 1],
    ['Bag', 'Tas', 'contoh/bag.svg', 1],
    ['Clock', 'Jam', 'contoh/clock.svg', 1],
    ['Apple', 'Apel', 'contoh/apple.svg', 2],
    ['Book', 'Buku', 'contoh/book.svg', 2],
    ['Chair', 'Kursi', 'contoh/chair.svg', 2],
    ['Table', 'Meja', 'contoh/table.svg', 2],
    ['Ball', 'Bola', 'contoh/ball.svg', 2],
    ['Pencil', 'Pensil', 'contoh/pencil.svg', 2],
  ];

  const soal = soalSeeds.map(([kata_inggris, arti_indonesia, gambar, id_guru], idx) => ({
    id_soal: idx + 1,
    kata_inggris,
    arti_indonesia,
    gambar,
    id_guru,
    dibuat_pada: now,
    diubah_pada: null,
  }));

  const poin = [
    { id_poin: 1, nisn: '0000000001', nilai: 80, tanggal: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id_poin: 2, nisn: '0000000002', nilai: 90, tanggal: new Date(Date.now() - 86400000).toISOString() },
    { id_poin: 3, nisn: '0000000003', nilai: 70, tanggal: new Date(Date.now() - 86400000).toISOString() },
    { id_poin: 4, nisn: '0000000004', nilai: 80, tanggal: new Date(Date.now() - 86400000).toISOString() },
    { id_poin: 5, nisn: '0000000006', nilai: 100, tanggal: new Date(Date.now() - 43200000).toISOString() },
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
