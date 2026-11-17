import {
  AccessoryBOM,
  CalculationInput,
  CalculationResult,
  CostSummary,
  CutPiece,
  GlassPiece,
  ProfileOptimizationResult,
  ProfileSize,
} from "./types";
import { optimizeStockCutting } from "./optimizer";

export interface MaterialPricingData {
  profiles: Array<{
    code: string;
    name: string;
    size: string;
    priceSilver: number;
    priceBrown: number;
    priceBlack: number;
    priceWhite: number;
  }>;
  glasses: Array<{
    code: string;
    name: string;
    pricePerM2: number;
  }>;
  accessories: Array<{
    code: string;
    name: string;
    unit: string;
    category: string;
    pricePerUnit: number;
  }>;
}

/**
 * Parametric Calculation Engine for Aluminium Doors and Windows
 */
export function calculateAluminiumItem(
  input: CalculationInput,
  pricingData?: MaterialPricingData
): CalculationResult {
  const {
    presetCode,
    widthMm: L,
    heightMm: T,
    quantity: Q,
    frameSize = "3_INCH",
    color = "SILVER",
    glassCode = "KACA_POLOS_5MM",
    customParams = {},
  } = input;

  // Frame thickness: 3" default 38/40mm, 4" default 44/50mm, or user provided
  const t_kusen = input.frameThicknessMm || (frameSize === "4_INCH" ? 44 : 40);

  const unitCuts: CutPiece[] = [];
  const unitGlasses: GlassPiece[] = [];
  const unitAccessories: AccessoryBOM[] = [];

  let category: "DOOR" | "WINDOW" = "DOOR";
  let presetName = presetCode;

  const glassNameMap: Record<string, string> = {
    KACA_POLOS_5MM: "Kaca Polos 5mm",
    KACA_POLOS_6MM: "Kaca Polos 6mm",
    KACA_POLOS_8MM: "Kaca Polos 8mm",
    KACA_POLOS_10MM: "Kaca Polos 10mm",
    KACA_POLOS_12MM: "Kaca Polos 12mm",
    KACA_RIBEN_5MM: "Kaca Riben 5mm",
    KACA_RIBEN_6MM: "Kaca Riben 6mm",
    KACA_RIBEN_8MM: "Kaca Riben 8mm",
    KACA_TEMPERED_5MM: "Kaca Tempered 5mm",
    KACA_TEMPERED_6MM: "Kaca Tempered 6mm",
    KACA_TEMPERED_8MM: "Kaca Tempered 8mm",
    KACA_TEMPERED_10MM: "Kaca Tempered 10mm",
    KACA_TEMPERED_12MM: "Kaca Tempered 12mm",
  };
  const gName = glassNameMap[glassCode] || glassCode;

  // ----------------------------------------------------------------------
  // 1. PINTU SWING (DOOR_SWING_SINGLE, DOOR_SWING_DOUBLE)
  // ----------------------------------------------------------------------
  if (presetCode === "DOOR_SWING_SINGLE" || presetCode === "DOOR_SWING_DOUBLE") {
    category = "DOOR";
    const N = presetCode === "DOOR_SWING_SINGLE" ? 1 : 2;
    presetName = N === 1 ? "Pintu Swing 1 Daun (Single)" : "Pintu Swing 2 Daun (Double)";

    // Kusen
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas Kusen", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang Kusen", lengthMm: T, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_STP", profileName: "Stoper Kusen", label: "Stoper Tiang Kusen", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_STP", profileName: "Stoper Kusen", label: "Stoper Ambang Atas", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" }
    );

    // Daun Pintu
    const celah = N === 1 ? 6 : 8;
    const bottomGap = 8;
    const L_daun = Math.round((L - 2 * t_kusen - celah) / N);
    const T_daun = T - t_kusen - bottomGap;
    const t_tiang = 50;
    const t_ambang_atas = 50;
    const t_ambang_bawah = 100;

    unitCuts.push(
      { profileCode: "TIANG_PINTU_POLOS", profileName: "Tiang Daun Pintu Polos", label: "Tiang Daun Pintu", lengthMm: T_daun, quantity: 2 * N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_ATAS", profileName: "Ambang Atas Daun Pintu", label: "Ambang Atas Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_BAWAH", profileName: "Ambang Bawah Daun Pintu", label: "Ambang Bawah Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" }
    );

    // Kaca Daun
    const wKaca = L_daun - 2 * t_tiang + 20;
    const hKaca = T_daun - t_ambang_atas - t_ambang_bawah + 20;
    const areaM2 = Number(((wKaca * hKaca) / 1_000_000).toFixed(3));
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Pintu Swing",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2,
    });

    // Aksesoris
    const hinges = N === 1 ? 2 : 3;
    unitAccessories.push(
      { accessoryCode: "ENGSEL_PINTU_4", accessoryName: "Engsel Pintu Aluminium 4\" Stainless", unit: "pasang", quantity: hinges, category: "HINGE" },
      { accessoryCode: "LOCKCASE_SWING", accessoryName: "Lockcase + Silinder + Handle Pintu Swing", unit: "set", quantity: 1, category: "LOCK" },
      { accessoryCode: "KARET_KUSEN", accessoryName: "Karet Kusen / Kaca", unit: "meter", quantity: Math.ceil(((2 * (L_daun + T_daun) * N * 2) / 1000)), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
    if (N === 2) {
      unitAccessories.push({
        accessoryCode: "FLUSHBOLT",
        accessoryName: "Grendel Tanam / Flushbolt Pintu Double",
        unit: "set",
        quantity: 1,
        category: "LOCK",
      });
    }
  }

  // ----------------------------------------------------------------------
  // 2. PINTU SLIDING (DOOR_SLIDE_SINGLE, DOOR_SLIDE_DOUBLE, DOOR_SLIDE_TRIPLE)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "DOOR_SLIDE_SINGLE" ||
    presetCode === "DOOR_SLIDE_DOUBLE" ||
    presetCode === "DOOR_SLIDE_TRIPLE"
  ) {
    category = "DOOR";
    const N = presetCode === "DOOR_SLIDE_SINGLE" ? 1 : presetCode === "DOOR_SLIDE_DOUBLE" ? 2 : 3;
    presetName = `Pintu Sliding ${N} Daun`;

    // Kusen & Rel
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Samping", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "REL_SLIDING", profileName: "Rel Atas/Bawah Sliding", label: "Rel Sliding Atas & Bawah", lengthMm: L, quantity: 2, angle: "90/90" }
    );

    const overlap = N > 1 ? 40 : 0;
    const L_daun = Math.round(((L - 2 * t_kusen) + (N - 1) * overlap) / N);
    const T_daun = T - t_kusen - 15;
    const t_tiang = 50;
    const t_ambang_atas = 50;
    const t_ambang_bawah = 100;

    unitCuts.push(
      { profileCode: "TIANG_PINTU_SLIDING", profileName: "Tiang Daun Pintu Sliding", label: "Tiang Daun Pintu Sliding", lengthMm: T_daun, quantity: 2 * N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_ATAS", profileName: "Ambang Atas Daun Pintu", label: "Ambang Atas Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_BAWAH", profileName: "Ambang Bawah Daun Pintu", label: "Ambang Bawah Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" }
    );

    const wKaca = L_daun - 2 * t_tiang + 20;
    const hKaca = T_daun - t_ambang_atas - t_ambang_bawah + 20;
    const areaM2 = Number(((wKaca * hKaca) / 1_000_000).toFixed(3));
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Pintu Sliding",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2,
    });

    unitAccessories.push(
      { accessoryCode: "RODA_SLIDING_PINTU", accessoryName: "Roda Gantung Pintu Sliding Heavy Duty", unit: "set", quantity: N, category: "ROLLER" },
      { accessoryCode: "KUNCI_SLIDING_PINTU", accessoryName: "Kunci Kait Pintu Sliding", unit: "set", quantity: 1, category: "LOCK" },
      { accessoryCode: "GUIDE_BAWAH_PINTU", accessoryName: "Guide Bawah Pintu Sliding", unit: "pcs", quantity: N, category: "ROLLER" },
      { accessoryCode: "MOHAIR", accessoryName: "Mohair / Sirip Kedap Debu", unit: "meter", quantity: Math.ceil((2 * N * T_daun) / 1000), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 3. PINTU SLIDING + SWING (DOOR_SLIDE_1_SWING, DOOR_SLIDE_2_SWING, DOOR_SLIDE_3_SWING)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "DOOR_SLIDE_1_SWING" ||
    presetCode === "DOOR_SLIDE_2_SWING" ||
    presetCode === "DOOR_SLIDE_3_SWING"
  ) {
    category = "DOOR";
    const N_slide = presetCode === "DOOR_SLIDE_1_SWING" ? 1 : presetCode === "DOOR_SLIDE_2_SWING" ? 2 : 3;
    presetName = `Pintu Kombinasi ${N_slide} Sliding + 1 Swing`;

    const L_swing_area = customParams.swingWidth || 850;
    const L_slide_area = L - L_swing_area - t_kusen;

    // Kusen & Mullion
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Utama", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas Kusen", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Pembagi (Mullion)", lengthMm: T - t_kusen, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang & Mullion", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "REL_SLIDING", profileName: "Rel Atas/Bawah Sliding", label: "Rel Sliding Area Geser", lengthMm: L_slide_area, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_STP", profileName: "Stoper Kusen", label: "Stoper Kusen Area Swing", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_STP", profileName: "Stoper Kusen", label: "Stoper Ambang Atas Swing", lengthMm: L_swing_area - t_kusen, quantity: 1, angle: "90/90" }
    );

    // Daun Swing (1 unit)
    const L_daun_swing = L_swing_area - t_kusen - 6;
    const T_daun_swing = T - t_kusen - 8;
    unitCuts.push(
      { profileCode: "TIANG_PINTU_POLOS", profileName: "Tiang Daun Pintu Polos", label: "Tiang Daun Swing", lengthMm: T_daun_swing, quantity: 2, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_ATAS", profileName: "Ambang Atas Daun Pintu", label: "Ambang Atas Daun Swing", lengthMm: L_daun_swing - 100, quantity: 1, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_BAWAH", profileName: "Ambang Bawah Daun Pintu", label: "Ambang Bawah Daun Swing", lengthMm: L_daun_swing - 100, quantity: 1, angle: "90/90" }
    );
    const wKacaSwing = L_daun_swing - 100 + 20;
    const hKacaSwing = T_daun_swing - 150 + 20;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Swing",
      widthMm: wKacaSwing,
      heightMm: hKacaSwing,
      quantity: 1,
      areaM2: Number(((wKacaSwing * hKacaSwing) / 1_000_000).toFixed(3)),
    });

    // Daun Sliding (N_slide unit)
    const overlap = N_slide > 1 ? 40 : 0;
    const L_daun_slide = Math.round((L_slide_area + (N_slide - 1) * overlap) / N_slide);
    const T_daun_slide = T - t_kusen - 15;
    unitCuts.push(
      { profileCode: "TIANG_PINTU_SLIDING", profileName: "Tiang Daun Pintu Sliding", label: "Tiang Daun Sliding", lengthMm: T_daun_slide, quantity: 2 * N_slide, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_ATAS", profileName: "Ambang Atas Daun Pintu", label: "Ambang Atas Daun Sliding", lengthMm: L_daun_slide - 100, quantity: N_slide, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_BAWAH", profileName: "Ambang Bawah Daun Pintu", label: "Ambang Bawah Daun Sliding", lengthMm: L_daun_slide - 100, quantity: N_slide, angle: "90/90" }
    );
    const wKacaSlide = L_daun_slide - 100 + 20;
    const hKacaSlide = T_daun_slide - 150 + 20;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Sliding",
      widthMm: wKacaSlide,
      heightMm: hKacaSlide,
      quantity: N_slide,
      areaM2: Number(((wKacaSlide * hKacaSlide) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "ENGSEL_PINTU_4", accessoryName: "Engsel Pintu Aluminium 4\" Stainless", unit: "pasang", quantity: 2, category: "HINGE" },
      { accessoryCode: "LOCKCASE_SWING", accessoryName: "Lockcase + Silinder + Handle Pintu Swing", unit: "set", quantity: 1, category: "LOCK" },
      { accessoryCode: "RODA_SLIDING_PINTU", accessoryName: "Roda Gantung Pintu Sliding Heavy Duty", unit: "set", quantity: N_slide, category: "ROLLER" },
      { accessoryCode: "KUNCI_SLIDING_PINTU", accessoryName: "Kunci Kait Pintu Sliding", unit: "set", quantity: 1, category: "LOCK" },
      { accessoryCode: "GUIDE_BAWAH_PINTU", accessoryName: "Guide Bawah Pintu Sliding", unit: "pcs", quantity: N_slide, category: "ROLLER" },
      { accessoryCode: "MOHAIR", accessoryName: "Mohair / Sirip Kedap Debu", unit: "meter", quantity: Math.ceil((2 * N_slide * T_daun_slide) / 1000), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 2, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 4. PINTU COWBOY / DOUBLE ACTION (DOOR_COWBOY_SINGLE, DOOR_COWBOY_DOUBLE)
  // ----------------------------------------------------------------------
  else if (presetCode === "DOOR_COWBOY_SINGLE" || presetCode === "DOOR_COWBOY_DOUBLE") {
    category = "DOOR";
    const N = presetCode === "DOOR_COWBOY_SINGLE" ? 1 : 2;
    presetName = `Pintu Cowboy Double Action ${N} Daun`;

    // Kusen tanpa Stoper, full Tutup Rata
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas Kusen", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang Kusen", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Ambang Atas", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" }
    );

    const celah = N === 1 ? 8 : 10;
    const L_daun = Math.round((L - 2 * t_kusen - celah) / N);
    const T_daun = T - t_kusen - 10;
    const t_tiang = 50;
    const t_ambang_atas = 50;
    const t_ambang_bawah = 100;

    unitCuts.push(
      { profileCode: "TIANG_PINTU_COWBOY", profileName: "Tiang Pintu Cowboy (Double Action)", label: "Tiang Daun Cowboy", lengthMm: T_daun, quantity: 2 * N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_ATAS", profileName: "Ambang Atas Daun Pintu", label: "Ambang Atas Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" },
      { profileCode: "AMBANG_PINTU_BAWAH", profileName: "Ambang Bawah Daun Pintu", label: "Ambang Bawah Daun", lengthMm: L_daun - 2 * t_tiang, quantity: N, angle: "90/90" }
    );

    const wKaca = L_daun - 2 * t_tiang + 20;
    const hKaca = T_daun - t_ambang_atas - t_ambang_bawah + 20;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Cowboy",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2: Number(((wKaca * hKaca) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "ENGSEL_COWBOY", accessoryName: "Engsel Cowboy / Floor Hinge Double Action", unit: "set", quantity: N, category: "HINGE" },
      { accessoryCode: "DEADBOLT_COWBOY", accessoryName: "Kunci Pelor / Deadbolt + Pull Handle", unit: "set", quantity: N, category: "LOCK" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 5. JENDELA KACA MATI & BOVEN MATI (WINDOW_FIXED_SINGLE, WINDOW_FIXED_DOUBLE, WINDOW_FIXED_TRIPLE, BOVEN_FIXED)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "WINDOW_FIXED_SINGLE" ||
    presetCode === "WINDOW_FIXED_DOUBLE" ||
    presetCode === "WINDOW_FIXED_TRIPLE" ||
    presetCode === "BOVEN_FIXED"
  ) {
    category = "WINDOW";
    const N = presetCode === "WINDOW_FIXED_TRIPLE" ? 3 : presetCode === "WINDOW_FIXED_DOUBLE" ? 2 : 1;
    presetName = presetCode === "BOVEN_FIXED" ? "Boven Kaca Mati (Single)" : `Jendela Kaca Mati ${N} Kolom`;

    const M = N - 1; // mullion

    // Kusen keliling
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Jendela", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas & Bawah Kusen", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" }
    );

    if (M > 0) {
      unitCuts.push(
        { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Pembagi (Mullion)", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" },
        { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Mullion", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" }
      );
    }
    unitCuts.push({ profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang", lengthMm: T, quantity: 1, angle: "90/90" });

    // Lubang kaca
    const L_lubang = Math.round((L - 2 * t_kusen - M * t_kusen) / N);
    const T_lubang = T - 2 * t_kusen;

    // M-Tutup stoper kaca keliling
    unitCuts.push(
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Tegak Lubang Kaca", lengthMm: T_lubang, quantity: 2 * N, angle: "90/90" },
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Datar Lubang Kaca", lengthMm: L_lubang, quantity: 2 * N, angle: "90/90" }
    );

    // Kaca (masuk sponeng 8mm tiap sisi = +16mm)
    const wKaca = L_lubang + 16;
    const hKaca = T_lubang + 16;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Mati",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2: Number(((wKaca * hKaca) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "KARET_KUSEN", accessoryName: "Karet Kusen / Kaca", unit: "meter", quantity: Math.ceil(((2 * (L_lubang + T_lubang) * N * 2) / 1000)), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 6. JENDELA CASEMENT & BOVEN CASEMENT (WINDOW_CASEMENT_SINGLE, WINDOW_CASEMENT_DOUBLE, WINDOW_CASEMENT_TRIPLE, BOVEN_CASEMENT_SINGLE, BOVEN_CASEMENT_DOUBLE)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "WINDOW_CASEMENT_SINGLE" ||
    presetCode === "WINDOW_CASEMENT_DOUBLE" ||
    presetCode === "WINDOW_CASEMENT_TRIPLE" ||
    presetCode === "BOVEN_CASEMENT_SINGLE" ||
    presetCode === "BOVEN_CASEMENT_DOUBLE"
  ) {
    category = "WINDOW";
    const isBoven = presetCode.startsWith("BOVEN_");
    const N = presetCode.endsWith("TRIPLE") ? 3 : presetCode.endsWith("DOUBLE") ? 2 : 1;
    presetName = isBoven ? `Boven Casement Jungkit ${N} Daun` : `Jendela Casement ${N} Daun`;
    const M = N - 1;

    // Kusen keliling
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Jendela", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas & Bawah Kusen", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" }
    );

    if (M > 0) {
      unitCuts.push(
        { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Pembagi (Mullion)", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" },
        { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Mullion", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" }
      );
    }
    unitCuts.push({ profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang", lengthMm: T, quantity: 1, angle: "90/90" });

    // Dimensi per lubang casement
    const L_lubang = Math.round((L - 2 * t_kusen - M * t_kusen) / N);
    const T_lubang = T - 2 * t_kusen;

    // Profil Daun Casement (Potong 45 derajat / adu manis)
    unitCuts.push(
      { profileCode: "DAUN_CASEMENT", profileName: "Profil Daun Jendela Casement", label: "Daun Casement Tegak", lengthMm: T_lubang, quantity: 2 * N, angle: "45/45" },
      { profileCode: "DAUN_CASEMENT", profileName: "Profil Daun Jendela Casement", label: "Daun Casement Datar", lengthMm: L_lubang, quantity: 2 * N, angle: "45/45" }
    );

    // Kaca Casement
    const t_casement = 42;
    const wKaca = L_lubang - 2 * t_casement + 12;
    const hKaca = T_lubang - 2 * t_casement + 12;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Casement",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2: Number(((wKaca * hKaca) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "ENGSEL_CASEMENT", accessoryName: "Engsel Casement / Friction Stay", unit: "pasang", quantity: N, category: "HINGE" },
      { accessoryCode: "RAMBUNCIS", accessoryName: "Rambuncis Pengunci Jendela Casement", unit: "pcs", quantity: N, category: "LOCK" },
      { accessoryCode: "KARET_KUSEN", accessoryName: "Karet Kusen / Kaca", unit: "meter", quantity: Math.ceil(((2 * (L_lubang + T_lubang) * N * 2) / 1000)), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 7. JENDELA SLIDING (WINDOW_SLIDE_SINGLE, WINDOW_SLIDE_DOUBLE, WINDOW_SLIDE_TRIPLE)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "WINDOW_SLIDE_SINGLE" ||
    presetCode === "WINDOW_SLIDE_DOUBLE" ||
    presetCode === "WINDOW_SLIDE_TRIPLE"
  ) {
    category = "WINDOW";
    const N = presetCode === "WINDOW_SLIDE_SINGLE" ? 1 : presetCode === "WINDOW_SLIDE_DOUBLE" ? 2 : 3;
    presetName = `Jendela Sliding ${N} Daun`;

    // Kusen Jendela Sliding
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Jendela Sliding", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "REL_SLIDING", profileName: "Rel Atas/Bawah Sliding", label: "Rel Geser Atas & Bawah", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" }
    );

    const overlap = N > 1 ? 25 : 0;
    const L_daun = Math.round(((L - 2 * t_kusen) + (N - 1) * overlap) / N);
    const T_daun = T - 2 * t_kusen - 10;

    unitCuts.push(
      { profileCode: "DAUN_JENDELA_SLIDING", profileName: "Profil Daun Jendela Sliding", label: "Tiang Daun Jendela Sliding", lengthMm: T_daun, quantity: 2 * N, angle: "90/90" },
      { profileCode: "DAUN_JENDELA_SLIDING", profileName: "Profil Daun Jendela Sliding", label: "Ambang Daun Jendela Sliding", lengthMm: L_daun, quantity: 2 * N, angle: "90/90" }
    );

    const wKaca = L_daun - 64 + 16;
    const hKaca = T_daun - 64 + 16;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Daun Jendela Sliding",
      widthMm: wKaca,
      heightMm: hKaca,
      quantity: N,
      areaM2: Number(((wKaca * hKaca) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "RODA_SLIDING_JENDELA", accessoryName: "Roda Bawah Jendela Sliding", unit: "pasang", quantity: N, category: "ROLLER" },
      { accessoryCode: "CRESCENT_LOCK", accessoryName: "Crescent Lock / Kunci Kait Jendela Sliding", unit: "pcs", quantity: N, category: "LOCK" },
      { accessoryCode: "MOHAIR", accessoryName: "Mohair / Sirip Kedap Debu", unit: "meter", quantity: Math.ceil((2 * N * T_daun) / 1000), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 1, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  }

  // ----------------------------------------------------------------------
  // 8. JENDELA BOVEN KOMBINASI (WINDOW_COMBO_FIXED_CASEMENT_1, WINDOW_COMBO_FIXED_CASEMENT_2, WINDOW_COMBO_BOVEN_SLIDE)
  // ----------------------------------------------------------------------
  else if (
    presetCode === "WINDOW_COMBO_FIXED_CASEMENT_1" ||
    presetCode === "WINDOW_COMBO_FIXED_CASEMENT_2"
  ) {
    category = "WINDOW";
    const pairs = presetCode === "WINDOW_COMBO_FIXED_CASEMENT_1" ? 1 : 2;
    const nFixed = pairs;
    const nCasement = pairs;
    const totalPanels = nFixed + nCasement;
    const M = totalPanels - 1;
    presetName = `Kombinasi ${nFixed} Kaca Mati + ${nCasement} Casement`;

    // Kusen keliling
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Utama", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas & Bawah", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Pembagi (Mullion)", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Mullion", lengthMm: T - 2 * t_kusen, quantity: M, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Tiang", lengthMm: T, quantity: 1, angle: "90/90" }
    );

    const L_lubang = Math.round((L - 2 * t_kusen - M * t_kusen) / totalPanels);
    const T_lubang = T - 2 * t_kusen;

    // Lubang Kaca Mati: M-Tutup & Kaca
    unitCuts.push(
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Area Kaca Mati", lengthMm: T_lubang, quantity: 2 * nFixed, angle: "90/90" },
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Datar Kaca Mati", lengthMm: L_lubang, quantity: 2 * nFixed, angle: "90/90" }
    );
    const wKacaFixed = L_lubang + 16;
    const hKacaFixed = T_lubang + 16;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Mati Kombinasi",
      widthMm: wKacaFixed,
      heightMm: hKacaFixed,
      quantity: nFixed,
      areaM2: Number(((wKacaFixed * hKacaFixed) / 1_000_000).toFixed(3)),
    });

    // Lubang Casement: Daun Casement & Kaca
    unitCuts.push(
      { profileCode: "DAUN_CASEMENT", profileName: "Profil Daun Jendela Casement", label: "Daun Casement Tegak", lengthMm: T_lubang, quantity: 2 * nCasement, angle: "45/45" },
      { profileCode: "DAUN_CASEMENT", profileName: "Profil Daun Jendela Casement", label: "Daun Casement Datar", lengthMm: L_lubang, quantity: 2 * nCasement, angle: "45/45" }
    );
    const t_casement = 42;
    const wKacaCase = L_lubang - 2 * t_casement + 12;
    const hKacaCase = T_lubang - 2 * t_casement + 12;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Casement Kombinasi",
      widthMm: wKacaCase,
      heightMm: hKacaCase,
      quantity: nCasement,
      areaM2: Number(((wKacaCase * hKacaCase) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "ENGSEL_CASEMENT", accessoryName: "Engsel Casement / Friction Stay", unit: "pasang", quantity: nCasement, category: "HINGE" },
      { accessoryCode: "RAMBUNCIS", accessoryName: "Rambuncis Pengunci Jendela Casement", unit: "pcs", quantity: nCasement, category: "LOCK" },
      { accessoryCode: "KARET_KUSEN", accessoryName: "Karet Kusen / Kaca", unit: "meter", quantity: Math.ceil(((2 * (L_lubang + T_lubang) * totalPanels * 2) / 1000)), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 2, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  } else if (presetCode === "WINDOW_COMBO_BOVEN_SLIDE") {
    category = "WINDOW";
    presetName = "Kombinasi Boven Kaca Mati + Jendela Sliding";

    const T_boven = customParams.bovenHeight || 400;
    const T_slide = T - T_boven - t_kusen;

    // Kusen keliling + Transom Horizontal
    unitCuts.push(
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Tiang Kusen Utama", lengthMm: T, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Atas & Bawah Kusen", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_OB", profileName: "Kusen Open Back", label: "Ambang Pembagi Horizontal (Transom)", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" },
      { profileCode: "KUSEN_TR", profileName: "Kusen Tutup Rata", label: "Tutup Rata Transom", lengthMm: L - 2 * t_kusen, quantity: 1, angle: "90/90" }
    );

    // Bagian Atas: Boven Kaca Mati
    const L_boven_lubang = L - 2 * t_kusen;
    const T_boven_lubang = T_boven - t_kusen;
    unitCuts.push(
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Boven Tegak", lengthMm: T_boven_lubang, quantity: 2, angle: "90/90" },
      { profileCode: "KUSEN_MT", profileName: "Kusen M-Tutup", label: "M-Tutup Boven Datar", lengthMm: L_boven_lubang, quantity: 2, angle: "90/90" }
    );
    const wKacaBoven = L_boven_lubang + 16;
    const hKacaBoven = T_boven_lubang + 16;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Boven Mati",
      widthMm: wKacaBoven,
      heightMm: hKacaBoven,
      quantity: 1,
      areaM2: Number(((wKacaBoven * hKacaBoven) / 1_000_000).toFixed(3)),
    });

    // Bagian Bawah: Jendela Sliding 2 Daun
    unitCuts.push(
      { profileCode: "REL_SLIDING", profileName: "Rel Atas/Bawah Sliding", label: "Rel Geser Atas & Bawah", lengthMm: L - 2 * t_kusen, quantity: 2, angle: "90/90" }
    );
    const overlap = 25;
    const L_daun_slide = Math.round(((L - 2 * t_kusen) + overlap) / 2);
    const T_daun_slide = T_slide - t_kusen - 10;
    unitCuts.push(
      { profileCode: "DAUN_JENDELA_SLIDING", profileName: "Profil Daun Jendela Sliding", label: "Tiang Daun Jendela Sliding", lengthMm: T_daun_slide, quantity: 4, angle: "90/90" },
      { profileCode: "DAUN_JENDELA_SLIDING", profileName: "Profil Daun Jendela Sliding", label: "Ambang Daun Jendela Sliding", lengthMm: L_daun_slide, quantity: 4, angle: "90/90" }
    );
    const wKacaSlide = L_daun_slide - 64 + 16;
    const hKacaSlide = T_daun_slide - 64 + 16;
    unitGlasses.push({
      glassCode,
      glassName: gName,
      label: "Kaca Jendela Sliding",
      widthMm: wKacaSlide,
      heightMm: hKacaSlide,
      quantity: 2,
      areaM2: Number(((wKacaSlide * hKacaSlide) / 1_000_000).toFixed(3)),
    });

    unitAccessories.push(
      { accessoryCode: "RODA_SLIDING_JENDELA", accessoryName: "Roda Bawah Jendela Sliding", unit: "pasang", quantity: 2, category: "ROLLER" },
      { accessoryCode: "CRESCENT_LOCK", accessoryName: "Crescent Lock / Kunci Kait Jendela Sliding", unit: "pcs", quantity: 2, category: "LOCK" },
      { accessoryCode: "MOHAIR", accessoryName: "Mohair / Sirip Kedap Debu", unit: "meter", quantity: Math.ceil((4 * T_daun_slide) / 1000), category: "SEAL" },
      { accessoryCode: "KARET_KUSEN", accessoryName: "Karet Kusen / Kaca", unit: "meter", quantity: Math.ceil((2 * (L_boven_lubang + T_boven_lubang) * 2) / 1000), category: "SEAL" },
      { accessoryCode: "SEALANT", accessoryName: "Lem Sealant Netral", unit: "tube", quantity: 2, category: "SEAL" },
      { accessoryCode: "SEKRUP_RIVET", accessoryName: "Baut Sekrup & Paku Rivet (Lot)", unit: "ls", quantity: 1, category: "FASTENER" }
    );
  } else {
    throw new Error(`Preset varian '${presetCode}' tidak dikenali!`);
  }

  // ----------------------------------------------------------------------
  // TOTAL ACCUMULATION (Multiply by Quantity Q)
  // ----------------------------------------------------------------------
  const totalCuts: CutPiece[] = unitCuts.map((c) => ({
    ...c,
    quantity: c.quantity * Q,
  }));

  const totalGlasses: GlassPiece[] = unitGlasses.map((g) => ({
    ...g,
    quantity: g.quantity * Q,
  }));

  const totalGlassAreaM2 = Number(
    totalGlasses.reduce((acc, g) => acc + g.areaM2 * g.quantity, 0).toFixed(3)
  );

  const totalAccessories: AccessoryBOM[] = unitAccessories.map((a) => ({
    ...a,
    quantity: a.quantity * Q,
  }));

  // ----------------------------------------------------------------------
  // 1D CUTTING OPTIMIZATION PER PROFILE
  // ----------------------------------------------------------------------
  const profileGroups: Record<string, CutPiece[]> = {};
  for (const piece of totalCuts) {
    if (!profileGroups[piece.profileCode]) {
      profileGroups[piece.profileCode] = [];
    }
    profileGroups[piece.profileCode].push(piece);
  }

  const optimizations: ProfileOptimizationResult[] = [];
  let totalProfileCost = 0;

  for (const [pCode, pieces] of Object.entries(profileGroups)) {
    const pName = pieces[0]?.profileName || pCode;
    let pricePerBar = 150000;

    if (pricingData && pricingData.profiles) {
      const match = pricingData.profiles.find(
        (p) => p.code === pCode && p.size === frameSize
      );
      if (match) {
        if (color === "SILVER") pricePerBar = match.priceSilver;
        else if (color === "BROWN") pricePerBar = match.priceBrown;
        else if (color === "BLACK") pricePerBar = match.priceBlack;
        else if (color === "WHITE") pricePerBar = match.priceWhite;
      }
    }

    const opt = optimizeStockCutting(pCode, pName, frameSize, pieces, {
      stockLengthMm: 6000,
      kerfMm: 4,
      pricePerBar,
    });
    optimizations.push(opt);
    totalProfileCost += opt.totalCost;
  }

  // Calculate Glass Cost
  let pricePerM2Glass = 135000;
  if (pricingData && pricingData.glasses) {
    const match = pricingData.glasses.find((g) => g.code === glassCode);
    if (match) pricePerM2Glass = match.pricePerM2;
  }
  const totalGlassCost = Math.round(totalGlassAreaM2 * pricePerM2Glass);

  // Calculate Accessory Cost
  let totalAccessoryCost = 0;
  for (const acc of totalAccessories) {
    let unitPrice = 25000;
    if (pricingData && pricingData.accessories) {
      const match = pricingData.accessories.find((a) => a.code === acc.accessoryCode);
      if (match) unitPrice = match.pricePerUnit;
    }
    totalAccessoryCost += acc.quantity * unitPrice;
  }

  const subtotal = totalProfileCost + totalGlassCost + totalAccessoryCost;
  const laborCostEstimate = Math.round(subtotal * 0.15); // 15% ongkos kerja fabrikasi
  const grandTotal = subtotal + laborCostEstimate;

  const costSummary: CostSummary = {
    profileCost: totalProfileCost,
    glassCost: totalGlassCost,
    accessoryCost: totalAccessoryCost,
    subtotal,
    laborCostEstimate,
    grandTotal,
  };

  return {
    input,
    presetName,
    category,
    unitCuttingList: unitCuts,
    totalCuttingList: totalCuts,
    unitGlassList: unitGlasses,
    totalGlassList: totalGlasses,
    totalGlassAreaM2,
    unitAccessoriesList: unitAccessories,
    totalAccessoriesList: totalAccessories,
    optimizations,
    costSummary,
  };
}
