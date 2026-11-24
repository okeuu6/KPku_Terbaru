<?php
// ==============================================================
// MEDIA BELAJAR INGGRIS SD - KPKU
// Layout Engine - Ceria, Taktil, & Ramah Anak
// Human-Crafted (Bukan Template AI)
// ==============================================================

function menu_peran(string $r): array {
    $m = [
        'guru' => [
            ['guru/index.php', 'Kelas Tersedia', '/^(index|data-siswa)\|/'],
            ['guru/soal.php', 'Kelola Soal Kuis', '/^soal/']
        ],
        'kepsek' => [
            ['kepsek/index.php', 'Dashboard', '/^index\|/'],
            ['kepsek/data-kelas.php', 'Data Kelas', '/^data-kelas/'],
            ['kepsek/poin-tertinggi.php', 'Siswa Poin Tertinggi', '/^poin-tertinggi/'],
            ['kepsek/nama-guru.php', 'Nama Guru', '/^nama-guru/']
        ],
        'operator' => [
            ['operator/index.php', 'Dashboard', '/^index\|/'],
            ['operator/daftar.php?jenis=guru', 'Data Guru', '/\|guru$/'],
            ['operator/daftar.php?jenis=siswa', 'Data Siswa', '/\|siswa$/'],
            ['operator/daftar.php?jenis=kepsek', 'Data Kepala Sekolah', '/\|kepsek$/'],
            ['operator/daftar.php?jenis=operator', 'Data Operator', '/\|operator$/'],
            ['operator/daftar.php?jenis=kelas', 'Data Kelas', '/\|kelas$/']
        ],
    ];
    return $m[$r] ?? [];
}

function label_peran(string $r): string {
    return [
        'siswa' => 'Siswa',
        'guru' => 'Guru',
        'kepsek' => 'Kepala Sekolah',
        'operator' => 'Operator'
    ][$r] ?? '';
}

/**
 * Kerangka awal halaman
 */
function halaman_mulai(string $judul, array $o = []): void {
    $r = peran();
    $staf = $r && $r !== 'siswa';
    $key = basename($_SERVER['SCRIPT_NAME'], '.php') . '|' . ($_GET['jenis'] ?? '');
    $vCss = @filemtime(__DIR__ . '/../assets/css/app.css') ?: 1;

    echo '<!doctype html><html lang="id"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<meta name="csrf" content="' . csrf_token() . '">'
       . '<title>' . e($judul) . ' - ' . e(NAMA_APLIKASI) . '</title>'
       . '<link rel="icon" type="image/svg+xml" href="' . e(url('assets/img/logo.svg')) . '">'
       . '<link rel="preconnect" href="https://fonts.googleapis.com">'
       . '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
       . '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">'
       . '<link rel="stylesheet" href="' . e(url('assets/css/app.css')) . '?v=' . $vCss . '">'
       . '</head>'
       . '<body class="' . ($staf ? 'staf' : 'siswa-zona') . '">';

    echo '<header class="topbar">'
       . '<div class="brand-group">'
       . '  <a href="' . e(url('index.php')) . '" style="display:flex;align-items:center;gap:12px;text-decoration:none;">'
       . '    <img src="' . e(url('assets/img/logo.svg')) . '" alt="Logo" class="brand-logo">'
       . '    <span class="brand">' . e(NAMA_APLIKASI) . '</span>'
       . '  </a>'
       . '  <span class="brand-sub">' . e(NAMA_SEKOLAH) . '</span>'
       . '</div>';

    echo '<div style="display:flex;align-items:center;gap:10px;">';
    echo '<button id="btn-audio-toggle" type="button" class="btn-topbar" onclick="if(window.KuisEfek){var m=window.KuisEfek.suara.toggleMute();this.textContent=m?\'🔇 Suara Mati\':\'🔊 Suara Nyala\';}" title="Nyalakan / Matikan Efek Suara">🔊 Suara</button>';
    if ($r) {
        echo '<span class="who">Halo, <strong>' . e($_SESSION['nama']) . '</strong>'
           . ($staf ? ' <span class="peran-label">' . e(label_peran($r)) . '</span>' : '')
           . '</span>'
           . '<a class="btn-staf btn-topbar" href="' . e(url('logout.php')) . '">Keluar</a>';
    } else {
        echo '<a class="btn-staf btn-topbar" href="' . e(url('index.php')) . '">Masuk</a>';
    }
    echo '</div></header>';

    echo '<div class="wrap">';
    if ($staf) {
        echo '<nav class="side" aria-label="Navigasi Menu">';
        foreach (menu_peran($r) as [$href, $lbl, $re]) {
            $isAktif = preg_match($re, $key);
            echo '<a href="' . e(url($href)) . '"' . ($isAktif ? ' class="aktif"' : '') . '>' . e($lbl) . '</a>';
        }
        echo '</nav>';
    }

    echo '<main class="isi">';
    if (!empty($o['back'])) {
        echo '<a class="kembali-link" href="' . e(url($o['back'])) . '">&larr; Kembali</a>';
    }
    if ($f = flash()) {
        $tipe = ($f[1] === 'err' ? 'galat' : 'sukses');
        $label = ($f[1] === 'err' ? 'Perhatian: ' : 'Berhasil: ');
        echo '<div class="pesan ' . $tipe . '">' . $label . e($f[0]) . '</div>';
    }
}

/**
 * Kerangka akhir halaman
 */
function halaman_selesai(array $js = []): void {
    echo '</main></div>';
    echo '<footer class="kaki">'
       . '&copy; ' . date('Y') . ' ' . e(NAMA_APLIKASI) . ' &middot; ' . e(NAMA_SEKOLAH)
       . '</footer>';

    $vEfek = @filemtime(__DIR__ . '/../assets/js/efek.js') ?: 1;
    echo '<script src="' . e(url('assets/js/efek.js')) . '?v=' . $vEfek . '"></script>';

    foreach ($js as $s) {
        $vJs = @filemtime(__DIR__ . '/../assets/js/' . $s) ?: 1;
        echo '<script src="' . e(url('assets/js/' . $s)) . '?v=' . $vJs . '"></script>';
    }
    echo '</body></html>';
}
