"use client";

import React from "react";
import { CostSummary, GlassPiece, AccessoryBOM } from "@/lib/calculator/types";
import { ShieldCheck, Layers, Wrench, Calculator } from "lucide-react";

interface BOMSummaryProps {
  glassList: GlassPiece[];
  totalGlassAreaM2: number;
  accessoriesList: AccessoryBOM[];
  costSummary: CostSummary;
  quantity: number;
}

export default function BOMSummary({
  glassList,
  totalGlassAreaM2,
  accessoriesList,
  costSummary,
  quantity,
}: BOMSummaryProps) {
  return (
    <div className="space-y-6">
      {/* 1. Rekap Belanja Kaca */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-slate-800">
              Rincian Pemesanan Kaca
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-md border border-cyan-200">
            Total Luas: {totalGlassAreaM2} m²
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Tipe Kaca</th>
                <th className="px-4 py-2.5">Posisi / Label</th>
                <th className="px-4 py-2.5 text-right">Ukuran Potong Kaca</th>
                <th className="px-4 py-2.5 text-center">Jumlah Lembar</th>
                <th className="px-4 py-2.5 text-right">Luas (m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {glassList.map((g, idx) => (
                <tr key={idx} className="hover:bg-cyan-50/30 transition">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{g.glassName}</td>
                  <td className="px-4 py-2.5 text-slate-600">{g.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-cyan-800">
                    {g.widthMm} × {g.heightMm} <span className="text-xs text-slate-400 font-normal">mm</span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold">{g.quantity} lbr</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                    {(g.areaM2 * g.quantity).toFixed(3)} m²
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Rekap Aksesoris & Hardware */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-800">
              Kebutuhan Aksesoris & Hardware
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {accessoriesList.length} Macam Perlengkapan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5 w-12 text-center">No</th>
                <th className="px-4 py-2.5">Nama Aksesoris / Hardware</th>
                <th className="px-4 py-2.5 text-center">Kategori</th>
                <th className="px-4 py-2.5 text-right">Jumlah Kebutuhan</th>
                <th className="px-4 py-2.5 text-center">Satuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accessoriesList.map((acc, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition">
                  <td className="px-4 py-2 text-center text-xs text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{acc.accessoryName}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {acc.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">
                    {acc.quantity}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600 text-xs">
                    {acc.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Rekap Anggaran Biaya (RAB) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">
              Rekap Anggaran Biaya (RAB Material & Jasa)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Estimasi untuk {quantity} Unit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2.5">
            <div className="flex justify-between text-slate-300">
              <span>Profil Aluminium (Batangan 6m):</span>
              <span className="font-mono font-bold text-white">
                Rp {costSummary.profileCost.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Kaca Lembaran:</span>
              <span className="font-mono font-bold text-white">
                Rp {costSummary.glassCost.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Aksesoris & Hardware:</span>
              <span className="font-mono font-bold text-white">
                Rp {costSummary.accessoryCost.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 md:border-l md:border-slate-700/60 md:pl-4">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal Material:</span>
              <span className="font-mono font-bold text-white">
                Rp {costSummary.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Ongkos Fabrikasi / Perakitan (~15%):</span>
              <span className="font-mono font-bold text-emerald-400">
                Rp {costSummary.laborCostEstimate.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
              <span className="font-bold text-base text-white">Total Estimasi RAB:</span>
              <span className="font-mono font-extrabold text-2xl text-blue-400">
                Rp {costSummary.grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
