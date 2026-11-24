<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('kepsek');

$rows = db()->query('SELECT k.nama_kelas, k.kode_kelas, g.nama AS guru, (SELECT COUNT(*) FROM siswa s WHERE s.id_kelas = k.id_kelas) AS jml FROM kelas k JOIN guru g ON g.id_guru = k.id_guru ORDER BY k.nama_kelas')->fetchAll();

halaman_mulai('Data Kelas', ['back' => 'kepsek/index.php']);
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem;">Data Seluruh Kelas</h1>
    <p class="bantu">Pemantauan kelas dan guru pengampu.</p>
  </div>
  <div>
    <button class="btn-staf btn-staf-netral" onclick="window.print()" type="button">
      Cetak
    </button>
  </div>
</div>

<div class="card-staf">
  <?php if (!$rows): ?>
    <p class="bantu">Data kelas masih kosong.</p>
  <?php else: ?>
    <div class="tabel-staf-bungkus">
      <table class="tabel-staf">
        <thead>
          <tr>
            <th>Kelas</th>
            <th>Guru Pengampu</th>
            <th style="text-align:right;">Jumlah Siswa</th>
            <th style="text-align:center;">Kode Kelas</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $r): ?>
            <tr>
              <td><strong><?= e($r['nama_kelas']) ?></strong></td>
              <td><?= e($r['guru']) ?></td>
              <td style="text-align:right;"><?= (int)$r['jml'] ?></td>
              <td style="text-align:center; font-family:monospace; font-weight:700;"><?= e($r['kode_kelas']) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
