<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('guru');

$id = (int)($_GET['id'] ?? $_POST['id'] ?? 0);
$st = db()->prepare('SELECT * FROM soal WHERE id_soal = ? AND id_guru = ?');
$st->execute([$id, $_SESSION['id']]);
if (!($s = $st->fetch())) {
    flash('Soal tidak ditemukan.', 'err');
    redirect('guru/soal.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    db()->prepare('DELETE FROM soal WHERE id_soal = ? AND id_guru = ?')->execute([$id, $_SESSION['id']]);
    hapus_berkas_gambar($s['gambar']);
    flash('Soal beserta gambarnya berhasil dihapus.');
    redirect('guru/soal.php');
}

halaman_mulai('Konfirmasi Hapus Soal', ['back' => 'guru/soal.php']);
?>
<div class="card-staf" style="max-width:480px; margin:0 auto; text-align:center;">
  <h2 style="margin:0 0 12px; font-size:1.25rem;">Hapus Soal</h2>
  <img style="width:100px; height:100px; object-fit:contain; border:1px solid var(--garis); padding:6px; background:#fff; margin-bottom:12px;" src="<?= e(gambar_url($s['gambar'])) ?>" alt="">
  <p style="margin:0 0 20px;">
    Soal "<strong><?= e($s['kata_inggris']) ?> - <?= e($s['arti_indonesia']) ?></strong>" beserta gambarnya akan dihapus.
  </p>

  <form method="post" style="display:flex; gap:10px; justify-content:center;">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= $id ?>">
    <a class="btn-staf btn-staf-netral" href="<?= e(url('guru/soal.php')) ?>">Batal</a>
    <button class="btn-staf btn-staf-merah" type="submit">Hapus</button>
  </form>
</div>
<?php halaman_selesai(); ?>
