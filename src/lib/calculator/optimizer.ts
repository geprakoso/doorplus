import { CutPiece, ProfileOptimizationResult, ProfileSize, StockBar, BarCut } from "./types";

export interface OptimizerOptions {
  stockLengthMm?: number; // default 6000
  kerfMm?: number;        // default 4mm saw tolerance
  pricePerBar?: number;
}

/**
 * 1D Bin Packing (First Fit Decreasing) for Aluminium Extrusions
 */
export function optimizeStockCutting(
  profileCode: string,
  profileName: string,
  profileSize: ProfileSize,
  cuts: CutPiece[],
  options: OptimizerOptions = {}
): ProfileOptimizationResult {
  const stockLength = options.stockLengthMm || 6000;
  const kerf = options.kerfMm !== undefined ? options.kerfMm : 4;
  const unitPrice = options.pricePerBar || 0;

  // Flatten all pieces
  const individualCuts: BarCut[] = [];
  for (const piece of cuts) {
    for (let i = 0; i < piece.quantity; i++) {
      individualCuts.push({
        label: piece.label,
        lengthMm: piece.lengthMm,
        angle: piece.angle,
      });
    }
  }

  // Sort descending by length (First Fit Decreasing)
  individualCuts.sort((a, b) => b.lengthMm - a.lengthMm);

  interface ActiveBar {
    cuts: BarCut[];
    usedNetMm: number;
    spaceConsumedMm: number;
  }

  const bars: ActiveBar[] = [];

  for (const cut of individualCuts) {
    if (cut.lengthMm > stockLength) {
      throw new Error(
        `Panjang potongan ${cut.label} (${cut.lengthMm}mm) melebihi panjang standar batang (${stockLength}mm)!`
      );
    }

    let placed = false;
    for (const bar of bars) {
      // Space needed is cut length + kerf
      const additionalSpace = cut.lengthMm + kerf;
      if (bar.spaceConsumedMm + additionalSpace <= stockLength) {
        bar.cuts.push(cut);
        bar.usedNetMm += cut.lengthMm;
        bar.spaceConsumedMm += additionalSpace;
        placed = true;
        break;
      }
    }

    if (!placed) {
      bars.push({
        cuts: [cut],
        usedNetMm: cut.lengthMm,
        spaceConsumedMm: cut.lengthMm + kerf,
      });
    }
  }

  const resultBars: StockBar[] = bars.map((b, idx) => {
    const waste = Math.max(0, stockLength - b.spaceConsumedMm);
    const eff = Number(((b.usedNetMm / stockLength) * 100).toFixed(1));
    return {
      barIndex: idx + 1,
      totalLengthMm: stockLength,
      usedLengthMm: b.usedNetMm,
      wasteLengthMm: waste,
      efficiencyPercent: eff,
      cuts: b.cuts,
    };
  });

  const totalPieces = individualCuts.length;
  const totalLengthMm = individualCuts.reduce((acc, c) => acc + c.lengthMm, 0);
  const barsNeeded = resultBars.length;
  const totalCapacity = barsNeeded * stockLength;
  const totalWasteMm = totalCapacity - totalLengthMm;
  const overallEfficiency = totalCapacity > 0
    ? Number(((totalLengthMm / totalCapacity) * 100).toFixed(1))
    : 100;

  return {
    profileCode,
    profileName,
    profileSize,
    totalPieces,
    totalLengthMm,
    barsNeeded,
    stockLengthMm: stockLength,
    totalWasteMm,
    overallEfficiencyPercent: overallEfficiency,
    bars: resultBars,
    unitPricePerBar: unitPrice,
    totalCost: barsNeeded * unitPrice,
  };
}
