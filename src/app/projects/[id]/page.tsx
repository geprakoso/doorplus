"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BarOptimizerVisualizer from "@/components/BarOptimizerVisualizer";
import {
  FolderKanban,
  ArrowLeft,
  Printer,
  Trash2,
  Layers,
  Wrench,
  DollarSign,
  Plus,
} from "lucide-react";
import { optimizeStockCutting } from "@/lib/calculator/optimizer";
import {
  CutPiece,
  GlassPiece,
  AccessoryBOM,
  ProfileOptimizationResult,
} from "@/lib/calculator/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"items" | "bars" | "glass" | "rab">("items");

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProject(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Hapus item "${name}" dari proyek ini?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}/items/${itemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchProject();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Memuat detail proyek...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Proyek tidak ditemukan.</p>
        <Link href="/projects" className="text-blue-600 underline text-sm">
          Kembali ke Daftar Proyek
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CONSOLIDATED PROJECT-WIDE CALCULATION
  // -------------------------------------------------------------
  const allCutPieces: CutPiece[] = [];
  const allGlasses: GlassPiece[] = [];
  const allAccessories: AccessoryBOM[] = [];

  let totalProjectCost = 0;
  let totalProfileCost = 0;
  let totalGlassCost = 0;
  let totalAccessoryCost = 0;

  project.items.forEach((item: any) => {
    const calc = item.calculationResult;
    if (calc) {
      if (calc.totalCuttingList) {
        allCutPieces.push(...calc.totalCuttingList);
      }
      if (calc.totalGlassList) {
        allGlasses.push(...calc.totalGlassList);
      }
      if (calc.totalAccessoriesList) {
        allAccessories.push(...calc.totalAccessoriesList);
      }
      if (calc.costSummary) {
        totalProfileCost += calc.costSummary.profileCost || 0;
        totalGlassCost += calc.costSummary.glassCost || 0;
        totalAccessoryCost += calc.costSummary.accessoryCost || 0;
      }
    }
  });

  // Group and re-optimize ALL pieces project-wide!
  const consolidatedProfileGroups: Record<string, CutPiece[]> = {};
  allCutPieces.forEach((piece) => {
    if (!consolidatedProfileGroups[piece.profileCode]) {
      consolidatedProfileGroups[piece.profileCode] = [];
    }
    consolidatedProfileGroups[piece.profileCode].push(piece);
  });

  const consolidatedOptimizations: ProfileOptimizationResult[] = [];
  Object.entries(consolidatedProfileGroups).forEach(([code, pieces]) => {
    const pName = pieces[0]?.profileName || code;
    const opt = optimizeStockCutting(code, pName, "3_INCH", pieces, {
      stockLengthMm: 6000,
      kerfMm: 4,
      pricePerBar: 150000,
    });
    consolidatedOptimizations.push(opt);
  });

  // Consolidated Glass Area
  const totalGlassM2 = Number(
    allGlasses.reduce((acc, g) => acc + g.areaM2 * g.quantity, 0).toFixed(3)
  );

  // Consolidated Accessories by code
  const consolidatedAccMap: Record<string, AccessoryBOM> = {};
  allAccessories.forEach((acc) => {
    if (!consolidatedAccMap[acc.accessoryCode]) {
      consolidatedAccMap[acc.accessoryCode] = { ...acc };
    } else {
      consolidatedAccMap[acc.accessoryCode].quantity += acc.quantity;
    }
  });
  const consolidatedAccessories = Object.values(consolidatedAccMap);

  const subtotalMaterial = totalProfileCost + totalGlassCost + totalAccessoryCost;
  const laborCost = Math.round(subtotalMaterial * 0.15);
  totalProjectCost = subtotalMaterial + laborCost;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar Proyek</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-amber-600" />
            <span>{project.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {project.clientName && <span>Klien: <strong>{project.clientName}</strong></span>}
            {project.address && <span>• Lokasi: {project.address}</span>}
            <span>• Dibuat: {new Date(project.createdAt).toLocaleDateString("id-ID")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap RAB Proyek</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Item dari Kalkulator</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            activeTab === "items"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Daftar Pintu & Jendela ({project.items.length})
        </button>

        <button
          onClick={() => setActiveTab("bars")}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            activeTab === "bars"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Total Belanja Batang 6m ({consolidatedOptimizations.reduce((a, b) => a + b.barsNeeded, 0)} Batang)
        </button>

        <button
          onClick={() => setActiveTab("glass")}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            activeTab === "glass"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Total Kaca ({totalGlassM2} m²) & Aksesoris
        </button>

        <button
          onClick={() => setActiveTab("rab")}
          className={`px-4 py-2 font-bold text-xs rounded-lg transition ${
            activeTab === "rab"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rekapitulasi Anggaran (RAB)
        </button>
      </div>

      {/* TAB 1: ITEMS LIST */}
      {(activeTab === "items" || typeof window === "undefined") && (
        <div className="space-y-4">
          {project.items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-slate-500 text-sm">
                Belum ada item pintu atau jendela yang disimpan ke proyek ini.
              </p>
              <Link
                href="/"
                className="inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Buka Kalkulator & Tambah Item
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Nama / Kode Posisi</th>
                      <th className="px-4 py-3">Model Varian</th>
                      <th className="px-4 py-3 text-right">Ukuran (L × T)</th>
                      <th className="px-4 py-3 text-center">Spesifikasi</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Estimasi Biaya</th>
                      <th className="no-print px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.items.map((item: any) => {
                      const cost = item.calculationResult?.costSummary?.grandTotal || 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.calculationResult?.presetName || item.presetCode}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                            {item.width} × {item.height} mm
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                              {item.frameSize === "3_INCH" ? "3\"" : "4\""} • {item.color}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {item.quantity} Unit
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                            Rp {cost.toLocaleString("id-ID")}
                          </td>
                          <td className="no-print px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Hapus Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSOLIDATED 6M BARS */}
      {activeTab === "bars" && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Optimasi Global Proyek:</strong> Seluruh potongan profil dari {project.items.length} unit pintu dan jendela telah digabungkan dan dihitung dengan algoritma 1D Bin Packing (First Fit Decreasing) untuk meminimalkan sisa potongan (waste) saat belanja batangan 6 meter.
          </div>
          <BarOptimizerVisualizer optimizations={consolidatedOptimizations} />
        </div>
      )}

      {/* TAB 3: CONSOLIDATED GLASS & ACCESSORIES */}
      {activeTab === "glass" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Glass */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>Rekap Seluruh Lembar Kaca</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                Total: {totalGlassM2} m²
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2 px-2">Label Posisi</th>
                    <th className="py-2 px-2 text-right">Ukuran (mm)</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allGlasses.map((g, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 font-medium">{g.label}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">
                        {g.widthMm} × {g.heightMm}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">{g.quantity} lbr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accessories */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Rekap Belanja Aksesoris & Hardware</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2 px-2">Nama Aksesoris</th>
                    <th className="py-2 px-2 text-right">Total Kebutuhan</th>
                    <th className="py-2 px-2 text-center">Satuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consolidatedAccessories.map((acc, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 font-medium">{acc.accessoryName}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">
                        {acc.quantity}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-500">{acc.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RAB SUMMARY */}
      {activeTab === "rab" && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-lg text-white">
                Rencana Anggaran Biaya (RAB) Total Proyek
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Total {project.items.length} Unit Kusen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Total Profil Aluminium (Batangan 6m):</span>
                <span className="font-mono font-bold text-white">
                  Rp {totalProfileCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Kaca Lembaran:</span>
                <span className="font-mono font-bold text-white">
                  Rp {totalGlassCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Aksesoris & Hardware:</span>
                <span className="font-mono font-bold text-white">
                  Rp {totalAccessoryCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="space-y-3 md:border-l md:border-slate-700/60 md:pl-6">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Bahan Material:</span>
                <span className="font-mono font-bold text-white">
                  Rp {subtotalMaterial.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Ongkos Fabrikasi & Pasang (~15%):</span>
                <span className="font-mono font-bold text-emerald-400">
                  Rp {laborCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
                <span className="font-bold text-base text-white">Grand Total Proyek:</span>
                <span className="font-mono font-extrabold text-2xl text-amber-400">
                  Rp {totalProjectCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SHEET (For printing quotation and whole project BOM) */}
      <div className="hidden print:block space-y-6">
        <div className="border-b-2 border-black pb-4">
          <h2 className="text-2xl font-black text-black">
            SURAT PENAWARAN & REKAPITULASI MATERIAL ALUMINIUM (RAB)
          </h2>
          <p className="text-sm font-bold text-black mt-1">PROYEK: {project.name}</p>
          <p className="text-xs text-black">
            Klien: {project.clientName || "-"} | Lokasi: {project.address || "-"} | Tanggal: {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-sm text-black uppercase">1. Rincian Kusen Pintu & Jendela:</h3>
          <table className="w-full text-left text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black p-2">Item Posisi</th>
                <th className="border border-black p-2">Model Varian</th>
                <th className="border border-black p-2 text-right">Ukuran (mm)</th>
                <th className="border border-black p-2 text-center">Spesifikasi</th>
                <th className="border border-black p-2 text-center">Qty</th>
                <th className="border border-black p-2 text-right">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {project.items.map((it: any) => (
                <tr key={it.id}>
                  <td className="border border-black p-2 font-bold">{it.name}</td>
                  <td className="border border-black p-2">{it.calculationResult?.presetName}</td>
                  <td className="border border-black p-2 text-right font-mono">{it.width} x {it.height}</td>
                  <td className="border border-black p-2 text-center">{it.frameSize} {it.color}</td>
                  <td className="border border-black p-2 text-center">{it.quantity}</td>
                  <td className="border border-black p-2 text-right font-mono">
                    {(it.calculationResult?.costSummary?.grandTotal || 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="page-break" />

        <div className="space-y-2">
          <h3 className="font-bold text-sm text-black uppercase">2. Rekap Belanja Batangan Profil 6 Meter:</h3>
          <BarOptimizerVisualizer optimizations={consolidatedOptimizations} />
        </div>

        <div className="pt-4 border-t-2 border-black space-y-2">
          <div className="flex justify-between font-bold text-base text-black">
            <span>TOTAL RENCANA ANGGARAN BIAYA (RAB):</span>
            <span className="font-mono text-xl">Rp {totalProjectCost.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
