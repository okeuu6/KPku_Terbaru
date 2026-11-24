<?php
// Portal Login Staf (Guru, Kepala Sekolah, Operator)
// Mengarahkan ke tab peran yang relevan di index.php
require_once __DIR__ . '/includes/fungsi.php';

$peran = $_GET['peran'] ?? 'guru';
if (!in_array($peran, ['guru', 'kepsek', 'operator', 'siswa'], true)) {
    $peran = 'guru';
}

if (!headers_sent()) {
    header('Location: ' . url('index.php?peran=' . urlencode($peran) . '#masuk-portal'));
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=index.html#masuk-portal">
  <title>Portal Login Staf - KPKu</title>
  <script>window.location.href = 'index.html#masuk-portal';</script>
</head>
<body style="font-family:sans-serif; text-align:center; padding:40px;">
  <p>Mengarahkan ke halaman login... <a href="index.html#masuk-portal">Klik di sini jika tidak otomatis beralih</a>.</p>
</body>
</html>
