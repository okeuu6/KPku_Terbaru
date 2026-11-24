<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('kepsek');

$jk = (int)db()->query('SELECT COUNT(*) FROM kelas')->fetchColumn();
$jg = (int)db()->query('SELECT COUNT(*) FROM guru')->fetchColumn();
$js = (int)db()->query('SELECT COUNT(*) FROM siswa')->fetchColumn();

halaman_mulai('Dashboard Kepala Sekolah');
?>
<div style="margin-bottom:20px;">
  <h1 style="margin:0 0 4px; font-size:1.5rem; font-weight:800; color:var(--teks);">
    Pemantauan Eksekutif Sekolah 🏫
  </h1>
  <p class="bantu">Ringkasan data pembelajaran dan capaian siswa sekolah dasar.</p>
</div>

<div class="grid tiga">
  <div class="stat-card-staf">
    <div class="stat-card-angka"><?= $js ?></div>
    <div class="stat-card-label">Tabel Lengkap Nilai Siswa</div>
    <a class="btn-staf btn-staf-aksen" href="<?= e(url('kepsek/poin-tertinggi.php')) ?>" style="width:100%; box-sizing:border-box;">
      📊 Buka Tabel Nilai
    </a>
  </div>

  <div class="stat-card-staf">
    <div class="stat-card-angka"><?= $jk ?></div>
    <div class="stat-card-label">Data Seluruh Kelas</div>
    <a class="btn-staf" href="<?= e(url('kepsek/data-kelas.php')) ?>" style="width:100%; box-sizing:border-box;">
      🏫 Buka Data Kelas
    </a>
  </div>

  <div class="stat-card-staf">
    <div class="stat-card-angka"><?= $jg ?></div>
    <div class="stat-card-label">Data Guru Pengampu</div>
    <a class="btn-staf" href="<?= e(url('kepsek/nama-guru.php')) ?>" style="width:100%; box-sizing:border-box;">
      👩‍🏫 Buka Data Guru
    </a>
  </div>
</div>
<?php halaman_selesai(); ?>
