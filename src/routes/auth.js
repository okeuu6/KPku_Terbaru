import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  isMysqlMode,
  getKelasById,
  getKelasByKode,
  listKodeKelas,
  listSiswaWithPoinByKelas,
  findSiswaLogin,
} from '../db.js';
import { config } from '../config.js';
import {
  asyncHandler,
  url,
  csrfToken,
  csrfField,
  csrfWajib,
  terlaluBanyakPercobaan,
  catatGagal,
  loginStaf,
} from '../helpers.js';

const router = Router();

const tujuan = {
  siswa: 'siswa/menu.php',
  guru: 'guru/index.php',
  kepsek: 'kepsek/index.php',
  operator: 'operator/index.php',
};

const peranList = {
  siswa: '🎒 Siswa',
  guru: '👨‍🏫 Guru',
  kepsek: '👔 Kepala Sekolah',
  operator: '⚙️ Operator',
};

async function renderLanding(req, res, { tab = 'siswa', galat = '', kodeIsi = '', postValues = {} } = {}) {
  const userAktif = (req.session && req.session.user) || null;
  const roleAktif = userAktif ? userAktif.role : null;

  let kelas = null;
  let daftarSiswa = [];
  if (tab === 'siswa' && req.session && req.session.kelas_pending) {
    const foundKelas = await getKelasById(req.session.kelas_pending);
    if (foundKelas) {
      kelas = foundKelas;
      daftarSiswa = await listSiswaWithPoinByKelas(foundKelas.id_kelas);
    } else {
      delete req.session.kelas_pending;
      delete req.session.nama_kelas_pending;
    }
  }

  const kodeAktif = await listKodeKelas();

  res.render('index', {
    config,
    tujuan,
    userAktif,
    roleAktif,
    peranList,
    tab,
    galat,
    kodeIsi,
    postValues,
    kelas,
    daftarSiswa,
    kodeAktif,
    isMysql: isMysqlMode(),
    csrf: csrfToken(req),
    csrfFieldHtml: csrfField(req),
    url,
    tahun: new Date().getFullYear(),
    habis: req.query.habis === '1',
  });
}

router.get(
  ['/', '/index.php', '/login.php'],
  asyncHandler(async (req, res) => {
    let tab = req.query.peran || 'siswa';
    if (!peranList[tab]) tab = 'siswa';
    await renderLanding(req, res, { tab });
  })
);

router.post(
  ['/', '/index.php', '/login.php'],
  asyncHandler(async (req, res) => {
    if (!csrfWajib(req, res, false)) return;

    let tab = req.body.peran || req.query.peran || 'siswa';
    if (!peranList[tab]) tab = 'siswa';
    const aksi = req.body.aksi || '';
    let galat = '';
    let kodeIsi = '';

    if (aksi === 'kode' && tab === 'siswa') {
      kodeIsi = String(req.body.kode || '').trim().toUpperCase();
      if (!kodeIsi) {
        galat = 'Kode kelas wajib diisi ya!';
      } else {
        const k = await getKelasByKode(kodeIsi);
        if (k) {
          req.session.kelas_pending = Number(k.id_kelas);
          req.session.nama_kelas_pending = k.nama_kelas;
        } else {
          galat = 'Kode kelas tidak ditemukan. Tanyakan pada bapak/ibu gurumu ya!';
        }
      }
    } else if (aksi === 'ganti_kelas') {
      delete req.session.kelas_pending;
      delete req.session.nama_kelas_pending;
    } else if (aksi === 'masuk_siswa' && req.session.kelas_pending) {
      const nisn = String(req.body.nisn || '');
      const pin = String(req.body.pin || '');
      if (terlaluBanyakPercobaan(req)) {
        galat = 'Terlalu banyak percobaan. Tunggu 30 detik lalu coba lagi ya.';
      } else if (!nisn) {
        galat = 'Silakan pilih namamu dari daftar terlebih dahulu.';
      } else if (!/^\d{4}$/.test(pin)) {
        galat = 'PIN harus berupa 4 angka rahasiamu.';
      } else {
        const s = await findSiswaLogin(nisn, req.session.kelas_pending);
        if (s && bcrypt.compareSync(pin, s.sandi_hash)) {
          req.session.user = {
            role: 'siswa',
            id: s.nisn,
            nisn: s.nisn,
            nama: s.nama,
            id_kelas: Number(s.id_kelas),
          };
          req.session.aktif = Date.now();
          delete req.session.kelas_pending;
          delete req.session.nama_kelas_pending;
          return res.redirect(url('siswa/menu.php'));
        }
        catatGagal(req);
        galat = 'PIN salah. Coba periksa kembali atau tanya gurumu ya.';
      }
    } else if (aksi === 'staf' && tab !== 'siswa') {
      const u = String(req.body.username || '').trim();
      const p = String(req.body.sandi || '');
      if (!u || !p) {
        galat = 'Username dan kata sandi wajib diisi.';
      } else {
        const err = await loginStaf(req, u, p, tab);
        if (!err) {
          return res.redirect(url(tujuan[req.session.user.role]));
        }
        galat = err;
      }
    }

    await renderLanding(req, res, { tab, galat, kodeIsi, postValues: req.body });
  })
);

router.get(['/logout.php', '/logout'], (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('KUISINGGRIS');
    res.redirect(url('index.php'));
  });
});

export default router;
