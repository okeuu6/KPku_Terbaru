<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('siswa');

$h = $_SESSION['hasil'] ?? null;
if (!$h) redirect('siswa/menu.php');

$st = db()->prepare('SELECT COALESCE(SUM(nilai),0) FROM poin WHERE nisn = ?');
$st->execute([$_SESSION['nisn']]);
$total = (int)$st->fetchColumn();

$benar = (int)$h['benar'];
$jmlSoal = (int)$h['total'];
$poinSesi = (int)$h['poin'];
$persen = $jmlSoal > 0 ? ($benar / $jmlSoal) : 0;

halaman_mulai('Hasil Kuis');
?>
<div class="siswa-zona" style="max-width:500px; margin:0 auto; text-align:center;">
  <div class="card-siswa">
    
    <!-- Maskot Kiko Juara dengan Piala -->
    <img src="<?= e(url('assets/img/kiko-juara.svg')) ?>" alt="Juara!" style="width:140px; height:140px; margin:0 auto 10px; display:block; filter:drop-shadow(0 4px 0 rgba(0,0,0,0.1));">

    <div class="stiker-badge" style="background:#BBF7D0;">
      <span>🎉</span> Horeee! Selesai!
    </div>

    <h1 style="font-size:32px; font-weight:900; margin:4px 0 8px; color:var(--teks);">
      <?php if ($persen >= 0.8): ?>
        Luar Biasa, Jagoan! 🏆
      <?php elseif ($persen >= 0.5): ?>
        Hebat Banget! 🌟
      <?php else: ?>
        Kerja Bagus! 💪
      <?php endif; ?>
    </h1>

    <!-- Deretan Bintang Penghargaan -->
    <div style="font-size:34px; margin:8px 0 14px; letter-spacing:6px;">
      <?php if ($persen >= 0.8): ?>
        ⭐⭐⭐
      <?php elseif ($persen >= 0.5): ?>
        ⭐⭐<span style="opacity:0.3;">⭐</span>
      <?php else: ?>
        ⭐<span style="opacity:0.3;">⭐⭐</span>
      <?php endif; ?>
    </div>

    <p style="font-size:20px; font-weight:700; color:#334155; margin:0 0 18px;">
      Kamu berhasil menjawab benar <strong><?= $benar ?></strong> dari <?= $jmlSoal ?> soal!
    </p>

    <!-- Box Hadiah Bintang & Poin -->
    <div class="poin-siswa-box">
      <div style="font-size:18px; font-weight:800; color:#B45309;">✨ Poin Tambahan yang Kamu Raih</div>
      <div class="poin-siswa-angka">+<?= $poinSesi ?></div>
      <div style="font-size:17px; font-weight:800; color:var(--teks); margin-top:4px;">
        Total tabungan poinmu sekarang: <strong style="color:var(--warna-utama);"><?= $total ?></strong> Poin
      </div>
    </div>

    <!-- Tombol Aksi Siswa -->
    <div style="display:flex; flex-direction:column; gap:12px;">
      <a class="btn-siswa btn-siswa-aksen" href="<?= e(url('siswa/mencocokkan.php')) ?>">
        <span style="font-size:22px;">🎮</span> Main Kuis Lagi
      </a>
      <a class="btn-siswa btn-siswa-netral" href="<?= e(url('siswa/menu.php')) ?>">
        <span style="font-size:22px;">🏠</span> Kembali ke Menu Utama
      </a>
    </div>
  </div>
</div>

<!-- Letupan Konfeti Ceria & Musik Kemenangan -->
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (window.KuisEfek) {
      window.KuisEfek.suara.selesai();
      window.KuisEfek.konfeti();
    }
  });
</script>
<?php halaman_selesai(); ?>
