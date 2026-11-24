import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch (err) {
    console.warn('[Config] Gagal membaca berkas .env:', err.message);
  }
}

loadDotEnv();

const ephemeralSessionSecret = crypto.randomBytes(32).toString('hex');
const ephemeralEncKey = crypto.randomBytes(32).toString('hex');

export const hasExplicitEncKey = Boolean(process.env.ENC_KEY && process.env.ENC_KEY.trim() !== '');

export const config = {
  port: Number(process.env.PORT) || 3000,
  sessionSecret: (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) || ephemeralSessionSecret,
  encKey: (process.env.ENC_KEY && process.env.ENC_KEY.trim()) || ephemeralEncKey,
  namaSekolah: process.env.NAMA_SEKOLAH || 'SD Contoh',
  namaAplikasi: process.env.NAMA_APLIKASI || 'Media Belajar Inggris SD',
  soalPerSesi: Number(process.env.SOAL_PER_SESI) || 10,
  poinPerBenar: Number(process.env.POIN_PER_BENAR) || 10,
  autoLogoutMenit: Number(process.env.AUTO_LOGOUT_MENIT) || 30,
  maxGambarByte: Number(process.env.MAX_GAMBAR_BYTE) || 1048576,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'kuis_inggris',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS ?? '',
    enabled: process.env.DB_DRIVER !== 'memory',
  },
};
