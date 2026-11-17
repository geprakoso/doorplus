"use client";

import React, { useState } from "react";
import { CutPiece } from "@/lib/calculator/types";
import { Scissors, Copy, Check } from "lucide-react";

interface CuttingListTableProps {
  unitCuttingList: CutPiece[];
  totalCuttingList: CutPiece[];
  quantity: number;
}

export default function CuttingListTable({
  unitCuttingList,
  totalCuttingList,
  quantity,
}: CuttingListTableProps) {
  const [viewMode, setViewMode] = useState<"unit" | "total">(quantity > 1 ? "total" : "unit");
  const [copied, setCopied] = useState(false);

  const activeList = viewMode === "unit" ? unitCuttingList : totalCuttingList;

  const copyToClipboard = () => {
    const text = activeList
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.profileName} [${c.label}]: ${c.quantity}x @ ${c.lengthMm}mm (${c.angle}°)`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">
            Daftar Potongan Aluminium (Cutting List)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            {activeList.reduce((acc, c) => acc + c.quantity, 0)} Potongan
          </span>
        </div>

        <div className="flex items-center gap-2">
          {quantity > 1 && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("unit")}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === "unit"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Per 1 Unit
              </button>
              <button
                type="button"
                onClick={() => setViewMode("total")}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === "total"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Total {quantity} Unit
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={copyToClipboard}
            className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 w-12 text-center">No</th>
              <th className="px-4 py-3">Profil Aluminium</th>
              <th className="px-4 py-3">Bagian / Posisi</th>
              <th className="px-4 py-3 text-right">Ukuran Potong</th>
              <th className="px-4 py-3 text-center">Jumlah</th>
              <th className="px-4 py-3 text-center">Sudut Potong</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeList.map((cut, idx) => (
              <tr key={idx} className="hover:bg-blue-50/40 transition">
                <td className="px-4 py-2.5 text-center text-xs text-slate-400 font-mono">
                  {idx + 1}
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {cut.profileName}
                  <span className="ml-2 text-[11px] font-mono text-slate-400">
                    ({cut.profileCode})
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{cut.label}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-700 text-base">
                  {cut.lengthMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </td>
                <td className="px-4 py-2.5 text-center font-semibold text-slate-900">
                  <span className="inline-block min-w-8 py-0.5 px-2 bg-slate-100 rounded text-xs font-mono font-bold">
                    {cut.quantity}x
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                      cut.angle === "45/45"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {cut.angle === "45/45" ? "45° Adu Manis" : "90° Rata"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
