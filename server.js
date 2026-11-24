import path from 'node:path';
import express from 'express';
import session from 'express-session';
import { config } from './src/config.js';
import { initDb } from './src/db.js';
import { autoLogoutMiddleware } from './src/helpers.js';
import authRoutes from './src/routes/auth.js';
import siswaRoutes from './src/routes/siswa.js';
import apiRoutes from './src/routes/api.js';
import guruRoutes from './src/routes/guru.js';
import kepsekRoutes from './src/routes/kepsek.js';
import operatorRoutes from './src/routes/operator.js';
import setupRoutes from './src/routes/setup.js';

const app = express();
const rootDir = process.cwd();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Single shared MemoryStore so sessions persist across requests
const sessionStore = new session.MemoryStore();
const httpsSession = session({
  name: 'KUISINGGRIS',
  secret: config.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'none', secure: true },
});
const httpSession = session({
  name: 'KUISINGGRIS',
  secret: config.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false },
});

app.use((req, res, next) => {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  return (isHttps ? httpsSession : httpSession)(req, res, next);
});

app.use(autoLogoutMiddleware);

// Serve static assets and uploaded question images
app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// Application routes
app.use(authRoutes);
app.use(siswaRoutes);
app.use(apiRoutes);
app.use(guruRoutes);
app.use(kepsekRoutes);
app.use(operatorRoutes);
app.use(setupRoutes);

app.use((req, res) => {
  res.status(404).send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Halaman tidak ditemukan</h2>`
    + `<p><a href="/">Kembali ke beranda</a></p></body>`
  );
});

app.use((err, req, res, _next) => {
  console.error('[Server Error]', err && err.message ? err.message : err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ ok: false, pesan: 'Terjadi kesalahan pada server.' });
  }
  res.status(500).send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Terjadi kesalahan server</h2>`
    + `<p>Silakan coba lagi beberapa saat atau periksa koneksi database Anda.</p>`
    + `<p><a href="/">Kembali ke beranda</a></p></body>`
  );
});

await initDb();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Media Belajar Inggris SD (KPKu) listening on http://localhost:${config.port} (0.0.0.0:${config.port})`);
});
