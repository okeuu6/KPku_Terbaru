<?php
require_once __DIR__ . '/koneksi.php';
require_once __DIR__ . '/fungsi.php';
require_once __DIR__ . '/csrf.php';

if (session_status() === PHP_SESSION_NONE) {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
    session_name('KUISINGGRIS');
    session_start();
}
// Auto logout (SRS 3.2.1 butir 7)
if (!empty($_SESSION['role']) && isset($_SESSION['aktif'])) {
    if (time() - $_SESSION['aktif'] > AUTO_LOGOUT_MENIT * 60) {
        $api = !empty($GLOBALS['API_MODE']);
        session_unset(); session_destroy();
        if ($api) json_out(['ok' => false, 'pesan' => 'Sesi berakhir. Silakan masuk lagi.', 'habis' => true], 401);
        header('Location: ' . url('index.php?habis=1')); exit;
    }
}
if (!empty($_SESSION['role'])) $_SESSION['aktif'] = time();

function user(): ?array { return empty($_SESSION['role']) ? null : $_SESSION; }
function peran(): ?string { return $_SESSION['role'] ?? null; }

function mulai_sesi(array $data): void {
    session_regenerate_id(true);
    $_SESSION = $data + ['aktif' => time()];
}
// RBAC di sisi server (FR-23)
function wajib_peran(string ...$boleh): void {
    $api = !empty($GLOBALS['API_MODE']);
    if (empty($_SESSION['role'])) {
        if ($api) json_out(['ok' => false, 'pesan' => 'Silakan masuk terlebih dahulu.'], 401);
        redirect('index.php?peran=' . ($boleh === ['siswa'] ? 'siswa' : $boleh[0]));
    }
    if (!in_array($_SESSION['role'], $boleh, true)) {
        if ($api) json_out(['ok' => false, 'pesan' => 'Akses ditolak.'], 403);
        http_response_code(403);
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<body style="font-family:sans-serif;text-align:center;margin-top:60px"><h2>Akses ditolak</h2>'
           . '<p>Halaman ini bukan untuk peran Anda.</p><p><a href="' . e(url('index.php')) . '">Kembali ke awal</a></p></body>';
        exit;
    }
    // Kepala Sekolah hanya-lihat: tolak semua permintaan non-GET
    if ($_SESSION['role'] === 'kepsek' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
        if ($api) json_out(['ok' => false, 'pesan' => 'Kepala Sekolah hanya dapat melihat data.'], 403);
        http_response_code(403); echo 'Kepala Sekolah hanya dapat melihat data.'; exit;
    }
}

// Pembatas percobaan login sederhana (per sesi)
function terlalu_banyak_percobaan(): bool {
    return ($_SESSION['gagal'] ?? 0) >= 5 && time() - ($_SESSION['gagal_t'] ?? 0) < 30;
}
function catat_gagal(): void {
    if (time() - ($_SESSION['gagal_t'] ?? 0) >= 30) $_SESSION['gagal'] = 0;
    $_SESSION['gagal'] = ($_SESSION['gagal'] ?? 0) + 1; $_SESSION['gagal_t'] = time();
}
function reset_gagal(): void { unset($_SESSION['gagal'], $_SESSION['gagal_t']); }

// Staf: username + sandi. Mengembalikan pesan galat atau null jika berhasil.
function login_staf(string $username, string $sandi, ?string $hanya = null): ?string {
    if (terlalu_banyak_percobaan()) return 'Terlalu banyak percobaan. Tunggu 30 detik lalu coba lagi.';
    $tabel = [
        'guru' => ['guru', 'id_guru'], 'kepsek' => ['kepala_sekolah', 'id_kepsek'], 'operator' => ['operator', 'id_operator'],
    ];
    $dummy = '$2y$10$usesomesillystringforsaltuoUFQJ1m0hQ2Oq0y9s3x7Gz9s1p6e'; // samakan waktu bila user tak ada
    foreach ($tabel as $role => [$t, $pk]) {
        if ($hanya !== null && $role !== $hanya) continue;
        $st = db()->prepare("SELECT * FROM $t WHERE username = ?");
        $st->execute([$username]);
        if ($row = $st->fetch()) {
            if (password_verify($sandi, $row['password'])) {
                reset_gagal();
                mulai_sesi(['role' => $role, 'id' => (int)$row[$pk], 'nama' => $row['nama'], 'username' => $row['username']]);
                return null;
            }
        }
    }
    password_verify($sandi, $dummy);
    catat_gagal();
    return 'Username atau sandi salah.';
}
