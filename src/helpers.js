import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { findStaffByUsername } from './db.js';

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function url(p = '') {
  return '/' + String(p).replace(/^\/+/, '');
}

export function gambarUrl(g) {
  const s = String(g || '');
  return s.startsWith('contoh/') ? url('assets/img/' + s) : url('uploads/soal/' + s);
}

export function hapusBerkasGambar(g) {
  const s = String(g || '');
  if (!s || s.startsWith('contoh/') || s.includes('/') || s.includes('\\') || s.includes('..')) return;
  const uploadDir = path.resolve(process.cwd(), 'uploads', 'soal');
  const resolved = path.resolve(uploadDir, s);
  if (!resolved.startsWith(uploadDir + path.sep)) return;
  if (fs.existsSync(resolved)) {
    try { fs.unlinkSync(resolved); } catch {}
  }
}

export function tglId(dt) {
  const b = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return `${d.getDate()} ${b[d.getMonth() + 1]} ${d.getFullYear()}`;
}

export function csrfToken(req) {
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrf;
}

export function csrfField(req) {
  return `<input type="hidden" name="csrf" value="${csrfToken(req)}">`;
}

export function csrfValid(req) {
  const sent = (req.body && req.body.csrf) || req.get('X-CSRF-Token') || '';
  if (typeof sent !== 'string' || !req.session.csrf || sent.length !== req.session.csrf.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(req.session.csrf), Buffer.from(sent));
}

export function csrfWajib(req, res, apiMode = false) {
  if (!csrfValid(req)) {
    if (apiMode) {
      res.status(419).json({ ok: false, pesan: 'Sesi formulir tidak valid. Muat ulang halaman.' });
    } else {
      res.status(419).send('Sesi formulir tidak valid atau kedaluwarsa. Silakan kembali dan muat ulang halaman.');
    }
    return false;
  }
  return true;
}

export function setFlash(req, pesan, tipe = 'ok') {
  req.session.flash = [pesan, tipe];
}

export function popFlash(req) {
  const f = req.session.flash || null;
  delete req.session.flash;
  return f;
}

export function labelPeran(r) {
  return {
    siswa: 'Siswa',
    guru: 'Guru',
    kepsek: 'Kepala Sekolah',
    operator: 'Operator',
  }[r] || '';
}

export function menuPeran(r) {
  const m = {
    guru: [
      ['guru/index.php', 'Kelas Tersedia', /^(index|data-siswa)\|/],
      ['guru/soal.php', 'Kelola Soal Kuis', /^soal/],
    ],
    kepsek: [
      ['kepsek/index.php', 'Dashboard', /^index\|/],
      ['kepsek/data-kelas.php', 'Data Kelas', /^data-kelas/],
      ['kepsek/poin-tertinggi.php', 'Siswa Poin Tertinggi', /^poin-tertinggi/],
      ['kepsek/nama-guru.php', 'Nama Guru', /^nama-guru/],
    ],
    operator: [
      ['operator/index.php', 'Dashboard', /^index\|/],
      ['operator/daftar.php?jenis=guru', 'Data Guru', /\|guru$/],
      ['operator/daftar.php?jenis=siswa', 'Data Siswa', /\|siswa$/],
      ['operator/daftar.php?jenis=kepsek', 'Data Kepala Sekolah', /\|kepsek$/],
      ['operator/daftar.php?jenis=operator', 'Data Operator', /\|operator$/],
      ['operator/daftar.php?jenis=kelas', 'Data Kelas', /\|kelas$/],
    ],
  };
  return m[r] || [];
}

export function buildViewLocals(req, judul, opts = {}) {
  const user = req.session && req.session.user ? req.session.user : null;
  const r = user ? user.role : null;
  const staf = Boolean(r && r !== 'siswa');
  const scriptKey = opts.scriptKey || 'index|';
  return {
    judul,
    config,
    user,
    role: r,
    staf,
    scriptKey,
    back: opts.back || null,
    flashMsg: popFlash(req),
    csrf: csrfToken(req),
    csrfFieldHtml: csrfField(req),
    url,
    gambarUrl,
    tglId,
    labelPeran,
    menuList: r ? menuPeran(r) : [],
    tahun: new Date().getFullYear(),
    jsFiles: opts.js || [],
  };
}

export function autoLogoutMiddleware(req, res, next) {
  if (req.session && req.session.user && req.session.aktif) {
    const idleMs = Date.now() - req.session.aktif;
    if (idleMs > config.autoLogoutMenit * 60 * 1000) {
      const isApi = req.path.startsWith('/api/');
      req.session.destroy(() => {
        if (isApi) {
          return res.status(401).json({ ok: false, pesan: 'Sesi berakhir. Silakan masuk lagi.', habis: true });
        }
        return res.redirect(url('index.php?habis=1'));
      });
      return;
    }
  }
  if (req.session && req.session.user) {
    req.session.aktif = Date.now();
  }
  next();
}

export function wajibPeran(...boleh) {
  return (req, res, next) => {
    const isApi = req.path.startsWith('/api/');
    const user = req.session && req.session.user;
    if (!user || !user.role) {
      if (isApi) {
        return res.status(401).json({ ok: false, pesan: 'Silakan masuk terlebih dahulu.' });
      }
      const targetRole = (boleh.length === 1 && boleh[0] === 'siswa') ? 'siswa' : boleh[0];
      return res.redirect(url('index.php?peran=' + targetRole));
    }
    if (!boleh.includes(user.role)) {
      if (isApi) {
        return res.status(403).json({ ok: false, pesan: 'Akses ditolak.' });
      }
      return res.status(403).send(
        `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
        + `<body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Akses ditolak</h2>`
        + `<p>Halaman ini bukan untuk peran Anda.</p><p><a href="${url('index.php')}">Kembali ke awal</a></p></body>`
      );
    }
    if (user.role === 'kepsek' && req.method !== 'GET') {
      if (isApi) {
        return res.status(403).json({ ok: false, pesan: 'Kepala Sekolah hanya dapat melihat data.' });
      }
      return res.status(403).send('Kepala Sekolah hanya dapat melihat data.');
    }
    next();
  };
}

export function terlaluBanyakPercobaan(req) {
  const now = Math.floor(Date.now() / 1000);
  return (req.session.gagal || 0) >= 5 && (now - (req.session.gagal_t || 0)) < 30;
}

export function catatGagal(req) {
  const now = Math.floor(Date.now() / 1000);
  if (now - (req.session.gagal_t || 0) >= 30) req.session.gagal = 0;
  req.session.gagal = (req.session.gagal || 0) + 1;
  req.session.gagal_t = now;
}

export function resetGagal(req) {
  delete req.session.gagal;
  delete req.session.gagal_t;
}

export async function loginStaf(req, username, sandi, hanya = null) {
  if (terlaluBanyakPercobaan(req)) {
    return 'Terlalu banyak percobaan. Tunggu 30 detik lalu coba lagi.';
  }
  const roles = ['guru', 'kepsek', 'operator'];
  for (const role of roles) {
    if (hanya !== null && role !== hanya) continue;
    const row = await findStaffByUsername(role, username);
    if (row && bcrypt.compareSync(sandi, row.password)) {
      resetGagal(req);
      req.session.user = {
        role,
        id: Number(row.id),
        nama: row.nama,
        username: row.username,
      };
      req.session.aktif = Date.now();
      return null;
    }
  }
  catatGagal(req);
  return 'Username atau sandi salah.';
}
