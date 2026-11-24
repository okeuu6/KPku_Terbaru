<?php
// Cadangan jika ekstensi mbstring tidak aktif di hosting
if (!function_exists('mb_strlen')) { function mb_strlen($s, $e = null) { return preg_match_all('/./su', (string)$s); } }
if (!function_exists('mb_strtolower')) { function mb_strtolower($s, $e = null) { return strtolower((string)$s); } }
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function base_url(): string {
    if (defined('BASE_URL') && BASE_URL !== '') return rtrim(BASE_URL, '/');
    $root = str_replace('\\', '/', (string)realpath(__DIR__ . '/..'));
    $doc  = str_replace('\\', '/', (string)realpath($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($doc !== '' && strpos($root, $doc) === 0) return substr($root, strlen($doc));
    return '';
}
function url(string $p = ''): string { return base_url() . '/' . ltrim($p, '/'); }
function redirect(string $p): void { header('Location: ' . (preg_match('#^https?://#', $p) ? $p : url($p))); exit; }

// ---- Pesan sekali tampil ----
function flash(?string $pesan = null, string $tipe = 'ok') {
    if ($pesan !== null) { $_SESSION['flash'] = [$pesan, $tipe]; return null; }
    $f = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f;
}

// ---- Enkripsi dua arah untuk PIN siswa (AES-256-GCM) ----
function kunci_enc(): string { return hash('sha256', ENC_KEY, true); }
function enkripsi_pin(string $pin): string {
    $iv = random_bytes(12);
    $c = openssl_encrypt($pin, 'aes-256-gcm', kunci_enc(), OPENSSL_RAW_DATA, $iv, $tag);
    return base64_encode($iv . $tag . $c);
}
function dekripsi_pin(string $s): string {
    $raw = base64_decode($s, true);
    if ($raw === false || strlen($raw) < 29) return '(tidak terbaca)';
    $p = openssl_decrypt(substr($raw, 28), 'aes-256-gcm', kunci_enc(), OPENSSL_RAW_DATA, substr($raw, 0, 12), substr($raw, 12, 16));
    return $p === false ? '(kunci berubah)' : $p;
}

// ---- Gambar soal ----
function gambar_url(string $g): string {
    return strpos($g, 'contoh/') === 0 ? url('assets/img/' . $g) : url('uploads/soal/' . $g);
}
function hapus_berkas_gambar(string $g): void {
    if ($g === '' || strpos($g, 'contoh/') === 0 || strpos($g, '/') !== false || strpos($g, '..') !== false) return;
    $f = __DIR__ . '/../uploads/soal/' . $g;
    if (is_file($f)) @unlink($f);
}
// Validasi + simpan unggahan. Mengembalikan [nama_berkas|null, pesan_error|null]
function simpan_gambar(array $f): array {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return [null, 'Gambar soal wajib dipilih.'];
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE || $f['size'] > MAX_GAMBAR_BYTE)
        return [null, 'Ukuran gambar maksimal 1 MB.'];
    if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) return [null, 'Gambar gagal diunggah. Coba lagi.'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext || !@getimagesize($f['tmp_name'])) return [null, 'Format gambar harus JPG, PNG, atau WebP.'];
    $nama = bin2hex(random_bytes(12)) . '.' . $ext;
    $dir = __DIR__ . '/../uploads/soal/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!move_uploaded_file($f['tmp_name'], $dir . $nama)) return [null, 'Folder uploads/soal tidak dapat ditulis. Periksa izin folder.'];
    return [$nama, null];
}

function tgl_id(string $dt): string {
    $b = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $t = strtotime($dt);
    return date('j', $t) . ' ' . $b[(int)date('n', $t)] . ' ' . date('Y', $t);
}
function json_out(array $d, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($d, JSON_UNESCAPED_UNICODE);
    exit;
}
