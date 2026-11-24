import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import {
  listKelasByGuru,
  listSoalByGuru,
  getKelasOwnedByGuru,
  listSiswaDetailByKelas,
  getSoalOwnedByGuru,
  insertSoal,
  updateSoal,
  deleteSoal,
} from '../db.js';
import { config } from '../config.js';
import { dekripsiPin } from '../crypto.js';
import {
  asyncHandler,
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

router.get(
  '/guru/index.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    const idGuru = req.session.user.id;
    const [kelas, soalGuru] = await Promise.all([
      listKelasByGuru(idGuru),
      listSoalByGuru(idGuru),
    ]);

    const totalSiswa = kelas.reduce((acc, k) => acc + k.jml, 0);
    const jmlSoal = soalGuru.length;

    res.render('guru/index', {
      ...buildViewLocals(req, 'Kelas Tersedia', { scriptKey: 'index|' }),
      kelas,
      totalSiswa,
      jmlSoal,
      soalPreview: soalGuru.slice(0, 6),
      gambarUrl,
    });
  })
);

router.get(
  '/guru/data-siswa.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    const idGuru = req.session.user.id;
    const id = Number(req.query.id || 0);
    const k = await getKelasOwnedByGuru(id, idGuru);
    if (!k) {
      setFlash(req, 'Kelas tidak ditemukan atau bukan kelas yang diampu.', 'err');
      return res.redirect(url('guru/index.php'));
    }

    const rawSiswa = await listSiswaDetailByKelas(id);
    const siswa = rawSiswa.map((s) => ({
      nisn: s.nisn,
      nama: s.nama,
      pin: dekripsiPin(s.sandi_terenkripsi),
      total: s.total,
    }));

    res.render('guru/data-siswa', {
      ...buildViewLocals(req, 'Data Siswa', { back: 'guru/index.php', scriptKey: 'data-siswa|' }),
      k,
      siswa,
    });
  })
);

router.get(
  '/guru/soal.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    const idGuru = req.session.user.id;
    const q = String(req.query.q || '').trim();
    const soal = await listSoalByGuru(idGuru, q);

    res.render('guru/soal', {
      ...buildViewLocals(req, 'Kelola Soal Kuis', { scriptKey: 'soal|' }),
      q,
      soal,
    });
  })
);

router.get(
  '/guru/soal-form.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    const idGuru = req.session.user.id;
    const id = Number(req.query.id || 0);
    let soal = null;
    if (id) {
      soal = await getSoalOwnedByGuru(id, idGuru);
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
  })
);

router.post('/guru/soal-form.php', wajibPeran('guru'), (req, res, next) => {
  upload.single('gambar')(req, res, async (uploadErr) => {
    try {
      if (!csrfWajib(req, res, false)) {
        if (req.file) hapusBerkasGambar(req.file.filename);
        return;
      }

      const idGuru = req.session.user.id;
      const id = Number(req.query.id || req.body.id || 0);
      let soal = null;
      if (id) {
        soal = await getSoalOwnedByGuru(id, idGuru);
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
        await updateSoal(soal.id_soal, idGuru, {
          kata_inggris: kata,
          arti_indonesia: arti,
          gambar: req.file ? req.file.filename : null,
        });
        if (lama) hapusBerkasGambar(lama);
        setFlash(req, 'Soal berhasil diubah.');
      } else {
        await insertSoal({
          kata_inggris: kata,
          arti_indonesia: arti,
          gambar: req.file.filename,
          id_guru: idGuru,
        });
        setFlash(req, 'Soal berhasil ditambahkan.');
      }

      res.redirect(url('guru/soal.php'));
    } catch (err) {
      if (req.file) hapusBerkasGambar(req.file.filename);
      next(err);
    }
  });
});

router.get(
  '/guru/soal-hapus.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    const idGuru = req.session.user.id;
    const id = Number(req.query.id || 0);
    const s = await getSoalOwnedByGuru(id, idGuru);
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
  })
);

router.post(
  '/guru/soal-hapus.php',
  wajibPeran('guru'),
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;
    const idGuru = req.session.user.id;
    const id = Number(req.query.id || req.body.id || 0);
    const removed = await deleteSoal(id, idGuru);
    if (!removed) {
      setFlash(req, 'Soal tidak ditemukan.', 'err');
      return res.redirect(url('guru/soal.php'));
    }
    hapusBerkasGambar(removed.gambar);
    setFlash(req, 'Soal beserta gambarnya berhasil dihapus.');
    res.redirect(url('guru/soal.php'));
  })
);

export default router;
