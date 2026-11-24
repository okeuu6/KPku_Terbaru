<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('guru');

$st = db()->prepare('SELECT k.*, (SELECT COUNT(*) FROM siswa s WHERE s.id_kelas = k.id_kelas) AS jml FROM kelas k WHERE k.id_guru = ? ORDER BY k.nama_kelas');
$st->execute([$_SESSION['id']]);
$kelas = $st->fetchAll();

$stQ = db()->prepare('SELECT COUNT(*) FROM soal WHERE id_guru = ?');
$stQ->execute([$_SESSION['id']]);
$jmlSoal = (int)$stQ->fetchColumn();

halaman_mulai('Kelas Tersedia');
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem;">Kelas Tersedia</h1>
    <p class="bantu">Daftar kelas yang diampu.</p>
  </div>
  <div>
    <a class="btn-staf" href="<?= e(url('guru/soal.php')) ?>">
      Kelola Soal Kuis (<?= $jmlSoal ?>)
    </a>
  </div>
</div>

<?php if (!$kelas): ?>
  <div class="card-staf">
    <p class="bantu">Belum ada kelas yang diampu. Hubungi Operator sekolah.</p>
  </div>
<?php else: ?>
  <div class="grid dua">
    <?php foreach ($kelas as $k): ?>
      <div class="card-staf">
        <h2 style="margin:0 0 4px; font-size:1.2rem;"><?= e($k['nama_kelas']) ?></h2>
        <p style="margin:4px 0 14px; font-size:15px; color:#555555;">
          Kode kelas: <strong><?= e($k['kode_kelas']) ?></strong> &middot; Jumlah siswa: <strong><?= (int)$k['jml'] ?></strong>
        </p>
        <a class="btn-staf" href="<?= e(url('guru/data-siswa.php?id=' . (int)$k['id_kelas'])) ?>">
          Lihat Data Siswa
        </a>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
<?php halaman_selesai(); ?>
