import crypto from 'node:crypto';
import { Router } from 'express';
import { listSoalByKelasId, insertPoin } from '../db.js';
import { config } from '../config.js';
import { asyncHandler, gambarUrl, wajibPeran, csrfWajib } from '../helpers.js';

const router = Router();

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

router.all(
  '/api/soal.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, pesan: 'Metode tidak diizinkan.' });
    }
    if (!csrfWajib(req, res, true)) return;

    const user = req.session.user;
    const semua = await listSoalByKelasId(user.id_kelas);

    const kataUnik = [...new Set(semua.map((r) => r.kata_inggris.toLowerCase()))];
    if (semua.length === 0) {
      return res.json({ ok: false, pesan: 'Gurumu belum menambahkan soal.' });
    }
    if (kataUnik.length < 4) {
      return res.json({
        ok: false,
        pesan: 'Soal belum cukup. Minimal 4 kata berbeda diperlukan agar permainan dapat dimulai.',
      });
    }

    const dipilih = shuffle(semua).slice(0, config.soalPerSesi);
    const kunci = {};
    const soalOut = dipilih.map((r, i) => {
      const benar = r.kata_inggris;
      const pengecoh = shuffle(kataUnik.filter((w) => w !== benar.toLowerCase())).slice(0, 3);
      const opsi = shuffle([benar, ...pengecoh]);
      kunci[i] = benar.toLowerCase();
      return {
        idx: i,
        gambar: gambarUrl(r.gambar),
        opsi,
      };
    });

    const token = crypto.randomBytes(16).toString('hex');
    req.session.game = {
      token,
      kunci,
      jawab: {},
      total: soalOut.length,
    };

    return res.json({
      ok: true,
      token,
      poin_per_benar: config.poinPerBenar,
      soal: soalOut,
    });
  })
);

router.all(
  '/api/poin.php',
  wajibPeran('siswa'),
  asyncHandler(async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, pesan: 'Metode tidak diizinkan.' });
    }
    if (!csrfWajib(req, res, true)) return;

    const g = req.session.game;
    const inp = req.body || {};
    const sentToken = String(inp.token || '');

    if (
      !g ||
      typeof g.token !== 'string' ||
      sentToken.length !== g.token.length ||
      !crypto.timingSafeEqual(Buffer.from(g.token), Buffer.from(sentToken))
    ) {
      return res.status(400).json({ ok: false, pesan: 'Sesi permainan tidak valid atau sudah selesai.' });
    }

    const aksi = inp.aksi || '';
    if (aksi === 'jawab') {
      const idx = Number(inp.idx ?? -1);
      if (g.kunci[idx] === undefined) {
        return res.status(400).json({ ok: false, pesan: 'Soal tidak ditemukan.' });
      }
      if (g.jawab[idx] === undefined) {
        const jaw = String(inp.jawaban || '').trim().toLowerCase();
        g.jawab[idx] = jaw === g.kunci[idx];
        req.session.game = g;
      }
      const benar = Object.values(g.jawab).filter(Boolean).length;
      return res.json({
        ok: true,
        benar: g.jawab[idx],
        kunci: g.kunci[idx],
        poin: benar * config.poinPerBenar,
      });
    }

    if (aksi === 'selesai') {
      const benar = Object.values(g.jawab).filter(Boolean).length;
      const nilai = benar * config.poinPerBenar;
      delete req.session.game;

      await insertPoin(req.session.user.nisn, nilai);
      req.session.hasil = {
        benar,
        total: g.total,
        poin: nilai,
      };
      return res.json({ ok: true, poin: nilai });
    }

    return res.status(400).json({ ok: false, pesan: 'Aksi tidak dikenal.' });
  })
);

export default router;
