# DoorPlus — Kalkulator Material Aluminium, Kaca & 1D Cutting Stock Optimizer

DoorPlus adalah aplikasi web kalkulator material aluminium, kaca, dan optimasi pemotongan batangan (BOM & Cutting List) berbasis **PostgreSQL**, **Next.js 14 (App Router)**, **TypeScript**, **TailwindCSS**, dan **Prisma ORM**.

Aplikasi ini mengimplementasikan seluruh spesifikasi teknis dan rumus fabrikasi aluminium sesuai standar workshop profesional dari [SPEC.md](file:///Users/galih/projects/doorplus/SPEC.md).

---

## 🚀 Fitur Utama

1. **Parametric Calculation Engine (DRY Modular Architecture)**
   - Mendukung seluruh varian konstruksi pintu & jendela:
     - **Pintu:** Swing (Single, Double / Kupu Tarung), Sliding (1, 2, 3 Daun), Kombinasi Sliding + Swing (1, 2, 3 Slide + Swing), dan Cowboy / Double Action (Single, Double).
     - **Jendela:** Kaca Mati (1, 2, 3 Kolom), Casement Adu Manis 45° (1, 2, 3 Daun), Sliding (1, 2, 3 Daun), Boven Kaca Mati, Boven Casement Jungkit (Top-Hung), Kombinasi Mati + Casement, serta Kombinasi Boven + Sliding dengan Transom.
   - Penghitungan akurat celah sponeng, celah bawah, interlock overlap, dan pemotongan profil dalam milimeter (mm).

2. **1D Cutting Stock Optimizer (First Fit Decreasing Algorithm)**
   - Mengelompokkan seluruh potongan aluminium untuk setiap profil.
   - Mengalokasikan potongan ke dalam batangan standar **6.000 mm (6 meter)** dengan toleransi kerf gergaji (default 4 mm).
   - Menghitung sisa potongan (waste/offcut) dan persentase efisiensi bahan.
   - Visualisasi grafis per batang: potongan tiap komponen dan sisa offcut secara interaktif.

3. **Visualisasi Sketsa 2D Dinamis (Pure SVG)**
   - Menggambar sketsa kerja proporsional berdasarkan input lebar ($L$) dan tinggi ($T$).
   - Dilengkapi garis anotasi dimensi luar, garis kusen, pembagian daun, mullion/transom, serta simbol arah bukaan (swing segitiga putus-putus, sliding panah horizontal, casement jungkit).

4. **Rekap BOM Kaca & Aksesoris Lengkap**
   - Rincian ukuran potong lembar kaca ($L_{kaca} \times T_{kaca}$) dan akumulasi luas ($m^2$).
   - Kebutuhan aksesoris (Engsel 4", Friction Stay, Floor Hinge, Lockcase, Flushbolt, Roda Sliding, Crescent Lock, Rambuncis, Karet Kusen/Kaca, Mohair, Sealant, dan Baut/Sekrup).
   - Estimasi biaya material dan ongkos fabrikasi (~15%).

5. **Manajemen Proyek RAB (Akumulasi Belanja Satu Gedung)**
   - Fitur menyimpan kalkulasi ke dalam proyek RAB.
   - Menggabungkan seluruh potongan pintu dan jendela satu rumah/gedung ke dalam satu kali perhitungan optimasi batangan 6m (mengurangi sisa waste secara drastis saat belanja material partai besar).

6. **Manajemen Master Harga (Database-Backed)**
   - Konfigurasi harga per batang 6m untuk profil 3" dan 4" pada 4 varian warna (Silver, Coklat, Hitam, Putih).
   - Konfigurasi harga kaca per $m^2$ (Polos 5-12mm, Riben 5-8mm, Tempered 5-12mm).
   - Konfigurasi harga aksesoris dan hardware.

7. **Cetak & Export PDF Lembar Kerja**
   - Mode cetak khusus (*print media query*) yang menghilangkan navbar dan tombol, menampilkan lembar kerja tukang potong dan rincian penawaran RAB yang rapi.

---

## 🛠️ Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js v18+ (direkomendasikan v20+)
- PostgreSQL 14+ (sudah berjalan pada port default 5432)

### 2. Konfigurasi Database (`.env`)
Pastikan file `.env` telah mengarah ke database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://galih@localhost:5432/doorplus?schema=public"
```

### 3. Migrasi & Database Seeder
Jalankan perintah berikut untuk sinkronisasi schema Prisma dan memasukkan master data:
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Menjalankan Unit Test
Semua unit test rumus kalkulator dan algoritma optimasi dapat dijalankan dengan:
```bash
npm test
```

### 5. Menjalankan Aplikasi Web
Mode Development:
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

Mode Production Build:
```bash
npm run build
npm start
```
