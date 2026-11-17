import { describe, it, expect } from "vitest";
import { optimizeStockCutting } from "../optimizer";
import { CutPiece } from "../types";

describe("1D Cutting Stock Optimizer (First Fit Decreasing)", () => {
  it("should pack pieces correctly into 6000mm bars with 4mm kerf", () => {
    const cuts: CutPiece[] = [
      {
        profileCode: "KUSEN_OB",
        profileName: "Kusen Open Back",
        label: "Tiang",
        lengthMm: 2100,
        quantity: 2,
        angle: "90/90",
      },
      {
        profileCode: "KUSEN_OB",
        profileName: "Kusen Open Back",
        label: "Ambang",
        lengthMm: 820,
        quantity: 1,
        angle: "90/90",
      },
    ];

    const result = optimizeStockCutting("KUSEN_OB", "Kusen Open Back", "3_INCH", cuts, {
      stockLengthMm: 6000,
      kerfMm: 4,
      pricePerBar: 150000,
    });

    // 2100 + 4 + 2100 + 4 + 820 + 4 = 5032mm <= 6000mm => Fits in 1 bar
    expect(result.barsNeeded).toBe(1);
    expect(result.totalPieces).toBe(3);
    expect(result.totalLengthMm).toBe(2100 * 2 + 820);
    expect(result.bars[0].cuts.length).toBe(3);
    expect(result.bars[0].usedLengthMm).toBe(5020);
    expect(result.bars[0].wasteLengthMm).toBe(6000 - (2100 + 4 + 2100 + 4 + 820 + 4));
    expect(result.totalCost).toBe(150000);
  });

  it("should allocate multiple bars when pieces exceed single bar capacity", () => {
    const cuts: CutPiece[] = [
      {
        profileCode: "KUSEN_OB",
        profileName: "Kusen Open Back",
        label: "Tiang Panjang",
        lengthMm: 2500,
        quantity: 4, // 4 x 2500 = 10000mm -> at least 2 bars (each can hold 2 x 2500 + 4 = 5004mm)
        angle: "90/90",
      },
    ];

    const result = optimizeStockCutting("KUSEN_OB", "Kusen Open Back", "3_INCH", cuts, {
      stockLengthMm: 6000,
      kerfMm: 4,
    });

    expect(result.barsNeeded).toBe(2);
    expect(result.bars[0].cuts.length).toBe(2);
    expect(result.bars[1].cuts.length).toBe(2);
  });

  it("should throw error if single cut exceeds standard bar length", () => {
    const cuts: CutPiece[] = [
      {
        profileCode: "KUSEN_OB",
        profileName: "Kusen Open Back",
        label: "Tiang Raksasa",
        lengthMm: 6500,
        quantity: 1,
        angle: "90/90",
      },
    ];

    expect(() => {
      optimizeStockCutting("KUSEN_OB", "Kusen Open Back", "3_INCH", cuts);
    }).toThrow(/melebihi panjang standar batang/);
  });
});
