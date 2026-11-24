import { Router } from 'express';
import {
  getKepsekCounts,
  listKelasRingkas,
  listGuruDenganKelas,
  listSiswaPeringkat,
} from '../db.js';
import { asyncHandler, wajibPeran, buildViewLocals } from '../helpers.js';

const router = Router();

router.get(
  '/kepsek/index.php',
  wajibPeran('kepsek'),
  asyncHandler(async (req, res) => {
    const [counts, ranked, kelasRingkas] = await Promise.all([
      getKepsekCounts(),
      listSiswaPeringkat(''),
      listKelasRingkas(),
    ]);

    res.render('kepsek/index', {
      ...buildViewLocals(req, 'Dashboard Kepala Sekolah', { scriptKey: 'index|' }),
      jk: counts.jk,
      jg: counts.jg,
      js: counts.js,
      jq: counts.jq,
      top3: ranked.slice(0, 3),
      kelasRingkas,
    });
  })
);

router.get(
  '/kepsek/data-kelas.php',
  wajibPeran('kepsek'),
  asyncHandler(async (req, res) => {
    const rows = await listKelasRingkas();

    res.render('kepsek/data-kelas', {
      ...buildViewLocals(req, 'Data Kelas', { back: 'kepsek/index.php', scriptKey: 'data-kelas|' }),
      rows,
    });
  })
);

router.get(
  '/kepsek/nama-guru.php',
  wajibPeran('kepsek'),
  asyncHandler(async (req, res) => {
    const rows = await listGuruDenganKelas();

    res.render('kepsek/nama-guru', {
      ...buildViewLocals(req, 'Nama Guru', { back: 'kepsek/index.php', scriptKey: 'nama-guru|' }),
      rows,
    });
  })
);

router.get(
  '/kepsek/poin-tertinggi.php',
  wajibPeran('kepsek'),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    const rows = await listSiswaPeringkat(q);

    res.render('kepsek/poin-tertinggi', {
      ...buildViewLocals(req, 'Laporan Lengkap Nilai Siswa', {
        back: 'kepsek/index.php',
        scriptKey: 'poin-tertinggi|',
      }),
      q,
      rows,
      top3: q === '' ? rows.slice(0, 3) : [],
    });
  })
);

export default router;
