-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 24, 2026 at 05:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kuis_inggris`
--

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

CREATE TABLE `guru` (
  `id_guru` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dibuat_oleh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`id_guru`, `nama`, `username`, `password`, `dibuat_oleh`) VALUES
(1, 'Dewi Anggraini, S.Pd.', 'guru.dewi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(2, 'Bambang Setiawan, S.Pd.', 'guru.bambang', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id_kelas` int(11) NOT NULL,
  `nama_kelas` varchar(50) NOT NULL,
  `kode_kelas` varchar(10) NOT NULL,
  `id_guru` int(11) NOT NULL,
  `id_kepsek` int(11) DEFAULT NULL,
  `dibuat_oleh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id_kelas`, `nama_kelas`, `kode_kelas`, `id_guru`, `id_kepsek`, `dibuat_oleh`) VALUES
(1, 'Kelas 5A', 'KLS5A', 1, 1, 1),
(2, 'Kelas 5B', 'KLS5B', 2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `kepala_sekolah`
--

CREATE TABLE `kepala_sekolah` (
  `id_kepsek` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dibuat_oleh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kepala_sekolah`
--

INSERT INTO `kepala_sekolah` (`id_kepsek`, `nama`, `username`, `password`, `dibuat_oleh`) VALUES
(1, 'Drs. Hendra Wijaya, M.Pd.', 'kepsek.hendra', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- --------------------------------------------------------

--
-- Table structure for table `operator`
--

CREATE TABLE `operator` (
  `id_operator` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dibuat_oleh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operator`
--

INSERT INTO `operator` (`id_operator`, `nama`, `username`, `password`, `dibuat_oleh`) VALUES
(1, 'Cindy Salsabila', 'Cindy', '$2y$10$tMJG/SjBZx5IF0VWtr2D6.s610Kfcpae9wkfnzJ9ycQhFd8YnU52G', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `poin`
--

CREATE TABLE `poin` (
  `id_poin` int(11) NOT NULL,
  `nisn` varchar(10) NOT NULL,
  `nilai` int(11) NOT NULL DEFAULT 0,
  `tanggal` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `poin`
--

INSERT INTO `poin` (`id_poin`, `nisn`, `nilai`, `tanggal`) VALUES
(1, '0015001001', 90, '2026-11-22 23:46:07'),
(2, '0015001002', 80, '2026-11-22 23:46:07'),
(3, '0015001003', 100, '2026-11-22 23:46:07'),
(4, '0015001004', 70, '2026-11-22 23:46:07'),
(5, '0015001005', 80, '2026-11-22 23:46:07'),
(6, '0015002001', 85, '2026-11-22 23:46:07'),
(7, '0015002002', 95, '2026-11-22 23:46:07'),
(8, '0015002003', 75, '2026-11-22 23:46:07'),
(9, '0015002004', 90, '2026-11-22 23:46:07'),
(10, '0015002005', 80, '2026-11-22 23:46:07'),
(11, '0015001001', 40, '2026-11-23 01:00:09');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `nisn` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `sandi_hash` varchar(255) NOT NULL,
  `sandi_terenkripsi` varchar(255) NOT NULL,
  `id_kelas` int(11) NOT NULL,
  `dibuat_oleh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`nisn`, `nama`, `sandi_hash`, `sandi_terenkripsi`, `id_kelas`, `dibuat_oleh`) VALUES
('0015001001', 'Alya Putri Ramadhani', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015001001', 1, 1),
('0015001002', 'Bagas Pratama Putra', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015001002', 1, 1),
('0015001003', 'Citra Kirana Sari', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015001003', 1, 1),
('0015001004', 'Dimas Aditya Nugroho', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015001004', 1, 1),
('0015001005', 'Eka Wulandari', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015001005', 1, 1),
('0015002001', 'Fajar Ramadhan Saputra', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015002001', 2, 1),
('0015002002', 'Gita Permata Hati', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015002002', 2, 1),
('0015002003', 'Hafiz Alfarizi', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015002003', 2, 1),
('0015002004', 'Indah Cahaya Lestari', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015002004', 2, 1),
('0015002005', 'Joko Susilo Wibowo', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', 'enc_init_0015002005', 2, 1),
('0015002006', 'Layla Nur Cahyani', '$2y$10$3RF6mVlCeL9Lw6Z8UxAXdOTSnlreoMrtZkAADn0SRvZilfP9JO9bO', '1G244P93f3EIs8cDr3NqpqmcfIDke9Myb5Mp+G5lnjU=', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `soal`
--

CREATE TABLE `soal` (
  `id_soal` int(11) NOT NULL,
  `kata_inggris` varchar(100) NOT NULL,
  `arti_indonesia` varchar(100) NOT NULL,
  `gambar` varchar(255) NOT NULL,
  `id_guru` int(11) NOT NULL,
  `dibuat_pada` datetime NOT NULL DEFAULT current_timestamp(),
  `diubah_pada` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `soal`
--

INSERT INTO `soal` (`id_soal`, `kata_inggris`, `arti_indonesia`, `gambar`, `id_guru`, `dibuat_pada`, `diubah_pada`) VALUES
(1, 'Apple', 'Apel', 'contoh/apple.svg', 1, '2026-11-22 23:46:07', NULL),
(2, 'Book', 'Buku', 'contoh/book.svg', 1, '2026-11-22 23:46:07', NULL),
(3, 'Chair', 'Kursi', 'contoh/chair.svg', 1, '2026-11-22 23:46:07', NULL),
(4, 'Table', 'Meja', 'contoh/table.svg', 1, '2026-11-22 23:46:07', NULL),
(5, 'Ball', 'Bola', 'contoh/ball.svg', 2, '2026-11-22 23:46:07', NULL),
(6, 'Pencil', 'Pensil', 'contoh/pencil.svg', 2, '2026-11-22 23:46:07', NULL),
(7, 'Bag', 'Tas', 'contoh/bag.svg', 2, '2026-11-22 23:46:07', NULL),
(8, 'Clock', 'Jam', 'contoh/clock.svg', 2, '2026-11-22 23:46:07', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`id_guru`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_guru_operator` (`dibuat_oleh`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id_kelas`),
  ADD UNIQUE KEY `kode_kelas` (`kode_kelas`),
  ADD KEY `idx_kelas_guru` (`id_guru`),
  ADD KEY `fk_kelas_kepsek` (`id_kepsek`),
  ADD KEY `fk_kelas_operator` (`dibuat_oleh`);

--
-- Indexes for table `kepala_sekolah`
--
ALTER TABLE `kepala_sekolah`
  ADD PRIMARY KEY (`id_kepsek`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_kepsek_operator` (`dibuat_oleh`);

--
-- Indexes for table `operator`
--
ALTER TABLE `operator`
  ADD PRIMARY KEY (`id_operator`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_operator_pembuat` (`dibuat_oleh`);

--
-- Indexes for table `poin`
--
ALTER TABLE `poin`
  ADD PRIMARY KEY (`id_poin`),
  ADD KEY `idx_poin_nisn` (`nisn`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`nisn`),
  ADD KEY `idx_siswa_kelas` (`id_kelas`),
  ADD KEY `fk_siswa_operator` (`dibuat_oleh`);

--
-- Indexes for table `soal`
--
ALTER TABLE `soal`
  ADD PRIMARY KEY (`id_soal`),
  ADD KEY `idx_soal_guru` (`id_guru`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `guru`
--
ALTER TABLE `guru`
  MODIFY `id_guru` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id_kelas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kepala_sekolah`
--
ALTER TABLE `kepala_sekolah`
  MODIFY `id_kepsek` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `operator`
--
ALTER TABLE `operator`
  MODIFY `id_operator` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `poin`
--
ALTER TABLE `poin`
  MODIFY `id_poin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `soal`
--
ALTER TABLE `soal`
  MODIFY `id_soal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guru`
--
ALTER TABLE `guru`
  ADD CONSTRAINT `fk_guru_operator` FOREIGN KEY (`dibuat_oleh`) REFERENCES `operator` (`id_operator`) ON DELETE SET NULL;

--
-- Constraints for table `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `fk_kelas_guru` FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`),
  ADD CONSTRAINT `fk_kelas_kepsek` FOREIGN KEY (`id_kepsek`) REFERENCES `kepala_sekolah` (`id_kepsek`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_kelas_operator` FOREIGN KEY (`dibuat_oleh`) REFERENCES `operator` (`id_operator`) ON DELETE SET NULL;

--
-- Constraints for table `kepala_sekolah`
--
ALTER TABLE `kepala_sekolah`
  ADD CONSTRAINT `fk_kepsek_operator` FOREIGN KEY (`dibuat_oleh`) REFERENCES `operator` (`id_operator`) ON DELETE SET NULL;

--
-- Constraints for table `operator`
--
ALTER TABLE `operator`
  ADD CONSTRAINT `fk_operator_pembuat` FOREIGN KEY (`dibuat_oleh`) REFERENCES `operator` (`id_operator`) ON DELETE SET NULL;

--
-- Constraints for table `poin`
--
ALTER TABLE `poin`
  ADD CONSTRAINT `fk_poin_siswa` FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`) ON DELETE CASCADE;

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `fk_siswa_kelas` FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`id_kelas`),
  ADD CONSTRAINT `fk_siswa_operator` FOREIGN KEY (`dibuat_oleh`) REFERENCES `operator` (`id_operator`) ON DELETE SET NULL;

--
-- Constraints for table `soal`
--
ALTER TABLE `soal`
  ADD CONSTRAINT `fk_soal_guru` FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
