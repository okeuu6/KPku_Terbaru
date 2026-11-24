import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  OPERATOR_JENIS,
  isMysqlMode,
  resetMemorySeed,
  getOperatorDashboardStats,
  listOperatorMaster,
  getRecordById,
  listDropdownData,
  isUsernameTaken,
  isSiswaNisnTaken,
  isKodeKelasTaken,
  saveMasterRecord,
  checkDeleteBlockReason,
  deleteMasterRecord,
} from '../db.js';
import { enkripsiPin } from '../crypto.js';
import {
  asyncHandler,
  url,
  hapusBerkasGambar,
  wajibPeran,
  csrfWajib,
  setFlash,
  buildViewLocals,
} from '../helpers.js';

const router = Router();

router.get(
  '/operator/index.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    const { counts, kelasRingkas } = await getOperatorDashboardStats();
    const kartu = [
      { jenis: 'guru', label: 'Data Guru', jml: counts.guru, icon: '👩‍🏫', aksen: 'aksen-biru' },
      { jenis: 'siswa', label: 'Data Siswa', jml: counts.siswa, icon: '🎒', aksen: 'aksen-oranye' },
      { jenis: 'kepsek', label: 'Data Kepala Sekolah', jml: counts.kepsek, icon: '👔', aksen: 'aksen-kuning' },
      { jenis: 'operator', label: 'Data Operator', jml: counts.operator, icon: '⚙️', aksen: 'aksen-ungu' },
      { jenis: 'kelas', label: 'Data Kelas', jml: counts.kelas, icon: '🏫', aksen: 'aksen-hijau' },
    ];

    res.render('operator/index', {
      ...buildViewLocals(req, 'Dashboard', { scriptKey: 'index|' }),
      kartu,
      jmlGuru: counts.guru,
      jmlSoal: counts.soal,
      kelasRingkas,
      isMysql: isMysqlMode(),
    });
  })
);

router.post('/operator/reset-demo', wajibPeran('operator'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;
  if (isMysqlMode()) {
    setFlash(req, 'Mode MySQL aktif: data database tidak direset secara otomatis.', 'err');
    return res.redirect(url('operator/index.php'));
  }
  resetMemorySeed();
  setFlash(req, 'Data awal sekolah berhasil dipulihkan.');
  res.redirect(url('operator/index.php'));
});

router.get(
  '/operator/daftar.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    const jenis = String(req.query.jenis || '');
    const cfg = OPERATOR_JENIS[jenis];
    if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

    const q = String(req.query.q || '').trim();
    const rows = await listOperatorMaster(jenis, q);

    let kol = {};
    if (jenis === 'siswa') {
      kol = { nisn: 'NISN', nama: 'Nama', nama_kelas: 'Kelas' };
    } else if (jenis === 'kelas') {
      kol = {
        nama_kelas: 'Nama Kelas',
        kode_kelas: 'Kode Kelas',
        guru: 'Guru Pengampu',
        kepsek: 'Kepala Sekolah',
      };
    } else {
      kol = { nama: 'Nama', username: 'Username' };
    }

    res.render('operator/daftar', {
      ...buildViewLocals(req, cfg.judul, {
        back: 'operator/index.php',
        scriptKey: `daftar|${jenis}`,
      }),
      jenis,
      cfg,
      q,
      kol,
      rows,
    });
  })
);

router.get(
  '/operator/form.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    const jenis = String(req.query.jenis || '');
    const cfg = OPERATOR_JENIS[jenis];
    if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

    const id = String(req.query.id || '');
    let row = null;
    if (id !== '') {
      row = await getRecordById(jenis, id);
      if (!row) {
        setFlash(req, 'Data tidak ditemukan.', 'err');
        return res.redirect(url('operator/daftar.php?jenis=' + jenis));
      }
    }

    const { gurus, kepseks, kelasL } = await listDropdownData();

    res.render('operator/form', {
      ...buildViewLocals(req, (row ? 'Ubah ' : 'Tambah ') + cfg.judul, {
        back: 'operator/daftar.php?jenis=' + jenis,
        scriptKey: `form|${jenis}`,
      }),
      jenis,
      cfg,
      id,
      row,
      v: row || {},
      galat: '',
      gurus,
      kepseks,
      kelasL,
    });
  })
);

router.post(
  '/operator/form.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;

    const jenis = String(req.body.jenis || req.query.jenis || '');
    const cfg = OPERATOR_JENIS[jenis];
    if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

    const id = String(req.body.id || req.query.id || '');
    let row = null;
    if (id !== '') {
      row = await getRecordById(jenis, id);
      if (!row) {
        setFlash(req, 'Data tidak ditemukan.', 'err');
        return res.redirect(url('operator/daftar.php?jenis=' + jenis));
      }
    }

    const v = { ...req.body };
    const me = req.session.user.id;
    let galat = '';

    try {
      if (['guru', 'kepsek', 'operator'].includes(jenis)) {
        const nama = String(req.body.nama || '').trim();
        const user = String(req.body.username || '').trim();
        const pw = String(req.body.password || '');

        if (!nama || nama.length > 100) {
          galat = 'Nama wajib diisi (maksimal 100 karakter).';
        } else if (!/^[A-Za-z0-9_.\-]{3,50}$/.test(user)) {
          galat = 'Username 3–50 karakter: huruf, angka, titik, garis bawah, atau strip.';
        } else if (!row && pw.length < 8) {
          galat = 'Sandi wajib diisi, minimal 8 karakter.';
        } else if (row && pw !== '' && pw.length < 8) {
          galat = 'Sandi baru minimal 8 karakter.';
        } else if (await isUsernameTaken(user, jenis, id)) {
          galat = 'Username sudah dipakai. Pilih username lain.';
        } else {
          await saveMasterRecord(
            jenis,
            row,
            {
              nama,
              username: user,
              passwordHash: pw !== '' ? bcrypt.hashSync(pw, 10) : null,
            },
            me
          );
        }
      } else if (jenis === 'siswa') {
        const nisn = row ? row.nisn : String(req.body.nisn || '').trim();
        const nama = String(req.body.nama || '').trim();
        const kls = Number(req.body.id_kelas || 0);
        const pin = String(req.body.pin || '');

        if (!/^\d{10}$/.test(nisn)) {
          galat = 'NISN harus 10 digit angka.';
        } else if (!nama || nama.length > 100) {
          galat = 'Nama siswa wajib diisi (maksimal 100 karakter).';
        } else if (!(await getRecordById('kelas', kls))) {
          galat = 'Pilih kelas terlebih dahulu.';
        } else if (!row && !/^\d{4}$/.test(pin)) {
          galat = 'PIN wajib 4 digit angka.';
        } else if (row && pin !== '' && !/^\d{4}$/.test(pin)) {
          galat = 'PIN baru harus 4 digit angka.';
        } else if (!row && (await isSiswaNisnTaken(nisn))) {
          galat = 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.';
        } else {
          await saveMasterRecord(
            'siswa',
            row,
            {
              nisn,
              nama,
              id_kelas: kls,
              sandi_hash: pin !== '' ? bcrypt.hashSync(pin, 10) : null,
              sandi_terenkripsi: pin !== '' ? enkripsiPin(pin) : null,
            },
            me
          );
        }
      } else {
        const nk = String(req.body.nama_kelas || '').trim();
        const kode = String(req.body.kode_kelas || '').trim().toUpperCase();
        const g = Number(req.body.id_guru || 0);
        const ks = Number(req.body.id_kepsek || 0);

        if (!nk || nk.length > 50) {
          galat = 'Nama kelas wajib diisi (maksimal 50 karakter).';
        } else if (!/^[A-Z0-9]{3,10}$/.test(kode)) {
          galat = 'Kode kelas 3–10 karakter huruf/angka tanpa spasi (contoh: KLS4A).';
        } else if (!(await getRecordById('guru', g))) {
          galat = 'Pilih guru pengampu.';
        } else if (ks && !(await getRecordById('kepsek', ks))) {
          galat = 'Kepala sekolah tidak valid.';
        } else if (await isKodeKelasTaken(kode, row ? row.id_kelas : null)) {
          galat = 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.';
        } else {
          await saveMasterRecord(
            'kelas',
            row,
            {
              nama_kelas: nk,
              kode_kelas: kode,
              id_guru: g,
              id_kepsek: ks || null,
            },
            me
          );
        }
      }
    } catch (err) {
      if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
        galat = 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.';
      } else {
        throw err;
      }
    }

    if (!galat) {
      setFlash(req, row ? 'Data berhasil diubah.' : 'Data berhasil ditambahkan.');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }

    const { gurus, kepseks, kelasL } = await listDropdownData();
    res.render('operator/form', {
      ...buildViewLocals(req, (row ? 'Ubah ' : 'Tambah ') + cfg.judul, {
        back: 'operator/daftar.php?jenis=' + jenis,
        scriptKey: `form|${jenis}`,
      }),
      jenis,
      cfg,
      id,
      row,
      v,
      galat,
      gurus,
      kepseks,
      kelasL,
    });
  })
);

router.get(
  '/operator/hapus.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    const jenis = String(req.query.jenis || '');
    const cfg = OPERATOR_JENIS[jenis];
    if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

    const id = String(req.query.id || '');
    const row = await getRecordById(jenis, id);
    if (!row) {
      setFlash(req, 'Data tidak ditemukan.', 'err');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }

    const blokir = await checkDeleteBlockReason(jenis, id, req.session.user.id);
    res.render('operator/hapus', {
      ...buildViewLocals(req, 'Konfirmasi Hapus', {
        back: 'operator/daftar.php?jenis=' + jenis,
        scriptKey: `hapus|${jenis}`,
      }),
      jenis,
      cfg,
      id,
      row,
      blokir,
    });
  })
);

router.post(
  '/operator/hapus.php',
  wajibPeran('operator'),
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;

    const jenis = String(req.body.jenis || req.query.jenis || '');
    const cfg = OPERATOR_JENIS[jenis];
    if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

    const id = String(req.body.id || req.query.id || '');
    const existing = await getRecordById(jenis, id);
    if (!existing) {
      setFlash(req, 'Data tidak ditemukan.', 'err');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }

    const blokir = await checkDeleteBlockReason(jenis, id, req.session.user.id);
    if (blokir) {
      setFlash(req, blokir, 'err');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }

    const gambarFiles = await deleteMasterRecord(jenis, id);
    for (const g of gambarFiles) {
      hapusBerkasGambar(g);
    }
    setFlash(req, 'Data ' + cfg.satu + ' berhasil dihapus.');
    res.redirect(url('operator/daftar.php?jenis=' + jenis));
  })
);

export default router;
