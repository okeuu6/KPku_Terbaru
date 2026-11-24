<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('siswa');

// Soal milik Guru pengampu kelas siswa ini (FR-05)
$st = db()->prepare('SELECT s.id_soal, s.kata_inggris, s.arti_indonesia, s.gambar FROM soal s JOIN kelas k ON k.id_guru = s.id_guru WHERE k.id_kelas = ? ORDER BY s.kata_inggris');
$st->execute([$_SESSION['id_kelas']]);
$kartu = array_map(fn($r) => [
    'kata' => $r['kata_inggris'],
    'arti' => $r['arti_indonesia'],
    'gambar' => gambar_url($r['gambar'])
], $st->fetchAll());

halaman_mulai('Mode Belajar', ['back' => 'siswa/menu.php']);
?>
<div class="siswa-zona" style="max-width:500px; margin:0 auto;">
<?php if (!$kartu): ?>
  <div class="card-siswa">
    <img src="<?= e(url('assets/img/kiko.svg')) ?>" alt="Kiko" style="width:100px; height:100px; margin:0 auto 12px; display:block;">
    <h2 style="font-size:24px; font-weight:800; margin:0 0 8px;">Belum Ada Kartu Kata</h2>
    <p class="bantu" style="font-size:16px; margin-bottom:20px;">Bapak/Ibu gurumu sedang menyiapkan materi kosa kata seru untukmu.</p>
    <a class="btn-siswa btn-siswa-netral" href="<?= e(url('siswa/menu.php')) ?>">Kembali ke Menu Utama</a>
  </div>
<?php else: ?>
  <div class="card-siswa">
    <div style="display:flex; justify-content:space-between; align-items:center; font-weight:800; font-size:18px; margin-bottom:14px; border-bottom:2.5px solid var(--garis); padding-bottom:10px;">
      <span class="stiker-badge" style="margin:0; font-size:14px;" id="hitung">Kartu 1 / <?= count($kartu) ?></span>
      <span style="color:var(--warna-utama); font-weight:800;">📖 Mode Belajar</span>
    </div>

    <!-- Gambar Kosa Kata Kartun -->
    <img id="gambar" alt="Gambar kosa kata" class="kartu-kata-gambar" src="">

    <!-- Kata Inggris & Arti Indonesia -->
    <div class="kartu-kata-inggris" id="kata">...</div>
    <div class="kartu-kata-arti">
      Arti: <strong id="arti" style="color:var(--teks);">...</strong>
    </div>

    <!-- Tombol Suara Pelafalan Ceria -->
    <button class="btn-siswa btn-siswa-hijau" id="dengar" type="button">
      <span style="font-size:24px;">🔊</span> Dengarkan Pelafalan
    </button>
    <p class="bantu" id="tts-info" style="font-weight:700; color:#10B981; margin:4px 0 16px;">
      💡 Dengarkan suaranya, lalu tirukan pelafalannya ya!
    </p>

    <!-- Navigasi Kartu Sebelumnya / Berikutnya -->
    <div class="nav-kartu-siswa">
      <button class="btn-siswa btn-siswa-netral" id="sebelum" type="button">&larr; Sebelumnya</button>
      <button class="btn-siswa btn-siswa-aksen" id="berikut" type="button">Berikutnya &rarr;</button>
    </div>
  </div>

  <script type="application/json" id="data-kartu"><?= json_encode($kartu, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php endif; ?>
</div>
<?php halaman_selesai($kartu ? ['belajar.js'] : []); ?>
