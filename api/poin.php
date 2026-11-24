<?php
$API_MODE = true;
require_once __DIR__ . '/../includes/auth.php';
wajib_peran('siswa');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'pesan' => 'Metode tidak diizinkan.'], 405);
csrf_wajib();

$g = $_SESSION['game'] ?? null;
$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
if (!$g || !hash_equals($g['token'], (string)($in['token'] ?? ''))) json_out(['ok' => false, 'pesan' => 'Sesi permainan tidak valid atau sudah selesai.'], 400);
$aksi = $in['aksi'] ?? '';

if ($aksi === 'jawab') {
    $idx = (int)($in['idx'] ?? -1);
    if (!isset($g['kunci'][$idx])) json_out(['ok' => false, 'pesan' => 'Soal tidak ditemukan.'], 400);
    if (!isset($g['jawab'][$idx])) {            // satu soal hanya dinilai sekali
        $g['jawab'][$idx] = mb_strtolower(trim((string)($in['jawaban'] ?? ''))) === $g['kunci'][$idx];
        $_SESSION['game'] = $g;
    }
    $benar = count(array_filter($g['jawab']));
    json_out(['ok' => true, 'benar' => $g['jawab'][$idx], 'kunci' => $g['kunci'][$idx], 'poin' => $benar * POIN_PER_BENAR]);
}
if ($aksi === 'selesai') {                      // simpan SEKALI per sesi (anti poin ganda)
    $benar = count(array_filter($g['jawab']));
    $nilai = $benar * POIN_PER_BENAR;
    unset($_SESSION['game']);                   // token dihapus dulu: muat ulang/permintaan ulang tidak menyimpan lagi
    db()->prepare('INSERT INTO poin (nisn, nilai) VALUES (?, ?)')->execute([$_SESSION['nisn'], $nilai]);
    $_SESSION['hasil'] = ['benar' => $benar, 'total' => $g['total'], 'poin' => $nilai];
    json_out(['ok' => true, 'poin' => $nilai]);
}
json_out(['ok' => false, 'pesan' => 'Aksi tidak dikenal.'], 400);
