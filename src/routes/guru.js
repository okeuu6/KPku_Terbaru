import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { db, nextId } from '../store.js';
import { config } from '../config.js';
import { dekripsiPin } from '../crypto.js';
import {
  url,
  gambarUrl,
  hapusBerkasGambar,
  wajibPeran,
  csrfWajib,
  setFlash,
  buildViewLocals,
} from '../helpers.js';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'soal');
fs.mkdirSync(uploadDir, { recursive: true });

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = MIME_EXT[file.mimetype] || 'bin';
      cb(null, crypto.randomBytes(12).toString('hex') + '.' + ext);
    },
  }),
  limits: { fileSize: config.maxGambarByte },
  fileFilter: (req, file, cb) => {
    if (!MIME_EXT[file.mimetype]) {
      return cb(new Error('Format gambar harus JPG, PNG, atau WebP.'));
    }
    cb(null, true);
  },
});

router.get('/guru/index.php', wajibPeran('guru'), (req, res) => {
  const idGuru = req.session.user.id;
  const kelas = db.kelas
    .filter((k) => k.id_guru === idGuru)
    .map((k) => {
      const siswaKelas = db.siswa.filter((s) => s.id_kelas === k.id_kelas);
      const totalPoinKelas = siswaKelas.reduce(
        (sum, s) =>
          sum +
          db.poin
            .filter((p) => p.nisn === s.nisn)
            .reduce((acc, p) => acc + Number(p.nilai || 0), 0),
        0
      );
      return {
        ...k,
        jml: siswaKelas.length,
        totalPoin: totalPoinKelas,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));

  const totalSiswa = kelas.reduce((acc, k) => acc + k.jml, 0);
  const soalGuru = db.soal.filter((s) => s.id_guru === idGuru);
  const jmlSoal = soalGuru.length;

  res.render('guru/index', {
    ...buildViewLocals(req, 'Kelas Tersedia', { scriptKey: 'index|' }),
    kelas,
    totalSiswa,
    jmlSoal,
    soalPreview: soalGuru.slice(0, 6),
    gambarUrl,
  });
});

router.get('/guru/data-siswa.php', wajibPeran('guru'), (req, res) => {
  const idGuru = req.session.user.id;
  const id = Number(req.query.id || 0);
  const k = db.kelas.find((x) => x.id_kelas === id && x.id_guru === idGuru);
  if (!k) {
    setFlash(req, 'Kelas tidak ditemukan atau bukan kelas yang diampu.', 'err');
    return res.redirect(url('guru/index.php'));
  }

  const siswa = db.siswa
    .filter((s) => s.id_kelas === id)
    .map((s) => ({
      nisn: s.nisn,
      nama: s.nama,
      pin: dekripsiPin(s.sandi_terenkripsi),
      total: db.poin
        .filter((p) => p.nisn === s.nisn)
        .reduce((acc, p) => acc + Number(p.nilai || 0), 0),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama));

  res.render('guru/data-siswa', {
    ...buildViewLocals(req, 'Data Siswa', { back: 'guru/index.php', scriptKey: 'data-siswa|' }),
    k,
    siswa,
  });
});

router.get('/guru/soal.php', wajibPeran('guru'), (req, res) => {
  const idGuru = req.session.user.id;
  const q = String(req.query.q || '').trim();
  const ql = q.toLowerCase();

  const soal = db.soal
    .filter((s) => {
      if (s.id_guru !== idGuru) return false;
      if (!ql) return true;
      return (
        s.kata_inggris.toLowerCase().includes(ql) ||
        s.arti_indonesia.toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => a.kata_inggris.localeCompare(b.kata_inggris));

  res.render('guru/soal', {
    ...buildViewLocals(req, 'Kelola Soal Kuis', { scriptKey: 'soal|' }),
    q,
    soal,
  });
});

router.get('/guru/soal-form.php', wajibPeran('guru'), (req, res) => {
  const idGuru = req.session.user.id;
  const id = Number(req.query.id || 0);
  let soal = null;
  if (id) {
    soal = db.soal.find((s) => s.id_soal === id && s.id_guru === idGuru) || null;
    if (!soal) {
      setFlash(req, 'Soal tidak ditemukan.', 'err');
      return res.redirect(url('guru/soal.php'));
    }
  }

  res.render('guru/soal-form', {
    ...buildViewLocals(req, soal ? 'Ubah Soal' : 'Tambah Soal', {
      back: 'guru/soal.php',
      scriptKey: 'soal-form|',
    }),
    soal,
    galat: '',
    kata: soal ? soal.kata_inggris : '',
    arti: soal ? soal.arti_indonesia : '',
  });
});

router.post('/guru/soal-form.php', wajibPeran('guru'), (req, res) => {
  upload.single('gambar')(req, res, (uploadErr) => {
    if (!csrfWajib(req, res, false)) {
      if (req.file) hapusBerkasGambar(req.file.filename);
      return;
    }

    const idGuru = req.session.user.id;
    const id = Number(req.query.id || req.body.id || 0);
    let soal = null;
    if (id) {
      soal = db.soal.find((s) => s.id_soal === id && s.id_guru === idGuru) || null;
      if (!soal) {
        if (req.file) hapusBerkasGambar(req.file.filename);
        setFlash(req, 'Soal tidak ditemukan.', 'err');
        return res.redirect(url('guru/soal.php'));
      }
    }

    const kata = String(req.body.kata || '').trim();
    const arti = String(req.body.arti || '').trim();
    let galat = '';

    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        galat = 'Ukuran gambar maksimal 1 MB.';
      } else {
        galat = uploadErr.message || 'Gambar gagal diunggah. Coba lagi.';
      }
    } else if (!kata || !arti) {
      galat = 'Kata bahasa Inggris dan arti wajib diisi.';
    } else if (kata.length > 100 || arti.length > 100) {
      galat = 'Kata dan arti maksimal 100 karakter.';
    } else if (!/^[\p{L}\s'\-]+$/u.test(kata)) {
      galat = 'Kata bahasa Inggris hanya boleh berisi huruf.';
    } else if (!soal && !req.file) {
      galat = 'Gambar soal wajib dipilih.';
    }

    if (galat) {
      if (req.file) hapusBerkasGambar(req.file.filename);
      return res.render('guru/soal-form', {
        ...buildViewLocals(req, soal ? 'Ubah Soal' : 'Tambah Soal', {
          back: 'guru/soal.php',
          scriptKey: 'soal-form|',
        }),
        soal,
        galat,
        kata,
        arti,
      });
    }

    if (soal) {
      const lama = req.file ? soal.gambar : null;
      soal.kata_inggris = kata;
      soal.arti_indonesia = arti;
      if (req.file) soal.gambar = req.file.filename;
      soal.diubah_pada = new Date().toISOString();
      if (lama) hapusBerkasGambar(lama);
      setFlash(req, 'Soal berhasil diubah.');
    } else {
      db.soal.push({
        id_soal: nextId('soal'),
        kata_inggris: kata,
        arti_indonesia: arti,
        gambar: req.file.filename,
        id_guru: idGuru,
        dibuat_pada: new Date().toISOString(),
        diubah_pada: null,
      });
      setFlash(req, 'Soal berhasil ditambahkan.');
    }

    res.redirect(url('guru/soal.php'));
  });
});

router.get('/guru/soal-hapus.php', wajibPeran('guru'), (req, res) => {
  const idGuru = req.session.user.id;
  const id = Number(req.query.id || 0);
  const s = db.soal.find((x) => x.id_soal === id && x.id_guru === idGuru);
  if (!s) {
    setFlash(req, 'Soal tidak ditemukan.', 'err');
    return res.redirect(url('guru/soal.php'));
  }

  res.render('guru/soal-hapus', {
    ...buildViewLocals(req, 'Konfirmasi Hapus Soal', {
      back: 'guru/soal.php',
      scriptKey: 'soal-hapus|',
    }),
    id,
    s,
    gambarUrl,
  });
});

router.post('/guru/soal-hapus.php', wajibPeran('guru'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;
  const idGuru = req.session.user.id;
  const id = Number(req.query.id || req.body.id || 0);
  const idx = db.soal.findIndex((x) => x.id_soal === id && x.id_guru === idGuru);
  if (idx === -1) {
    setFlash(req, 'Soal tidak ditemukan.', 'err');
    return res.redirect(url('guru/soal.php'));
  }
  const [removed] = db.soal.splice(idx, 1);
  hapusBerkasGambar(removed.gambar);
  setFlash(req, 'Soal beserta gambarnya berhasil dihapus.');
  res.redirect(url('guru/soal.php'));
});

export default router;
