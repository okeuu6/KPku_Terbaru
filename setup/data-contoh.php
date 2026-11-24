<?php
// Memuat DATA CONTOH (guru, kepsek, kelas, siswa, kosa kata) — hanya untuk uji coba. Perlu login Operator.
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
wajib_peran('operator');

$galat = '';
if ((int)db()->query('SELECT COUNT(*) FROM guru')->fetchColumn() > 0) {
    flash('Data contoh hanya dapat dimuat saat data guru masih kosong.', 'err');
    redirect('operator/index.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_wajib();
    $pw = $_POST['sandi'] ?? '';
    $pin = $_POST['pin'] ?? '';

    if (strlen($pw) < 8) {
        $galat = 'Sandi akun contoh minimal 8 karakter.';
    } elseif (!preg_match('/^\d{4}$/', $pin)) {
        $galat = 'PIN contoh harus 4 angka.';
    } else {
        $pdo = db();
        $me = $_SESSION['id'];
        $h = password_hash($pw, PASSWORD_DEFAULT);
        $pdo->beginTransaction();
        try {
            $pdo->prepare('INSERT INTO guru (nama, username, password, dibuat_oleh) VALUES (?,?,?,?)')
                ->execute(['Guru Contoh', 'guru.contoh', $h, $me]);
            $idg = (int)$pdo->lastInsertId();

            $pdo->prepare('INSERT INTO kepala_sekolah (nama, username, password, dibuat_oleh) VALUES (?,?,?,?)')
                ->execute(['Kepala Sekolah Contoh', 'kepsek.contoh', $h, $me]);
            $idk = (int)$pdo->lastInsertId();

            $pdo->prepare('INSERT INTO kelas (nama_kelas, kode_kelas, id_guru, id_kepsek, dibuat_oleh) VALUES (?,?,?,?,?)')
                ->execute(['Kelas 4A (contoh)', 'KLS4A', $idg, $idk, $me]);
            $idkl = (int)$pdo->lastInsertId();

            $ps = $pdo->prepare('INSERT INTO siswa (nisn, nama, sandi_hash, sandi_terenkripsi, id_kelas, dibuat_oleh) VALUES (?,?,?,?,?,?)');
            foreach ([['0000000001', 'Budi Santoso'], ['0000000002', 'Siti Nurhaliza']] as [$n, $nm]) {
                $ps->execute([$n, $nm, password_hash($pin, PASSWORD_DEFAULT), enkripsi_pin($pin), $idkl, $me]);
            }

            $pq = $pdo->prepare('INSERT INTO soal (kata_inggris, arti_indonesia, gambar, id_guru) VALUES (?,?,?,?)');
            foreach ([
                ['Apple', 'Apel', 'apple'],
                ['Book', 'Buku', 'book'],
                ['Chair', 'Kursi', 'chair'],
                ['Table', 'Meja', 'table'],
                ['Ball', 'Bola', 'ball'],
                ['Pencil', 'Pensil', 'pencil'],
                ['Bag', 'Tas', 'bag'],
                ['Clock', 'Jam', 'clock']
            ] as [$k, $a, $g]) {
                $pq->execute([$k, $a, 'contoh/' . $g . '.svg', $idg]);
            }

            $pdo->commit();
            flash('Data contoh dimuat. Akun: guru.contoh dan kepsek.contoh (sandi sesuai isian Anda). Kode kelas: KLS4A, siswa memakai PIN isian Anda.');
            redirect('operator/index.php');
        } catch (PDOException $e) {
            $pdo->rollBack();
            $galat = 'Data contoh gagal dimuat: ' . $e->getMessage();
        }
    }
}

halaman_mulai('Muat Data Contoh', ['back' => 'operator/index.php']);
?>
<div class="card-staf" style="max-width:520px; margin:0 auto;">
  <h1 style="margin:0 0 8px; font-size:1.4rem;">Muat Data Contoh</h1>
  <p class="bantu">Membuat 1 guru, 1 kepala sekolah, 1 kelas (kode KLS4A), 2 siswa, dan 8 kosa kata benda. Tentukan sandi dan PIN sendiri.</p>

  <?php if ($galat): ?>
    <div class="pesan galat">Galat: <?= e($galat) ?></div>
  <?php endif; ?>

  <form method="post" autocomplete="off">
    <?= csrf_field() ?>
    <label for="sandi">Sandi akun guru.contoh dan kepsek.contoh (min. 8 karakter)</label>
    <input type="password" id="sandi" name="sandi" autocomplete="new-password" required>

    <label for="pin">PIN 4 angka untuk siswa contoh</label>
    <input type="text" id="pin" name="pin" maxlength="4" inputmode="numeric" required>

    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="btn-staf" type="submit">Muat Data</button>
      <a class="btn-staf btn-staf-netral" href="<?= e(url('operator/index.php')) ?>">Batal</a>
    </div>
  </form>
</div>
<?php halaman_selesai(); ?>
