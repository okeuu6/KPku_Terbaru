import { Router } from 'express';
import { db } from '../store.js';
import { url, gambarUrl, wajibPeran, buildViewLocals } from '../helpers.js';

const router = Router();

router.get(['/siswa/masuk-kelas.php', '/siswa/pilih-nama.php'], (req, res) => {
  res.redirect(url('index.php?peran=siswa#masuk-portal'));
});

router.get('/siswa/menu.php', wajibPeran('siswa'), (req, res) => {
  const user = req.session.user;
  const total = db.poin
    .filter((p) => p.nisn === user.nisn)
    .reduce((acc, p) => acc + Number(p.nilai || 0), 0);
  const k = db.kelas.find((x) => x.id_kelas === user.id_kelas);
  const namaKelas = k ? k.nama_kelas : 'Kelas';

  res.render('siswa/menu', {
    ...buildViewLocals(req, 'Menu Utama'),
    total,
    namaKelas,
  });
});

router.get('/siswa/belajar.php', wajibPeran('siswa'), (req, res) => {
  const user = req.session.user;
  const k = db.kelas.find((x) => x.id_kelas === user.id_kelas);
  const idGuru = k ? k.id_guru : -1;

  const kartu = db.soal
    .filter((s) => s.id_guru === idGuru)
    .sort((a, b) => a.kata_inggris.localeCompare(b.kata_inggris))
    .map((r) => ({
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
});

router.get('/siswa/mencocokkan.php', wajibPeran('siswa'), (req, res) => {
  res.render('siswa/mencocokkan', {
    ...buildViewLocals(req, 'Mode Mencocokkan', {
      back: 'siswa/menu.php',
      js: ['kuis.js'],
    }),
  });
});

router.get('/siswa/hasil.php', wajibPeran('siswa'), (req, res) => {
  const h = req.session.hasil;
  if (!h) return res.redirect(url('siswa/menu.php'));

  const user = req.session.user;
  const total = db.poin
    .filter((p) => p.nisn === user.nisn)
    .reduce((acc, p) => acc + Number(p.nilai || 0), 0);

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
});

router.get('/siswa/poin.php', wajibPeran('siswa'), (req, res) => {
  const user = req.session.user;
  const riwayat = db.poin
    .filter((p) => p.nisn === user.nisn)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  const total = riwayat.reduce((acc, p) => acc + Number(p.nilai || 0), 0);

  res.render('siswa/poin', {
    ...buildViewLocals(req, 'Poin Saya', { back: 'siswa/menu.php' }),
    total,
    riwayat,
  });
});

export default router;
