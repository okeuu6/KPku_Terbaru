<?php
// ==============================================================
// MEDIA BELAJAR INGGRIS SD - KPKU
// Landing Page Ceria, Hangat, & Pintu Masuk Belajar Ramah Anak
// Human-Crafted (Bukan Template AI)
// ==============================================================
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout.php';

$tujuan = [
    'siswa' => 'siswa/menu.php',
    'guru' => 'guru/index.php',
    'kepsek' => 'kepsek/index.php',
    'operator' => 'operator/index.php'
];

$userAktif = user();
$roleAktif = peran();

$peranList = [
    'siswa' => '🎒 Siswa',
    'guru' => '👨‍🏫 Guru',
    'kepsek' => '👔 Kepala Sekolah',
    'operator' => '⚙️ Operator'
];

$tab = $_POST['peran'] ?? $_GET['peran'] ?? 'siswa';
if (!isset($peranList[$tab])) $tab = 'siswa';
$galat = ''; $kodeIsi = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    $aksi = $_POST['aksi'] ?? '';

    if ($aksi === 'kode' && $tab === 'siswa') { // FR-01
        $kodeIsi = strtoupper(trim($_POST['kode'] ?? ''));
        if ($kodeIsi === '') {
            $galat = 'Kode kelas wajib diisi ya!';
        } else {
            $st = db()->prepare('SELECT id_kelas, nama_kelas FROM kelas WHERE kode_kelas = ?');
            $st->execute([$kodeIsi]);
            if ($k = $st->fetch()) {
                $_SESSION['kelas_pending'] = (int)$k['id_kelas'];
                $_SESSION['nama_kelas_pending'] = $k['nama_kelas'];
            } else {
                $galat = 'Kode kelas tidak ditemukan. Tanyakan pada bapak/ibu gurumu ya!';
            }
        }
    } elseif ($aksi === 'ganti_kelas') {
        unset($_SESSION['kelas_pending'], $_SESSION['nama_kelas_pending']);
    } elseif ($aksi === 'masuk_siswa' && !empty($_SESSION['kelas_pending'])) { // FR-02, FR-03
        $nisn = $_POST['nisn'] ?? '';
        $pin = $_POST['pin'] ?? '';
        if (terlalu_banyak_percobaan()) {
            $galat = 'Terlalu banyak percobaan. Tunggu 30 detik lalu coba lagi ya.';
        } elseif ($nisn === '') {
            $galat = 'Silakan pilih namamu dari daftar terlebih dahulu.';
        } elseif (!preg_match('/^\d{4}$/', $pin)) {
            $galat = 'PIN harus berupa 4 angka rahasiamu.';
        } else {
            $st = db()->prepare('SELECT * FROM siswa WHERE nisn = ? AND id_kelas = ?');
            $st->execute([$nisn, $_SESSION['kelas_pending']]);
            $s = $st->fetch();
            if ($s && password_verify($pin, $s['sandi_hash'])) {
                mulai_sesi([
                    'role' => 'siswa',
                    'id' => $s['nisn'],
                    'nisn' => $s['nisn'],
                    'nama' => $s['nama'],
                    'id_kelas' => (int)$s['id_kelas']
                ]);
                unset($_SESSION['kelas_pending'], $_SESSION['nama_kelas_pending']);
                redirect('siswa/menu.php');
            }
            catat_gagal();
            $galat = 'PIN salah. Coba periksa kembali atau tanya gurumu ya.';
        }
    } elseif ($aksi === 'staf' && $tab !== 'siswa') { // FR-04
        $u = trim($_POST['username'] ?? '');
        $p = $_POST['sandi'] ?? '';
        if ($u === '' || $p === '') {
            $galat = 'Username dan kata sandi wajib diisi.';
        } else {
            $galat = login_staf($u, $p, $tab) ?? '';
            if (!$galat) {
                redirect($tujuan[peran()]);
            }
        }
    }
}

// Siswa langkah 2: daftar nama kelas
$kelas = null; $daftarSiswa = [];
if ($tab === 'siswa' && !empty($_SESSION['kelas_pending'])) {
    $st = db()->prepare('SELECT id_kelas, nama_kelas, kode_kelas FROM kelas WHERE id_kelas = ?');
    $st->execute([$_SESSION['kelas_pending']]);
    if ($kelas = $st->fetch()) {
        $st = db()->prepare('SELECT nisn, nama FROM siswa WHERE id_kelas = ? ORDER BY nama');
        $st->execute([$_SESSION['kelas_pending']]);
        $daftarSiswa = $st->fetchAll();
    } else {
        unset($_SESSION['kelas_pending'], $_SESSION['nama_kelas_pending']);
    }
}

$vCss = @filemtime(__DIR__ . '/assets/css/landing.css') ?: 1;
$vApp = @filemtime(__DIR__ . '/assets/css/app.css') ?: 1;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Media Pembelajaran Interaktif Bahasa Inggris Berbasis Web untuk Siswa Sekolah Dasar - KPKu">
  <meta name="csrf" content="<?= csrf_token() ?>">
  <title><?= e(NAMA_APLIKASI) ?> - <?= e(NAMA_SEKOLAH) ?></title>
  <link rel="icon" type="image/svg+xml" href="<?= e(url('assets/img/logo.svg')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('assets/css/app.css')) ?>?v=<?= $vApp ?>">
  <link rel="stylesheet" href="<?= e(url('assets/css/landing.css')) ?>?v=<?= $vCss ?>">
  <style>
    /* Tab Peran Ceria & Taktil */
    .tab-peran-bar {
      display: flex;
      gap: 6px;
      border-bottom: 3px solid var(--border-komik);
      margin-bottom: 22px;
      overflow-x: auto;
      padding-bottom: 6px;
    }
    .tab-peran-btn {
      flex: 1;
      min-width: 90px;
      padding: 10px 12px;
      text-align: center;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      color: var(--teks);
      background: #F1F5F9;
      border: 2px solid var(--border-komik);
      border-radius: 14px;
      box-shadow: 0 3px 0 var(--border-komik);
      transition: transform var(--transisi), background var(--transisi);
      white-space: nowrap;
    }
    .tab-peran-btn:hover {
      background: #FEF08A;
      transform: translateY(-2px);
    }
    .tab-peran-btn.aktif {
      background: var(--warna-utama);
      color: #FFFFFF;
      box-shadow: 0 4px 0 var(--border-komik);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>

  <!-- ==================== HEADER LENGKET ==================== -->
  <header class="lp-header">
    <div class="container header-wrap">
      <a href="<?= e(url('index.php')) ?>" class="brand-link">
        <img src="<?= e(url('assets/img/logo.svg')) ?>" alt="Logo" class="brand-logo">
        <div class="brand-title">
          Media Belajar <span>Inggris SD</span>
          <small><?= e(NAMA_SEKOLAH) ?></small>
        </div>
      </a>

      <nav class="lp-nav">
        <a href="#fitur">Fitur Keren</a>
        <a href="#cara-kerja">Alur Belajar</a>
        <a href="#untuk-siapa">Untuk Siapa</a>
        <a href="#mockup">Pratinjau</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div style="display:flex; align-items:center; gap:8px;">
        <button id="btn-sound-top" type="button" class="btn-lp btn-lp-netral" style="padding:8px 12px; font-size:14px;" onclick="if(window.KuisEfek){var m=window.KuisEfek.suara.toggleMute();this.textContent=m?'🔇 Suara Mati':'🔊 Suara Nyala';}" title="Suara">🔊 Suara</button>
        <?php if ($userAktif): ?>
          <a href="<?= e(url($tujuan[$roleAktif] ?? 'index.php')) ?>" class="btn-lp btn-lp-utama">
            Dashboard (<?= e($_SESSION['nama']) ?>)
          </a>
        <?php else: ?>
          <a href="#masuk-portal" class="btn-lp btn-lp-utama" onclick="pilihTabPeran('siswa')">
            🎒 Aku Siswa
          </a>
          <a href="#masuk-portal" class="btn-lp btn-lp-netral" onclick="pilihTabPeran('guru')">
            👨‍🏫 Masuk Staf
          </a>
        <?php endif; ?>
      </div>
    </div>
  </header>

  <!-- ==================== HERO SECTION CERIA ==================== -->
  <section class="hero-section">
    <div class="container hero-grid">
      <div>
        <div class="hero-badge">
          <span>✨</span> Petualangan Belajar Kosa Kata Inggris SD
        </div>

        <h1 class="hero-title">
          Belajar Bahasa Inggris <span class="sorot">Jadi Super Asik!</span> 🎈
        </h1>
        <p class="hero-desc">
          Yuk kenali aneka benda di sekitarmu dalam bahasa Inggris! Lihat gambar lucunya, dengar suara pelafalan aslinya, dan selesaikan kuis berhadiah bintang kejuaraan! ⭐
        </p>

        <div class="hero-actions">
          <?php if ($userAktif): ?>
            <a href="<?= e(url($tujuan[$roleAktif] ?? 'index.php')) ?>" class="btn-lp btn-lp-utama" style="font-size:18px; padding:14px 28px;">
              🚀 Lanjut Belajar (<?= e($_SESSION['nama']) ?>)
            </a>
          <?php else: ?>
            <a href="#masuk-portal" class="btn-lp btn-lp-utama" onclick="pilihTabPeran('siswa')" style="font-size:18px; padding:14px 28px;">
              🚀 Mulai Belajar Sekarang!
            </a>
            <a href="#masuk-portal" class="btn-lp btn-lp-netral" onclick="pilihTabPeran('guru')">
              👨‍🏫 Ruang Guru & Staf
            </a>
          <?php endif; ?>
        </div>
      </div>

      <!-- Kartu Interaktif Hero (Bisa Diklik Langsung Bunyi) -->
      <div>
        <div class="hero-card-box">
          <div class="hero-card-tag">⭐ Coba Dengar!</div>
          <div class="hero-card-img-wrap">
            <img id="heroImg" src="<?= e(url('assets/img/contoh/apple.svg')) ?>" alt="Apple" class="hero-card-img">
          </div>
          <div class="hero-word-title" id="heroWord">APPLE</div>
          <div class="hero-word-arti" id="heroArti">Arti: <strong>Apel</strong></div>
          <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
            <button class="btn-lp btn-lp-hijau" type="button" onclick="playVoiceHero()">
              <span style="font-size:20px;">🔊</span> Bunyikan Suara
            </button>
            <button class="btn-lp btn-lp-aksen" type="button" onclick="gantiKartuHero()">
              Ganti Gambar &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== PINTU MASUK / FORM LOGIN ==================== -->
  <section class="section" id="masuk-portal" style="background: var(--latar);">
    <div class="container" style="max-width: 540px;">
      <div class="section-header" style="margin-bottom: 24px;">
        <span class="section-kategori">Gerbang Masuk</span>
        <h2 class="section-title">Pintu Masuk Belajar 🏫</h2>
        <p class="section-desc">Pilih peranmu untuk memulai petualangan atau mengelola pembelajaran.</p>
      </div>

      <div class="card-siswa" style="text-align: left; background: var(--permukaan);">
        <!-- Tab Pilihan Peran -->
        <div class="tab-peran-bar" role="tablist">
          <?php foreach ($peranList as $k => $lb): ?>
            <a href="<?= e(url('index.php?peran=' . $k)) ?>#masuk-portal" role="tab" class="tab-peran-btn <?= $k === $tab ? 'aktif' : '' ?>" id="tab-btn-<?= $k ?>">
              <?= e($lb) ?>
            </a>
          <?php endforeach; ?>
        </div>

        <?php if ($galat): ?>
          <div class="pesan galat">⚠️ <?= e($galat) ?></div>
        <?php endif; ?>

        <!-- SISWA TAHAP 1: INPUT KODE KELAS (FR-01) -->
        <?php if ($tab === 'siswa' && !$kelas): ?>
          <form method="post" autocomplete="off" class="siswa-zona">
            <?= csrf_field() ?>
            <input type="hidden" name="peran" value="siswa">
            <input type="hidden" name="aksi" value="kode">

            <div style="text-align:center; margin-bottom:14px;">
              <img src="<?= e(url('assets/img/kiko.svg')) ?>" alt="Kiko" style="width:85px; height:85px; margin:0 auto 8px; display:block;">
              <p style="font-size:16px; font-weight:700; color:#475569; margin:0;">
                Halo Teman Pintar! Masukkan kode kelas yang diberikan oleh gurumu ya:
              </p>
            </div>

            <label for="kode" style="font-size: 18px; text-align:center;">Kode Kelas</label>
            <input type="text" id="kode" name="kode" maxlength="10" value="<?= e($kodeIsi) ?>" placeholder="contoh: KLS4A" style="text-transform:uppercase; font-size: 26px; text-align: center; font-weight: 900; min-height: 58px; letter-spacing:0.1em;" required autofocus>
            <p class="bantu" style="text-align:center;">Contoh kode: <strong>KLS4A</strong></p>

            <button class="btn-siswa btn-siswa-aksen" type="submit" style="margin-top: 20px;">
              🚀 Masuk ke Kelasku!
            </button>
          </form>

        <!-- SISWA TAHAP 2: PILIH NAMA & PIN 4 DIGIT (FR-02, FR-03) -->
        <?php elseif ($tab === 'siswa'): ?>
          <div class="siswa-zona">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px; border-bottom: 2.5px solid var(--garis); padding-bottom: 10px;">
              <strong style="font-size: 20px; color:var(--warna-utama);"><?= e($kelas['nama_kelas']) ?></strong>
              <span class="stiker-badge" style="margin:0; font-size:14px;">Kode: <?= e($kelas['kode_kelas']) ?></span>
            </div>

            <?php if (!$daftarSiswa): ?>
              <p class="bantu">Belum ada siswa terdaftar di kelas ini. Hubungi gurumu ya.</p>
            <?php else: ?>
              <form method="post" autocomplete="off">
                <?= csrf_field() ?>
                <input type="hidden" name="peran" value="siswa">
                <input type="hidden" name="aksi" value="masuk_siswa">

                <label style="font-size: 18px;">👤 Siapa Namamu?</label>
                <div style="display:grid; gap:8px; max-height: 220px; overflow-y: auto; margin-bottom: 16px; padding-right:4px;">
                  <?php foreach ($daftarSiswa as $s): ?>
                    <label style="display:flex; align-items:center; gap:12px; margin:0; padding:10px 14px; border:2.5px solid var(--border-komik); border-radius:14px; cursor:pointer; font-size:18px; font-weight:700; background:#FFFFFF; box-shadow:0 3px 0 var(--garis);">
                      <input type="radio" name="nisn" value="<?= e($s['nisn']) ?>" <?= ($_POST['nisn'] ?? '') === $s['nisn'] ? 'checked' : '' ?> style="width:22px; height:22px; accent-color:var(--warna-utama);" required>
                      <span><?= e($s['nama']) ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>

                <label for="pin" style="font-size: 18px; text-align:center;">🔑 PIN Rahasiamu (4 Angka)</label>
                <input type="password" id="pin" name="pin" inputmode="numeric" pattern="\d{4}" maxlength="4" placeholder="••••" style="text-align:center; font-size: 32px; letter-spacing: 0.5em; font-weight:900; background:#FFFBEB;" required>

                <!-- Virtual PIN Pad Mainan Anak -->
                <div class="pin-pad-siswa">
                  <?php for ($i = 1; $i <= 9; $i++): ?>
                    <button type="button" class="btn-pin-angka" onclick="ketikPin('<?= $i ?>')"><?= $i ?></button>
                  <?php endfor; ?>
                  <button type="button" class="btn-pin-angka btn-pin-hapus" onclick="hapusPin()">⌫</button>
                  <button type="button" class="btn-pin-angka" onclick="ketikPin('0')">0</button>
                  <button type="button" class="btn-pin-angka btn-pin-clear" onclick="clearPin()">C</button>
                </div>

                <button class="btn-siswa btn-siswa-aksen" type="submit" style="margin-top: 14px;">
                  🚀 Mulai Belajar Sekarang!
                </button>
              </form>
            <?php endif; ?>

            <form method="post" style="margin-top: 10px; text-align:center;">
              <?= csrf_field() ?>
              <input type="hidden" name="peran" value="siswa">
              <input type="hidden" name="aksi" value="ganti_kelas">
              <button class="btn-staf btn-staf-netral" type="submit" style="font-size:14px;">&larr; Ganti Kode Kelas</button>
            </form>
          </div>

        <!-- STAF: GURU, KEPALA SEKOLAH, OPERATOR (FR-04) -->
        <?php else: ?>
          <div>
            <h2 style="margin:0 0 12px; font-size:1.3rem; font-weight:800; color:var(--teks);">
              Masuk sebagai <?= e($peranList[$tab]) ?>
            </h2>

            <form method="post" autocomplete="off">
              <?= csrf_field() ?>
              <input type="hidden" name="peran" value="<?= e($tab) ?>">
              <input type="hidden" name="aksi" value="staf">

              <label for="username">Username</label>
              <input type="text" id="username" name="username" maxlength="50" value="<?= e($_POST['username'] ?? '') ?>" placeholder="Masukkan username" required autofocus>

              <label for="sandi">Kata Sandi</label>
              <input type="password" id="sandi" name="sandi" placeholder="Masukkan kata sandi" required>

              <p style="margin-top: 22px;">
                <button class="btn-staf" type="submit" style="width:100%; padding:14px; font-size:17px;">
                  Masuk Sekarang &rarr;
                </button>
              </p>
            </form>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- ==================== FITUR ==================== -->
  <section class="section" id="fitur">
    <div class="container">
      <div class="section-header">
        <span class="section-kategori">Fitur Pembelajaran</span>
        <h2 class="section-title">Apa Saja yang Bisa Kamu Lakukan? 🌟</h2>
        <p class="section-desc">Dirancang khusus dengan aktivitas ramah anak yang menyenangkan dan memotivasi belajar.</p>
      </div>

      <div class="fitur-grid">
        <div class="fitur-item">
          <div class="fitur-icon-box">📖</div>
          <h3>Mode Belajar Kartu Kata</h3>
          <p>Buka kartu kosa kata bergambar kartun ceria, pelajari artinya dalam bahasa Indonesia, dan dengarkan pelafalan bahasa Inggris aslinya.</p>
        </div>

        <div class="fitur-item">
          <div class="fitur-icon-box">🎮</div>
          <h3>Mode Mencocokkan Kuis</h3>
          <p>Latihan tebak kata seru! Cocokkan gambar benda dengan pilihan kata yang benar. Dapatkan suara melodi gembira saat jawabanmu tepat!</p>
        </div>

        <div class="fitur-item">
          <div class="fitur-icon-box">⭐</div>
          <h3>Tabungan Poin & Bintang</h3>
          <p>Kumpulkan poin bintang dari setiap jawaban kuis yang benar dan lihat riwayat capaian belajarmu di buku nilai pribadi.</p>
        </div>

        <div class="fitur-item">
          <div class="fitur-icon-box">🏫</div>
          <h3>Pemantauan Guru & Kepsek</h3>
          <p>Guru dengan mudah mengelola materi soal dan nilai kelas; Kepala Sekolah memantau peringkat siswa dan capaian seluruh kelas.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== ALUR BELAJAR ==================== -->
  <section class="section" id="cara-kerja" style="background: var(--permukaan);">
    <div class="container">
      <div class="section-header">
        <span class="section-kategori">Petualangan Belajar</span>
        <h2 class="section-title">Cara Kerja Petualangan Belajar 🗺️</h2>
        <p class="section-desc">Empat langkah mudah dari kelas sekolah hingga menjadi juara kosa kata!</p>
      </div>

      <div class="langkah-grid">
        <div class="langkah-item">
          <div class="langkah-nomor">1</div>
          <h4>Operator Siapkan Data</h4>
          <p>Operator sekolah mendaftarkan data Guru, Siswa, Kepala Sekolah, dan Kelas secara tertib.</p>
        </div>

        <div class="langkah-item">
          <div class="langkah-nomor">2</div>
          <h4>Guru Buat Materi Soal</h4>
          <p>Bapak/Ibu guru memasukkan soal kosa kata bergambar dan artinya sesuai tema pelajaran.</p>
        </div>

        <div class="langkah-item">
          <div class="langkah-nomor">3</div>
          <h4>Siswa Belajar & Main</h4>
          <p>Siswa masuk memakai kode kelas dan PIN 4 angka, belajar kartu kata lalu bermain kuis berpoin.</p>
        </div>

        <div class="langkah-item">
          <div class="langkah-nomor">4</div>
          <h4>Pantau & Rayakan!</h4>
          <p>Guru dan Kepala Sekolah melihat grafik nilai dan merayakan siswa dengan bintang tertinggi!</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== UNTUK SIAPA ==================== -->
  <section class="section" id="untuk-siapa">
    <div class="container">
      <div class="section-header">
        <span class="section-kategori">Hak Akses Pengguna</span>
        <h2 class="section-title">Untuk Siapa Aplikasi Ini Dibuat? 👥</h2>
        <p class="section-desc">Setiap pengguna memiliki ruang dan fitur yang disesuaikan dengan perannya.</p>
      </div>

      <div class="peran-grid">
        <div class="peran-item">
          <div class="peran-badge-tag">🎒 Siswa SD</div>
          <h3>Siswa Sekolah Dasar</h3>
          <p>Untuk siswa kelas 1 s.d. 6 SD (usia 6-12 tahun).</p>
          <ul>
            <li>Login mudah pakai kode kelas & PIN 4 angka</li>
            <li>Mode Belajar kartu kata bergambar</li>
            <li>Mode Mencocokkan kuis berhadiah poin</li>
            <li>Melihat koleksi bintang dan poin sendiri</li>
          </ul>
        </div>

        <div class="peran-item">
          <div class="peran-badge-tag">👩‍🏫 Guru Kelas</div>
          <h3>Bapak / Ibu Guru</h3>
          <p>Guru pengampu mata pelajaran bahasa Inggris.</p>
          <ul>
            <li>Melihat daftar kelas yang diampu</li>
            <li>Melihat data siswa, perolehan poin & PIN siswa</li>
            <li>Menambah, mengedit, dan menghapus soal kuis</li>
            <li>Cetak rekap nilai kelas</li>
          </ul>
        </div>

        <div class="peran-item">
          <div class="peran-badge-tag">👔 Pimpinan</div>
          <h3>Kepala Sekolah</h3>
          <p>Pemantau eksekutif sekolah secara terpadu.</p>
          <ul>
            <li>Melihat data capaian seluruh kelas</li>
            <li>Melihat podium siswa dengan poin tertinggi</li>
            <li>Melihat data guru pengampu mata pelajaran</li>
          </ul>
        </div>

        <div class="peran-item">
          <div class="peran-badge-tag">⚙️ Administrator</div>
          <h3>Operator Sekolah</h3>
          <p>Pengelola data induk sekolah.</p>
          <ul>
            <li>Kelola akun Guru, Siswa, Kepala Sekolah</li>
            <li>Kelola data Kelas dan Operator</li>
            <li>Muat data contoh awal untuk uji coba</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== PRATINJAU TAMPILAN ==================== -->
  <section class="section" id="mockup" style="background: var(--permukaan);">
    <div class="container">
      <div class="section-header">
        <span class="section-kategori">Pratinjau Antarmuka</span>
        <h2 class="section-title">Tampilan Ramah di Laptop & Smartphone 📱💻</h2>
        <p class="section-desc">Didesain responsif dengan tombol besar dan gambar jelas agar nyaman di semua perangkat.</p>
      </div>

      <div class="mockup-wrap">
        <div class="mockup-kotak">
          <div class="mockup-header-top">
            <span class="mockup-dot red"></span>
            <span class="mockup-dot yellow"></span>
            <span class="mockup-dot green"></span>
            <div class="mockup-judul">Tampilan Laptop (Menu Guru & Kelas)</div>
          </div>
          <div style="background:#F8FAFC; border:2px solid var(--border-komik); border-radius:14px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid var(--garis); padding-bottom:8px;">
              <strong style="font-size:18px;">Kelas 4A (KLS4A)</strong>
              <span class="stiker-badge" style="margin:0; font-size:13px;">2 Siswa Terdaftar</span>
            </div>
            <div style="display:flex; gap:10px;">
              <span class="btn-staf btn-staf-netral" style="padding:6px 14px; font-size:13px;">👥 Data Siswa</span>
              <span class="btn-staf" style="padding:6px 14px; font-size:13px;">📝 Kelola Soal</span>
            </div>
          </div>
        </div>

        <div class="mockup-kotak">
          <div class="mockup-header-top">
            <span class="mockup-dot red"></span>
            <span class="mockup-dot yellow"></span>
            <span class="mockup-dot green"></span>
            <div class="mockup-judul">Tampilan Ponsel (Kuis Siswa)</div>
          </div>
          <div style="background:#FFFDF7; border:2px solid var(--border-komik); border-radius:14px; padding:14px; text-align:center;">
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:800; margin-bottom:8px;">
              <span class="stiker-badge" style="margin:0; font-size:11px;">Soal 1 / 10</span>
              <span style="color:#D97706;">⭐ Poin: 0</span>
            </div>
            <div style="width:70px; height:70px; margin:4px auto 10px; background:#F0FDF4; border:2px solid var(--border-komik); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:28px;">
              📖
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <div style="padding:8px; border:2px solid var(--border-komik); border-radius:10px; font-size:13px; font-weight:800; background:#FFF;">A. BOOK</div>
              <div style="padding:8px; border:2px solid var(--border-komik); border-radius:10px; font-size:13px; font-weight:800; background:#FFF;">B. APPLE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== FAQ ==================== -->
  <section class="section" id="faq">
    <div class="container">
      <div class="section-header">
        <span class="section-kategori">Bantuan</span>
        <h2 class="section-title">Pertanyaan yang Sering Diajukan (FAQ) 💬</h2>
        <p class="section-desc">Jawaban singkat untuk pertanyaan umum bapak/ibu guru dan wali murid.</p>
      </div>

      <div class="faq-list">
        <details class="faq-kotak" open>
          <summary>Apakah perlu mengunduh aplikasi di Play Store / App Store?</summary>
          <p>Tidak perlu! Aplikasi ini berbasis web modern (Web App) yang dapat dibuka langsung lewat peramban Google Chrome atau Microsoft Edge di Android maupun laptop Windows.</p>
        </details>

        <details class="faq-kotak">
          <summary>Apakah siswa bisa mendaftar akun sendiri?</summary>
          <p>Demi ketertiban data sekolah dan keamanan siswa, akun dibuatkan oleh Operator sekolah. Siswa cukup memasukkan kode kelas dan PIN 4 digit untuk belajar.</p>
        </details>

        <details class="faq-kotak">
          <summary>Bagaimana jika siswa lupa nomor PIN rahasianya?</summary>
          <p>Bapak/Ibu guru pengampu kelas dapat melihat dan membantu memberitahukan PIN siswa melalui menu "Data Siswa" di akun Guru masing-masing.</p>
        </details>

        <details class="faq-kotak">
          <summary>Bagaimana jika suara pelafalan tidak berbunyi?</summary>
          <p>Pastikan volume perangkat Anda sudah aktif dan peramban Anda telah mengizinkan audio. Disarankan menggunakan peramban Google Chrome untuk kualitas pelafalan Web Speech API terbaik.</p>
        </details>
      </div>
    </div>
  </section>

  <!-- ==================== FOOTER ==================== -->
  <footer class="lp-footer">
    <div class="container footer-bar">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="<?= e(url('assets/img/logo.svg')) ?>" alt="Logo" style="width:30px; height:30px;">
        <strong><?= e(NAMA_APLIKASI) ?></strong> &middot; <?= e(NAMA_SEKOLAH) ?>
      </div>
      <div>
        &copy; <?= date('Y') ?> Kerja Praktik (KPku) &middot; Dibuat dengan Kasih Sayang untuk Siswa SD ❤️
      </div>
    </div>
  </footer>

  <script src="<?= e(url('assets/js/efek.js')) ?>"></script>
  <script>
    var heroItems = [
      { kata: 'APPLE', arti: 'Apel', gambar: 'assets/img/contoh/apple.svg' },
      { kata: 'BOOK', arti: 'Buku', gambar: 'assets/img/contoh/book.svg' },
      { kata: 'BALL', arti: 'Bola', gambar: 'assets/img/contoh/ball.svg' },
      { kata: 'PENCIL', arti: 'Pensil', gambar: 'assets/img/contoh/pencil.svg' }
    ];
    var heroIdx = 0;

    function gantiKartuHero() {
      heroIdx = (heroIdx + 1) % heroItems.length;
      var item = heroItems[heroIdx];
      document.getElementById('heroImg').src = item.gambar;
      document.getElementById('heroWord').textContent = item.kata;
      document.getElementById('heroArti').innerHTML = 'Arti: <strong>' + item.arti + '</strong>';
      if (window.KuisEfek) window.KuisEfek.suara.klik();
    }

    function playVoiceHero() {
      var item = heroItems[heroIdx];
      playVoice(item.kata);
      if (window.KuisEfek) window.KuisEfek.suara.benar();
    }

    function playVoice(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    }

    function pilihTabPeran(peranId) {
      var btn = document.getElementById('tab-btn-' + peranId);
      if (btn) btn.click();
    }

    function ketikPin(n) {
      var p = document.getElementById('pin');
      if (p && p.value.length < 4) {
        p.value += n;
        if (window.KuisEfek) window.KuisEfek.suara.klik();
      }
    }
    function hapusPin() {
      var p = document.getElementById('pin');
      if (p) {
        p.value = p.value.slice(0, -1);
        if (window.KuisEfek) window.KuisEfek.suara.klik();
      }
    }
    function clearPin() {
      var p = document.getElementById('pin');
      if (p) {
        p.value = '';
        if (window.KuisEfek) window.KuisEfek.suara.klik();
      }
    }
  </script>
</body>
</html>
