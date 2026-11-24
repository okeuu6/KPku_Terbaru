<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('operator');

$n = fn($t) => (int)db()->query("SELECT COUNT(*) FROM $t")->fetchColumn();
$kartu = [
    ['guru', 'Data Guru', $n('guru')],
    ['siswa', 'Data Siswa', $n('siswa')],
    ['kepsek', 'Data Kepala Sekolah', $n('kepala_sekolah')],
    ['operator', 'Data Operator', $n('operator')],
    ['kelas', 'Data Kelas', $n('kelas')]
];

halaman_mulai('Dashboard');
?>
<div style="margin-bottom:20px;">
  <h1 style="margin:0 0 4px; font-size:1.5rem;">Kelola Data</h1>
  <p class="bantu">Ringkasan master data aplikasi.</p>
</div>

<!-- Kartu Angka Sederhana (Angka besar + label + tombol, tanpa ikon) -->
<div class="grid lima">
  <?php foreach ($kartu as [$j, $lbl, $jml]): ?>
    <div class="stat-card-staf">
      <div class="stat-card-angka"><?= $jml ?></div>
      <div class="stat-card-label"><?= $lbl ?></div>
      <a class="btn-staf" href="<?= e(url('operator/daftar.php?jenis=' . $j)) ?>">Kelola</a>
    </div>
  <?php endforeach; ?>
</div>

<?php if ($n('guru') === 0): ?>
  <div class="card-staf" style="margin-top:20px;">
    <h2 style="margin:0 0 6px; font-size:1.2rem;">Data Contoh</h2>
    <p class="bantu">Belum ada data guru. Anda dapat memuat data contoh (guru, kepala sekolah, kelas, siswa, dan kosa kata) untuk mencoba aplikasi.</p>
    <a class="btn-staf btn-staf-aksen" href="<?= e(url('setup/data-contoh.php')) ?>">Muat Data Contoh</a>
  </div>
<?php endif; ?>
<?php halaman_selesai(); ?>
