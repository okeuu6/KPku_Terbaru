export const config = {
  port: Number(process.env.PORT) || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'kpku-inggris-sd-session-secret-2026-default-key',
  encKey: process.env.ENC_KEY || 'KPKU-MEDIA-BELAJAR-INGGRIS-SD-32-CHAR-KEY',
  namaSekolah: process.env.NAMA_SEKOLAH || 'SD Contoh',
  namaAplikasi: process.env.NAMA_APLIKASI || 'Media Belajar Inggris SD',
  soalPerSesi: Number(process.env.SOAL_PER_SESI) || 10,
  poinPerBenar: Number(process.env.POIN_PER_BENAR) || 10,
  autoLogoutMenit: Number(process.env.AUTO_LOGOUT_MENIT) || 30,
  maxGambarByte: Number(process.env.MAX_GAMBAR_BYTE) || 1048576,
};
