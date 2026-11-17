# TODO: Implementasi DoorPlus - Kalkulator Aluminium & Kaca (BOM & Cutting List)

## Fase 1: Setup Project, Konfigurasi Database PostgreSQL, dan Migration Schema
- [x] Inisialisasi Project (Next.js 14 App Router, TypeScript, TailwindCSS, Lucide Icons)
- [x] Konfigurasi Database PostgreSQL dengan Prisma ORM
- [x] Desain Schema Prisma:
  - `Profile` (tipe, nama, ukuran 3"/4", harga per batang 6m per warna: Silver, Coklat, Hitam, Putih)
  - `Glass` (nama, tebal 5-12mm, harga per m2)
  - `Accessory` (nama, unit/satuan, harga per unit)
  - `ProductPreset` (kategori, kode varian, nama varian, konfigurasi parameter default, rumus parametric)
  - `Project` & `ProjectItem` (perhitungan BOM per proyek / kalkulator)
- [x] Migration schema dan verifikasi koneksi database

## Fase 2: Database Seeder (Master Profil 3" & 4", Kaca, Aksesoris, dan Seluruh Preset Varian)
- [x] Seeder Master Profil Kusen & Daun 3" dan 4" (`KUSEN_OB`, `KUSEN_MT`, `KUSEN_TR`, `KUSEN_TB`, `KUSEN_STP`, `REL_SLIDING`, `TIANG_PINTU_POLOS`, `TIANG_PINTU_SLIDING`, `TIANG_PINTU_COWBOY`, `AMBANG_PINTU_ATAS`, `AMBANG_PINTU_BAWAH`, `SPANDREL_ACP`, `DAUN_CASEMENT`, `DAUN_JENDELA_SLIDING`, `LIST_KACA`)
- [x] Seeder Master Kaca (Polos, Riben, Tempered 5mm, 6mm, 8mm, 10mm, 12mm)
- [x] Seeder Master Aksesoris (Karet, Mohair, Sealant, Engsel 4", Friction Stay, Floor Hinge, Lockcase, Flushbolt, Roda Sliding, Rambuncis, Crescent Lock, Sekrup/Rivet)
- [x] Seeder Seluruh Preset Varian Pintu:
  - Pintu Swing (Single, Double)
  - Pintu Sliding (Single, Double, Triple)
  - Pintu Sliding + Swing (1 Sliding + Swing, 2 Sliding + Swing, 3 Sliding + Swing)
  - Pintu Cowboy / Double Action (Single, Double)
- [x] Seeder Seluruh Preset Varian Jendela:
  - Jendela Kaca Mati (Single, Double, Triple)
  - Jendela Casement (Single, Double, Triple)
  - Jendela Sliding (Single, Double, Triple)
  - Jendela Boven Kaca Mati & Boven Casement (Single, Double)
  - Jendela Boven Kombinasi (Mati + Casement 1, 2 Mati + Casement 2, Boven + Sliding)
- [x] Eksekusi seed script dan validasi data terisi di database

## Fase 3: Core Calculation Engine & 1D Cutting Stock Optimizer
- [x] Modular Parametric Calculation Engine (`src/lib/calculator/engine.ts`):
  - Penghitungan Kusen & Mullion berdasarkan $L$, $T$, $t_{kusen}$, $N$, $M$
  - Penghitungan Daun Pintu & Jendela sesuai tipe bukaan
  - Penghitungan Kaca (luas $m^2$ dan lembar potong $L_{kaca} \times T_{kaca}$)
  - Penghitungan Aksesoris & Karet/Mohair/Sealant
- [x] 1D Cutting Stock Optimizer (`src/lib/calculator/optimizer.ts`):
  - Algoritma First Fit Decreasing (FFD) untuk batangan 6000mm
  - Toleransi kerf gergaji (default 4mm per potong)
  - Perhitungan sisa sisa potong (waste/offcut) dan total batang yang dibeli
- [x] Unit Test suite komprehensif (`src/lib/calculator/__tests__`):
  - Test validasi rumus Pintu Swing (Single & Double)
  - Test validasi Pintu Sliding & Sliding+Swing
  - Test validasi Pintu Cowboy
  - Test validasi Jendela Kaca Mati, Casement, Sliding
  - Test validasi Boven & Kombinasi
  - Test validasi 1D Cutting Stock Optimizer FFD
- [x] Jalankan dan loloskan semua Unit Test

## Fase 4: Backend API / Controllers
- [x] API Route `/api/materials`:
  - GET, POST, PUT, DELETE untuk Profil, Kaca, dan Aksesoris
- [x] API Route `/api/presets`:
  - GET daftar preset produk beserta parameter defaultnya
- [x] API Route `/api/calculate`:
  - POST menerima parameter dimensi, ukuran profil, warna, varian, dan qty -> mengembalikan Cutting List, Optimasi Batangan 6m, BOM Kaca & Aksesoris, Rekap Biaya
- [x] API Route `/api/projects`:
  - CRUD Proyek (menyimpan daftar item kalkulasi ke dalam satu proyek RAB)
- [x] Integrasi Database / Repository layer

## Fase 5: Frontend UI
- [x] Layout Utama & Navigasi (Navbar modern, responsif, dark/light theme ready)
- [x] Halaman Kalkulator Interaktif:
  - Selector Kategori & Varian (Pintu / Jendela dengan icon/preview)
  - Input form: Lebar ($L$), Tinggi ($T$), Ukuran Kusen (3" / 4"), Warna, Jenis Kaca, Tebal Kusen, Jumlah Unit
  - Visualisasi Sketsa 2D Dinamis (SVG murni dengan dimensi $L \times T$, kusen, daun, mullion, arah bukaan swing/sliding/jungkit)
  - Output 1: Tabel Cutting List per Unit (dimensi potong mm, sudut potong 90/45, jumlah potong)
  - Output 2: Rekap Belanja Batangan 6m (visualisasi layout pemotongan FFD per batang, efisiensi & waste %)
  - Output 3: Rekap Biaya Material (Aluminium, Kaca, Aksesoris, Total RAB)
  - Tombol Simpan ke Proyek & Cetak / Export PDF lembar kerja tukang & RAB
- [x] Halaman Master Material & Harga:
  - Manajemen harga profil aluminium 3" & 4" per warna (Silver, Coklat, Hitam, Putih)
  - Manajemen harga kaca per m2
  - Manajemen harga aksesoris
- [x] Halaman Proyek / Rekapitulasi RAB:
  - Daftar proyek, detail proyek, total akumulasi belanja material satu rumah/gedung

## Fase 6: Pengujian End-to-End, Bug Fixing & Verifikasi Final
- [x] Build testing (`npm run build`) tanpa error
- [x] Verifikasi semua endpoint API dan fungsionalitas UI
- [x] Verifikasi print/export layout lembar kerja tukang & RAB
- [x] Finalisasi dokumentasi dan panduan penggunaan
