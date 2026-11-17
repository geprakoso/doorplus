"use client";

import React, { useState, useEffect } from "react";
import SvgPreview from "@/components/SvgPreview";
import CuttingListTable from "@/components/CuttingListTable";
import BarOptimizerVisualizer from "@/components/BarOptimizerVisualizer";
import BOMSummary from "@/components/BOMSummary";
import SaveToProjectModal from "@/components/SaveToProjectModal";
import {
  CalculationResult,
  ProfileSize,
  AluminiumColor,
} from "@/lib/calculator/types";
import {
  Calculator,
  Printer,
  FolderPlus,
  RefreshCw,
  Sparkles,
  Layers,
  Scissors,
  DollarSign,
  Maximize2,
} from "lucide-react";

interface PresetItem {
  id: string;
  category: "DOOR" | "WINDOW";
  code: string;
  name: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  config: any;
}

export default function CalculatorPage() {
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"DOOR" | "WINDOW">("DOOR");
  const [selectedPresetCode, setSelectedPresetCode] = useState<string>("DOOR_SWING_SINGLE");

  // Inputs
  const [widthMm, setWidthMm] = useState<number>(900);
  const [heightMm, setHeightMm] = useState<number>(2100);
  const [quantity, setQuantity] = useState<number>(1);
  const [frameSize, setFrameSize] = useState<ProfileSize>("3_INCH");
  const [frameThicknessMm, setFrameThicknessMm] = useState<number>(40);
  const [color, setColor] = useState<AluminiumColor>("SILVER");
  const [glassCode, setGlassCode] = useState<string>("KACA_POLOS_5MM");

  // Results
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "cutting" | "optimizer" | "bom">("preview");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Fetch presets on load
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch("/api/presets");
      const json = await res.json();
      if (json.success && json.data) {
        setPresets(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // When selected preset changes, update default dimensions
  const handleSelectPreset = (code: string) => {
    setSelectedPresetCode(code);
    const p = presets.find((item) => item.code === code);
    if (p) {
      setWidthMm(p.defaultWidth);
      setHeightMm(p.defaultHeight);
    }
  };

  // Run calculation
  const handleCalculate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetCode: selectedPresetCode,
          widthMm,
          heightMm,
          quantity,
          frameSize,
          frameThicknessMm,
          color,
          glassCode,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Gagal menghitung");
      }
      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan perhitungan");
    } finally {
      setLoading(false);
    }
  };

  // Auto calculate on initial load or preset change
  useEffect(() => {
    if (presets.length > 0) {
      handleCalculate();
    }
  }, [selectedPresetCode, frameSize, color, glassCode]);

  const filteredPresets = presets.filter((p) => p.category === activeCategory);
  const currentPreset = presets.find((p) => p.code === selectedPresetCode);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-blue-600" />
            <span>Kalkulator Aluminium, Kaca & 1D Cutting List</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hitung daftar potongan presisi (mm), optimasi batangan 6 meter, BOM kaca & aksesoris secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!result}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Lembar Kerja</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            disabled={!result}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Simpan ke Proyek</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Form, Right Column Visual & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls & Parameters */}
        <div className="no-print lg:col-span-5 space-y-5">
          {/* Category Switcher (Pintu vs Jendela) */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Kategori Produk:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("DOOR");
                  const firstDoor = presets.find((p) => p.category === "DOOR");
                  if (firstDoor) handleSelectPreset(firstDoor.code);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                  activeCategory === "DOOR"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🚪 Pintu Aluminium
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("WINDOW");
                  const firstWin = presets.find((p) => p.category === "WINDOW");
                  if (firstWin) handleSelectPreset(firstWin.code);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                  activeCategory === "WINDOW"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🪟 Jendela & Boven
              </button>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Varian & Model Konstruksi:
            </label>
            <select
              value={selectedPresetCode}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {filteredPresets.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            {currentPreset && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                {currentPreset.description}
              </p>
            )}
          </div>

          {/* Dimensions & Parameters Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dimensi & Spesifikasi Kusen:
            </h3>

            {/* Lebar & Tinggi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lebar Luar (L) mm:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="300"
                    max="10000"
                    step="5"
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">
                    mm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tinggi Luar (T) mm:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="300"
                    max="10000"
                    step="5"
                    value={heightMm}
                    onChange={(e) => setHeightMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">
                    mm
                  </span>
                </div>
              </div>
            </div>

            {/* Frame Size & Tebal Kusen */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ukuran Profil Kusen:
                </label>
                <select
                  value={frameSize}
                  onChange={(e) => {
                    const s = e.target.value as ProfileSize;
                    setFrameSize(s);
                    setFrameThicknessMm(s === "4_INCH" ? 44 : 40);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                >
                  <option value="3_INCH">Kusen 3 Inch (76 mm)</option>
                  <option value="4_INCH">Kusen 4 Inch (101.6 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tebal Kusen (mm):
                </label>
                <input
                  type="number"
                  min="30"
                  max="60"
                  value={frameThicknessMm}
                  onChange={(e) => setFrameThicknessMm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-medium text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Warna Aluminium */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warna Aluminium Anodize / Powder Coating:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: "SILVER", label: "Silver", bg: "bg-slate-200 border-slate-400 text-slate-800" },
                    { id: "BROWN", label: "Coklat", bg: "bg-amber-900 border-amber-950 text-white" },
                    { id: "BLACK", label: "Hitam", bg: "bg-slate-900 border-black text-white" },
                    { id: "WHITE", label: "Putih", bg: "bg-white border-slate-300 text-slate-800" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      c.bg
                    } ${color === c.id ? "ring-2 ring-blue-500 ring-offset-1 scale-102" : "opacity-80 hover:opacity-100"}`}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis Kaca */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe & Ketebalan Kaca:
              </label>
              <select
                value={glassCode}
                onChange={(e) => setGlassCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-800"
              >
                <optgroup label="Kaca Polos (Clear)">
                  <option value="KACA_POLOS_5MM">Kaca Polos 5 mm</option>
                  <option value="KACA_POLOS_6MM">Kaca Polos 6 mm</option>
                  <option value="KACA_POLOS_8MM">Kaca Polos 8 mm</option>
                  <option value="KACA_POLOS_10MM">Kaca Polos 10 mm</option>
                  <option value="KACA_POLOS_12MM">Kaca Polos 12 mm</option>
                </optgroup>
                <optgroup label="Kaca Riben / Rayban (Dark Grey)">
                  <option value="KACA_RIBEN_5MM">Kaca Riben 5 mm</option>
                  <option value="KACA_RIBEN_6MM">Kaca Riben 6 mm</option>
                  <option value="KACA_RIBEN_8MM">Kaca Riben 8 mm</option>
                </optgroup>
                <optgroup label="Kaca Tempered Safety">
                  <option value="KACA_TEMPERED_5MM">Kaca Tempered 5 mm</option>
                  <option value="KACA_TEMPERED_6MM">Kaca Tempered 6 mm</option>
                  <option value="KACA_TEMPERED_8MM">Kaca Tempered 8 mm</option>
                  <option value="KACA_TEMPERED_10MM">Kaca Tempered 10 mm</option>
                  <option value="KACA_TEMPERED_12MM">Kaca Tempered 12 mm</option>
                </optgroup>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Unit Pembuatan (Quantity):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-28 px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-sm"
                />
                <span className="text-xs text-slate-500 font-medium">
                  Unit Kusen Lengkap
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menghitung Bahan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kalkulasi Material & Cutting List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Preview & Results Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Result Navigation Tabs */}
          <div className="no-print bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "preview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Gambar 2D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cutting")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "cutting"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Cutting List ({result?.totalCuttingList.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("optimizer")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "optimizer"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batang 6m</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bom")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "bom"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>RAB & Kaca</span>
            </button>
          </div>

          {/* TAB 1: 2D SVG PREVIEW */}
          {(activeTab === "preview" || typeof window === "undefined") && (
            <div className="space-y-4">
              <SvgPreview
                presetCode={selectedPresetCode}
                widthMm={widthMm}
                heightMm={heightMm}
                color={color}
              />

              {result && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{result.presetName}</h4>
                    <p className="text-xs text-slate-500">
                      {result.input.widthMm} × {result.input.heightMm} mm • {result.input.frameSize === "3_INCH" ? "3 Inci" : "4 Inci"} • {result.input.color} • {result.input.quantity} Unit
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Estimasi RAB</span>
                    <span className="text-xl font-mono font-extrabold text-blue-600">
                      Rp {result.costSummary.grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUTTING LIST TABLE */}
          {activeTab === "cutting" && result && (
            <CuttingListTable
              unitCuttingList={result.unitCuttingList}
              totalCuttingList={result.totalCuttingList}
              quantity={result.input.quantity}
            />
          )}

          {/* TAB 3: 1D STOCK OPTIMIZER */}
          {activeTab === "optimizer" && result && (
            <BarOptimizerVisualizer optimizations={result.optimizations} />
          )}

          {/* TAB 4: BOM KACA, AKSESORIS & RAB */}
          {activeTab === "bom" && result && (
            <BOMSummary
              glassList={result.totalGlassList}
              totalGlassAreaM2={result.totalGlassAreaM2}
              accessoriesList={result.totalAccessoriesList}
              costSummary={result.costSummary}
              quantity={result.input.quantity}
            />
          )}

          {/* Print Section (Only visible during print / PDF export) */}
          {result && (
            <div className="hidden print:block space-y-6">
              <div className="border-b border-black pb-3">
                <h2 className="text-xl font-bold text-black">
                  LEMBAR KERJA PEMBUATAN ALUMINIUM & KACA
                </h2>
                <p className="text-xs text-black">
                  Model: {result.presetName} | Ukuran: {result.input.widthMm} x {result.input.heightMm} mm | Qty: {result.input.quantity} Unit | Warna: {result.input.color}
                </p>
              </div>

              <SvgPreview
                presetCode={selectedPresetCode}
                widthMm={widthMm}
                heightMm={heightMm}
                color={color}
              />

              <CuttingListTable
                unitCuttingList={result.unitCuttingList}
                totalCuttingList={result.totalCuttingList}
                quantity={result.input.quantity}
              />

              <div className="page-break" />

              <BarOptimizerVisualizer optimizations={result.optimizations} />

              <BOMSummary
                glassList={result.totalGlassList}
                totalGlassAreaM2={result.totalGlassAreaM2}
                accessoriesList={result.totalAccessoriesList}
                costSummary={result.costSummary}
                quantity={result.input.quantity}
              />
            </div>
          )}
        </div>
      </div>

      {/* Save to Project Modal */}
      {result && (
        <SaveToProjectModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          calculationResult={result}
        />
      )}
    </div>
  );
}
