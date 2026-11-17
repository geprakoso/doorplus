# SPESIFIKASI APLIKASI KALKULATOR MATERIAL ALUMINIUM & KACA (BOM & CUTTING LIST)

## 1. Tech Stack & Arsitektur
- **Database:** PostgreSQL
- **Backend & Frontend:** Fullstack Web (Gunakan Laravel + Inertia.js + Vue 3 + TailwindCSS, atau Next.js App Router + Prisma + TailwindCSS ― pilih yang paling ringkas jumlah filenya).
- **Prinsip Utama:** Jangan pernah hardcode rumus per produk di dalam file UI/Controller. Gunakan **Parametric Formula Engine** berbasis database.

## 2. Katalog Material Standar (Master Data Seeder)
Panjang standar 1 batang profil aluminium = **6000 mm (6 meter)**.
Semua perhitungan dimensi input menggunakan satuan **milimeter (mm)** (Lebar $L \times$ Tinggi $T$).

### A. Profil Kusen (Tersedia varian 3 inch [76mm] & 4 inch [101.6mm])
- `KUSEN_OB`: Open Back (Kusen utama tiang & ambang).
- `KUSEN_MT`: M-Tutup (Kusen tiang/ambang dengan jalur penutup/stoper kaca mati).
- `KUSEN_TR`: Tutup Rata (Penutup celah Open Back).
- `KUSEN_TB`: Tutup Bawah / Ambang Bawah.
- `KUSEN_STP`: Stoper Kusen (Tumpuan daun pintu/jendela swing & kaca mati).
- `REL_SLIDING`: Rel Atas & Rel Bawah (untuk pintu/jendela sliding).

### B. Profil Daun Pintu & Jendela
- `TIANG_PINTU_POLOS`: Tiang daun pintu swing (kanan & kiri).
- `TIANG_PINTU_SLIDING`: Tiang daun pintu sliding (atau tiang polos + adaptasi rel).
- `TIANG_PINTU_COWBOY`: Tiang pintu bulat / double-action (untuk pintu cowboy).
- `AMBANG_PINTU_ATAS`: Ambang atas daun pintu.
- `AMBANG_PINTU_BAWAH`: Ambang bawah daun pintu (lebar ~100-110mm).
- `SPANDREL_ACP`: Isian panel aluminium (Spandrel double/single atau ACP) jika tidak full kaca.
- `DAUN_CASEMENT`: Profil bingkai daun jendela casement (potong 45 derajat / adu manis).
- `DAUN_JENDELA_SLIDING`: Tiang & ambang daun jendela sliding.
- `LIST_KACA`: Penjepit kaca pada daun pintu/jendela.

### C. Kaca & Aksesoris
- `KACA`: Kaca Polos / Riben / Tempered (5mm, 6mm, 8mm, 10mm, 12mm) -> dihitung luas ($m^2$) dan dimensi lembar potong ($L_{kaca} \times T_{kaca}$).
- `AKSESORIS`: Karet Kusen/Kaca (m'), Mohair (m'), Sealant (tube), Engsel Pintu 4" (psg), Engsel Casement/Friction Stay (psg), Engsel Cowboy/Floor Hinge (set), Lockcase + Cylinder + Handle (set), Flushbolt (set - untuk double/kupu tarung), Roda Sliding Pintu/Jendela (set), Rambuncis (pcs), Kunci Kait/Crescent Lock (pcs), Sekrup & Rivet (ls).

---

## 3. Logika Perakitan & Rumus Potongan (Formula Engine)
Setiap produk didefinisikan oleh:
- $L$ = Lebar Kusen Luar (mm), $T$ = Tinggi Kusen Luar (mm)
- $t_{kusen}$ = Tebal penampang kusen (3" = 38mm atau 44mm; 4" = 44mm atau 50mm, buat configurable di pengaturan, default 40mm).
- $N$ = Jumlah pembagian kolom/daun (1 = Single, 2 = Double, 3 = Triple).
- $M$ = Jumlah tiang pembagi vertikal (Mullion) = $N - 1$ (untuk kaca mati, casement, atau sekat kombinasi).

### Daftar Preset Produk yang Wajib Ada di Seeder:

#### 1. Pintu Swing (Single, Double / Kupu Tarung)
- **Kusen:** Tiang Kusen OB = $2 \times T$; Ambang Atas OB = $1 \times (L - 2 \cdot t_{kusen})$; Tutup Rata = $1 \times T$ (di salah satu tiang); Stoper Kusen = $2 \times T + 1 \times L$.
- **Daun Pintu ($N = 1$ untuk Single, $N = 2$ untuk Kupu Tarung):**
  - Lebar efektif per daun ($L_{daun}$) = $\frac{L - 2 \cdot t_{kusen} - \text{celah}(6mm)}{N}$
  - Tinggi efektif daun ($T_{daun}$) = $T - t_{kusen} - \text{celah bawah}(8mm)$
  - Tiang Pintu Polos = $2 \times N \times T_{daun}$
  - Ambang Atas Pintu = $N \times (L_{daun} - 2 \cdot t_{tiang\_pintu})$
  - Ambang Bawah Pintu = $N \times (L_{daun} - 2 \cdot t_{tiang\_pintu})$
  - Kaca Daun Pintu = $N$ lembar ukuran $(L_{daun} - 2 \cdot t_{tiang} + 20mm) \times (T_{daun} - t_{ambang\_atas} - t_{ambang\_bawah} + 20mm)$.
  - Aksesoris: Engsel 4" ($1.5 \times N$ pasang), Lockcase+Handle (1 set), Flushbolt (jika $N=2$, tambah 1 pasang).

#### 2. Pintu Sliding (Single, Double, Triple)
- **Kusen & Rel:** Kusen keliling opsional/open back + Rel Atas & Bawah sepanjang $L$ (Single: $2 \times L$ lintasan geser; Double/Triple menyesuaikan lebar bukaan + *overlap* 40mm antar daun).
- **Daun Pintu ($N \in \{1, 2, 3\}$):**
  - Tiang Pintu Sliding = $2 \times N \times T_{daun}$
  - Ambang Atas & Bawah Pintu = masing-masing $N \times (L_{daun} - 2 \cdot t_{tiang})$
  - Aksesoris: Roda Gantung Sliding ($N$ set), Kunci Pintu Sliding (1 set per titik temu), Guide Bawah ($N$ pcs), Mohair.

#### 3. Pintu Sliding + Swing (1 Sliding + Swing, 2 Sliding + Swing, 3 Sliding + Swing)
- Menggabungkan $N_{slide} \in \{1, 2, 3\}$ modul Daun Pintu Sliding dan $1$ modul Daun Pintu Swing dalam satu bentang lebar $L$.
- Menggunakan 1 Tiang Pembagi (Mullion OB + Tutup Rata) setinggi $T$ di antara area Sliding dan area Swing.
- Lebar area Swing default = $850mm$ (bisa diubah user), sisa lebar $(L - L_{swing})$ dibagi rata untuk $N_{slide}$ daun sliding.

#### 4. Pintu Cowboy / Double Action (Single, Double)
- Seperti Pintu Swing ($N \in \{1, 2\}$), tetapi **TANPA Stoper Kusen** (kusen full Tutup Rata keliling).
- Menggunakan profil **Tiang Pintu Cowboy** ($2 \times N \times T_{daun}$).
- Aksesoris: Engsel Cowboy / Floor Hinge ($N$ set), tanpa Lockcase biasa (menggunakan Deadbolt/Kunci Pelor + Pull Handle).

#### 5. Jendela Kaca Mati (Single, Double, Triple)
- **Kusen:** Tiang OB = $2 \times T$; Ambang Atas & Bawah OB = $2 \times (L - 2 \cdot t_{kusen})$.
- **Tiang Pembagi (Mullion):** $(N - 1) \times (T - 2 \cdot t_{kusen})$ + Tutup Rata pada setiap mullion dan 1 tiang kusen.
- **Stoper Kaca / M-Tutup:** Keliling setiap lubang kaca = $N \times (2 \cdot L_{lubang} + 2 \cdot T_{lubang})$.
- **Kaca:** $N$ lembar ukuran $(L_{lubang} + 16mm) \times (T_{lubang} + 16mm)$ (masuk ke sponeng).

#### 6. Jendela Casement (Single, Double, Triple)
- **Kusen & Mullion:** Sama seperti Jendela Kaca Mati ($N$ lubang dengan $N-1$ tiang pembagi).
- **Daun Casement:** Setiap lubang memiliki 4 potong profil Daun Casement (2 tegak $\times T_{lubang}$, 2 datar $\times L_{lubang}$, potong 45 derajat).
- **Kaca:** $N$ lembar dikurangi lebar profil Daun Casement.
- **Aksesoris:** Engsel Casement / Friction Stay ($N$ pasang), Rambuncis ($N$ pcs).

#### 7. Jendela Sliding (Single, Double, Triple)
- **Kusen Jendela Sliding:** Tiang = $2 \times T$, Ambang Rel Atas & Bawah = $2 \times L$.
- **Daun Jendela Sliding ($N \in \{1, 2, 3\}$):** Tiang Daun Sliding = $2 \times N \times T_{daun}$, Ambang Daun Sliding = $2 \times N \times L_{daun}$ (dengan *interlock* / overlap 25mm antar daun).
- **Aksesoris:** Roda Jendela Sliding ($N$ pasang), Kunci Kait / Crescent Lock ($N$ pcs), Mohair.

#### 8. Jendela Boven & Kombinasi (Grid Top-Bottom / Left-Right)
- **Boven Kaca Mati:** 1 Lubang Kaca Mati ukuran kecil (Tinggi $400-600mm$).
- **Boven Casement (Single, Double):** Jendela Casement dengan engsel di atas (*Top-Hung* / Jungkit), $N \in \{1, 2\}$.
- **Boven Kombinasi (Mati + Casement 1, 2 Mati + Casement 2):**
  - `Mati + Casement 1`: Total 2 kolom ($M = 1$ tiang pembagi), 1 lubang diisi Kaca Mati, 1 lubang diisi Daun Casement.
  - `2 Mati + Casement 2`: Total 4 kolom ($M = 3$ tiang pembagi), 2 lubang Kaca Mati, 2 lubang Daun Casement.
- **Boven + Sliding:** Kombinasi 2 baris (dipisahkan 1 Ambang Pembagi Horizontal / Transom sepanjang $L - 2 \cdot t_{kusen}$). Baris atas = Boven Kaca Mati (tinggi default $400mm$), Baris bawah = Jendela Sliding (Single/Double).

---

## 4. Fitur Utama Aplikasi yang Harus Dibangun
1. **Master Harga & Profil:** CRUD harga per batang (6m) untuk profil 3" dan 4" (warna Silver/Coklat/Hitam/Putih), ketebalan kaca per $m^2$, dan harga aksesoris.
2. **Kalkulator Dinamis & Proyek (RAB/BOQ):**
   - Pilih Kategori & Varian Pintu/Jendela.
   - Pilih Ukuran Kusen (3 inch / 4 inch), Warna, dan Jenis Kaca.
   - Input $L$ (Lebar mm), $T$ (Tinggi mm), dan Quantity (Jumlah Unit).
   - **Output 1 (Rincian Potongan / Cutting List per Unit):** Tabel ukuran potong milimeter tiap profil (misal: Open Back 3" = 2 potong @ 2100mm, 1 potong @ 820mm).
   - **Output 2 (Kebutuhan Belanja Batangan / Optimasi 6 Meter):** Akumulasi total panjang per profil dibagi 6000mm (ditambah *waste factor* / toleransi potong gergaji 4mm per potong) dan dibulatkan ke atas menjadi **Jumlah Batang Utuh** menggunakan algoritma *1D Bin Packing (First Fit Decreasing)*.
   - **Output 3 (Rekap Biaya Material):** Total harga profil + kaca + aksesoris.
3. **Visualisasi Sketsa 2D Dinamis (SVG):** Tampilkan preview gambar kerja 2D proporsional (garis kusen, arah bukaan swing/sliding/jungkit, dan dimensi $L \times T$) menggunakan SVG murni di browser.
4. **Export PDF / Print:** Cetak lembar kerja tukang (Cutting List) dan RAB Material.