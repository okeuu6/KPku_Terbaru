<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('siswa');

halaman_mulai('Mode Mencocokkan', ['back' => 'siswa/menu.php']);
?>
<div class="siswa-zona" style="max-width:520px; margin:0 auto;" id="game"
     data-api="<?= e(url('api/soal.php')) ?>"
     data-poin="<?= e(url('api/poin.php')) ?>"
     data-hasil="<?= e(url('siswa/hasil.php')) ?>">

  <div id="pesan-game" class="pesan galat" style="display:none"></div>

  <div id="area" style="display:none" class="card-siswa">
    <!-- Papan Skor Kuis Ceria -->
    <div style="display:flex; justify-content:space-between; align-items:center; font-weight:800; font-size:18px; margin-bottom:14px; border-bottom:2.5px solid var(--garis); padding-bottom:10px;">
      <span class="stiker-badge" style="margin:0; font-size:15px;" id="no">Soal 1 / 10</span>
      <span style="font-size:18px; color:#D97706; font-weight:900;">
        ⭐ Poin: <strong id="skor" style="font-size:22px; color:#D97706;">0</strong>
      </span>
    </div>

    <!-- Gambar Soal Kuis -->
    <img class="kartu-kata-gambar" id="gambar" alt="Gambar kosa kata" src="">

    <div style="background:#EFF6FF; border:2px dashed #93C5FD; border-radius:14px; padding:10px 14px; margin:10px 0 16px;">
      <span style="font-size:17px; font-weight:800; color:var(--warna-utama);">
        ❓ Pilih kata yang sesuai dengan gambar di atas:
      </span>
    </div>

    <!-- Opsi Pilihan Kata Siswa (Grid 2 Kolom Ramah Anak) -->
    <div class="opsi-kuis" id="opsi"></div>

    <!-- Umpan Balik Ceria & Menyenangkan -->
    <div id="umpan" class="umpan-balik-box"></div>

    <!-- Tombol Lanjut Soal -->
    <button class="btn-siswa btn-siswa-aksen" id="lanjut" type="button" style="display:none; margin-top:16px;">
      Lanjut ke Soal Berikutnya &rarr;
    </button>
  </div>

  <!-- State Memuat Soal -->
  <div id="muat" class="card-siswa">
    <img src="<?= e(url('assets/img/kiko.svg')) ?>" alt="Kiko" style="width:110px; height:110px; margin:0 auto 12px; display:block;">
    <h3 style="font-size:22px; font-weight:800; margin:0 0 6px;">Menyiapkan Soal Kuis...</h3>
    <p class="bantu" style="font-size:16px; margin:0;">Tunggu sebentar ya, Kiko sedang menyiapkan gambar dan pilihan kata seru!</p>
  </div>
</div>
<?php halaman_selesai(['kuis.js']); ?>
