<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('guru');

$q = trim($_GET['q'] ?? '');
if ($q !== '') {
    $st = db()->prepare('SELECT * FROM soal WHERE id_guru = ? AND (kata_inggris LIKE ? OR arti_indonesia LIKE ?) ORDER BY kata_inggris');
    $st->execute([$_SESSION['id'], "%$q%", "%$q%"]);
} else {
    $st = db()->prepare('SELECT * FROM soal WHERE id_guru = ? ORDER BY kata_inggris');
    $st->execute([$_SESSION['id']]);
}
$soal = $st->fetchAll();

halaman_mulai('Kelola Soal Kuis');
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem;">Kelola Soal Kuis</h1>
    <p class="bantu">Daftar soal bergambar milik Anda.</p>
  </div>
  <div>
    <a class="btn-staf" href="<?= e(url('guru/soal-form.php')) ?>">
      + Tambah Soal
    </a>
  </div>
</div>

<div class="card-staf">
  <div style="margin-bottom:14px;">
    <form method="get" action="" style="display:flex; gap:8px;">
      <input type="search" name="q" value="<?= e($q) ?>" placeholder="Cari kata Inggris atau arti..." style="max-width:320px;">
      <button class="btn-staf btn-staf-netral" type="submit">Cari</button>
      <?php if ($q !== ''): ?>
        <a class="btn-staf btn-staf-netral" href="<?= e(url('guru/soal.php')) ?>">Reset</a>
      <?php endif; ?>
    </form>
  </div>

  <?php if (!$soal): ?>
    <p class="bantu"><?= $q !== '' ? 'Soal tidak ditemukan.' : 'Belum ada soal. Klik Tambah Soal untuk membuat soal baru.' ?></p>
  <?php else: ?>
    <div class="tabel-staf-bungkus">
      <table class="tabel-staf">
        <thead>
          <tr>
            <th style="width:70px;">Gambar</th>
            <th>Kata Inggris</th>
            <th>Arti Indonesia</th>
            <th>Diubah</th>
            <th style="text-align:right; width:140px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($soal as $s): ?>
            <tr>
              <td>
                <img src="<?= e(gambar_url($s['gambar'])) ?>" alt="" style="width:48px; height:48px; object-fit:contain; border:1px solid var(--garis); background:#fff; border-radius:4px; display:block;">
              </td>
              <td><strong><?= e($s['kata_inggris']) ?></strong></td>
              <td><?= e($s['arti_indonesia']) ?></td>
              <td style="font-size:13px; color:#666666;"><?= e(tgl_id($s['diubah_pada'] ?: $s['dibuat_pada'])) ?></td>
              <td style="text-align:right;">
                <a class="btn-staf btn-staf-netral" style="padding:4px 8px; font-size:13px;" href="<?= e(url('guru/soal-form.php?id=' . (int)$s['id_soal'])) ?>">Ubah</a>
                <a class="btn-staf btn-staf-merah" style="padding:4px 8px; font-size:13px;" href="<?= e(url('guru/soal-hapus.php?id=' . (int)$s['id_soal'])) ?>">Hapus</a>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
