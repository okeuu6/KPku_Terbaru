import { Router } from 'express';
import {
  getTotalPoinSiswa,
  getKelasById,
  listSoalByKelasId,
  getRiwayatPoinSiswa,
} from '../db.js';
import { asyncHandler, url, gambarUrl, wajibPeran, buildViewLocals } from '../helpers.js';

const router = Router();

router.get(['/siswa/masuk-kelas.php', '/siswa/pilih-nama.php'], (req, res) => {
  res.redirect(url('index.php?peran=siswa#masuk-portal'));
});

router.get(
  '/siswa/menu.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    const user = req.session.user;
    const [total, k] = await Promise.all([
      getTotalPoinSiswa(user.nisn),
      getKelasById(user.id_kelas),
    ]);
    const namaKelas = k ? k.nama_kelas : 'Kelas';

    res.render('siswa/menu', {
      ...buildViewLocals(req, 'Menu Utama'),
      total,
      namaKelas,
    });
  })
);

router.get(
  '/siswa/belajar.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    const user = req.session.user;
    const soalRows = await listSoalByKelasId(user.id_kelas);

    const kartu = soalRows.map((r) => ({
      kata: r.kata_inggris,
      arti: r.arti_indonesia,
      gambar: gambarUrl(r.gambar),
    }));

    res.render('siswa/belajar', {
      ...buildViewLocals(req, 'Mode Belajar', {
        back: 'siswa/menu.php',
        js: kartu.length ? ['belajar.js'] : [],
      }),
      kartu,
      kartuJson: JSON.stringify(kartu),
    });
  })
);

router.get('/siswa/mencocokkan.php', wajibPeran('siswa'), (req, res) => {
  res.render('siswa/mencocokkan', {
    ...buildViewLocals(req, 'Mode Mencocokkan', {
      back: 'siswa/menu.php',
      js: ['kuis.js'],
    }),
  });
});

router.get(
  '/siswa/hasil.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    const h = req.session.hasil;
    if (!h) return res.redirect(url('siswa/menu.php'));

    const user = req.session.user;
    const total = await getTotalPoinSiswa(user.nisn);

    const benar = Number(h.benar);
    const jmlSoal = Number(h.total);
    const poinSesi = Number(h.poin);
    const persen = jmlSoal > 0 ? benar / jmlSoal : 0;

    res.render('siswa/hasil', {
      ...buildViewLocals(req, 'Hasil Kuis'),
      total,
      benar,
      jmlSoal,
      poinSesi,
      persen,
    });
  })
);

router.get(
  '/siswa/poin.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    const user = req.session.user;
    const riwayat = await getRiwayatPoinSiswa(user.nisn);
    const total = riwayat.reduce((acc, p) => acc + Number(p.nilai || 0), 0);

    res.render('siswa/poin', {
      ...buildViewLocals(req, 'Poin Saya', { back: 'siswa/menu.php' }),
      total,
      riwayat,
    });
  })
);

export default router;
