<?php
if (!file_exists(__DIR__ . '/config.php')) {
    http_response_code(500);
    echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px">'
       . '<h2>Konfigurasi belum dibuat</h2><p>Salin <code>includes/config.example.php</code> menjadi '
       . '<code>includes/config.php</code>, lalu isi pengaturan database dan kunci enkripsi.</p></body>';
    exit;
}
require_once __DIR__ . '/config.php';

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(503);
        if (!empty($GLOBALS['API_MODE'])) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'pesan' => 'Tidak dapat terhubung ke database. Coba lagi nanti.']);
            exit;
        }
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px;text-align:center">'
           . '<h2>Sistem belum dapat diakses</h2><p>Tidak dapat terhubung ke database. '
           . 'Mohon coba beberapa saat lagi atau hubungi Operator sekolah.</p></body>';
        exit;
    }
    return $pdo;
}
