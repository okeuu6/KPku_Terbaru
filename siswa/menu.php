<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('siswa');

$st = db()->prepare('SELECT COALESCE(SUM(nilai),0) FROM poin WHERE nisn = ?');
$st->execute([$_SESSION['nisn']]);
$total = (int)$st->fetchColumn();

$stK = db()->prepare('SELECT nama_kelas FROM kelas WHERE id_kelas = ?');
$stK->execute([$_SESSION['id_kelas']]);
$namaKelas = $stK->fetchColumn() ?: 'Kelas';

halaman_mulai('Menu Utama');
?>
<div class="siswa-zona" style="max-width:500px; margin:0 auto; text-align:center;">
  
  <!-- Maskot Ramah Kiko -->
  <div style="position:relative; margin-bottom:12px;">
    <img src="<?= e(url('assets/img/kiko.svg')) ?>" alt="Kiko Maskot" style="width:115px; height:115px; margin:0 auto; display:block; filter:drop-shadow(0 4px 0 rgba(0,0,0,0.08));">
  </div>

  <div class="stiker-badge">
    <span>✨</span> Selamat Datang di Petualangan Kata!
  </div>

  <h1 style="font-size:30px; font-weight:900; margin:0 0 4px; color:var(--teks);">
    Halo, <?= e($_SESSION['nama']) ?>! 👋
  </h1>
  <p style="font-size:18px; color:var(--teks-muda); font-weight:700; margin:0 0 20px;">
    Siswa <?= e($namaKelas) ?>
  </p>

  <!-- Kotak Poin Ceria Siswa -->
  <div class="poin-siswa-box">
    <div style="font-size:18px; font-weight:800; color:var(--teks);">⭐ Total Bintang & Poin Kamu</div>
    <div class="poin-siswa-angka"><?= $total ?></div>
    <div style="font-size:16px; font-weight:700; color:#B45309;">
      <?= $total > 0 ? 'Hebat sekali! Ayo kumpulkan lebih banyak lagi!' : 'Yuk mulai latihan kuis untuk mendapatkan bintang!' ?>
    </div>
  </div>

  <!-- Pilihan Petualangan Siswa (Chunky 3D Buttons) -->
  <div style="display:flex; flex-direction:column; gap:12px;">
    <a class="btn-siswa" href="<?= e(url('siswa/belajar.php')) ?>">
      <span style="font-size:24px;">📖</span> Mode Belajar (Kartu Kata)
    </a>

    <a class="btn-siswa btn-siswa-aksen" href="<?= e(url('siswa/mencocokkan.php')) ?>">
      <span style="font-size:24px;">🎮</span> Mode Mencocokkan (Kuis Tebak)
    </a>

    <a class="btn-siswa btn-siswa-emas" href="<?= e(url('siswa/poin.php')) ?>">
      <span style="font-size:24px;">🏆</span> Papan Poin Saya
    </a>

    <a class="btn-siswa btn-siswa-netral" href="<?= e(url('logout.php')) ?>" style="margin-top:8px;">
      🚪 Keluar dari Kelas
    </a>
  </div>
</div>
<?php halaman_selesai(); ?>
