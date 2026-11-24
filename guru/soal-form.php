<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('guru');

$id = (int)($_GET['id'] ?? 0);
$soal = null;
if ($id) {
    $st = db()->prepare('SELECT * FROM soal WHERE id_soal = ? AND id_guru = ?');
    $st->execute([$id, $_SESSION['id']]);
    if (!($soal = $st->fetch())) {
        flash('Soal tidak ditemukan.', 'err');
        redirect('guru/soal.php');
    }
}

$galat = '';
$kata = $soal['kata_inggris'] ?? '';
$arti = $soal['arti_indonesia'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    $kata = trim($_POST['kata'] ?? '');
    $arti = trim($_POST['arti'] ?? '');
    $adaFile = ($_FILES['gambar']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;

    if ($kata === '' || $arti === '') {
        $galat = 'Kata bahasa Inggris dan arti wajib diisi.';
    } elseif (mb_strlen($kata) > 100 || mb_strlen($arti) > 100) {
        $galat = 'Kata dan arti maksimal 100 karakter.';
    } elseif (!preg_match('/^[\p{L}\s\'\-]+$/u', $kata)) {
        $galat = 'Kata bahasa Inggris hanya boleh berisi huruf.';
    } else {
        $nama = $soal['gambar'] ?? null;
        $lama = null;
        if (!$soal || $adaFile) {
            [$baru, $err] = simpan_gambar($_FILES['gambar'] ?? []);
            if ($err) {
                $galat = $err;
            } else {
                $lama = $soal['gambar'] ?? null;
                $nama = $baru;
            }
        }
        if (!$galat) {
            if ($soal) {
                db()->prepare('UPDATE soal SET kata_inggris = ?, arti_indonesia = ?, gambar = ? WHERE id_soal = ? AND id_guru = ?')
                    ->execute([$kata, $arti, $nama, $id, $_SESSION['id']]);
                if ($lama) hapus_berkas_gambar($lama);
                flash('Soal berhasil diubah.');
            } else {
                db()->prepare('INSERT INTO soal (kata_inggris, arti_indonesia, gambar, id_guru) VALUES (?,?,?,?)')
                    ->execute([$kata, $arti, $nama, $_SESSION['id']]);
                flash('Soal berhasil ditambahkan.');
            }
            redirect('guru/soal.php');
        }
    }
}

halaman_mulai($soal ? 'Ubah Soal' : 'Tambah Soal', ['back' => 'guru/soal.php']);
?>
<div class="card-staf" style="max-width:560px; margin:0 auto;">
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
    <span style="font-size:28px;">📝</span>
    <div>
      <h1 style="margin:0; font-size:1.4rem; color:var(--teks); font-weight:800;">
        <?= $soal ? 'Ubah Soal Kosa Kata' : 'Tambah Soal Kosa Kata Baru' ?>
      </h1>
      <p class="bantu" style="margin:2px 0 0;">Lengkapi kata bahasa Inggris, arti bahasa Indonesia, dan unggah gambar pendukung.</p>
    </div>
  </div>

  <?php if ($galat): ?>
    <div class="pesan galat">⚠️ <?= e($galat) ?></div>
  <?php endif; ?>

  <form method="post" enctype="multipart/form-data" autocomplete="off">
    <?= csrf_field() ?>

    <label for="kata">Kata Bahasa Inggris</label>
    <input type="text" id="kata" name="kata" maxlength="100" value="<?= e($kata) ?>" placeholder="contoh: APPLE, BOOK, BALL" style="font-weight:700;" required autofocus>

    <label for="arti">Arti Bahasa Indonesia</label>
    <input type="text" id="arti" name="arti" maxlength="100" value="<?= e($arti) ?>" placeholder="contoh: Apel, Buku, Bola" required>

    <label for="gambar">Unggah Gambar Kartun Kosa Kata (Choose File)</label>
    <div style="border:2.5px dashed var(--warna-utama); background:#F0FDF4; border-radius:16px; padding:18px; text-align:center; margin-top:6px;">
      <span style="font-size:32px; display:block; margin-bottom:6px;">🖼️</span>
      <input type="file" id="gambar" name="gambar" accept="image/jpeg,image/png,image/webp" <?= $soal ? '' : 'required' ?> style="display:block; margin:0 auto; max-width:280px; font-weight:700;">
      <p class="bantu" style="margin:8px 0 0; font-size:13px; color:#475569;">
        Format: <strong>JPG, PNG, atau WebP</strong> &middot; Ukuran Maksimal: <strong>1 MB</strong>
        <?= $soal ? '<br><span style="color:var(--warna-aksen); font-weight:700;">(Kosongkan jika gambar tidak ingin diubah)</span>' : '' ?>
      </p>

      <div style="margin-top:14px;">
        <img id="preview" alt="Pratinjau gambar" <?= $soal ? 'src="' . e(gambar_url($soal['gambar'])) . '" style="display:block; margin:0 auto; max-width:160px; max-height:160px; border:2.5px solid var(--border-komik); border-radius:14px; padding:6px; background:#fff; box-shadow:0 4px 0 var(--garis);"' : 'style="display:none; margin:0 auto; max-width:160px; max-height:160px; border:2.5px solid var(--border-komik); border-radius:14px; padding:6px; background:#fff; box-shadow:0 4px 0 var(--garis);"' ?>>
      </div>
    </div>

    <div style="display:flex; gap:12px; margin-top:24px;">
      <button class="btn-staf" type="submit" style="padding:12px 24px; font-size:16px;">💾 Simpan Soal</button>
      <a class="btn-staf btn-staf-netral" href="<?= e(url('guru/soal.php')) ?>" style="padding:12px 20px; font-size:16px;">Batal</a>
    </div>
  </form>
</div>

<script>
document.getElementById('gambar').addEventListener('change', function () {
  var f = this.files[0];
  var p = document.getElementById('preview');
  if (!f) return;
  if (f.size > <?= (int)MAX_GAMBAR_BYTE ?>) {
    alert('Ukuran gambar maksimal 1 MB.');
    this.value = '';
    p.style.display = 'none';
    return;
  }
  p.src = URL.createObjectURL(f);
  p.style.display = 'block';
});
</script>
<?php halaman_selesai(); ?>
