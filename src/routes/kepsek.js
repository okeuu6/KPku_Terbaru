import { Router } from 'express';
import { db } from '../store.js';
import { wajibPeran, buildViewLocals } from '../helpers.js';

const router = Router();

function getRankedStudents() {
  return db.siswa
    .map((s) => {
      const k = db.kelas.find((x) => x.id_kelas === s.id_kelas);
      const g = k ? db.guru.find((x) => x.id_guru === k.id_guru) : null;
      const poinList = db.poin.filter((p) => p.nisn === s.nisn);
      const total = poinList.reduce((acc, p) => acc + Number(p.nilai || 0), 0);
      return {
        nisn: s.nisn,
        nama: s.nama,
        nama_kelas: k ? k.nama_kelas : '-',
        nama_guru: g ? g.nama : '-',
        total,
        jml_sesi: poinList.length,
      };
    })
    .sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama));
}

router.get('/kepsek/index.php', wajibPeran('kepsek'), (req, res) => {
  const ranked = getRankedStudents();
  const top3 = ranked.slice(0, 3);
  const kelasRingkas = db.kelas
    .map((k) => {
      const g = db.guru.find((x) => x.id_guru === k.id_guru);
      return {
        nama_kelas: k.nama_kelas,
        kode_kelas: k.kode_kelas,
        guru: g ? g.nama : '-',
        jml: db.siswa.filter((s) => s.id_kelas === k.id_kelas).length,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));

  res.render('kepsek/index', {
    ...buildViewLocals(req, 'Dashboard Kepala Sekolah', { scriptKey: 'index|' }),
    jk: db.kelas.length,
    jg: db.guru.length,
    js: db.siswa.length,
    jq: db.soal.length,
    top3,
    kelasRingkas,
  });
});

router.get('/kepsek/data-kelas.php', wajibPeran('kepsek'), (req, res) => {
  const rows = db.kelas
    .map((k) => {
      const g = db.guru.find((x) => x.id_guru === k.id_guru);
      return {
        nama_kelas: k.nama_kelas,
        kode_kelas: k.kode_kelas,
        guru: g ? g.nama : '-',
        jml: db.siswa.filter((s) => s.id_kelas === k.id_kelas).length,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));

  res.render('kepsek/data-kelas', {
    ...buildViewLocals(req, 'Data Kelas', { back: 'kepsek/index.php', scriptKey: 'data-kelas|' }),
    rows,
  });
});

router.get('/kepsek/nama-guru.php', wajibPeran('kepsek'), (req, res) => {
  const rows = db.guru
    .map((g) => {
      const kelasStr = db.kelas
        .filter((k) => k.id_guru === g.id_guru)
        .map((k) => k.nama_kelas)
        .sort((a, b) => a.localeCompare(b))
        .join(', ');
      return {
        nama: g.nama,
        kelas: kelasStr || '-',
      };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));

  res.render('kepsek/nama-guru', {
    ...buildViewLocals(req, 'Nama Guru', { back: 'kepsek/index.php', scriptKey: 'nama-guru|' }),
    rows,
  });
});

router.get('/kepsek/poin-tertinggi.php', wajibPeran('kepsek'), (req, res) => {
  const q = String(req.query.q || '').trim();
  const ql = q.toLowerCase();

  const rows = db.siswa
    .map((s) => {
      const k = db.kelas.find((x) => x.id_kelas === s.id_kelas);
      const g = k ? db.guru.find((x) => x.id_guru === k.id_guru) : null;
      const poinList = db.poin.filter((p) => p.nisn === s.nisn);
      const total = poinList.reduce((acc, p) => acc + Number(p.nilai || 0), 0);
      return {
        nisn: s.nisn,
        nama: s.nama,
        nama_kelas: k ? k.nama_kelas : '-',
        nama_guru: g ? g.nama : '-',
        total,
        jml_sesi: poinList.length,
      };
    })
    .filter((r) => {
      if (!ql) return true;
      return (
        r.nama.toLowerCase().includes(ql) ||
        r.nisn.toLowerCase().includes(ql) ||
        r.nama_kelas.toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama));

  res.render('kepsek/poin-tertinggi', {
    ...buildViewLocals(req, 'Laporan Lengkap Nilai Siswa', {
      back: 'kepsek/index.php',
      scriptKey: 'poin-tertinggi|',
    }),
    q,
    rows,
    top3: q === '' ? rows.slice(0, 3) : [],
  });
});

export default router;
