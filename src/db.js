import mysql from 'mysql2/promise';
import { config, hasExplicitEncKey } from './config.js';
import { db as memDb, nextId, resetSeedData } from './store.js';

let pool = null;
let mysqlActive = false;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS operator (
    id_operator INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dibuat_oleh INT NULL,
    CONSTRAINT fk_op_dibuat FOREIGN KEY (dibuat_oleh) REFERENCES operator(id_operator) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS kepala_sekolah (
    id_kepsek INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dibuat_oleh INT NULL,
    CONSTRAINT fk_ks_dibuat FOREIGN KEY (dibuat_oleh) REFERENCES operator(id_operator) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS guru (
    id_guru INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dibuat_oleh INT NULL,
    CONSTRAINT fk_guru_dibuat FOREIGN KEY (dibuat_oleh) REFERENCES operator(id_operator) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS kelas (
    id_kelas INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    kode_kelas VARCHAR(10) NOT NULL UNIQUE,
    id_guru INT NOT NULL,
    id_kepsek INT NULL,
    dibuat_oleh INT NULL,
    CONSTRAINT fk_kelas_guru FOREIGN KEY (id_guru) REFERENCES guru(id_guru),
    CONSTRAINT fk_kelas_kepsek FOREIGN KEY (id_kepsek) REFERENCES kepala_sekolah(id_kepsek) ON DELETE SET NULL,
    CONSTRAINT fk_kelas_dibuat FOREIGN KEY (dibuat_oleh) REFERENCES operator(id_operator) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS siswa (
    nisn VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    sandi_hash VARCHAR(255) NOT NULL,
    sandi_terenkripsi VARCHAR(255) NOT NULL,
    id_kelas INT NOT NULL,
    dibuat_oleh INT NULL,
    CONSTRAINT fk_siswa_kelas FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas),
    CONSTRAINT fk_siswa_dibuat FOREIGN KEY (dibuat_oleh) REFERENCES operator(id_operator) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS soal (
    id_soal INT AUTO_INCREMENT PRIMARY KEY,
    kata_inggris VARCHAR(100) NOT NULL,
    arti_indonesia VARCHAR(100) NOT NULL,
    gambar VARCHAR(255) NOT NULL,
    id_guru INT NOT NULL,
    dibuat_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_soal_guru FOREIGN KEY (id_guru) REFERENCES guru(id_guru) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS poin (
    id_poin INT AUTO_INCREMENT PRIMARY KEY,
    nisn VARCHAR(10) NOT NULL,
    nilai INT NOT NULL DEFAULT 0,
    tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_poin_siswa FOREIGN KEY (nisn) REFERENCES siswa(nisn) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function createMissingDatabase() {
  const dbName = config.db.database;
  if (!/^[A-Za-z0-9_]{1,64}$/.test(dbName)) {
    throw new Error('Nama database tidak valid.');
  }

  const bootstrapConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    connectTimeout: 2500,
    charset: 'utf8mb4',
  });
  try {
    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrapConn.end();
  }
}

function createMysqlPool() {
  return mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 2500,
    charset: 'utf8mb4',
  });
}

export async function initDb() {
  if (!config.db.enabled) {
    mysqlActive = false;
    console.log('[DB] DB_DRIVER=memory aktif. Menggunakan data contoh sementara.');
    return false;
  }

  try {
    pool = createMysqlPool();
    try {
      await pool.execute('SELECT 1');
    } catch (firstErr) {
      if (firstErr && firstErr.code === 'ER_BAD_DB_ERROR') {
        await pool.end().catch(() => {});
        await createMissingDatabase();
        pool = createMysqlPool();
        await pool.execute('SELECT 1');
      } else {
        throw firstErr;
      }
    }

    const [tables] = await pool.execute("SHOW TABLES LIKE 'operator'");
    if (!tables.length) {
      for (const ddl of SCHEMA_STATEMENTS) {
        await pool.query(ddl);
      }
    }

    mysqlActive = true;
    console.log(
      `[DB] Terhubung ke MySQL (${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}).`
    );
    if (!hasExplicitEncKey) {
      console.warn(
        '[DB] Peringatan: ENC_KEY belum diatur di .env. Atur ENC_KEY agar PIN siswa tetap dapat didekripsi setelah server dimulai ulang.'
      );
    }
    return true;
  } catch (err) {
    mysqlActive = false;
    if (pool) {
      try {
        await pool.end();
      } catch {}
      pool = null;
    }
    console.warn(
      `[DB] MySQL belum terhubung (${err.code || err.message}). Menggunakan mode sementara (in-memory).`
    );
    return false;
  }
}

export function isMysqlMode() {
  return mysqlActive && pool !== null;
}

export function resetMemorySeed() {
  resetSeedData();
}

function escapeLike(str) {
  return String(str).replace(/[\\%_]/g, '\\$&');
}

// =========================================================
// AUTH & LANDING
// =========================================================

export async function findStaffByUsername(role, username) {
  const tableMap = {
    guru: { table: 'guru', pk: 'id_guru' },
    kepsek: { table: 'kepala_sekolah', pk: 'id_kepsek' },
    operator: { table: 'operator', pk: 'id_operator' },
  };
  const info = tableMap[role];
  if (!info) return null;

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT ${info.pk} AS id, nama, username, password FROM ${info.table} WHERE username = ? LIMIT 1`,
      [username]
    );
    return rows[0] || null;
  }

  const memKey = role;
  const row = memDb[memKey].find((r) => r.username === username);
  if (!row) return null;
  return {
    id: Number(row[info.pk]),
    nama: row.nama,
    username: row.username,
    password: row.password,
  };
}

export async function getKelasByKode(kode) {
  const upper = String(kode || '').trim().toUpperCase();
  if (!upper) return null;

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_kelas, nama_kelas, kode_kelas, id_guru, id_kepsek FROM kelas WHERE UPPER(kode_kelas) = ? LIMIT 1',
      [upper]
    );
    return rows[0] || null;
  }

  return memDb.kelas.find((x) => x.kode_kelas.toUpperCase() === upper) || null;
}

export async function getKelasById(idKelas) {
  const id = Number(idKelas);
  if (!id) return null;

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_kelas, nama_kelas, kode_kelas, id_guru, id_kepsek FROM kelas WHERE id_kelas = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  return memDb.kelas.find((k) => k.id_kelas === id) || null;
}

export async function listKodeKelas() {
  if (isMysqlMode()) {
    const [rows] = await pool.execute('SELECT kode_kelas FROM kelas ORDER BY nama_kelas ASC');
    return rows.map((r) => r.kode_kelas);
  }
  return [...memDb.kelas]
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas))
    .map((k) => k.kode_kelas);
}

export async function listSiswaWithPoinByKelas(idKelas) {
  const id = Number(idKelas);
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT s.nisn, s.nama, s.id_kelas, COALESCE(SUM(p.nilai), 0) AS poin
       FROM siswa s
       LEFT JOIN poin p ON p.nisn = s.nisn
       WHERE s.id_kelas = ?
       GROUP BY s.nisn, s.nama, s.id_kelas
       ORDER BY s.nama ASC`,
      [id]
    );
    return rows.map((r) => ({
      nisn: r.nisn,
      nama: r.nama,
      id_kelas: Number(r.id_kelas),
      poin: Number(r.poin || 0),
    }));
  }

  return memDb.siswa
    .filter((s) => s.id_kelas === id)
    .map((s) => ({
      nisn: s.nisn,
      nama: s.nama,
      id_kelas: Number(s.id_kelas),
      poin: memDb.poin
        .filter((p) => p.nisn === s.nisn)
        .reduce((acc, p) => acc + Number(p.nilai || 0), 0),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

export async function findSiswaLogin(nisn, idKelas) {
  const id = Number(idKelas);
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT nisn, nama, sandi_hash, id_kelas FROM siswa WHERE nisn = ? AND id_kelas = ? LIMIT 1',
      [nisn, id]
    );
    return rows[0] || null;
  }

  return memDb.siswa.find((x) => x.nisn === nisn && x.id_kelas === id) || null;
}

// =========================================================
// SISWA & KUIS API
// =========================================================

export async function getTotalPoinSiswa(nisn) {
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(nilai), 0) AS total FROM poin WHERE nisn = ?',
      [nisn]
    );
    return Number(rows[0]?.total || 0);
  }

  return memDb.poin
    .filter((p) => p.nisn === nisn)
    .reduce((acc, p) => acc + Number(p.nilai || 0), 0);
}

export async function getRiwayatPoinSiswa(nisn) {
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_poin, nisn, nilai, tanggal FROM poin WHERE nisn = ? ORDER BY tanggal DESC, id_poin DESC',
      [nisn]
    );
    return rows.map((r) => ({
      id_poin: Number(r.id_poin),
      nisn: r.nisn,
      nilai: Number(r.nilai || 0),
      tanggal: r.tanggal,
    }));
  }

  return memDb.poin
    .filter((p) => p.nisn === nisn)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

export async function listSoalByKelasId(idKelas) {
  const k = await getKelasById(idKelas);
  const idGuru = k ? Number(k.id_guru) : -1;

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_soal, kata_inggris, arti_indonesia, gambar, id_guru FROM soal WHERE id_guru = ? ORDER BY kata_inggris ASC',
      [idGuru]
    );
    return rows;
  }

  return memDb.soal
    .filter((s) => s.id_guru === idGuru)
    .sort((a, b) => a.kata_inggris.localeCompare(b.kata_inggris));
}

export async function insertPoin(nisn, nilai) {
  if (isMysqlMode()) {
    const [res] = await pool.execute(
      'INSERT INTO poin (nisn, nilai) VALUES (?, ?)',
      [nisn, Number(nilai)]
    );
    return Number(res.insertId);
  }

  const id = nextId('poin');
  memDb.poin.push({
    id_poin: id,
    nisn,
    nilai: Number(nilai),
    tanggal: new Date().toISOString(),
  });
  return id;
}

// =========================================================
// GURU
// =========================================================

export async function listKelasByGuru(idGuru) {
  const gid = Number(idGuru);
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT k.id_kelas, k.nama_kelas, k.kode_kelas, k.id_guru,
              COUNT(DISTINCT s.nisn) AS jml,
              COALESCE(SUM(p.nilai), 0) AS totalPoin
       FROM kelas k
       LEFT JOIN siswa s ON s.id_kelas = k.id_kelas
       LEFT JOIN poin p ON p.nisn = s.nisn
       WHERE k.id_guru = ?
       GROUP BY k.id_kelas, k.nama_kelas, k.kode_kelas, k.id_guru
       ORDER BY k.nama_kelas ASC`,
      [gid]
    );
    return rows.map((r) => ({
      id_kelas: Number(r.id_kelas),
      nama_kelas: r.nama_kelas,
      kode_kelas: r.kode_kelas,
      id_guru: Number(r.id_guru),
      jml: Number(r.jml || 0),
      totalPoin: Number(r.totalPoin || 0),
    }));
  }

  return memDb.kelas
    .filter((k) => k.id_guru === gid)
    .map((k) => {
      const siswaKelas = memDb.siswa.filter((s) => s.id_kelas === k.id_kelas);
      const totalPoin = siswaKelas.reduce(
        (sum, s) =>
          sum +
          memDb.poin
            .filter((p) => p.nisn === s.nisn)
            .reduce((acc, p) => acc + Number(p.nilai || 0), 0),
        0
      );
      return {
        ...k,
        jml: siswaKelas.length,
        totalPoin,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));
}

export async function listSoalByGuru(idGuru, q = '') {
  const gid = Number(idGuru);
  const query = String(q || '').trim();

  if (isMysqlMode()) {
    if (query) {
      const like = `%${escapeLike(query)}%`;
      const [rows] = await pool.execute(
        `SELECT id_soal, kata_inggris, arti_indonesia, gambar, id_guru, dibuat_pada, diubah_pada
         FROM soal
         WHERE id_guru = ? AND (kata_inggris LIKE ? ESCAPE '\\\\' OR arti_indonesia LIKE ? ESCAPE '\\\\')
         ORDER BY kata_inggris ASC`,
        [gid, like, like]
      );
      return rows;
    }
    const [rows] = await pool.execute(
      `SELECT id_soal, kata_inggris, arti_indonesia, gambar, id_guru, dibuat_pada, diubah_pada
       FROM soal
       WHERE id_guru = ?
       ORDER BY kata_inggris ASC`,
      [gid]
    );
    return rows;
  }

  const ql = query.toLowerCase();
  return memDb.soal
    .filter((s) => {
      if (s.id_guru !== gid) return false;
      if (!ql) return true;
      return (
        s.kata_inggris.toLowerCase().includes(ql) ||
        s.arti_indonesia.toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => a.kata_inggris.localeCompare(b.kata_inggris));
}

export async function getKelasOwnedByGuru(idKelas, idGuru) {
  const kid = Number(idKelas);
  const gid = Number(idGuru);

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_kelas, nama_kelas, kode_kelas, id_guru FROM kelas WHERE id_kelas = ? AND id_guru = ? LIMIT 1',
      [kid, gid]
    );
    return rows[0] || null;
  }

  return memDb.kelas.find((x) => x.id_kelas === kid && x.id_guru === gid) || null;
}

export async function listSiswaDetailByKelas(idKelas) {
  const kid = Number(idKelas);
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT s.nisn, s.nama, s.sandi_terenkripsi, COALESCE(SUM(p.nilai), 0) AS total
       FROM siswa s
       LEFT JOIN poin p ON p.nisn = s.nisn
       WHERE s.id_kelas = ?
       GROUP BY s.nisn, s.nama, s.sandi_terenkripsi
       ORDER BY s.nama ASC`,
      [kid]
    );
    return rows.map((r) => ({
      nisn: r.nisn,
      nama: r.nama,
      sandi_terenkripsi: r.sandi_terenkripsi,
      total: Number(r.total || 0),
    }));
  }

  return memDb.siswa
    .filter((s) => s.id_kelas === kid)
    .map((s) => ({
      nisn: s.nisn,
      nama: s.nama,
      sandi_terenkripsi: s.sandi_terenkripsi,
      total: memDb.poin
        .filter((p) => p.nisn === s.nisn)
        .reduce((acc, p) => acc + Number(p.nilai || 0), 0),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

export async function getSoalOwnedByGuru(idSoal, idGuru) {
  const sid = Number(idSoal);
  const gid = Number(idGuru);
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_soal, kata_inggris, arti_indonesia, gambar, id_guru FROM soal WHERE id_soal = ? AND id_guru = ? LIMIT 1',
      [sid, gid]
    );
    return rows[0] || null;
  }

  return memDb.soal.find((s) => s.id_soal === sid && s.id_guru === gid) || null;
}

export async function insertSoal({ kata_inggris, arti_indonesia, gambar, id_guru }) {
  const gid = Number(id_guru);
  if (isMysqlMode()) {
    const [res] = await pool.execute(
      'INSERT INTO soal (kata_inggris, arti_indonesia, gambar, id_guru) VALUES (?, ?, ?, ?)',
      [kata_inggris, arti_indonesia, gambar, gid]
    );
    return Number(res.insertId);
  }

  const id = nextId('soal');
  memDb.soal.push({
    id_soal: id,
    kata_inggris,
    arti_indonesia,
    gambar,
    id_guru: gid,
    dibuat_pada: new Date().toISOString(),
    diubah_pada: null,
  });
  return id;
}

export async function updateSoal(idSoal, idGuru, { kata_inggris, arti_indonesia, gambar }) {
  const sid = Number(idSoal);
  const gid = Number(idGuru);

  if (isMysqlMode()) {
    if (gambar) {
      await pool.execute(
        'UPDATE soal SET kata_inggris = ?, arti_indonesia = ?, gambar = ? WHERE id_soal = ? AND id_guru = ?',
        [kata_inggris, arti_indonesia, gambar, sid, gid]
      );
    } else {
      await pool.execute(
        'UPDATE soal SET kata_inggris = ?, arti_indonesia = ? WHERE id_soal = ? AND id_guru = ?',
        [kata_inggris, arti_indonesia, sid, gid]
      );
    }
    return;
  }

  const soal = memDb.soal.find((s) => s.id_soal === sid && s.id_guru === gid);
  if (!soal) return;
  soal.kata_inggris = kata_inggris;
  soal.arti_indonesia = arti_indonesia;
  if (gambar) soal.gambar = gambar;
  soal.diubah_pada = new Date().toISOString();
}

export async function deleteSoal(idSoal, idGuru) {
  const sid = Number(idSoal);
  const gid = Number(idGuru);
  const existing = await getSoalOwnedByGuru(sid, gid);
  if (!existing) return null;

  if (isMysqlMode()) {
    await pool.execute('DELETE FROM soal WHERE id_soal = ? AND id_guru = ?', [sid, gid]);
    return existing;
  }

  const idx = memDb.soal.findIndex((x) => x.id_soal === sid && x.id_guru === gid);
  if (idx !== -1) memDb.soal.splice(idx, 1);
  return existing;
}

// =========================================================
// KEPALA SEKOLAH
// =========================================================

export async function getKepsekCounts() {
  if (isMysqlMode()) {
    const [[k]] = await pool.execute('SELECT COUNT(*) AS c FROM kelas');
    const [[g]] = await pool.execute('SELECT COUNT(*) AS c FROM guru');
    const [[s]] = await pool.execute('SELECT COUNT(*) AS c FROM siswa');
    const [[q]] = await pool.execute('SELECT COUNT(*) AS c FROM soal');
    return {
      jk: Number(k.c || 0),
      jg: Number(g.c || 0),
      js: Number(s.c || 0),
      jq: Number(q.c || 0),
    };
  }

  return {
    jk: memDb.kelas.length,
    jg: memDb.guru.length,
    js: memDb.siswa.length,
    jq: memDb.soal.length,
  };
}

export async function listKelasRingkas() {
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT k.id_kelas, k.nama_kelas, k.kode_kelas,
              COALESCE(g.nama, '-') AS guru,
              COUNT(s.nisn) AS jml
       FROM kelas k
       LEFT JOIN guru g ON g.id_guru = k.id_guru
       LEFT JOIN siswa s ON s.id_kelas = k.id_kelas
       GROUP BY k.id_kelas, k.nama_kelas, k.kode_kelas, g.nama
       ORDER BY k.nama_kelas ASC`
    );
    return rows.map((r) => ({
      id_kelas: Number(r.id_kelas),
      nama_kelas: r.nama_kelas,
      kode_kelas: r.kode_kelas,
      guru: r.guru || '-',
      jml: Number(r.jml || 0),
    }));
  }

  return memDb.kelas
    .map((k) => {
      const g = memDb.guru.find((x) => x.id_guru === k.id_guru);
      return {
        id_kelas: k.id_kelas,
        nama_kelas: k.nama_kelas,
        kode_kelas: k.kode_kelas,
        guru: g ? g.nama : '-',
        jml: memDb.siswa.filter((s) => s.id_kelas === k.id_kelas).length,
      };
    })
    .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas));
}

export async function listGuruDenganKelas() {
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT g.nama,
              COALESCE(GROUP_CONCAT(k.nama_kelas ORDER BY k.nama_kelas ASC SEPARATOR ', '), '-') AS kelas
       FROM guru g
       LEFT JOIN kelas k ON k.id_guru = g.id_guru
       GROUP BY g.id_guru, g.nama
       ORDER BY g.nama ASC`
    );
    return rows.map((r) => ({
      nama: r.nama,
      kelas: r.kelas || '-',
    }));
  }

  return memDb.guru
    .map((g) => {
      const kelasStr = memDb.kelas
        .filter((k) => k.id_guru === g.id_guru)
        .map((k) => k.nama_kelas)
        .sort((a, b) => a.localeCompare(b))
        .join(', ');
      return {
        nama: g.nama,
        kelas: kelasStr || '-',
      };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

export async function listSiswaPeringkat(q = '') {
  const query = String(q || '').trim();
  if (isMysqlMode()) {
    const params = [];
    let whereSql = '';
    if (query) {
      const like = `%${escapeLike(query)}%`;
      whereSql = `WHERE s.nama LIKE ? ESCAPE '\\\\' OR s.nisn LIKE ? ESCAPE '\\\\' OR k.nama_kelas LIKE ? ESCAPE '\\\\'`;
      params.push(like, like, like);
    }
    const [rows] = await pool.execute(
      `SELECT s.nisn, s.nama,
              COALESCE(k.nama_kelas, '-') AS nama_kelas,
              COALESCE(g.nama, '-') AS nama_guru,
              COALESCE(SUM(p.nilai), 0) AS total,
              COUNT(p.id_poin) AS jml_sesi
       FROM siswa s
       LEFT JOIN kelas k ON k.id_kelas = s.id_kelas
       LEFT JOIN guru g ON g.id_guru = k.id_guru
       LEFT JOIN poin p ON p.nisn = s.nisn
       ${whereSql}
       GROUP BY s.nisn, s.nama, k.nama_kelas, g.nama
       ORDER BY total DESC, s.nama ASC`,
      params
    );
    return rows.map((r) => ({
      nisn: r.nisn,
      nama: r.nama,
      nama_kelas: r.nama_kelas || '-',
      nama_guru: r.nama_guru || '-',
      total: Number(r.total || 0),
      jml_sesi: Number(r.jml_sesi || 0),
    }));
  }

  const ql = query.toLowerCase();
  return memDb.siswa
    .map((s) => {
      const k = memDb.kelas.find((x) => x.id_kelas === s.id_kelas);
      const g = k ? memDb.guru.find((x) => x.id_guru === k.id_guru) : null;
      const poinList = memDb.poin.filter((p) => p.nisn === s.nisn);
      const total = poinList.reduce((acc, p) => acc + Number(p.nilai || 0), 0);
      return {
        nisn: s.nisn,
        nama: s.nama,
        nama_kelas: k ? k.nama_kelas : '-',
        nama_guru: g ? g.nama : '-',
        total,
        jml_sesi: poinList.length,
      };
    })
    .filter((r) => {
      if (!ql) return true;
      return (
        r.nama.toLowerCase().includes(ql) ||
        r.nisn.toLowerCase().includes(ql) ||
        r.nama_kelas.toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama));
}

// =========================================================
// OPERATOR
// =========================================================

export const OPERATOR_JENIS = {
  guru: { table: 'guru', memKey: 'guru', pk: 'id_guru', judul: 'Data Guru', satu: 'guru' },
  siswa: { table: 'siswa', memKey: 'siswa', pk: 'nisn', judul: 'Data Siswa', satu: 'siswa' },
  kepsek: { table: 'kepala_sekolah', memKey: 'kepsek', pk: 'id_kepsek', judul: 'Data Kepala Sekolah', satu: 'kepala sekolah' },
  operator: { table: 'operator', memKey: 'operator', pk: 'id_operator', judul: 'Data Operator', satu: 'operator' },
  kelas: { table: 'kelas', memKey: 'kelas', pk: 'id_kelas', judul: 'Data Kelas', satu: 'kelas' },
};

export async function getOperatorDashboardStats() {
  if (isMysqlMode()) {
    const [[g]] = await pool.execute('SELECT COUNT(*) AS c FROM guru');
    const [[s]] = await pool.execute('SELECT COUNT(*) AS c FROM siswa');
    const [[ks]] = await pool.execute('SELECT COUNT(*) AS c FROM kepala_sekolah');
    const [[op]] = await pool.execute('SELECT COUNT(*) AS c FROM operator');
    const [[kl]] = await pool.execute('SELECT COUNT(*) AS c FROM kelas');
    const [[q]] = await pool.execute('SELECT COUNT(*) AS c FROM soal');
    const kelasRows = await listKelasRingkas();

    return {
      counts: {
        guru: Number(g.c || 0),
        siswa: Number(s.c || 0),
        kepsek: Number(ks.c || 0),
        operator: Number(op.c || 0),
        kelas: Number(kl.c || 0),
        soal: Number(q.c || 0),
      },
      kelasRingkas: kelasRows.map((k) => ({
        id_kelas: k.id_kelas,
        nama_kelas: k.nama_kelas,
        kode_kelas: k.kode_kelas,
        guru: k.guru,
        jmlSiswa: k.jml,
      })),
    };
  }

  return {
    counts: {
      guru: memDb.guru.length,
      siswa: memDb.siswa.length,
      kepsek: memDb.kepsek.length,
      operator: memDb.operator.length,
      kelas: memDb.kelas.length,
      soal: memDb.soal.length,
    },
    kelasRingkas: memDb.kelas
      .map((k) => {
        const g = memDb.guru.find((x) => x.id_guru === k.id_guru);
        return {
          id_kelas: k.id_kelas,
          nama_kelas: k.nama_kelas,
          kode_kelas: k.kode_kelas,
          guru: g ? g.nama : '-',
          jmlSiswa: memDb.siswa.filter((s) => s.id_kelas === k.id_kelas).length,
        };
      })
      .sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas)),
  };
}

export async function listOperatorMaster(jenis, q = '') {
  const cfg = OPERATOR_JENIS[jenis];
  if (!cfg) return [];
  const query = String(q || '').trim();

  if (isMysqlMode()) {
    if (jenis === 'siswa') {
      const params = [];
      let whereSql = '';
      if (query) {
        const like = `%${escapeLike(query)}%`;
        whereSql = `WHERE s.nama LIKE ? ESCAPE '\\\\' OR s.nisn LIKE ? ESCAPE '\\\\'`;
        params.push(like, like);
      }
      const [rows] = await pool.execute(
        `SELECT s.nisn AS id, s.nisn, s.nama, COALESCE(k.nama_kelas, '-') AS nama_kelas
         FROM siswa s
         LEFT JOIN kelas k ON k.id_kelas = s.id_kelas
         ${whereSql}
         ORDER BY s.nama ASC`,
        params
      );
      return rows;
    }

    if (jenis === 'kelas') {
      const params = [];
      let whereSql = '';
      if (query) {
        const like = `%${escapeLike(query)}%`;
        whereSql = `WHERE k.nama_kelas LIKE ? ESCAPE '\\\\' OR k.kode_kelas LIKE ? ESCAPE '\\\\'`;
        params.push(like, like);
      }
      const [rows] = await pool.execute(
        `SELECT k.id_kelas AS id, k.nama_kelas, k.kode_kelas,
                COALESCE(g.nama, '-') AS guru,
                COALESCE(ks.nama, '-') AS kepsek
         FROM kelas k
         LEFT JOIN guru g ON g.id_guru = k.id_guru
         LEFT JOIN kepala_sekolah ks ON ks.id_kepsek = k.id_kepsek
         ${whereSql}
         ORDER BY k.nama_kelas ASC`,
        params
      );
      return rows;
    }

    const params = [];
    let whereSql = '';
    if (query) {
      const like = `%${escapeLike(query)}%`;
      whereSql = `WHERE nama LIKE ? ESCAPE '\\\\' OR username LIKE ? ESCAPE '\\\\'`;
      params.push(like, like);
    }
    const [rows] = await pool.execute(
      `SELECT ${cfg.pk} AS id, nama, username FROM ${cfg.table} ${whereSql} ORDER BY nama ASC`,
      params
    );
    return rows;
  }

  const ql = query.toLowerCase();
  if (jenis === 'siswa') {
    return memDb.siswa
      .map((s) => {
        const k = memDb.kelas.find((x) => x.id_kelas === s.id_kelas);
        return {
          id: s.nisn,
          nisn: s.nisn,
          nama: s.nama,
          nama_kelas: k ? k.nama_kelas : '-',
        };
      })
      .filter((r) => !ql || r.nama.toLowerCase().includes(ql) || r.nisn.toLowerCase().includes(ql))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  if (jenis === 'kelas') {
    return memDb.kelas
      .map((k) => {
        const g = memDb.guru.find((x) => x.id_guru === k.id_guru);
        const ks = memDb.kepsek.find((x) => x.id_kepsek === k.id_kepsek);
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
  }

  return memDb[cfg.memKey]
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

export async function getRecordById(jenis, id) {
  const cfg = OPERATOR_JENIS[jenis];
  if (!cfg || id === '' || id === null || id === undefined) return null;

  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${cfg.table} WHERE ${cfg.pk} = ? LIMIT 1`,
      [jenis === 'siswa' ? String(id) : Number(id)]
    );
    return rows[0] || null;
  }

  return memDb[cfg.memKey].find((r) => String(r[cfg.pk]) === String(id)) || null;
}

export async function listDropdownData() {
  if (isMysqlMode()) {
    const [gurus] = await pool.execute('SELECT id_guru, nama FROM guru ORDER BY nama ASC');
    const [kepseks] = await pool.execute('SELECT id_kepsek, nama FROM kepala_sekolah ORDER BY nama ASC');
    const [kelasL] = await pool.execute('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
    return { gurus, kepseks, kelasL };
  }

  return {
    gurus: [...memDb.guru].sort((a, b) => a.nama.localeCompare(b.nama)),
    kepseks: [...memDb.kepsek].sort((a, b) => a.nama.localeCompare(b.nama)),
    kelasL: [...memDb.kelas].sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas)),
  };
}

export async function isUsernameTaken(username, excludeJenis, excludeId) {
  if (isMysqlMode()) {
    for (const j of ['guru', 'kepsek', 'operator']) {
      const cfg = OPERATOR_JENIS[j];
      const [rows] = await pool.execute(
        `SELECT ${cfg.pk} AS id FROM ${cfg.table} WHERE username = ? LIMIT 1`,
        [username]
      );
      if (rows[0] && !(j === excludeJenis && String(rows[0].id) === String(excludeId))) {
        return true;
      }
    }
    return false;
  }

  for (const j of ['guru', 'kepsek', 'operator']) {
    const cfg = OPERATOR_JENIS[j];
    const r = memDb[cfg.memKey].find((x) => x.username === username);
    if (r && !(j === excludeJenis && String(r[cfg.pk]) === String(excludeId))) {
      return true;
    }
  }
  return false;
}

export async function isSiswaNisnTaken(nisn) {
  if (isMysqlMode()) {
    const [rows] = await pool.execute('SELECT nisn FROM siswa WHERE nisn = ? LIMIT 1', [nisn]);
    return rows.length > 0;
  }
  return memDb.siswa.some((s) => s.nisn === nisn);
}

export async function isKodeKelasTaken(kode, excludeIdKelas = null) {
  const upper = String(kode || '').trim().toUpperCase();
  if (isMysqlMode()) {
    const [rows] = await pool.execute(
      'SELECT id_kelas FROM kelas WHERE UPPER(kode_kelas) = ? LIMIT 1',
      [upper]
    );
    if (!rows[0]) return false;
    return excludeIdKelas ? Number(rows[0].id_kelas) !== Number(excludeIdKelas) : true;
  }

  return memDb.kelas.some(
    (k) =>
      k.kode_kelas.toUpperCase() === upper &&
      (!excludeIdKelas || k.id_kelas !== Number(excludeIdKelas))
  );
}

export async function saveMasterRecord(jenis, existingRow, payload, operatorId) {
  const cfg = OPERATOR_JENIS[jenis];
  const opId = operatorId ? Number(operatorId) : null;

  if (['guru', 'kepsek', 'operator'].includes(jenis)) {
    const { nama, username, passwordHash } = payload;
    if (isMysqlMode()) {
      if (existingRow) {
        if (passwordHash) {
          await pool.execute(
            `UPDATE ${cfg.table} SET nama = ?, username = ?, password = ? WHERE ${cfg.pk} = ?`,
            [nama, username, passwordHash, existingRow[cfg.pk]]
          );
        } else {
          await pool.execute(
            `UPDATE ${cfg.table} SET nama = ?, username = ? WHERE ${cfg.pk} = ?`,
            [nama, username, existingRow[cfg.pk]]
          );
        }
      } else {
        await pool.execute(
          `INSERT INTO ${cfg.table} (nama, username, password, dibuat_oleh) VALUES (?, ?, ?, ?)`,
          [nama, username, passwordHash, opId]
        );
      }
      return;
    }

    if (existingRow) {
      existingRow.nama = nama;
      existingRow.username = username;
      if (passwordHash) existingRow.password = passwordHash;
    } else {
      memDb[cfg.memKey].push({
        [cfg.pk]: nextId(cfg.memKey),
        nama,
        username,
        password: passwordHash,
        dibuat_oleh: opId,
      });
    }
    return;
  }

  if (jenis === 'siswa') {
    const { nisn, nama, id_kelas, sandi_hash, sandi_terenkripsi } = payload;
    if (isMysqlMode()) {
      if (existingRow) {
        if (sandi_hash && sandi_terenkripsi) {
          await pool.execute(
            'UPDATE siswa SET nama = ?, id_kelas = ?, sandi_hash = ?, sandi_terenkripsi = ? WHERE nisn = ?',
            [nama, Number(id_kelas), sandi_hash, sandi_terenkripsi, existingRow.nisn]
          );
        } else {
          await pool.execute(
            'UPDATE siswa SET nama = ?, id_kelas = ? WHERE nisn = ?',
            [nama, Number(id_kelas), existingRow.nisn]
          );
        }
      } else {
        await pool.execute(
          'INSERT INTO siswa (nisn, nama, sandi_hash, sandi_terenkripsi, id_kelas, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?)',
          [nisn, nama, sandi_hash, sandi_terenkripsi, Number(id_kelas), opId]
        );
      }
      return;
    }

    if (existingRow) {
      existingRow.nama = nama;
      existingRow.id_kelas = Number(id_kelas);
      if (sandi_hash && sandi_terenkripsi) {
        existingRow.sandi_hash = sandi_hash;
        existingRow.sandi_terenkripsi = sandi_terenkripsi;
      }
    } else {
      memDb.siswa.push({
        nisn,
        nama,
        sandi_hash,
        sandi_terenkripsi,
        id_kelas: Number(id_kelas),
        dibuat_oleh: opId,
      });
    }
    return;
  }

  if (jenis === 'kelas') {
    const { nama_kelas, kode_kelas, id_guru, id_kepsek } = payload;
    const kepsekVal = id_kepsek ? Number(id_kepsek) : null;
    if (isMysqlMode()) {
      if (existingRow) {
        await pool.execute(
          'UPDATE kelas SET nama_kelas = ?, kode_kelas = ?, id_guru = ?, id_kepsek = ? WHERE id_kelas = ?',
          [nama_kelas, kode_kelas, Number(id_guru), kepsekVal, existingRow.id_kelas]
        );
      } else {
        await pool.execute(
          'INSERT INTO kelas (nama_kelas, kode_kelas, id_guru, id_kepsek, dibuat_oleh) VALUES (?, ?, ?, ?, ?)',
          [nama_kelas, kode_kelas, Number(id_guru), kepsekVal, opId]
        );
      }
      return;
    }

    if (existingRow) {
      existingRow.nama_kelas = nama_kelas;
      existingRow.kode_kelas = kode_kelas;
      existingRow.id_guru = Number(id_guru);
      existingRow.id_kepsek = kepsekVal;
    } else {
      memDb.kelas.push({
        id_kelas: nextId('kelas'),
        nama_kelas,
        kode_kelas,
        id_guru: Number(id_guru),
        id_kepsek: kepsekVal,
        dibuat_oleh: opId,
      });
    }
  }
}

export async function checkDeleteBlockReason(jenis, id, sessionUserId) {
  if (jenis === 'guru') {
    if (isMysqlMode()) {
      const [rows] = await pool.execute('SELECT id_kelas FROM kelas WHERE id_guru = ? LIMIT 1', [Number(id)]);
      if (rows.length > 0) {
        return 'Guru ini masih mengampu kelas. Ubah guru pengampu kelas tersebut terlebih dahulu.';
      }
    } else if (memDb.kelas.some((k) => k.id_guru === Number(id))) {
      return 'Guru ini masih mengampu kelas. Ubah guru pengampu kelas tersebut terlebih dahulu.';
    }
  } else if (jenis === 'kelas') {
    if (isMysqlMode()) {
      const [rows] = await pool.execute('SELECT nisn FROM siswa WHERE id_kelas = ? LIMIT 1', [Number(id)]);
      if (rows.length > 0) {
        return 'Kelas ini masih berisi siswa. Pindahkan atau hapus siswa di dalamnya terlebih dahulu.';
      }
    } else if (memDb.siswa.some((s) => s.id_kelas === Number(id))) {
      return 'Kelas ini masih berisi siswa. Pindahkan atau hapus siswa di dalamnya terlebih dahulu.';
    }
  } else if (jenis === 'operator') {
    if (String(id) === String(sessionUserId)) {
      return 'Anda tidak dapat menghapus akun Operator yang sedang digunakan.';
    }
    const totalOp = await countOperators();
    if (totalOp <= 1) {
      return 'Tidak dapat menghapus Operator terakhir.';
    }
  }
  return null;
}

export async function deleteMasterRecord(jenis, id) {
  const cfg = OPERATOR_JENIS[jenis];
  if (!cfg) return [];
  const gambarToDelete = [];

  if (isMysqlMode()) {
    if (jenis === 'guru') {
      const [soalRows] = await pool.execute('SELECT gambar FROM soal WHERE id_guru = ?', [Number(id)]);
      for (const r of soalRows) {
        if (r.gambar) gambarToDelete.push(r.gambar);
      }
    }
    await pool.execute(
      `DELETE FROM ${cfg.table} WHERE ${cfg.pk} = ?`,
      [jenis === 'siswa' ? String(id) : Number(id)]
    );
    return gambarToDelete;
  }

  const idx = memDb[cfg.memKey].findIndex((r) => String(r[cfg.pk]) === String(id));
  if (idx === -1) return [];

  if (jenis === 'guru') {
    const idG = Number(id);
    memDb.soal = memDb.soal.filter((s) => {
      if (s.id_guru === idG) {
        if (s.gambar) gambarToDelete.push(s.gambar);
        return false;
      }
      return true;
    });
  } else if (jenis === 'siswa') {
    memDb.poin = memDb.poin.filter((p) => p.nisn !== String(id));
  } else if (jenis === 'kepsek') {
    const idK = Number(id);
    memDb.kelas.forEach((k) => {
      if (k.id_kepsek === idK) k.id_kepsek = null;
    });
  }

  memDb[cfg.memKey].splice(idx, 1);
  return gambarToDelete;
}

// =========================================================
// SETUP
// =========================================================

export async function countOperators() {
  if (isMysqlMode()) {
    const [[row]] = await pool.execute('SELECT COUNT(*) AS c FROM operator');
    return Number(row.c || 0);
  }
  return memDb.operator.length;
}

export async function countGuru() {
  if (isMysqlMode()) {
    const [[row]] = await pool.execute('SELECT COUNT(*) AS c FROM guru');
    return Number(row.c || 0);
  }
  return memDb.guru.length;
}

export async function createFirstOperator({ nama, username, passwordHash }) {
  if (isMysqlMode()) {
    const [res] = await pool.execute(
      'INSERT INTO operator (nama, username, password, dibuat_oleh) VALUES (?, ?, ?, NULL)',
      [nama, username, passwordHash]
    );
    return Number(res.insertId);
  }

  const id = nextId('operator');
  memDb.operator.push({
    id_operator: id,
    nama,
    username,
    password: passwordHash,
    dibuat_oleh: null,
  });
  return id;
}

export async function loadSampleData({ operatorId, passwordHash, pinHash, pinEncrypted }) {
  const me = Number(operatorId);
  const sampleWords = [
    ['Apple', 'Apel', 'apple'],
    ['Book', 'Buku', 'book'],
    ['Chair', 'Kursi', 'chair'],
    ['Table', 'Meja', 'table'],
    ['Ball', 'Bola', 'ball'],
    ['Pencil', 'Pensil', 'pencil'],
    ['Bag', 'Tas', 'bag'],
    ['Clock', 'Jam', 'clock'],
  ];

  if (isMysqlMode()) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [gRes] = await conn.execute(
        'INSERT INTO guru (nama, username, password, dibuat_oleh) VALUES (?, ?, ?, ?)',
        ['Guru Contoh', 'guru.contoh', passwordHash, me]
      );
      const idg = Number(gRes.insertId);

      const [ksRes] = await conn.execute(
        'INSERT INTO kepala_sekolah (nama, username, password, dibuat_oleh) VALUES (?, ?, ?, ?)',
        ['Kepala Sekolah Contoh', 'kepsek.contoh', passwordHash, me]
      );
      const idk = Number(ksRes.insertId);

      const [klRes] = await conn.execute(
        'INSERT INTO kelas (nama_kelas, kode_kelas, id_guru, id_kepsek, dibuat_oleh) VALUES (?, ?, ?, ?, ?)',
        ['Kelas 4A (contoh)', 'KLS4A', idg, idk, me]
      );
      const idkl = Number(klRes.insertId);

      for (const [nisn, nama] of [
        ['0000000001', 'Budi Santoso'],
        ['0000000002', 'Siti Nurhaliza'],
      ]) {
        await conn.execute(
          'INSERT IGNORE INTO siswa (nisn, nama, sandi_hash, sandi_terenkripsi, id_kelas, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?)',
          [nisn, nama, pinHash, pinEncrypted, idkl, me]
        );
      }

      for (const [kata, arti, g] of sampleWords) {
        await conn.execute(
          'INSERT INTO soal (kata_inggris, arti_indonesia, gambar, id_guru) VALUES (?, ?, ?, ?)',
          [kata, arti, `contoh/${g}.svg`, idg]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return;
  }

  const idg = nextId('guru');
  memDb.guru.push({
    id_guru: idg,
    nama: 'Guru Contoh',
    username: 'guru.contoh',
    password: passwordHash,
    dibuat_oleh: me,
  });

  const idk = nextId('kepsek');
  memDb.kepsek.push({
    id_kepsek: idk,
    nama: 'Kepala Sekolah Contoh',
    username: 'kepsek.contoh',
    password: passwordHash,
    dibuat_oleh: me,
  });

  const idkl = nextId('kelas');
  memDb.kelas.push({
    id_kelas: idkl,
    nama_kelas: 'Kelas 4A (contoh)',
    kode_kelas: 'KLS4A',
    id_guru: idg,
    id_kepsek: idk,
    dibuat_oleh: me,
  });

  for (const [n, nm] of [
    ['0000000001', 'Budi Santoso'],
    ['0000000002', 'Siti Nurhaliza'],
  ]) {
    if (!memDb.siswa.some((s) => s.nisn === n)) {
      memDb.siswa.push({
        nisn: n,
        nama: nm,
        sandi_hash: pinHash,
        sandi_terenkripsi: pinEncrypted,
        id_kelas: idkl,
        dibuat_oleh: me,
      });
    }
  }

  const now = new Date().toISOString();
  for (const [k, a, g] of sampleWords) {
    memDb.soal.push({
      id_soal: nextId('soal'),
      kata_inggris: k,
      arti_indonesia: a,
      gambar: `contoh/${g}.svg`,
      id_guru: idg,
      dibuat_pada: now,
      diubah_pada: null,
    });
  }
}
