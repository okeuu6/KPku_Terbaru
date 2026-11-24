import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, nextId } from '../store.js';
import { enkripsiPin } from '../crypto.js';
import { url, wajibPeran, csrfWajib, setFlash, buildViewLocals } from '../helpers.js';

const router = Router();

router.get(['/setup/index.php', '/setup/buat-operator.php', '/setup'], (req, res) => {
  res.render('setup/index', {
    ...buildViewLocals(req, 'Setup', { scriptKey: 'setup|' }),
    ada: db.operator.length,
    info: '',
    galat: '',
  });
});

router.post(['/setup/index.php', '/setup/buat-operator.php'], (req, res) => {
  if (!csrfWajib(req, res, false)) return;
  if (db.operator.length > 0) {
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
    db.operator.push({
      id_operator: nextId('operator'),
      nama,
      username: user,
      password: bcrypt.hashSync(pw, 10),
      dibuat_oleh: null,
    });
    info = 'Operator pertama berhasil dibuat. Silakan login.';
  }

  res.render('setup/index', {
    ...buildViewLocals(req, 'Setup Operator Pertama', { scriptKey: 'setup|' }),
    ada: info ? 0 : db.operator.length,
    info,
    galat,
  });
});

router.get('/setup/data-contoh.php', wajibPeran('operator'), (req, res) => {
  if (db.guru.length > 0) {
    setFlash(req, 'Data contoh hanya dapat dimuat saat data guru masih kosong.', 'err');
    return res.redirect(url('operator/index.php'));
  }
  res.render('setup/data-contoh', {
    ...buildViewLocals(req, 'Muat Data Contoh', { back: 'operator/index.php', scriptKey: 'data-contoh|' }),
    galat: '',
  });
});

router.post('/setup/data-contoh.php', wajibPeran('operator'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;
  if (db.guru.length > 0) {
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
    const me = req.session.user.id;
    const h = bcrypt.hashSync(pw, 10);

    const idg = nextId('guru');
    db.guru.push({ id_guru: idg, nama: 'Guru Contoh', username: 'guru.contoh', password: h, dibuat_oleh: me });

    const idk = nextId('kepsek');
    db.kepsek.push({
      id_kepsek: idk,
      nama: 'Kepala Sekolah Contoh',
      username: 'kepsek.contoh',
      password: h,
      dibuat_oleh: me,
    });

    const idkl = nextId('kelas');
    db.kelas.push({
      id_kelas: idkl,
      nama_kelas: 'Kelas 4A (contoh)',
      kode_kelas: 'KLS4A',
      id_guru: idg,
      id_kepsek: idk,
      dibuat_oleh: me,
    });

    const pHash = bcrypt.hashSync(pin, 10);
    const pEnc = enkripsiPin(pin);
    for (const [n, nm] of [
      ['0000000001', 'Budi Santoso'],
      ['0000000002', 'Siti Nurhaliza'],
    ]) {
      if (!db.siswa.some((s) => s.nisn === n)) {
        db.siswa.push({
          nisn: n,
          nama: nm,
          sandi_hash: pHash,
          sandi_terenkripsi: pEnc,
          id_kelas: idkl,
          dibuat_oleh: me,
        });
      }
    }

    const now = new Date().toISOString();
    for (const [k, a, g] of [
      ['Apple', 'Apel', 'apple'],
      ['Book', 'Buku', 'book'],
      ['Chair', 'Kursi', 'chair'],
      ['Table', 'Meja', 'table'],
      ['Ball', 'Bola', 'ball'],
      ['Pencil', 'Pensil', 'pencil'],
      ['Bag', 'Tas', 'bag'],
      ['Clock', 'Jam', 'clock'],
    ]) {
      db.soal.push({
        id_soal: nextId('soal'),
        kata_inggris: k,
        arti_indonesia: a,
        gambar: `contoh/${g}.svg`,
        id_guru: idg,
        dibuat_pada: now,
        diubah_pada: null,
      });
    }

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
});

export default router;
