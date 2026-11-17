"use client";

import React, { useState } from "react";
import { ProfileOptimizationResult } from "@/lib/calculator/types";
import { Layers, ChevronDown, ChevronUp, PackageCheck, AlertCircle } from "lucide-react";

interface BarOptimizerVisualizerProps {
  optimizations: ProfileOptimizationResult[];
}

export default function BarOptimizerVisualizer({
  optimizations,
}: BarOptimizerVisualizerProps) {
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({
    [optimizations[0]?.profileCode || ""]: true,
  });

  const toggleExpand = (code: string) => {
    setExpandedProfiles((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const totalBarsAll = optimizations.reduce((acc, opt) => acc + opt.barsNeeded, 0);
  const totalLengthM = Number(
    (optimizations.reduce((acc, opt) => acc + opt.totalLengthMm, 0) / 1000).toFixed(2)
  );
  const totalWasteM = Number(
    (optimizations.reduce((acc, opt) => acc + opt.totalWasteMm, 0) / 1000).toFixed(2)
  );
  const avgEfficiency = totalBarsAll > 0
    ? Number(
        (
          optimizations.reduce((acc, opt) => acc + opt.overallEfficiencyPercent, 0) /
          optimizations.length
        ).toFixed(1)
      )
    : 100;

  // Distinct piece colors for visual contrast
  const cutPalette = [
    "bg-blue-500 text-white",
    "bg-emerald-500 text-white",
    "bg-indigo-500 text-white",
    "bg-amber-500 text-slate-900",
    "bg-violet-500 text-white",
    "bg-cyan-500 text-slate-900",
    "bg-rose-500 text-white",
  ];

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Batang 6m</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 font-mono">
              {totalBarsAll}
            </span>
            <span className="text-xs text-slate-500">Batang Utuh</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Panjang Bersih</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">
              {totalLengthM}
            </span>
            <span className="text-xs text-slate-500">Meter</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Sisa Potong (Waste)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">
              {totalWasteM}
            </span>
            <span className="text-xs text-slate-500">Meter</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Efisiensi Bahan</span>
            <span className="text-xs font-bold text-blue-600">FFD 1D</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">
              {avgEfficiency}%
            </span>
            <span className="text-xs text-slate-500">Optimal</span>
          </div>
        </div>
      </div>

      {/* Per Profile Optimization Breakdown */}
      <div className="space-y-4">
        {optimizations.map((opt) => {
          const isExpanded = !!expandedProfiles[opt.profileCode];

          return (
            <div
              key={opt.profileCode}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(opt.profileCode)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {opt.barsNeeded}b
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{opt.profileName}</h4>
                    <p className="text-xs text-slate-500">
                      Total {opt.totalPieces} potongan ({Number((opt.totalLengthMm / 1000).toFixed(2))} m) • Sisa {Number((opt.totalWasteMm / 1000).toFixed(2))} m ({opt.overallEfficiencyPercent}% efisien)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Estimasi Biaya</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      Rp {opt.totalCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Detail Batang (Expanded) */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="text-xs font-semibold text-slate-600 mb-2">
                    Visualisasi Layout Pemotongan per Batang 6.000 mm (Toleransi Gergaji 4mm):
                  </div>

                  {opt.bars.map((bar) => (
                    <div
                      key={bar.barIndex}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Batang #{bar.barIndex}
                        </span>
                        <div className="flex items-center gap-3 text-slate-500 font-mono">
                          <span>Terpakai: {bar.usedLengthMm} mm</span>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">
                            Sisa: {bar.wasteLengthMm} mm
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            {bar.efficiencyPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Bar Container */}
                      <div className="w-full h-8 bg-slate-100 rounded-md overflow-hidden flex border border-slate-200">
                        {bar.cuts.map((c, cIdx) => {
                          const widthPct = (c.lengthMm / bar.totalLengthMm) * 100;
                          const colorClass = cutPalette[cIdx % cutPalette.length];

                          return (
                            <div
                              key={cIdx}
                              style={{ width: `${widthPct}%` }}
                              title={`${c.label}: ${c.lengthMm}mm (${c.angle}°)`}
                              className={`h-full flex items-center justify-center text-[10px] font-mono font-bold border-r border-white/60 truncate px-1 transition hover:brightness-110 ${colorClass}`}
                            >
                              {c.lengthMm}
                            </div>
                          );
                        })}

                        {/* Waste Segment */}
                        {bar.wasteLengthMm > 0 && (
                          <div
                            style={{
                              width: `${(bar.wasteLengthMm / bar.totalLengthMm) * 100}%`,
                            }}
                            title={`Sisa/Offcut: ${bar.wasteLengthMm}mm`}
                            className="h-full bg-slate-200/80 text-slate-500 flex items-center justify-center text-[10px] font-mono italic truncate px-1"
                          >
                            sisa {bar.wasteLengthMm}
                          </div>
                        )}
                      </div>

                      {/* Cut labels breakdown */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {bar.cuts.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                            <span>{c.label}:</span>
                            <span className="font-mono font-bold">{c.lengthMm}mm</span>
                            <span className="text-[10px] text-slate-400">({c.angle}°)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
