import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, nextId, resetSeedData } from '../store.js';
import { enkripsiPin } from '../crypto.js';
import {
  url,
  hapusBerkasGambar,
  wajibPeran,
  csrfWajib,
  setFlash,
  buildViewLocals,
} from '../helpers.js';

const router = Router();

const JENIS = {
  guru: { key: 'guru', pk: 'id_guru', judul: 'Data Guru', satu: 'guru' },
  siswa: { key: 'siswa', pk: 'nisn', judul: 'Data Siswa', satu: 'siswa' },
  kepsek: { key: 'kepsek', pk: 'id_kepsek', judul: 'Data Kepala Sekolah', satu: 'kepala sekolah' },
  operator: { key: 'operator', pk: 'id_operator', judul: 'Data Operator', satu: 'operator' },
  kelas: { key: 'kelas', pk: 'id_kelas', judul: 'Data Kelas', satu: 'kelas' },
};

function ambilBaris(key, pk, id) {
  return db[key].find((r) => String(r[pk]) === String(id)) || null;
}

function usernameDipakai(u, jenis, idSendiri) {
  for (const j of ['guru', 'kepsek', 'operator']) {
    const cfg = JENIS[j];
    const r = db[cfg.key].find((x) => x.username === u);
    if (r && !(j === jenis && String(r[cfg.pk]) === String(idSendiri))) {
      return true;
    }
  }
  return false;
}

router.get('/operator/index.php', wajibPeran('operator'), (req, res) => {
  const kartu = [
    { jenis: 'guru', label: 'Data Guru', jml: db.guru.length, icon: '👩‍🏫', aksen: 'aksen-biru' },
    { jenis: 'siswa', label: 'Data Siswa', jml: db.siswa.length, icon: '🎒', aksen: 'aksen-oranye' },
    { jenis: 'kepsek', label: 'Data Kepala Sekolah', jml: db.kepsek.length, icon: '👔', aksen: 'aksen-kuning' },
    { jenis: 'operator', label: 'Data Operator', jml: db.operator.length, icon: '⚙️', aksen: 'aksen-ungu' },
    { jenis: 'kelas', label: 'Data Kelas', jml: db.kelas.length, icon: '🏫', aksen: 'aksen-hijau' },
  ];

  const kelasRingkas = db.kelas
    .map((k) => {
      const g = db.guru.find((x) => x.id_guru === k.id_guru);
      return {
        id_kelas: k.id_kelas,
        nama_kelas: k.nama_kelas,
        kode_kelas: k.kode_kelas,
        guru: g ? g.nama : '-',
        jmlSiswa: db.siswa.filter((s) => s.id_kelas === k.id_kelas).length,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));

  res.render('operator/index', {
    ...buildViewLocals(req, 'Dashboard', { scriptKey: 'index|' }),
    kartu,
    jmlGuru: db.guru.length,
    jmlSoal: db.soal.length,
    kelasRingkas,
  });
});

router.post('/operator/reset-demo', wajibPeran('operator'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;
  resetSeedData();
  setFlash(req, 'Data awal sekolah berhasil dipulihkan.');
  res.redirect(url('operator/index.php'));
});

router.get('/operator/daftar.php', wajibPeran('operator'), (req, res) => {
  const jenis = String(req.query.jenis || '');
  const cfg = JENIS[jenis];
  if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

  const q = String(req.query.q || '').trim();
  const ql = q.toLowerCase();

  let kol = {};
  let rows = [];

  if (jenis === 'siswa') {
    kol = { nisn: 'NISN', nama: 'Nama', nama_kelas: 'Kelas' };
    rows = db.siswa
      .map((s) => {
        const k = db.kelas.find((x) => x.id_kelas === s.id_kelas);
        return {
          id: s.nisn,
          nisn: s.nisn,
          nama: s.nama,
          nama_kelas: k ? k.nama_kelas : '-',
        };
      })
      .filter((r) => !ql || r.nama.toLowerCase().includes(ql) || r.nisn.toLowerCase().includes(ql))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  } else if (jenis === 'kelas') {
    kol = {
      nama_kelas: 'Nama Kelas',
      kode_kelas: 'Kode Kelas',
      guru: 'Guru Pengampu',
      kepsek: 'Kepala Sekolah',
    };
    rows = db.kelas
      .map((k) => {
        const g = db.guru.find((x) => x.id_guru === k.id_guru);
        const ks = db.kepsek.find((x) => x.id_kepsek === k.id_kepsek);
        return {
          id: k.id_kelas,
          nama_kelas: k.nama_kelas,
          kode_kelas: k.kode_kelas,
          guru: g ? g.nama : '-',
          kepsek: ks ? ks.nama : '-',
        };
      })
      .filter(
        (r) =>
          !ql ||
          r.nama_kelas.toLowerCase().includes(ql) ||
          r.kode_kelas.toLowerCase().includes(ql)
      )
      .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));
  } else {
    kol = { nama: 'Nama', username: 'Username' };
    rows = db[cfg.key]
      .map((r) => ({
        id: r[cfg.pk],
        nama: r.nama,
        username: r.username,
      }))
      .filter(
        (r) => !ql || r.nama.toLowerCase().includes(ql) || r.username.toLowerCase().includes(ql)
      )
      .sort((a, b) => a.nama.localeCompare(b.nama));
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
});

router.get('/operator/form.php', wajibPeran('operator'), (req, res) => {
  const jenis = String(req.query.jenis || '');
  const cfg = JENIS[jenis];
  if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

  const id = String(req.query.id || '');
  let row = null;
  if (id !== '') {
    row = ambilBaris(cfg.key, cfg.pk, id);
    if (!row) {
      setFlash(req, 'Data tidak ditemukan.', 'err');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }
  }

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
    gurus: [...db.guru].sort((a, b) => a.nama.localeCompare(b.nama)),
    kepseks: [...db.kepsek].sort((a, b) => a.nama.localeCompare(b.nama)),
    kelasL: [...db.kelas].sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas)),
  });
});

router.post('/operator/form.php', wajibPeran('operator'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;

  const jenis = String(req.body.jenis || req.query.jenis || '');
  const cfg = JENIS[jenis];
  if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

  const id = String(req.body.id || req.query.id || '');
  let row = null;
  if (id !== '') {
    row = ambilBaris(cfg.key, cfg.pk, id);
    if (!row) {
      setFlash(req, 'Data tidak ditemukan.', 'err');
      return res.redirect(url('operator/daftar.php?jenis=' + jenis));
    }
  }

  const v = { ...req.body };
  const me = req.session.user.id;
  let galat = '';

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
    } else if (usernameDipakai(user, jenis, id)) {
      galat = 'Username sudah dipakai. Pilih username lain.';
    } else if (row) {
      row.nama = nama;
      row.username = user;
      if (pw !== '') row.password = bcrypt.hashSync(pw, 10);
    } else {
      const newObj = {
        [cfg.pk]: nextId(cfg.key),
        nama,
        username: user,
        password: bcrypt.hashSync(pw, 10),
        dibuat_oleh: me,
      };
      db[cfg.key].push(newObj);
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
    } else if (!ambilBaris('kelas', 'id_kelas', kls)) {
      galat = 'Pilih kelas terlebih dahulu.';
    } else if (!row && !/^\d{4}$/.test(pin)) {
      galat = 'PIN wajib 4 digit angka.';
    } else if (row && pin !== '' && !/^\d{4}$/.test(pin)) {
      galat = 'PIN baru harus 4 digit angka.';
    } else if (!row && db.siswa.some((s) => s.nisn === nisn)) {
      galat = 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.';
    } else if (row) {
      row.nama = nama;
      row.id_kelas = kls;
      if (pin !== '') {
        row.sandi_hash = bcrypt.hashSync(pin, 10);
        row.sandi_terenkripsi = enkripsiPin(pin);
      }
    } else {
      db.siswa.push({
        nisn,
        nama,
        sandi_hash: bcrypt.hashSync(pin, 10),
        sandi_terenkripsi: enkripsiPin(pin),
        id_kelas: kls,
        dibuat_oleh: me,
      });
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
    } else if (!ambilBaris('guru', 'id_guru', g)) {
      galat = 'Pilih guru pengampu.';
    } else if (ks && !ambilBaris('kepsek', 'id_kepsek', ks)) {
      galat = 'Kepala sekolah tidak valid.';
    } else if (
      db.kelas.some(
        (k) => k.kode_kelas.toUpperCase() === kode && (!row || k.id_kelas !== row.id_kelas)
      )
    ) {
      galat = 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.';
    } else if (row) {
      row.nama_kelas = nk;
      row.kode_kelas = kode;
      row.id_guru = g;
      row.id_kepsek = ks || null;
    } else {
      db.kelas.push({
        id_kelas: nextId('kelas'),
        nama_kelas: nk,
        kode_kelas: kode,
        id_guru: g,
        id_kepsek: ks || null,
        dibuat_oleh: me,
      });
    }
  }

  if (!galat) {
    setFlash(req, row ? 'Data berhasil diubah.' : 'Data berhasil ditambahkan.');
    return res.redirect(url('operator/daftar.php?jenis=' + jenis));
  }

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
    gurus: [...db.guru].sort((a, b) => a.nama.localeCompare(b.nama)),
    kepseks: [...db.kepsek].sort((a, b) => a.nama.localeCompare(b.nama)),
    kelasL: [...db.kelas].sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas)),
  });
});

function cekBlokir(jenis, id, sessionUserId) {
  if (jenis === 'guru') {
    if (db.kelas.some((k) => k.id_guru === Number(id))) {
      return 'Guru ini masih mengampu kelas. Ubah guru pengampu kelas tersebut terlebih dahulu.';
    }
  } else if (jenis === 'kelas') {
    if (db.siswa.some((s) => s.id_kelas === Number(id))) {
      return 'Kelas ini masih berisi siswa. Pindahkan atau hapus siswa di dalamnya terlebih dahulu.';
    }
  } else if (jenis === 'operator') {
    if (String(id) === String(sessionUserId)) {
      return 'Anda tidak dapat menghapus akun Operator yang sedang digunakan.';
    }
    if (db.operator.length <= 1) {
      return 'Tidak dapat menghapus Operator terakhir.';
    }
  }
  return null;
}

router.get('/operator/hapus.php', wajibPeran('operator'), (req, res) => {
  const jenis = String(req.query.jenis || '');
  const cfg = JENIS[jenis];
  if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

  const id = String(req.query.id || '');
  const row = ambilBaris(cfg.key, cfg.pk, id);
  if (!row) {
    setFlash(req, 'Data tidak ditemukan.', 'err');
    return res.redirect(url('operator/daftar.php?jenis=' + jenis));
  }

  const blokir = cekBlokir(jenis, id, req.session.user.id);
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
});

router.post('/operator/hapus.php', wajibPeran('operator'), (req, res) => {
  if (!csrfWajib(req, res, false)) return;

  const jenis = String(req.body.jenis || req.query.jenis || '');
  const cfg = JENIS[jenis];
  if (!cfg) return res.status(404).send('Jenis data tidak dikenal.');

  const id = String(req.body.id || req.query.id || '');
  const idx = db[cfg.key].findIndex((r) => String(r[cfg.pk]) === String(id));
  if (idx === -1) {
    setFlash(req, 'Data tidak ditemukan.', 'err');
    return res.redirect(url('operator/daftar.php?jenis=' + jenis));
  }

  const blokir = cekBlokir(jenis, id, req.session.user.id);
  if (blokir) {
    setFlash(req, blokir, 'err');
    return res.redirect(url('operator/daftar.php?jenis=' + jenis));
  }

  if (jenis === 'guru') {
    const idG = Number(id);
    db.soal = db.soal.filter((s) => {
      if (s.id_guru === idG) {
        hapusBerkasGambar(s.gambar);
        return false;
      }
      return true;
    });
  } else if (jenis === 'siswa') {
    db.poin = db.poin.filter((p) => p.nisn !== id);
  } else if (jenis === 'kepsek') {
    const idK = Number(id);
    db.kelas.forEach((k) => {
      if (k.id_kepsek === idK) k.id_kepsek = null;
    });
  }

  db[cfg.key].splice(idx, 1);
  setFlash(req, 'Data ' + cfg.satu + ' berhasil dihapus.');
  res.redirect(url('operator/daftar.php?jenis=' + jenis));
});

export default router;
