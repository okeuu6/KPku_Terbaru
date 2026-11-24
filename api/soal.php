<?php
$API_MODE = true;
require_once __DIR__ . '/../includes/auth.php';
wajib_peran('siswa');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'pesan' => 'Metode tidak diizinkan.'], 405);
csrf_wajib();

// Mulai sesi permainan: ambil soal milik Guru pengampu kelas siswa
$st = db()->prepare('SELECT s.id_soal, s.kata_inggris, s.gambar FROM soal s JOIN kelas k ON k.id_guru = s.id_guru WHERE k.id_kelas = ?');
$st->execute([$_SESSION['id_kelas']]);
$semua = $st->fetchAll();
$kataUnik = array_values(array_unique(array_map(fn($r) => mb_strtolower($r['kata_inggris']), $semua)));
if (count($semua) === 0) json_out(['ok' => false, 'pesan' => 'Gurumu belum menambahkan soal.']);
if (count($kataUnik) < 4) json_out(['ok' => false, 'pesan' => 'Soal belum cukup. Minimal 4 kata berbeda diperlukan agar permainan dapat dimulai.']);

shuffle($semua);
$dipilih = array_slice($semua, 0, SOAL_PER_SESI);
$kunci = []; $soalOut = [];
foreach ($dipilih as $i => $r) {
    $benar = $r['kata_inggris'];
    $pengecoh = array_values(array_filter($kataUnik, fn($k) => $k !== mb_strtolower($benar)));
    shuffle($pengecoh);
    $opsi = array_merge([$benar], array_slice($pengecoh, 0, 3));
    shuffle($opsi);
    $kunci[$i] = mb_strtolower($benar);
    $soalOut[] = ['idx' => $i, 'gambar' => gambar_url($r['gambar']), 'opsi' => $opsi];
}
$token = bin2hex(random_bytes(16));
$_SESSION['game'] = ['token' => $token, 'kunci' => $kunci, 'jawab' => [], 'total' => count($soalOut)];
json_out(['ok' => true, 'token' => $token, 'poin_per_benar' => POIN_PER_BENAR, 'soal' => $soalOut]);
