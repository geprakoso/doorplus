const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Master Profiles...");

  const profileTemplates = [
    { code: "KUSEN_OB", name: "Kusen Open Back", category: "KUSEN" },
    { code: "KUSEN_MT", name: "Kusen M-Tutup", category: "KUSEN" },
    { code: "KUSEN_TR", name: "Kusen Tutup Rata", category: "KUSEN" },
    { code: "KUSEN_TB", name: "Kusen Tutup Bawah", category: "KUSEN" },
    { code: "KUSEN_STP", name: "Stoper Kusen", category: "KUSEN" },
    { code: "REL_SLIDING", name: "Rel Atas/Bawah Sliding", category: "REL" },
    { code: "TIANG_PINTU_POLOS", name: "Tiang Pintu Polos (Swing)", category: "DAUN" },
    { code: "TIANG_PINTU_SLIDING", name: "Tiang Pintu Sliding", category: "DAUN" },
    { code: "TIANG_PINTU_COWBOY", name: "Tiang Pintu Cowboy (Double Action)", category: "DAUN" },
    { code: "AMBANG_PINTU_ATAS", name: "Ambang Atas Daun Pintu", category: "DAUN" },
    { code: "AMBANG_PINTU_BAWAH", name: "Ambang Bawah Daun Pintu (Lebar)", category: "DAUN" },
    { code: "SPANDREL_ACP", name: "Spandrel / Panel Aluminium", category: "PANEL" },
    { code: "DAUN_CASEMENT", name: "Profil Daun Jendela Casement", category: "DAUN" },
    { code: "DAUN_JENDELA_SLIDING", name: "Profil Daun Jendela Sliding", category: "DAUN" },
    { code: "LIST_KACA", name: "List Penjepit Kaca", category: "LIST" },
  ];

  const sizes = ["3_INCH", "4_INCH"];

  for (const size of sizes) {
    const multiplier = size === "4_INCH" ? 1.3 : 1.0;
    for (const p of profileTemplates) {
      const baseSilver = 145000 * multiplier;
      await prisma.profile.upsert({
        where: {
          code_size: {
            code: p.code,
            size: size,
          },
        },
        update: {},
        create: {
          code: p.code,
          name: `${p.name} ${size === "3_INCH" ? "3 Inci" : "4 Inci"}`,
          size: size,
          category: p.category,
          lengthMm: 6000,
          priceSilver: Math.round(baseSilver),
          priceBrown: Math.round(baseSilver * 1.12),
          priceBlack: Math.round(baseSilver * 1.15),
          priceWhite: Math.round(baseSilver * 1.22),
        },
      });
    }
  }

  console.log("Seeding Master Glass...");
  const glasses = [
    { code: "KACA_POLOS_5MM", name: "Kaca Polos 5mm", thicknessMm: 5, type: "POLOS", pricePerM2: 135000 },
    { code: "KACA_POLOS_6MM", name: "Kaca Polos 6mm", thicknessMm: 6, type: "POLOS", pricePerM2: 165000 },
    { code: "KACA_POLOS_8MM", name: "Kaca Polos 8mm", thicknessMm: 8, type: "POLOS", pricePerM2: 220000 },
    { code: "KACA_POLOS_10MM", name: "Kaca Polos 10mm", thicknessMm: 10, type: "POLOS", pricePerM2: 310000 },
    { code: "KACA_POLOS_12MM", name: "Kaca Polos 12mm", thicknessMm: 12, type: "POLOS", pricePerM2: 420000 },
    { code: "KACA_RIBEN_5MM", name: "Kaca Riben / Rayban 5mm", thicknessMm: 5, type: "RIBEN", pricePerM2: 150000 },
    { code: "KACA_RIBEN_6MM", name: "Kaca Riben / Rayban 6mm", thicknessMm: 6, type: "RIBEN", pricePerM2: 185000 },
    { code: "KACA_RIBEN_8MM", name: "Kaca Riben / Rayban 8mm", thicknessMm: 8, type: "RIBEN", pricePerM2: 255000 },
    { code: "KACA_TEMPERED_5MM", name: "Kaca Tempered 5mm", thicknessMm: 5, type: "TEMPERED", pricePerM2: 260000 },
    { code: "KACA_TEMPERED_6MM", name: "Kaca Tempered 6mm", thicknessMm: 6, type: "TEMPERED", pricePerM2: 320000 },
    { code: "KACA_TEMPERED_8MM", name: "Kaca Tempered 8mm", thicknessMm: 8, type: "TEMPERED", pricePerM2: 410000 },
    { code: "KACA_TEMPERED_10MM", name: "Kaca Tempered 10mm", thicknessMm: 10, type: "TEMPERED", pricePerM2: 530000 },
    { code: "KACA_TEMPERED_12MM", name: "Kaca Tempered 12mm", thicknessMm: 12, type: "TEMPERED", pricePerM2: 680000 },
  ];

  for (const g of glasses) {
    await prisma.glass.upsert({
      where: { code: g.code },
      update: {},
      create: g,
    });
  }

  console.log("Seeding Master Accessories...");
  const accessories = [
    { code: "KARET_KUSEN", name: "Karet Kusen / Karet 068", unit: "meter", pricePerUnit: 3500, category: "SEAL" },
    { code: "MOHAIR", name: "Mohair / Sirip Kedap Debu", unit: "meter", pricePerUnit: 4500, category: "SEAL" },
    { code: "SEALANT", name: "Lem Sealant Netral / Asam", unit: "tube", pricePerUnit: 35000, category: "SEAL" },
    { code: "ENGSEL_PINTU_4", name: "Engsel Pintu Aluminium 4\" Stainless", unit: "pasang", pricePerUnit: 45000, category: "HINGE" },
    { code: "ENGSEL_CASEMENT", name: "Engsel Casement / Friction Stay", unit: "pasang", pricePerUnit: 55000, category: "HINGE" },
    { code: "ENGSEL_COWBOY", name: "Engsel Cowboy / Floor Hinge Double Action", unit: "set", pricePerUnit: 380000, category: "HINGE" },
    { code: "LOCKCASE_SWING", name: "Lockcase + Silinder + Handle Pintu Swing", unit: "set", pricePerUnit: 175000, category: "LOCK" },
    { code: "DEADBOLT_COWBOY", name: "Kunci Pelor / Deadbolt + Pull Handle", unit: "set", pricePerUnit: 195000, category: "LOCK" },
    { code: "FLUSHBOLT", name: "Grendel Tanam / Flushbolt Pintu Double", unit: "set", pricePerUnit: 65000, category: "LOCK" },
    { code: "RODA_SLIDING_PINTU", name: "Roda Gantung Pintu Sliding Heavy Duty", unit: "set", pricePerUnit: 95000, category: "ROLLER" },
    { code: "KUNCI_SLIDING_PINTU", name: "Kunci Kait Pintu Sliding", unit: "set", pricePerUnit: 85000, category: "LOCK" },
    { code: "GUIDE_BAWAH_PINTU", name: "Guide Bawah Pintu Sliding", unit: "pcs", pricePerUnit: 15000, category: "ROLLER" },
    { code: "RAMBUNCIS", name: "Rambuncis Pengunci Jendela Casement", unit: "pcs", pricePerUnit: 30000, category: "LOCK" },
    { code: "CRESCENT_LOCK", name: "Crescent Lock / Kunci Kait Jendela Sliding", unit: "pcs", pricePerUnit: 25000, category: "LOCK" },
    { code: "RODA_SLIDING_JENDELA", name: "Roda Bawah Jendela Sliding", unit: "pasang", pricePerUnit: 35000, category: "ROLLER" },
    { code: "SEKRUP_RIVET", name: "Sekrup Drilling & Paku Rivet (Lot)", unit: "ls", pricePerUnit: 25000, category: "FASTENER" },
  ];

  for (const a of accessories) {
    await prisma.accessory.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }

  console.log("Seeding Product Presets...");
  const presets = [
    // 1. PINTU SWING
    {
      category: "DOOR",
      code: "DOOR_SWING_SINGLE",
      name: "Pintu Swing 1 Daun (Single)",
      description: "Pintu ayun aluminium 1 daun kaca/panel lengkap dengan kusen Open Back & Stoper.",
      defaultWidth: 900,
      defaultHeight: 2100,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "SWING",
        panels: 1,
        clearanceSide: 6,
        clearanceBottom: 8,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        hasStopper: true,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_SWING_DOUBLE",
      name: "Pintu Swing 2 Daun (Double / Kupu Tarung)",
      description: "Pintu ayun aluminium 2 daun (kupu tarung) dengan grendel tanam flushbolt.",
      defaultWidth: 1600,
      defaultHeight: 2100,
      defaultPanels: 2,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "SWING",
        panels: 2,
        clearanceSide: 8,
        clearanceBottom: 8,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        hasStopper: true,
        hasFlushbolt: true,
      }),
    },

    // 2. PINTU SLIDING
    {
      category: "DOOR",
      code: "DOOR_SLIDE_SINGLE",
      name: "Pintu Sliding 1 Daun (Single)",
      description: "Pintu geser 1 daun dengan rel atas/bawah, roda gantung, dan kunci kait.",
      defaultWidth: 1000,
      defaultHeight: 2100,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "SLIDE",
        panels: 1,
        overlap: 0,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        trackRuns: 1,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_SLIDE_DOUBLE",
      name: "Pintu Sliding 2 Daun (Double)",
      description: "Pintu geser 2 daun dengan overlap pertemuan 40mm dan 2 set roda gantung.",
      defaultWidth: 1800,
      defaultHeight: 2100,
      defaultPanels: 2,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "SLIDE",
        panels: 2,
        overlap: 40,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        trackRuns: 2,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_SLIDE_TRIPLE",
      name: "Pintu Sliding 3 Daun (Triple)",
      description: "Pintu geser 3 daun lebar bentang besar dengan overlap 40mm antar daun.",
      defaultWidth: 2700,
      defaultHeight: 2100,
      defaultPanels: 3,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "SLIDE",
        panels: 3,
        overlap: 40,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        trackRuns: 3,
      }),
    },

    // 3. PINTU SLIDING + SWING
    {
      category: "DOOR",
      code: "DOOR_SLIDE_1_SWING",
      name: "Pintu Kombinasi 1 Sliding + 1 Swing",
      description: "Kombinasi 1 daun swing (pintu lalu lintas) dan 1 daun sliding dalam 1 kusen.",
      defaultWidth: 1800,
      defaultHeight: 2100,
      defaultPanels: 2,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "SLIDE_AND_SWING",
        slidingPanels: 1,
        swingWidthDefault: 850,
        overlap: 0,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_SLIDE_2_SWING",
      name: "Pintu Kombinasi 2 Sliding + 1 Swing",
      description: "Kombinasi 2 daun sliding geser dan 1 daun swing utama.",
      defaultWidth: 2600,
      defaultHeight: 2100,
      defaultPanels: 3,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "SLIDE_AND_SWING",
        slidingPanels: 2,
        swingWidthDefault: 850,
        overlap: 40,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_SLIDE_3_SWING",
      name: "Pintu Kombinasi 3 Sliding + 1 Swing",
      description: "Kombinasi 3 daun sliding geser dan 1 daun swing bentang ekstra lebar.",
      defaultWidth: 3400,
      defaultHeight: 2100,
      defaultPanels: 4,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "SLIDE_AND_SWING",
        slidingPanels: 3,
        swingWidthDefault: 850,
        overlap: 40,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
      }),
    },

    // 4. PINTU COWBOY / DOUBLE ACTION
    {
      category: "DOOR",
      code: "DOOR_COWBOY_SINGLE",
      name: "Pintu Cowboy / Double Action 1 Daun",
      description: "Pintu koboi ayun 2 arah tanpa stoper kusen dengan tiang profil cowboy & floor hinge.",
      defaultWidth: 900,
      defaultHeight: 2100,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "COWBOY",
        panels: 1,
        clearanceSide: 8,
        clearanceBottom: 10,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        hasStopper: false,
      }),
    },
    {
      category: "DOOR",
      code: "DOOR_COWBOY_DOUBLE",
      name: "Pintu Cowboy / Double Action 2 Daun",
      description: "Pintu koboi 2 daun ayun bolak-balik dengan floor hinge & push/pull handle.",
      defaultWidth: 1600,
      defaultHeight: 2100,
      defaultPanels: 2,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "COWBOY",
        panels: 2,
        clearanceSide: 10,
        clearanceBottom: 10,
        stileWidth: 50,
        topRailHeight: 50,
        bottomRailHeight: 100,
        glassBite: 10,
        hasStopper: false,
      }),
    },

    // 5. JENDELA KACA MATI
    {
      category: "WINDOW",
      code: "WINDOW_FIXED_SINGLE",
      name: "Jendela Kaca Mati 1 Kolom (Single)",
      description: "Jendela kaca mati permanen 1 bidang dengan kusen Open Back & M-Tutup.",
      defaultWidth: 600,
      defaultHeight: 1200,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "FIXED",
        panels: 1,
        glassOverlap: 16,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_FIXED_DOUBLE",
      name: "Jendela Kaca Mati 2 Kolom (Double)",
      description: "Jendela kaca mati 2 bidang dengan 1 tiang pembagi vertikal (Mullion).",
      defaultWidth: 1200,
      defaultHeight: 1200,
      defaultPanels: 2,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "FIXED",
        panels: 2,
        glassOverlap: 16,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_FIXED_TRIPLE",
      name: "Jendela Kaca Mati 3 Kolom (Triple)",
      description: "Jendela kaca mati 3 bidang dengan 2 tiang pembagi vertikal (Mullion).",
      defaultWidth: 1800,
      defaultHeight: 1200,
      defaultPanels: 3,
      defaultMullions: 2,
      configJson: JSON.stringify({
        type: "FIXED",
        panels: 3,
        glassOverlap: 16,
      }),
    },

    // 6. JENDELA CASEMENT
    {
      category: "WINDOW",
      code: "WINDOW_CASEMENT_SINGLE",
      name: "Jendela Casement 1 Daun (Single)",
      description: "Jendela jungkit / swing samping 1 daun dengan profil adu manis 45° dan friction stay.",
      defaultWidth: 600,
      defaultHeight: 1200,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "CASEMENT",
        panels: 1,
        daunProfileWidth: 42,
        glassOverlap: 12,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_CASEMENT_DOUBLE",
      name: "Jendela Casement 2 Daun (Double)",
      description: "Jendela casement 2 daun dengan 1 tiang pembagi (Mullion).",
      defaultWidth: 1200,
      defaultHeight: 1200,
      defaultPanels: 2,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "CASEMENT",
        panels: 2,
        daunProfileWidth: 42,
        glassOverlap: 12,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_CASEMENT_TRIPLE",
      name: "Jendela Casement 3 Daun (Triple)",
      description: "Jendela casement 3 daun dengan 2 tiang pembagi (Mullion).",
      defaultWidth: 1800,
      defaultHeight: 1200,
      defaultPanels: 3,
      defaultMullions: 2,
      configJson: JSON.stringify({
        type: "CASEMENT",
        panels: 3,
        daunProfileWidth: 42,
        glassOverlap: 12,
      }),
    },

    // 7. JENDELA SLIDING
    {
      category: "WINDOW",
      code: "WINDOW_SLIDE_SINGLE",
      name: "Jendela Sliding 1 Daun Geser",
      description: "Jendela geser 1 daun aktif dengan 1 sisi kaca mati / rel sliding.",
      defaultWidth: 800,
      defaultHeight: 1200,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "WINDOW_SLIDE",
        panels: 1,
        overlap: 0,
        daunWidth: 32,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_SLIDE_DOUBLE",
      name: "Jendela Sliding 2 Daun (Double)",
      description: "Jendela geser 2 daun dengan interlock overlap 25mm dan kunci kait crescent.",
      defaultWidth: 1400,
      defaultHeight: 1200,
      defaultPanels: 2,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "WINDOW_SLIDE",
        panels: 2,
        overlap: 25,
        daunWidth: 32,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_SLIDE_TRIPLE",
      name: "Jendela Sliding 3 Daun (Triple)",
      description: "Jendela geser 3 daun bukaan luas dengan overlap 25mm antar daun.",
      defaultWidth: 2100,
      defaultHeight: 1200,
      defaultPanels: 3,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "WINDOW_SLIDE",
        panels: 3,
        overlap: 25,
        daunWidth: 32,
      }),
    },

    // 8. JENDELA BOVEN & KOMBINASI
    {
      category: "WINDOW",
      code: "BOVEN_FIXED",
      name: "Boven Kaca Mati (Single)",
      description: "Boven/ventilasi kaca mati ukuran ringkas untuk kamar mandi atau atas pintu.",
      defaultWidth: 600,
      defaultHeight: 400,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "FIXED",
        panels: 1,
        glassOverlap: 16,
      }),
    },
    {
      category: "WINDOW",
      code: "BOVEN_CASEMENT_SINGLE",
      name: "Boven Casement Jungkit 1 Daun",
      description: "Boven casement bukaan atas / jungkit (Top-Hung) 1 daun.",
      defaultWidth: 600,
      defaultHeight: 500,
      defaultPanels: 1,
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "CASEMENT",
        panels: 1,
        isTopHung: true,
        daunProfileWidth: 42,
        glassOverlap: 12,
      }),
    },
    {
      category: "WINDOW",
      code: "BOVEN_CASEMENT_DOUBLE",
      name: "Boven Casement Jungkit 2 Daun",
      description: "Boven casement bukaan atas / jungkit 2 daun dengan mullion pembagi.",
      defaultWidth: 1200,
      defaultHeight: 500,
      defaultPanels: 2,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "CASEMENT",
        panels: 2,
        isTopHung: true,
        daunProfileWidth: 42,
        glassOverlap: 12,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_COMBO_FIXED_CASEMENT_1",
      name: "Kombinasi 1 Kaca Mati + 1 Casement",
      description: "Total 2 kolom berdampingan: 1 lubang Kaca Mati dan 1 lubang Daun Casement.",
      defaultWidth: 1200,
      defaultHeight: 1200,
      defaultPanels: 2,
      defaultMullions: 1,
      configJson: JSON.stringify({
        type: "COMBO_FIXED_CASEMENT",
        fixedPanels: 1,
        casementPanels: 1,
        mullions: 1,
        daunProfileWidth: 42,
        glassOverlap: 16,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_COMBO_FIXED_CASEMENT_2",
      name: "Kombinasi 2 Kaca Mati + 2 Casement",
      description: "Total 4 kolom berdampingan: 2 lubang Kaca Mati dan 2 lubang Daun Casement.",
      defaultWidth: 2400,
      defaultHeight: 1200,
      defaultPanels: 4,
      defaultMullions: 3,
      configJson: JSON.stringify({
        type: "COMBO_FIXED_CASEMENT",
        fixedPanels: 2,
        casementPanels: 2,
        mullions: 3,
        daunProfileWidth: 42,
        glassOverlap: 16,
      }),
    },
    {
      category: "WINDOW",
      code: "WINDOW_COMBO_BOVEN_SLIDE",
      name: "Kombinasi Boven Kaca Mati Atas + Jendela Sliding Bawah",
      description: "Grid 2 baris dipisahkan Transom: Baris atas Boven Kaca Mati, baris bawah Jendela Sliding 2 Daun.",
      defaultWidth: 1400,
      defaultHeight: 1800,
      defaultPanels: 3, // 1 boven + 2 sliding
      defaultMullions: 0,
      configJson: JSON.stringify({
        type: "COMBO_BOVEN_SLIDE",
        bovenHeightDefault: 400,
        slidingPanels: 2,
        overlap: 25,
      }),
    },
  ];

  for (const p of presets) {
    await prisma.productPreset.upsert({
      where: { code: p.code },
      update: {
        category: p.category,
        name: p.name,
        description: p.description,
        defaultWidth: p.defaultWidth,
        defaultHeight: p.defaultHeight,
        defaultPanels: p.defaultPanels,
        defaultMullions: p.defaultMullions,
        configJson: p.configJson,
      },
      create: p,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
