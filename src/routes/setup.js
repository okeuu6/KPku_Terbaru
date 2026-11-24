import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  countOperators,
  countGuru,
  createFirstOperator,
  loadSampleData,
} from '../db.js';
import { enkripsiPin } from '../crypto.js';
import { asyncHandler, url, wajibPeran, csrfWajib, setFlash, buildViewLocals } from '../helpers.js';

const router = Router();

router.get(
  ['/setup/index.php', '/setup/buat-operator.php', '/setup'],
  asyncHandler(async (req, res) => {
    const ada = await countOperators();
    res.render('setup/index', {
      ...buildViewLocals(req, 'Setup', { scriptKey: 'setup|' }),
      ada,
      info: '',
      galat: '',
    });
  })
);

router.post(
  ['/setup/index.php', '/setup/buat-operator.php'],
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;
    const ada = await countOperators();
    if (ada > 0) {
      return res.redirect(url('setup/index.php'));
    }

    const nama = String(req.body.nama || '').trim();
    const user = String(req.body.username || '').trim();
    const pw = String(req.body.password || '');
    const ulang = String(req.body.ulang || '');
    let galat = '';
    let info = '';

    if (!nama || !/^[A-Za-z0-9_.\-]{3,50}$/.test(user)) {
      galat = 'Nama wajib diisi dan username 3–50 karakter (huruf/angka/._-).';
    } else if (pw.length < 8) {
      galat = 'Sandi minimal 8 karakter.';
    } else if (pw !== ulang) {
      galat = 'Pengulangan sandi tidak sama.';
    } else {
      await createFirstOperator({
        nama,
        username: user,
        passwordHash: bcrypt.hashSync(pw, 10),
      });
      info = 'Operator pertama berhasil dibuat. Silakan login.';
    }

    res.render('setup/index', {
      ...buildViewLocals(req, 'Setup Operator Pertama', { scriptKey: 'setup|' }),
      ada: info ? 0 : await countOperators(),
      info,
      galat,
    });
  })
);

router.get(
  '/setup/data-contoh.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    if ((await countGuru()) > 0) {
      setFlash(req, 'Data contoh hanya dapat dimuat saat data guru masih kosong.', 'err');
      return res.redirect(url('operator/index.php'));
    }
    res.render('setup/data-contoh', {
      ...buildViewLocals(req, 'Muat Data Contoh', { back: 'operator/index.php', scriptKey: 'data-contoh|' }),
      galat: '',
    });
  })
);

router.post(
  '/setup/data-contoh.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;
    if ((await countGuru()) > 0) {
      setFlash(req, 'Data contoh hanya dapat dimuat saat data guru masih kosong.', 'err');
      return res.redirect(url('operator/index.php'));
    }

    const pw = String(req.body.sandi || '');
    const pin = String(req.body.pin || '');
    let galat = '';

    if (pw.length < 8) {
      galat = 'Sandi akun contoh minimal 8 karakter.';
    } else if (!/^\d{4}$/.test(pin)) {
      galat = 'PIN contoh harus 4 angka.';
    } else {
      await loadSampleData({
        operatorId: req.session.user.id,
        passwordHash: bcrypt.hashSync(pw, 10),
        pinHash: bcrypt.hashSync(pin, 10),
        pinEncrypted: enkripsiPin(pin),
      });

      setFlash(
        req,
        'Data contoh dimuat. Akun: guru.contoh dan kepsek.contoh (sandi sesuai isian Anda). Kode kelas: KLS4A, siswa memakai PIN isian Anda.'
      );
      return res.redirect(url('operator/index.php'));
    }

    res.render('setup/data-contoh', {
      ...buildViewLocals(req, 'Muat Data Contoh', { back: 'operator/index.php', scriptKey: 'data-contoh|' }),
      galat,
    });
  })
);

export default router;
