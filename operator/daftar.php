<?php
require_once __DIR__ . '/_jenis.php';
$q = trim($_GET['q'] ?? '');
$like = '%' . $q . '%';

switch ($jenis) {
    case 'siswa':
        $kol = ['nisn' => 'NISN', 'nama' => 'Nama', 'nama_kelas' => 'Kelas'];
        $sql = 'SELECT s.nisn AS id, s.nisn, s.nama, k.nama_kelas FROM siswa s JOIN kelas k ON k.id_kelas = s.id_kelas WHERE s.nama LIKE ? OR s.nisn LIKE ? ORDER BY s.nama';
        $par = [$like, $like];
        break;
    case 'kelas':
        $kol = ['nama_kelas' => 'Nama Kelas', 'kode_kelas' => 'Kode Kelas', 'guru' => 'Guru Pengampu', 'kepsek' => 'Kepala Sekolah'];
        $sql = 'SELECT k.id_kelas AS id, k.nama_kelas, k.kode_kelas, g.nama AS guru, ks.nama AS kepsek FROM kelas k JOIN guru g ON g.id_guru = k.id_guru LEFT JOIN kepala_sekolah ks ON ks.id_kepsek = k.id_kepsek WHERE k.nama_kelas LIKE ? OR k.kode_kelas LIKE ? ORDER BY k.nama_kelas';
        $par = [$like, $like];
        break;
    default:
        $kol = ['nama' => 'Nama', 'username' => 'Username'];
        $sql = "SELECT {$cfg['pk']} AS id, nama, username FROM {$cfg['tabel']} WHERE nama LIKE ? OR username LIKE ? ORDER BY nama";
        $par = [$like, $like];
}

$st = db()->prepare($sql);
$st->execute($par);
$rows = $st->fetchAll();

halaman_mulai($cfg['judul'], ['back' => 'operator/index.php']);
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem;"><?= e($cfg['judul']) ?></h1>
    <p class="bantu">Kelola data <?= e($cfg['satu']) ?> sekolah.</p>
  </div>
  <div>
    <a class="btn-staf" href="<?= e(url('operator/form.php?jenis=' . $jenis)) ?>">
      + Tambah
    </a>
  </div>
</div>

<div class="card-staf">
  <div style="margin-bottom:14px;">
    <form method="get" style="display:flex; gap:8px;">
      <input type="hidden" name="jenis" value="<?= e($jenis) ?>">
      <input type="search" name="q" value="<?= e($q) ?>" placeholder="<?= $jenis === 'siswa' ? 'Cari nama atau NISN' : ($jenis === 'kelas' ? 'Cari nama atau kode kelas' : 'Cari nama atau username') ?>" style="max-width:320px;">
      <button class="btn-staf btn-staf-netral" type="submit">Cari</button>
      <?php if ($q !== ''): ?>
        <a class="btn-staf btn-staf-netral" href="<?= e(url('operator/daftar.php?jenis=' . $jenis)) ?>">Reset</a>
      <?php endif; ?>
    </form>
  </div>

  <?php if (!$rows): ?>
    <p class="bantu"><?= $q !== '' ? 'Data tidak ditemukan.' : 'Data masih kosong.' ?></p>
  <?php else: ?>
    <div class="tabel-staf-bungkus">
      <table class="tabel-staf">
        <thead>
          <tr>
            <?php foreach ($kol as $l): ?>
              <th><?= e($l) ?></th>
            <?php endforeach; ?>
            <th style="text-align:right; width:130px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $r): ?>
            <tr>
              <?php foreach ($kol as $k => $l): ?>
                <td><?= e($r[$k] ?? '-') ?: '-' ?></td>
              <?php endforeach; ?>
              <td style="text-align:right;">
                <a class="btn-staf btn-staf-netral" style="padding:4px 8px; font-size:13px;" href="<?= e(url('operator/form.php?jenis=' . $jenis . '&id=' . urlencode((string)$r['id']))) ?>">Ubah</a>
                <a class="btn-staf btn-staf-merah" style="padding:4px 8px; font-size:13px;" href="<?= e(url('operator/hapus.php?jenis=' . $jenis . '&id=' . urlencode((string)$r['id']))) ?>">Hapus</a>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
