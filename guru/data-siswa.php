<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('guru');

$id = (int)($_GET['id'] ?? 0);
$st = db()->prepare('SELECT * FROM kelas WHERE id_kelas = ? AND id_guru = ?');
$st->execute([$id, $_SESSION['id']]);
if (!($k = $st->fetch())) {
    flash('Kelas tidak ditemukan atau bukan kelas yang diampu.', 'err');
    redirect('guru/index.php');
}

$st = db()->prepare('SELECT s.nisn, s.nama, s.sandi_terenkripsi, COALESCE(SUM(p.nilai),0) AS total FROM siswa s LEFT JOIN poin p ON p.nisn = s.nisn WHERE s.id_kelas = ? GROUP BY s.nisn, s.nama, s.sandi_terenkripsi ORDER BY s.nama');
$st->execute([$id]);
$siswa = $st->fetchAll();

halaman_mulai('Data Siswa', ['back' => 'guru/index.php']);
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem;"><?= e($k['nama_kelas']) ?></h1>
    <p class="bantu">Kode kelas: <strong><?= e($k['kode_kelas']) ?></strong> &middot; Jumlah: <?= count($siswa) ?> siswa</p>
  </div>
  <div>
    <button class="btn-staf btn-staf-netral" onclick="window.print()" type="button">
      Cetak Rekap
    </button>
  </div>
</div>

<div class="card-staf">
  <?php if (!$siswa): ?>
    <p class="bantu">Belum ada siswa di kelas ini.</p>
  <?php else: ?>
    <div class="tabel-staf-bungkus">
      <table class="tabel-staf">
        <thead>
          <tr>
            <th style="width:50px;">No</th>
            <th>Nama Siswa</th>
            <th>NISN</th>
            <th style="text-align:right;">Poin</th>
            <th style="text-align:center;">Sandi / PIN</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($siswa as $idx => $s): ?>
            <tr>
              <td><?= $idx + 1 ?></td>
              <td><strong><?= e($s['nama']) ?></strong></td>
              <td><?= e($s['nisn']) ?></td>
              <td style="text-align:right; font-weight:700; color:var(--warna-aksen);"><?= (int)$s['total'] ?></td>
              <td style="text-align:center; font-family:monospace; font-weight:700; font-size:16px;">
                <?= e(dekripsi_pin($s['sandi_terenkripsi'])) ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
