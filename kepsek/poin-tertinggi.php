<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('kepsek');

$q = trim($_GET['q'] ?? '');
$params = [];
$where = '';
if ($q !== '') {
    $where = 'WHERE s.nama LIKE ? OR s.nisn LIKE ? OR k.nama_kelas LIKE ?';
    $params = ["%$q%", "%$q%", "%$q%"];
}

$sql = "SELECT s.nisn, s.nama, k.nama_kelas, g.nama AS nama_guru, 
               COALESCE(SUM(p.nilai), 0) AS total, 
               COUNT(p.id_poin) AS jml_sesi
        FROM siswa s
        JOIN kelas k ON k.id_kelas = s.id_kelas
        LEFT JOIN guru g ON g.id_guru = k.id_guru
        LEFT JOIN poin p ON p.nisn = s.nisn
        $where
        GROUP BY s.nisn, s.nama, k.nama_kelas, g.nama
        ORDER BY total DESC, s.nama";

$st = db()->prepare($sql);
$st->execute($params);
$rows = $st->fetchAll();

halaman_mulai('Laporan Lengkap Nilai Siswa', ['back' => 'kepsek/index.php']);
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
  <div>
    <h1 style="margin:0; font-size:1.5rem; font-weight:800; color:var(--teks);">
      📊 Laporan Lengkap Nilai Siswa
    </h1>
    <p class="bantu" style="margin:2px 0 0;">Rekapitulasi nilai dan capaian pembelajaran kuis kosa kata bahasa Inggris seluruh siswa.</p>
  </div>
  <div style="display:flex; gap:8px;">
    <button class="btn-staf btn-staf-netral" onclick="window.print()" type="button" style="font-size:14px; padding:8px 14px;">
      🖨️ Cetak Laporan
    </button>
  </div>
</div>

<div class="card-staf">
  <div style="margin-bottom:16px;">
    <form method="get" action="" style="display:flex; gap:8px; flex-wrap:wrap;">
      <input type="search" name="q" value="<?= e($q) ?>" placeholder="Cari nama siswa, NISN, atau kelas..." style="max-width:340px;">
      <button class="btn-staf btn-staf-netral" type="submit">Cari</button>
      <?php if ($q !== ''): ?>
        <a class="btn-staf btn-staf-netral" href="<?= e(url('kepsek/poin-tertinggi.php')) ?>">Reset</a>
      <?php endif; ?>
    </form>
  </div>

  <?php if (!$rows): ?>
    <p class="bantu"><?= $q !== '' ? 'Data siswa tidak ditemukan.' : 'Belum ada data nilai siswa.' ?></p>
  <?php else: ?>
    <div class="tabel-staf-bungkus">
      <table class="tabel-staf">
        <thead>
          <tr style="background:#F8FAFC;">
            <th style="width:60px; text-align:center;">No</th>
            <th>NISN</th>
            <th>Nama Lengkap Siswa</th>
            <th>Kelas</th>
            <th>Guru Pengampu</th>
            <th style="text-align:right;">Total Poin</th>
            <th>Predikat Capaian</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $i => $r): 
            $tot = (int)$r['total'];
            if ($tot >= 100) {
                $pred = '⭐⭐⭐ Sangat Baik';
                $badgeBg = '#ECFDF5'; $badgeClr = '#065F46';
            } elseif ($tot >= 50) {
                $pred = '⭐⭐ Baik';
                $badgeBg = '#EFF6FF'; $badgeClr = '#1E40AF';
            } elseif ($tot > 0) {
                $pred = '⭐ Cukup';
                $badgeBg = '#FFFBEB'; $badgeClr = '#92400E';
            } else {
                $pred = 'Belum Ada Poin';
                $badgeBg = '#F1F5F9'; $badgeClr = '#475569';
            }
          ?>
            <tr>
              <td style="text-align:center; font-weight:800; color:var(--teks);"><?= $i + 1 ?></td>
              <td style="font-family:monospace; font-size:14px;"><?= e($r['nisn']) ?></td>
              <td><strong><?= e($r['nama']) ?></strong></td>
              <td><span class="peran-label" style="background:#EFF6FF; border-color:#BFDBFE; color:#1E40AF;"><?= e($r['nama_kelas']) ?></span></td>
              <td><?= e($r['nama_guru'] ?: '-') ?></td>
              <td style="text-align:right; font-weight:900; font-size:16px; color:#D97706;">
                <?= $tot ?> ⭐
              </td>
              <td>
                <span style="display:inline-block; padding:3px 10px; border-radius:12px; font-size:13px; font-weight:700; background:<?= $badgeBg ?>; color:<?= $badgeClr ?>; border:1px solid <?= $badgeClr ?>;">
                  <?= $pred ?>
                </span>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
