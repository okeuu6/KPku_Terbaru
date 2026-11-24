<?php
require_once __DIR__ . '/_jenis.php';
$id = $_GET['id'] ?? $_POST['id'] ?? '';
$row = null;
if ($id !== '') {
    $row = ambil_baris($cfg['tabel'], $cfg['pk'], $id);
    if (!$row) {
        flash('Data tidak ditemukan.', 'err');
        redirect('operator/daftar.php?jenis=' . $jenis);
    }
}
$gurus  = db()->query('SELECT id_guru, nama FROM guru ORDER BY nama')->fetchAll();
$kepseks = db()->query('SELECT id_kepsek, nama FROM kepala_sekolah ORDER BY nama')->fetchAll();
$kelasL = db()->query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas')->fetchAll();
$v = $row ?: [];
$galat = '';

function username_dipakai(string $u, string $jenis, $idSendiri): bool {
    foreach (['guru' => ['guru', 'id_guru'], 'kepsek' => ['kepala_sekolah', 'id_kepsek'], 'operator' => ['operator', 'id_operator']] as $j => [$t, $pk]) {
        $st = db()->prepare("SELECT $pk FROM $t WHERE username = ?");
        $st->execute([$u]);
        if (($r = $st->fetch()) && !($j === $jenis && (string)$r[$pk] === (string)$idSendiri)) return true;
    }
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    $v = $_POST;
    $me = $_SESSION['id'];
    try {
        if (in_array($jenis, ['guru', 'kepsek', 'operator'], true)) {
            $nama = trim($_POST['nama'] ?? '');
            $user = trim($_POST['username'] ?? '');
            $pw = $_POST['password'] ?? '';
            if ($nama === '' || mb_strlen($nama) > 100) $galat = 'Nama wajib diisi (maksimal 100 karakter).';
            elseif (!preg_match('/^[A-Za-z0-9_.\-]{3,50}$/', $user)) $galat = 'Username 3–50 karakter: huruf, angka, titik, garis bawah, atau strip.';
            elseif (!$row && strlen($pw) < 8) $galat = 'Sandi wajib diisi, minimal 8 karakter.';
            elseif ($row && $pw !== '' && strlen($pw) < 8) $galat = 'Sandi baru minimal 8 karakter.';
            elseif (username_dipakai($user, $jenis, $id)) $galat = 'Username sudah dipakai. Pilih username lain.';
            else {
                if ($row) {
                    if ($pw !== '') db()->prepare("UPDATE {$cfg['tabel']} SET nama=?, username=?, password=? WHERE {$cfg['pk']}=?")->execute([$nama, $user, password_hash($pw, PASSWORD_DEFAULT), $id]);
                    else db()->prepare("UPDATE {$cfg['tabel']} SET nama=?, username=? WHERE {$cfg['pk']}=?")->execute([$nama, $user, $id]);
                } else {
                    db()->prepare("INSERT INTO {$cfg['tabel']} (nama, username, password, dibuat_oleh) VALUES (?,?,?,?)")->execute([$nama, $user, password_hash($pw, PASSWORD_DEFAULT), $me]);
                }
            }
        } elseif ($jenis === 'siswa') {
            $nisn = trim($_POST['nisn'] ?? '');
            $nama = trim($_POST['nama'] ?? '');
            $kls = (int)($_POST['id_kelas'] ?? 0);
            $pin = $_POST['pin'] ?? '';
            if ($row) $nisn = $row['nisn'];
            if (!preg_match('/^\d{10}$/', $nisn)) $galat = 'NISN harus 10 digit angka.';
            elseif ($nama === '' || mb_strlen($nama) > 100) $galat = 'Nama siswa wajib diisi (maksimal 100 karakter).';
            elseif (!ambil_baris('kelas', 'id_kelas', $kls)) $galat = 'Pilih kelas terlebih dahulu.';
            elseif (!$row && !preg_match('/^\d{4}$/', $pin)) $galat = 'PIN wajib 4 digit angka.';
            elseif ($row && $pin !== '' && !preg_match('/^\d{4}$/', $pin)) $galat = 'PIN baru harus 4 digit angka.';
            else {
                if ($row) {
                    if ($pin !== '') db()->prepare('UPDATE siswa SET nama=?, id_kelas=?, sandi_hash=?, sandi_terenkripsi=? WHERE nisn=?')->execute([$nama, $kls, password_hash($pin, PASSWORD_DEFAULT), enkripsi_pin($pin), $nisn]);
                    else db()->prepare('UPDATE siswa SET nama=?, id_kelas=? WHERE nisn=?')->execute([$nama, $kls, $nisn]);
                } else {
                    db()->prepare('INSERT INTO siswa (nisn, nama, sandi_hash, sandi_terenkripsi, id_kelas, dibuat_oleh) VALUES (?,?,?,?,?,?)')->execute([$nisn, $nama, password_hash($pin, PASSWORD_DEFAULT), enkripsi_pin($pin), $kls, $me]);
                }
            }
        } else { // kelas
            $nk = trim($_POST['nama_kelas'] ?? '');
            $kode = strtoupper(trim($_POST['kode_kelas'] ?? ''));
            $g = (int)($_POST['id_guru'] ?? 0);
            $ks = (int)($_POST['id_kepsek'] ?? 0);
            if ($nk === '' || mb_strlen($nk) > 50) $galat = 'Nama kelas wajib diisi (maksimal 50 karakter).';
            elseif (!preg_match('/^[A-Z0-9]{3,10}$/', $kode)) $galat = 'Kode kelas 3–10 karakter huruf/angka tanpa spasi (contoh: KLS4A).';
            elseif (!ambil_baris('guru', 'id_guru', $g)) $galat = 'Pilih guru pengampu.';
            elseif ($ks && !ambil_baris('kepala_sekolah', 'id_kepsek', $ks)) $galat = 'Kepala sekolah tidak valid.';
            else {
                $ksv = $ks ?: null;
                if ($row) db()->prepare('UPDATE kelas SET nama_kelas=?, kode_kelas=?, id_guru=?, id_kepsek=? WHERE id_kelas=?')->execute([$nk, $kode, $g, $ksv, $id]);
                else db()->prepare('INSERT INTO kelas (nama_kelas, kode_kelas, id_guru, id_kepsek, dibuat_oleh) VALUES (?,?,?,?,?)')->execute([$nk, $kode, $g, $ksv, $me]);
            }
        }
        if (!$galat) {
            flash($row ? 'Data berhasil diubah.' : 'Data berhasil ditambahkan.');
            redirect('operator/daftar.php?jenis=' . $jenis);
        }
    } catch (PDOException $ex) {
        $galat = ($ex->getCode() === '23000') ? 'Data ganda: NISN, username, atau kode kelas sudah terdaftar.' : 'Data gagal disimpan. Coba lagi.';
    }
}

halaman_mulai(($row ? 'Ubah ' : 'Tambah ') . $cfg['judul'], ['back' => 'operator/daftar.php?jenis=' . $jenis]);
$val = fn($k) => e($v[$k] ?? '');
?>
<div class="card-staf" style="max-width:540px; margin:0 auto;">
  <h1 style="margin:0 0 14px; font-size:1.4rem;"><?= $row ? 'Ubah' : 'Tambah' ?> <?= e(ucfirst($cfg['satu'])) ?></h1>

  <?php if ($galat): ?>
    <div class="pesan galat">Galat: <?= e($galat) ?></div>
  <?php endif; ?>

  <form method="post" autocomplete="off">
    <?= csrf_field() ?>
    <input type="hidden" name="jenis" value="<?= e($jenis) ?>">
    <input type="hidden" name="id" value="<?= e((string)$id) ?>">

    <?php if ($jenis === 'siswa'): ?>
      <label for="nisn">NISN</label>
      <input type="text" id="nisn" name="nisn" maxlength="10" inputmode="numeric" value="<?= $val('nisn') ?>" <?= $row ? 'readonly' : 'required' ?>>

      <label for="nama">Nama Siswa</label>
      <input type="text" id="nama" name="nama" maxlength="100" value="<?= $val('nama') ?>" required>

      <label for="id_kelas">Kelas</label>
      <select id="id_kelas" name="id_kelas" required>
        <option value="">-- Pilih kelas --</option>
        <?php foreach ($kelasL as $k): ?>
          <option value="<?= (int)$k['id_kelas'] ?>" <?= (string)($v['id_kelas'] ?? '') === (string)$k['id_kelas'] ? 'selected' : '' ?>><?= e($k['nama_kelas']) ?></option>
        <?php endforeach; ?>
      </select>
      <?php if (!$kelasL): ?><p class="bantu">Belum ada kelas. Tambahkan kelas terlebih dahulu.</p><?php endif; ?>

      <label for="pin">Sandi / PIN (4 angka)</label>
      <input type="text" id="pin" name="pin" maxlength="4" inputmode="numeric" placeholder="<?= $row ? 'Kosongkan jika tidak diubah' : '' ?>" <?= $row ? '' : 'required' ?>>

    <?php elseif ($jenis === 'kelas'): ?>
      <label for="nama_kelas">Nama Kelas</label>
      <input type="text" id="nama_kelas" name="nama_kelas" maxlength="50" value="<?= $val('nama_kelas') ?>" placeholder="contoh: Kelas 4A" required>

      <label for="kode_kelas">Kode Kelas</label>
      <input type="text" id="kode_kelas" name="kode_kelas" maxlength="10" value="<?= $val('kode_kelas') ?>" placeholder="contoh: KLS4A" style="text-transform:uppercase" required>

      <label for="id_guru">Guru Pengampu</label>
      <select id="id_guru" name="id_guru" required>
        <option value="">-- Pilih guru --</option>
        <?php foreach ($gurus as $g): ?>
          <option value="<?= (int)$g['id_guru'] ?>" <?= (string)($v['id_guru'] ?? '') === (string)$g['id_guru'] ? 'selected' : '' ?>><?= e($g['nama']) ?></option>
        <?php endforeach; ?>
      </select>

      <label for="id_kepsek">Kepala Sekolah (pemantau)</label>
      <select id="id_kepsek" name="id_kepsek">
        <option value="0">-- Tidak diatur --</option>
        <?php foreach ($kepseks as $g): ?>
          <option value="<?= (int)$g['id_kepsek'] ?>" <?= (string)($v['id_kepsek'] ?? '') === (string)$g['id_kepsek'] ? 'selected' : '' ?>><?= e($g['nama']) ?></option>
        <?php endforeach; ?>
      </select>

    <?php else: ?>
      <label for="nama">Nama</label>
      <input type="text" id="nama" name="nama" maxlength="100" value="<?= $val('nama') ?>" required>

      <label for="username">Username</label>
      <input type="text" id="username" name="username" maxlength="50" value="<?= $val('username') ?>" required>

      <label for="password">Sandi</label>
      <input type="password" id="password" name="password" autocomplete="new-password" placeholder="<?= $row ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter' ?>" <?= $row ? '' : 'required' ?>>
    <?php endif; ?>

    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="btn-staf" type="submit">Simpan</button>
      <a class="btn-staf btn-staf-netral" href="<?= e(url('operator/daftar.php?jenis=' . $jenis)) ?>">Batal</a>
    </div>
  </form>
</div>
<?php halaman_selesai(); ?>
