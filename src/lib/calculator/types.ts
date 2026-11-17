export type ProfileSize = "3_INCH" | "4_INCH";
export type AluminiumColor = "SILVER" | "BROWN" | "BLACK" | "WHITE";

export interface CutPiece {
  profileCode: string;
  profileName: string;
  label: string; // e.g. "Tiang Kusen Kiri", "Ambang Atas", "Tiang Pintu"
  lengthMm: number;
  quantity: number;
  angle: "90/90" | "45/45" | "90/45";
  description?: string;
}

export interface GlassPiece {
  glassCode: string;
  glassName: string;
  label: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  areaM2: number;
}

export interface AccessoryBOM {
  accessoryCode: string;
  accessoryName: string;
  unit: string;
  quantity: number;
  category: string;
}

export interface BarCut {
  label: string;
  lengthMm: number;
  angle: string;
}

export interface StockBar {
  barIndex: number;
  totalLengthMm: number; // 6000
  usedLengthMm: number;
  wasteLengthMm: number;
  efficiencyPercent: number;
  cuts: BarCut[];
}

export interface ProfileOptimizationResult {
  profileCode: string;
  profileName: string;
  profileSize: ProfileSize;
  totalPieces: number;
  totalLengthMm: number;
  barsNeeded: number;
  stockLengthMm: number; // 6000
  totalWasteMm: number;
  overallEfficiencyPercent: number;
  bars: StockBar[];
  unitPricePerBar: number;
  totalCost: number;
}

export interface CostSummary {
  profileCost: number;
  glassCost: number;
  accessoryCost: number;
  subtotal: number;
  laborCostEstimate: number; // e.g. 15% fabrication labor
  grandTotal: number;
}

export interface CalculationInput {
  presetCode: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  frameSize: ProfileSize;
  frameThicknessMm?: number; // default 40
  color: AluminiumColor;
  glassCode: string;
  customParams?: Record<string, any>;
}

export interface CalculationResult {
  input: CalculationInput;
  presetName: string;
  category: "DOOR" | "WINDOW";
  unitCuttingList: CutPiece[];
  totalCuttingList: CutPiece[];
  unitGlassList: GlassPiece[];
  totalGlassList: GlassPiece[];
  totalGlassAreaM2: number;
  unitAccessoriesList: AccessoryBOM[];
  totalAccessoriesList: AccessoryBOM[];
  optimizations: ProfileOptimizationResult[];
  costSummary: CostSummary;
}
