<?php
// Definisi lima jenis data yang dikelola Operator (FR-18 s.d. FR-22).
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('operator');

$JENIS = [
    'guru'     => ['tabel' => 'guru', 'pk' => 'id_guru', 'judul' => 'Data Guru', 'satu' => 'guru'],
    'siswa'    => ['tabel' => 'siswa', 'pk' => 'nisn', 'judul' => 'Data Siswa', 'satu' => 'siswa'],
    'kepsek'   => ['tabel' => 'kepala_sekolah', 'pk' => 'id_kepsek', 'judul' => 'Data Kepala Sekolah', 'satu' => 'kepala sekolah'],
    'operator' => ['tabel' => 'operator', 'pk' => 'id_operator', 'judul' => 'Data Operator', 'satu' => 'operator'],
    'kelas'    => ['tabel' => 'kelas', 'pk' => 'id_kelas', 'judul' => 'Data Kelas', 'satu' => 'kelas'],
];
$jenis = $_GET['jenis'] ?? $_POST['jenis'] ?? '';
if (!isset($JENIS[$jenis])) { http_response_code(404); echo 'Jenis data tidak dikenal.'; exit; }
$cfg = $JENIS[$jenis];

function ambil_baris(string $tabel, string $pk, $id): ?array {
    $st = db()->prepare("SELECT * FROM $tabel WHERE $pk = ?"); $st->execute([$id]);
    return $st->fetch() ?: null;
}
function nama_baris(string $jenis, array $r): string { return $jenis === 'kelas' ? $r['nama_kelas'] : $r['nama']; }
