<?php
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function csrf_field(): string {
    return '<input type="hidden" name="csrf" value="' . csrf_token() . '">';
}
function csrf_valid(): bool {
    $t = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    return is_string($t) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t);
}
// Panggil di awal setiap handler POST.
function csrf_wajib(): void {
    if (!csrf_valid()) {
        http_response_code(419);
        if (!empty($GLOBALS['API_MODE'])) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'pesan' => 'Sesi formulir tidak valid. Muat ulang halaman.']);
        } else {
            echo 'Sesi formulir tidak valid atau kedaluwarsa. Silakan kembali dan muat ulang halaman.';
        }
        exit;
    }
}
