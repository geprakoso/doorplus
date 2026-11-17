import { describe, it, expect } from "vitest";
import { calculateAluminiumItem } from "../engine";

describe("Parametric Calculation Engine", () => {
  describe("1. Pintu Swing (Single & Double)", () => {
    it("should calculate Pintu Swing Single correctly", () => {
      const result = calculateAluminiumItem({
        presetCode: "DOOR_SWING_SINGLE",
        widthMm: 900,
        heightMm: 2100,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
      });

      expect(result.category).toBe("DOOR");
      expect(result.presetName).toContain("Single");

      // Kusen OB
      const tiangKusen = result.unitCuttingList.find(
        (c) => c.profileCode === "KUSEN_OB" && c.label === "Tiang Kusen"
      );
      expect(tiangKusen).toBeDefined();
      expect(tiangKusen?.lengthMm).toBe(2100);
      expect(tiangKusen?.quantity).toBe(2);

      const ambangAtasKusen = result.unitCuttingList.find(
        (c) => c.profileCode === "KUSEN_OB" && c.label === "Ambang Atas Kusen"
      );
      // L - 2 * 40 = 900 - 80 = 820
      expect(ambangAtasKusen?.lengthMm).toBe(820);
      expect(ambangAtasKusen?.quantity).toBe(1);

      // Daun Pintu: L_daun = (900 - 80 - 6) / 1 = 814mm
      // T_daun = 2100 - 40 - 8 = 2052mm
      const tiangDaun = result.unitCuttingList.find(
        (c) => c.profileCode === "TIANG_PINTU_POLOS"
      );
      expect(tiangDaun?.lengthMm).toBe(2052);
      expect(tiangDaun?.quantity).toBe(2);

      const ambangDaun = result.unitCuttingList.find(
        (c) => c.profileCode === "AMBANG_PINTU_ATAS"
      );
      // 814 - 100 = 714mm
      expect(ambangDaun?.lengthMm).toBe(714);

      // Kaca: 1 lembar
      expect(result.unitGlassList.length).toBe(1);
      expect(result.unitGlassList[0].widthMm).toBe(714 + 20); // 734
      expect(result.unitGlassList[0].heightMm).toBe(2052 - 150 + 20); // 1922

      // Aksesoris: Engsel 4" = 2 pasang, Lockcase = 1 set, tanpa flushbolt
      const engsel = result.unitAccessoriesList.find((a) => a.accessoryCode === "ENGSEL_PINTU_4");
      expect(engsel?.quantity).toBe(2);
      const flushbolt = result.unitAccessoriesList.find((a) => a.accessoryCode === "FLUSHBOLT");
      expect(flushbolt).toBeUndefined();
    });

    it("should calculate Pintu Swing Double (Kupu Tarung) with Flushbolt", () => {
      const result = calculateAluminiumItem({
        presetCode: "DOOR_SWING_DOUBLE",
        widthMm: 1600,
        heightMm: 2100,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
      });

      // L_daun = (1600 - 80 - 8) / 2 = 756mm
      const ambangDaun = result.unitCuttingList.find(
        (c) => c.profileCode === "AMBANG_PINTU_ATAS"
      );
      expect(ambangDaun?.lengthMm).toBe(756 - 100);
      expect(ambangDaun?.quantity).toBe(2);

      // Aksesoris: 3 pasang engsel & 1 pasang flushbolt
      const engsel = result.unitAccessoriesList.find((a) => a.accessoryCode === "ENGSEL_PINTU_4");
      expect(engsel?.quantity).toBe(3);
      const flushbolt = result.unitAccessoriesList.find((a) => a.accessoryCode === "FLUSHBOLT");
      expect(flushbolt).toBeDefined();
      expect(flushbolt?.quantity).toBe(1);
    });
  });

  describe("2. Pintu Sliding (Single, Double, Triple)", () => {
    it("should calculate Pintu Sliding Double with 40mm overlap", () => {
      const result = calculateAluminiumItem({
        presetCode: "DOOR_SLIDE_DOUBLE",
        widthMm: 1800,
        heightMm: 2100,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "BROWN",
        glassCode: "KACA_RIBEN_5MM",
      });

      // L - 2*40 = 1720 + (2-1)*40 = 1760 / 2 = 880mm
      const ambangDaun = result.unitCuttingList.find(
        (c) => c.profileCode === "AMBANG_PINTU_ATAS"
      );
      expect(ambangDaun?.lengthMm).toBe(880 - 100);
      expect(ambangDaun?.quantity).toBe(2);

      // Rel sliding atas & bawah
      const rel = result.unitCuttingList.find((c) => c.profileCode === "REL_SLIDING");
      expect(rel?.lengthMm).toBe(1800);
      expect(rel?.quantity).toBe(2);

      // Aksesoris roda gantung sliding
      const roda = result.unitAccessoriesList.find((a) => a.accessoryCode === "RODA_SLIDING_PINTU");
      expect(roda?.quantity).toBe(2);
    });
  });

  describe("3. Pintu Sliding + Swing", () => {
    it("should combine swing and sliding leaves with mullion", () => {
      const result = calculateAluminiumItem({
        presetCode: "DOOR_SLIDE_1_SWING",
        widthMm: 1800,
        heightMm: 2100,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "WHITE",
        glassCode: "KACA_POLOS_5MM",
        customParams: { swingWidth: 850 },
      });

      // Mullion OB
      const mullion = result.unitCuttingList.find(
        (c) => c.profileCode === "KUSEN_OB" && c.label.includes("Mullion")
      );
      expect(mullion).toBeDefined();
      expect(mullion?.lengthMm).toBe(2100 - 40);

      // Has both swing and sliding leaves
      const tiangSwing = result.unitCuttingList.find((c) => c.profileCode === "TIANG_PINTU_POLOS");
      const tiangSlide = result.unitCuttingList.find((c) => c.profileCode === "TIANG_PINTU_SLIDING");
      expect(tiangSwing).toBeDefined();
      expect(tiangSlide).toBeDefined();
    });
  });

  describe("4. Pintu Cowboy / Double Action", () => {
    it("should use TIANG_PINTU_COWBOY without stopper", () => {
      const result = calculateAluminiumItem({
        presetCode: "DOOR_COWBOY_SINGLE",
        widthMm: 900,
        heightMm: 2100,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
      });

      const stoper = result.unitCuttingList.find((c) => c.profileCode === "KUSEN_STP");
      expect(stoper).toBeUndefined();

      const tiangCowboy = result.unitCuttingList.find(
        (c) => c.profileCode === "TIANG_PINTU_COWBOY"
      );
      expect(tiangCowboy).toBeDefined();

      const floorHinge = result.unitAccessoriesList.find(
        (a) => a.accessoryCode === "ENGSEL_COWBOY"
      );
      expect(floorHinge?.quantity).toBe(1);
    });
  });

  describe("5. Jendela Kaca Mati", () => {
    it("should calculate Fixed Window 2 panels with M-Tutup stoper and 1 mullion", () => {
      const result = calculateAluminiumItem({
        presetCode: "WINDOW_FIXED_DOUBLE",
        widthMm: 1200,
        heightMm: 1200,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "BLACK",
        glassCode: "KACA_POLOS_5MM",
      });

      expect(result.category).toBe("WINDOW");

      // Mullion = 1
      const mullion = result.unitCuttingList.find(
        (c) => c.profileCode === "KUSEN_OB" && c.label.includes("Mullion")
      );
      expect(mullion?.quantity).toBe(1);

      // M-Tutup stoper
      const mTutup = result.unitCuttingList.filter((c) => c.profileCode === "KUSEN_MT");
      expect(mTutup.length).toBeGreaterThan(0);

      // Kaca: 2 lembar
      expect(result.unitGlassList[0].quantity).toBe(2);
    });
  });

  describe("6. Jendela Casement", () => {
    it("should use 45-degree miter cut for DAUN_CASEMENT and friction stay", () => {
      const result = calculateAluminiumItem({
        presetCode: "WINDOW_CASEMENT_SINGLE",
        widthMm: 600,
        heightMm: 1200,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
      });

      const casementDaun = result.unitCuttingList.filter(
        (c) => c.profileCode === "DAUN_CASEMENT"
      );
      expect(casementDaun.length).toBe(2); // Tegak & Datar
      expect(casementDaun[0].angle).toBe("45/45");
      expect(casementDaun[1].angle).toBe("45/45");

      const frictionStay = result.unitAccessoriesList.find(
        (a) => a.accessoryCode === "ENGSEL_CASEMENT"
      );
      expect(frictionStay?.quantity).toBe(1);

      const rambuncis = result.unitAccessoriesList.find(
        (a) => a.accessoryCode === "RAMBUNCIS"
      );
      expect(rambuncis?.quantity).toBe(1);
    });
  });

  describe("7. Jendela Sliding", () => {
    it("should calculate Jendela Sliding 2 Daun with crescent lock", () => {
      const result = calculateAluminiumItem({
        presetCode: "WINDOW_SLIDE_DOUBLE",
        widthMm: 1400,
        heightMm: 1200,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
      });

      const daunSliding = result.unitCuttingList.filter(
        (c) => c.profileCode === "DAUN_JENDELA_SLIDING"
      );
      expect(daunSliding.length).toBe(2);

      const crescentLock = result.unitAccessoriesList.find(
        (a) => a.accessoryCode === "CRESCENT_LOCK"
      );
      expect(crescentLock?.quantity).toBe(2);
    });
  });

  describe("8. Jendela Boven & Kombinasi", () => {
    it("should calculate WINDOW_COMBO_BOVEN_SLIDE with transom", () => {
      const result = calculateAluminiumItem({
        presetCode: "WINDOW_COMBO_BOVEN_SLIDE",
        widthMm: 1400,
        heightMm: 1800,
        quantity: 1,
        frameSize: "3_INCH",
        frameThicknessMm: 40,
        color: "SILVER",
        glassCode: "KACA_POLOS_5MM",
        customParams: { bovenHeight: 400 },
      });

      const transom = result.unitCuttingList.find(
        (c) => c.label.includes("Transom")
      );
      expect(transom).toBeDefined();
      expect(transom?.lengthMm).toBe(1400 - 80);

      // Has both boven glass and sliding glass
      expect(result.unitGlassList.length).toBe(2);
    });
  });
});
