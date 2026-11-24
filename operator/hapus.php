<?php
require_once __DIR__ . '/_jenis.php';
$id = $_GET['id'] ?? $_POST['id'] ?? '';
$row = ambil_baris($cfg['tabel'], $cfg['pk'], $id);
if (!$row) {
    flash('Data tidak ditemukan.', 'err');
    redirect('operator/daftar.php?jenis=' . $jenis);
}

// Aturan blokir hapus (FR-18-22)
$blokir = null;
if ($jenis === 'guru') {
    if ((int)db()->query('SELECT COUNT(*) FROM kelas WHERE id_guru = ' . (int)$id)->fetchColumn() > 0)
        $blokir = 'Guru ini masih mengampu kelas. Ubah guru pengampu kelas tersebut terlebih dahulu.';
} elseif ($jenis === 'kelas') {
    if ((int)db()->query('SELECT COUNT(*) FROM siswa WHERE id_kelas = ' . (int)$id)->fetchColumn() > 0)
        $blokir = 'Kelas ini masih berisi siswa. Pindahkan atau hapus siswa di dalamnya terlebih dahulu.';
} elseif ($jenis === 'operator') {
    if ((string)$id === (string)$_SESSION['id'])
        $blokir = 'Anda tidak dapat menghapus akun Operator yang sedang digunakan.';
    elseif ((int)db()->query('SELECT COUNT(*) FROM operator')->fetchColumn() <= 1)
        $blokir = 'Tidak dapat menghapus Operator terakhir.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    if ($blokir) {
        flash($blokir, 'err');
        redirect('operator/daftar.php?jenis=' . $jenis);
    }
    // Hapus guru juga menghapus berkas gambar soalnya
    if ($jenis === 'guru') {
        $st = db()->prepare('SELECT gambar FROM soal WHERE id_guru = ?');
        $st->execute([(int)$id]);
        foreach ($st->fetchAll() as $g) hapus_berkas_gambar($g['gambar']);
    }
    db()->prepare("DELETE FROM {$cfg['tabel']} WHERE {$cfg['pk']} = ?")->execute([$id]);
    flash('Data ' . $cfg['satu'] . ' berhasil dihapus.');
    redirect('operator/daftar.php?jenis=' . $jenis);
}

halaman_mulai('Konfirmasi Hapus', ['back' => 'operator/daftar.php?jenis=' . $jenis]);
?>
<div class="card-staf" style="max-width:480px; margin:0 auto; text-align:center;">
  <h2 style="margin:0 0 12px; font-size:1.25rem;">Hapus Data <?= e(ucfirst($cfg['satu'])) ?></h2>
  <p style="margin:0 0 16px;">
    Data <?= e($cfg['satu']) ?> "<strong><?= e($row['nama'] ?? $row['nama_kelas'] ?? $id) ?></strong>" akan dihapus dari Sistem.
  </p>

  <?php if ($blokir): ?>
    <div class="pesan galat" style="text-align:left;">Galat: <?= e($blokir) ?></div>
    <a class="btn-staf btn-staf-netral" href="<?= e(url('operator/daftar.php?jenis=' . $jenis)) ?>">Kembali</a>
  <?php else: ?>
    <form method="post" style="display:flex; gap:10px; justify-content:center;">
      <?= csrf_field() ?>
      <input type="hidden" name="jenis" value="<?= e($jenis) ?>">
      <input type="hidden" name="id" value="<?= e((string)$id) ?>">
      <a class="btn-staf btn-staf-netral" href="<?= e(url('operator/daftar.php?jenis=' . $jenis)) ?>">Batal</a>
      <button class="btn-staf btn-staf-merah" type="submit">Hapus</button>
    </form>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
