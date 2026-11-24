<?php
// Membuat Operator pertama. Hapus folder setup/ setelah selesai (lihat panduan hosting).
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$galat = ''; $info = '';

try {
    $ada = (int)db()->query('SELECT COUNT(*) FROM operator')->fetchColumn();
} catch (PDOException $e) {
    $ada = -1;
}

if ($ada > 0) {
    halaman_mulai('Setup', ['publik' => true]);
    echo '<div class="card-staf" style="max-width:500px; margin:40px auto; text-align:center;">'
       . '<h2 style="margin-top:0;">Setup Sudah Selesai</h2>'
       . '<p class="bantu">Operator pertama sudah dibuat. Hapus folder <code>setup/</code> dari server demi keamanan.</p>'
       . '<a class="btn-staf" href="' . e(url('index.php')) . '">Ke Halaman Masuk</a></div>';
    halaman_selesai();
    exit;
}

if ($ada < 0) {
    halaman_mulai('Setup');
    echo '<div class="card-staf" style="max-width:500px; margin:40px auto; text-align:center;">'
       . '<h2 style="margin-top:0;">Tabel Database Belum Ada</h2>'
       . '<p class="bantu">Impor berkas <code>database/kuis_inggris.sql</code> ke database melalui phpMyAdmin terlebih dahulu.</p></div>';
    halaman_selesai();
    exit;
}

if (strlen(ENC_KEY) < 32 || strpos(ENC_KEY, 'GANTI-DENGAN') === 0) {
    $galat = 'ENC_KEY di includes/config.php belum diganti dengan kunci acak minimal 32 karakter.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    $nama = trim($_POST['nama'] ?? '');
    $user = trim($_POST['username'] ?? '');
    $pw = $_POST['password'] ?? '';

    if ($nama === '' || !preg_match('/^[A-Za-z0-9_.\-]{3,50}$/', $user)) {
        $galat = 'Nama wajib diisi dan username 3–50 karakter (huruf/angka/._-).';
    } elseif (strlen($pw) < 8) {
        $galat = 'Sandi minimal 8 karakter.';
    } elseif ($pw !== ($_POST['ulang'] ?? '')) {
        $galat = 'Pengulangan sandi tidak sama.';
    } else {
        db()->prepare('INSERT INTO operator (nama, username, password, dibuat_oleh) VALUES (?,?,?,NULL)')
            ->execute([$nama, $user, password_hash($pw, PASSWORD_DEFAULT)]);
        $info = 'Operator pertama berhasil dibuat. Silakan login, lalu hapus folder setup/.';
    }
}

halaman_mulai('Setup Operator Pertama', ['publik' => true]);
?>
<div class="card-staf" style="max-width:500px; margin:30px auto;">
  <h1 style="margin:0 0 12px; font-size:1.4rem;">Setup Operator Pertama</h1>
  <p class="bantu">Buat akun pengelola utama sistem sekolah.</p>

  <?php if ($info): ?>
    <div class="pesan sukses">Berhasil: <?= e($info) ?></div>
    <a class="btn-staf" href="<?= e(url('index.php')) ?>">Ke Halaman Masuk</a>
  <?php else: ?>
    <?php if ($galat): ?>
      <div class="pesan galat">Galat: <?= e($galat) ?></div>
    <?php endif; ?>

    <form method="post" autocomplete="off">
      <?= csrf_field() ?>
      <label for="nama">Nama Lengkap</label>
      <input type="text" id="nama" name="nama" maxlength="100" required autofocus>

      <label for="username">Username</label>
      <input type="text" id="username" name="username" maxlength="50" required>

      <label for="password">Sandi (minimal 8 karakter)</label>
      <input type="password" id="password" name="password" autocomplete="new-password" required>

      <label for="ulang">Ulangi Sandi</label>
      <input type="password" id="ulang" name="ulang" autocomplete="new-password" required>

      <p style="margin-top:20px;">
        <button class="btn-staf" type="submit" style="width:100%;">Buat Operator</button>
      </p>
    </form>
  <?php endif; ?>
</div>
<?php halaman_selesai(); ?>
