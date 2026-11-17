"use client";

import React from "react";
import { AluminiumColor } from "@/lib/calculator/types";

interface SvgPreviewProps {
  presetCode: string;
  widthMm: number;
  heightMm: number;
  color?: AluminiumColor;
  className?: string;
}

export default function SvgPreview({
  presetCode,
  widthMm,
  heightMm,
  color = "SILVER",
  className = "",
}: SvgPreviewProps) {
  // Safe limits
  const W = Math.max(300, Math.min(widthMm, 10000));
  const H = Math.max(300, Math.min(heightMm, 10000));

  // Padding for dimension labels
  const padX = 60;
  const padY = 50;
  const svgWidth = W + padX * 2;
  const svgHeight = H + padY * 2;

  // Frame colors
  const colorMap: Record<AluminiumColor, { frame: string; stroke: string; glass: string }> = {
    SILVER: { frame: "#cbd5e1", stroke: "#475569", glass: "#e0f2fe" },
    BROWN: { frame: "#78350f", stroke: "#451a03", glass: "#fef3c7" },
    BLACK: { frame: "#1e293b", stroke: "#0f172a", glass: "#e2e8f0" },
    WHITE: { frame: "#f8fafc", stroke: "#94a3b8", glass: "#f0f9ff" },
  };
  const theme = colorMap[color] || colorMap.SILVER;

  const tKusen = 40; // visual frame thickness
  const x0 = padX;
  const y0 = padY;
  const innerW = W - 2 * tKusen;
  const innerH = H - 2 * tKusen;

  const renderContent = () => {
    // ----------------------------------------------------
    // 1. PINTU SWING SINGLE
    // ----------------------------------------------------
    if (presetCode === "DOOR_SWING_SINGLE") {
      const stile = 50;
      const topRail = 50;
      const bottomRail = 100;
      const leafX = x0 + tKusen + 4;
      const leafY = y0 + tKusen + 4;
      const leafW = innerW - 8;
      const leafH = H - tKusen - 8; // door reaches bottom

      return (
        <g>
          {/* Daun Pintu */}
          <rect
            x={leafX}
            y={leafY}
            width={leafW}
            height={leafH}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="3"
          />
          {/* Kaca Daun */}
          <rect
            x={leafX + stile}
            y={leafY + topRail}
            width={leafW - 2 * stile}
            height={leafH - topRail - bottomRail}
            fill={theme.glass}
            stroke={theme.stroke}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Handle */}
          <rect
            x={leafX + leafW - 25}
            y={leafY + leafH / 2 - 20}
            width="6"
            height="40"
            rx="3"
            fill="#334155"
          />
          {/* Bukaan Swing: Garis putus-putus segitiga (Engsel di kiri, handle di kanan) */}
          <path
            d={`M ${leafX} ${leafY} L ${leafX + leafW} ${leafY + leafH / 2} L ${leafX} ${leafY + leafH}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
        </g>
      );
    }

    // ----------------------------------------------------
    // 2. PINTU SWING DOUBLE (KUPU TARUNG)
    // ----------------------------------------------------
    if (presetCode === "DOOR_SWING_DOUBLE") {
      const stile = 50;
      const topRail = 50;
      const bottomRail = 100;
      const leafW = (innerW - 12) / 2;
      const leafH = H - tKusen - 8;

      const leaf1X = x0 + tKusen + 4;
      const leaf2X = leaf1X + leafW + 4;
      const leafY = y0 + tKusen + 4;

      return (
        <g>
          {/* Daun Kiri */}
          <rect
            x={leaf1X}
            y={leafY}
            width={leafW}
            height={leafH}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2.5"
          />
          <rect
            x={leaf1X + stile}
            y={leafY + topRail}
            width={leafW - 2 * stile}
            height={leafH - topRail - bottomRail}
            fill={theme.glass}
            stroke={theme.stroke}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Swing Kiri: Engsel di kiri luar */}
          <path
            d={`M ${leaf1X} ${leafY} L ${leaf1X + leafW} ${leafY + leafH / 2} L ${leaf1X} ${leafY + leafH}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <rect x={leaf1X + leafW - 12} y={leafY + leafH / 2 - 20} width="5" height="40" rx="2" fill="#334155" />

          {/* Daun Kanan */}
          <rect
            x={leaf2X}
            y={leafY}
            width={leafW}
            height={leafH}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2.5"
          />
          <rect
            x={leaf2X + stile}
            y={leafY + topRail}
            width={leafW - 2 * stile}
            height={leafH - topRail - bottomRail}
            fill={theme.glass}
            stroke={theme.stroke}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Swing Kanan: Engsel di kanan luar */}
          <path
            d={`M ${leaf2X + leafW} ${leafY} L ${leaf2X} ${leafY + leafH / 2} L ${leaf2X + leafW} ${leafY + leafH}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <rect x={leaf2X + 7} y={leafY + leafH / 2 - 20} width="5" height="40" rx="2" fill="#334155" />
        </g>
      );
    }

    // ----------------------------------------------------
    // 3. PINTU SLIDING (1, 2, 3 DAUN)
    // ----------------------------------------------------
    if (presetCode.startsWith("DOOR_SLIDE_")) {
      const N = presetCode.endsWith("TRIPLE") ? 3 : presetCode.endsWith("DOUBLE") ? 2 : 1;
      const stile = 50;
      const topRail = 50;
      const bottomRail = 100;
      const overlap = N > 1 ? 30 : 0;
      const leafW = (innerW + (N - 1) * overlap) / N;
      const leafH = H - tKusen - 15;

      return (
        <g>
          {Array.from({ length: N }).map((_, i) => {
            const lX = x0 + tKusen + i * (leafW - overlap);
            const lY = y0 + tKusen + 10;
            const isLeft = i % 2 === 0;

            return (
              <g key={i}>
                <rect
                  x={lX}
                  y={lY}
                  width={leafW}
                  height={leafH}
                  fill={theme.frame}
                  stroke={theme.stroke}
                  strokeWidth="2.5"
                />
                <rect
                  x={lX + stile}
                  y={lY + topRail}
                  width={leafW - 2 * stile}
                  height={leafH - topRail - bottomRail}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                {/* Arrow sliding indicator */}
                <path
                  d={
                    isLeft
                      ? `M ${lX + leafW / 2 + 30} ${lY + leafH / 2} L ${lX + leafW / 2 - 30} ${lY + leafH / 2} M ${lX + leafW / 2 - 20} ${lY + leafH / 2 - 8} L ${lX + leafW / 2 - 30} ${lY + leafH / 2} L ${lX + leafW / 2 - 20} ${lY + leafH / 2 + 8}`
                      : `M ${lX + leafW / 2 - 30} ${lY + leafH / 2} L ${lX + leafW / 2 + 30} ${lY + leafH / 2} M ${lX + leafW / 2 + 20} ${lY + leafH / 2 - 8} L ${lX + leafW / 2 + 30} ${lY + leafH / 2} L ${lX + leafW / 2 + 20} ${lY + leafH / 2 + 8}`
                  }
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  fill="none"
                />
              </g>
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 4. PINTU SLIDING + SWING
    // ----------------------------------------------------
    if (presetCode.startsWith("DOOR_SLIDE_") && presetCode.includes("_SWING")) {
      const N_slide = presetCode.includes("3_SWING") ? 3 : presetCode.includes("2_SWING") ? 2 : 1;
      const swingW = Math.min(850, W * 0.4);
      const slideW = W - swingW - tKusen;
      const stile = 50;

      // Mullion at swing boundary
      const mulX = x0 + swingW;

      return (
        <g>
          {/* Mullion vertical bar */}
          <rect
            x={mulX}
            y={y0 + tKusen}
            width={tKusen}
            height={H - tKusen}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2"
          />

          {/* Area Swing (Kiri) */}
          <rect
            x={x0 + tKusen + 4}
            y={y0 + tKusen + 4}
            width={swingW - tKusen - 8}
            height={H - tKusen - 8}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2.5"
          />
          <rect
            x={x0 + tKusen + stile}
            y={y0 + tKusen + 50}
            width={swingW - tKusen - 8 - 2 * stile}
            height={H - tKusen - 158}
            fill={theme.glass}
            stroke={theme.stroke}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Swing dash line */}
          <path
            d={`M ${x0 + tKusen + 4} ${y0 + tKusen + 4} L ${mulX - 4} ${y0 + H / 2} L ${x0 + tKusen + 4} ${y0 + H - 4}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6,4"
          />

          {/* Area Sliding (Kanan) */}
          {Array.from({ length: N_slide }).map((_, i) => {
            const panelW = (slideW - tKusen) / N_slide;
            const pX = mulX + tKusen + i * panelW;
            return (
              <g key={i}>
                <rect
                  x={pX}
                  y={y0 + tKusen + 10}
                  width={panelW}
                  height={H - tKusen - 15}
                  fill={theme.frame}
                  stroke={theme.stroke}
                  strokeWidth="2"
                />
                <rect
                  x={pX + stile}
                  y={y0 + tKusen + 60}
                  width={panelW - 2 * stile}
                  height={H - tKusen - 165}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                {/* Slide Arrow */}
                <path
                  d={`M ${pX + panelW / 2 - 20} ${y0 + H / 2} L ${pX + panelW / 2 + 20} ${y0 + H / 2} M ${pX + panelW / 2 + 12} ${y0 + H / 2 - 6} L ${pX + panelW / 2 + 20} ${y0 + H / 2} L ${pX + panelW / 2 + 12} ${y0 + H / 2 + 6}`}
                  stroke="#2563eb"
                  strokeWidth="2"
                  fill="none"
                />
              </g>
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 5. PINTU COWBOY (SINGLE / DOUBLE)
    // ----------------------------------------------------
    if (presetCode.startsWith("DOOR_COWBOY_")) {
      const N = presetCode.endsWith("DOUBLE") ? 2 : 1;
      const stile = 50;
      const leafW = (innerW - (N === 1 ? 8 : 12)) / N;
      const leafH = H - tKusen - 10;

      return (
        <g>
          {Array.from({ length: N }).map((_, i) => {
            const lX = x0 + tKusen + 4 + i * (leafW + 4);
            const lY = y0 + tKusen + 5;
            return (
              <g key={i}>
                <rect
                  x={lX}
                  y={lY}
                  width={leafW}
                  height={leafH}
                  fill={theme.frame}
                  stroke={theme.stroke}
                  strokeWidth="2.5"
                />
                <rect
                  x={lX + stile}
                  y={lY + 50}
                  width={leafW - 2 * stile}
                  height={leafH - 150}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                {/* Double action curves (2-way swing arrows) */}
                <path
                  d={`M ${lX + leafW / 2 - 25} ${lY + leafH / 2} A 25 25 0 0 1 ${lX + leafW / 2 + 25} ${lY + leafH / 2}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                />
                <path
                  d={`M ${lX + leafW / 2 - 25} ${lY + leafH / 2} A 25 25 0 0 0 ${lX + leafW / 2 + 25} ${lY + leafH / 2}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
              </g>
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 6. JENDELA KACA MATI & BOVEN MATI
    // ----------------------------------------------------
    if (presetCode.startsWith("WINDOW_FIXED_") || presetCode === "BOVEN_FIXED") {
      const N = presetCode.endsWith("TRIPLE") ? 3 : presetCode.endsWith("DOUBLE") ? 2 : 1;
      const M = N - 1;
      const panelW = (innerW - M * tKusen) / N;

      return (
        <g>
          {Array.from({ length: N }).map((_, i) => {
            const pX = x0 + tKusen + i * (panelW + tKusen);
            return (
              <g key={i}>
                <rect
                  x={pX}
                  y={y0 + tKusen}
                  width={panelW}
                  height={innerH}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* Diagonal glass reflection lines */}
                <line
                  x1={pX + panelW * 0.2}
                  y1={y0 + tKusen + innerH * 0.7}
                  x2={pX + panelW * 0.4}
                  y2={y0 + tKusen + innerH * 0.3}
                  stroke="#93c5fd"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1={pX + panelW * 0.3}
                  y1={y0 + tKusen + innerH * 0.8}
                  x2={pX + panelW * 0.5}
                  y2={y0 + tKusen + innerH * 0.4}
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              </g>
            );
          })}
          {/* Mullions */}
          {Array.from({ length: M }).map((_, i) => {
            const mX = x0 + tKusen + (i + 1) * panelW + i * tKusen;
            return (
              <rect
                key={`m-${i}`}
                x={mX}
                y={y0 + tKusen}
                width={tKusen}
                height={innerH}
                fill={theme.frame}
                stroke={theme.stroke}
                strokeWidth="2"
              />
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 7. JENDELA CASEMENT & BOVEN CASEMENT
    // ----------------------------------------------------
    if (presetCode.startsWith("WINDOW_CASEMENT_") || presetCode.startsWith("BOVEN_CASEMENT_")) {
      const isTopHung = presetCode.startsWith("BOVEN_CASEMENT_");
      const N = presetCode.endsWith("TRIPLE") ? 3 : presetCode.endsWith("DOUBLE") ? 2 : 1;
      const M = N - 1;
      const panelW = (innerW - M * tKusen) / N;

      return (
        <g>
          {Array.from({ length: N }).map((_, i) => {
            const pX = x0 + tKusen + i * (panelW + tKusen);
            const pY = y0 + tKusen;
            const cWidth = 35; // casement leaf profile width

            return (
              <g key={i}>
                {/* Daun Casement */}
                <rect
                  x={pX + 3}
                  y={pY + 3}
                  width={panelW - 6}
                  height={innerH - 6}
                  fill={theme.frame}
                  stroke={theme.stroke}
                  strokeWidth="2.5"
                />
                {/* Kaca Casement */}
                <rect
                  x={pX + cWidth}
                  y={pY + cWidth}
                  width={panelW - 2 * cWidth}
                  height={innerH - 2 * cWidth}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                {/* Opening lines */}
                {isTopHung ? (
                  // Top-Hung (Jungkit): Engsel di atas, bukaan ke bawah
                  <path
                    d={`M ${pX + 3} ${pY + 3} L ${pX + panelW / 2} ${pY + innerH - 6} L ${pX + panelW - 3} ${pY + 3}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                ) : (
                  // Side-Hung Casement
                  <path
                    d={`M ${pX + 3} ${pY + 3} L ${pX + panelW - 6} ${pY + innerH / 2} L ${pX + 3} ${pY + innerH - 6}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                )}
              </g>
            );
          })}
          {/* Mullions */}
          {Array.from({ length: M }).map((_, i) => {
            const mX = x0 + tKusen + (i + 1) * panelW + i * tKusen;
            return (
              <rect
                key={`m-${i}`}
                x={mX}
                y={y0 + tKusen}
                width={tKusen}
                height={innerH}
                fill={theme.frame}
                stroke={theme.stroke}
                strokeWidth="2"
              />
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 8. JENDELA SLIDING
    // ----------------------------------------------------
    if (presetCode.startsWith("WINDOW_SLIDE_")) {
      const N = presetCode.endsWith("TRIPLE") ? 3 : presetCode.endsWith("DOUBLE") ? 2 : 1;
      const overlap = N > 1 ? 25 : 0;
      const leafW = (innerW + (N - 1) * overlap) / N;
      const cWidth = 30;

      return (
        <g>
          {Array.from({ length: N }).map((_, i) => {
            const lX = x0 + tKusen + i * (leafW - overlap);
            const lY = y0 + tKusen + 4;
            const isLeft = i % 2 === 0;

            return (
              <g key={i}>
                <rect
                  x={lX}
                  y={lY}
                  width={leafW}
                  height={innerH - 8}
                  fill={theme.frame}
                  stroke={theme.stroke}
                  strokeWidth="2"
                />
                <rect
                  x={lX + cWidth}
                  y={lY + cWidth}
                  width={leafW - 2 * cWidth}
                  height={innerH - 8 - 2 * cWidth}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <path
                  d={
                    isLeft
                      ? `M ${lX + leafW / 2 + 20} ${lY + innerH / 2} L ${lX + leafW / 2 - 20} ${lY + innerH / 2} M ${lX + leafW / 2 - 12} ${lY + innerH / 2 - 6} L ${lX + leafW / 2 - 20} ${lY + innerH / 2} L ${lX + leafW / 2 - 12} ${lY + innerH / 2 + 6}`
                      : `M ${lX + leafW / 2 - 20} ${lY + innerH / 2} L ${lX + leafW / 2 + 20} ${lY + innerH / 2} M ${lX + leafW / 2 + 12} ${lY + innerH / 2 - 6} L ${lX + leafW / 2 + 20} ${lY + innerH / 2} L ${lX + leafW / 2 + 12} ${lY + innerH / 2 + 6}`
                  }
                  stroke="#2563eb"
                  strokeWidth="2"
                  fill="none"
                />
              </g>
            );
          })}
        </g>
      );
    }

    // ----------------------------------------------------
    // 9. BOVEN KOMBINASI (MATI + CASEMENT & BOVEN + SLIDE)
    // ----------------------------------------------------
    if (presetCode === "WINDOW_COMBO_BOVEN_SLIDE") {
      const bovenH = Math.min(H * 0.3, 400);
      const slideH = H - bovenH - tKusen;
      const transY = y0 + bovenH;

      return (
        <g>
          {/* Transom horizontal bar */}
          <rect
            x={x0 + tKusen}
            y={transY}
            width={innerW}
            height={tKusen}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2"
          />
          {/* Boven Mati Atas */}
          <rect
            x={x0 + tKusen}
            y={y0 + tKusen}
            width={innerW}
            height={bovenH - tKusen}
            fill={theme.glass}
            stroke={theme.stroke}
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Jendela Sliding Bawah (2 Daun) */}
          <rect
            x={x0 + tKusen}
            y={transY + tKusen + 4}
            width={innerW / 2 + 15}
            height={slideH - tKusen - 8}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2"
          />
          <rect
            x={x0 + innerW / 2 - 15 + tKusen}
            y={transY + tKusen + 4}
            width={innerW / 2 + 15}
            height={slideH - tKusen - 8}
            fill={theme.frame}
            stroke={theme.stroke}
            strokeWidth="2"
          />
        </g>
      );
    }

    if (presetCode.startsWith("WINDOW_COMBO_FIXED_CASEMENT")) {
      const pairs = presetCode.endsWith("2") ? 2 : 1;
      const totalPanels = pairs * 2;
      const M = totalPanels - 1;
      const panelW = (innerW - M * tKusen) / totalPanels;

      return (
        <g>
          {Array.from({ length: totalPanels }).map((_, i) => {
            const pX = x0 + tKusen + i * (panelW + tKusen);
            const isFixed = i % 2 === 0;

            if (isFixed) {
              return (
                <rect
                  key={i}
                  x={pX}
                  y={y0 + tKusen}
                  width={panelW}
                  height={innerH}
                  fill={theme.glass}
                  stroke={theme.stroke}
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              );
            } else {
              return (
                <g key={i}>
                  <rect
                    x={pX + 3}
                    y={y0 + tKusen + 3}
                    width={panelW - 6}
                    height={innerH - 6}
                    fill={theme.frame}
                    stroke={theme.stroke}
                    strokeWidth="2"
                  />
                  <rect
                    x={pX + 30}
                    y={y0 + tKusen + 30}
                    width={panelW - 60}
                    height={innerH - 60}
                    fill={theme.glass}
                    stroke={theme.stroke}
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <path
                    d={`M ${pX + 3} ${y0 + tKusen + 3} L ${pX + panelW - 6} ${y0 + tKusen + innerH / 2} L ${pX + 3} ${y0 + tKusen + innerH - 6}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />
                </g>
              );
            }
          })}
          {/* Mullions */}
          {Array.from({ length: M }).map((_, i) => {
            const mX = x0 + tKusen + (i + 1) * panelW + i * tKusen;
            return (
              <rect
                key={`m-${i}`}
                x={mX}
                y={y0 + tKusen}
                width={tKusen}
                height={innerH}
                fill={theme.frame}
                stroke={theme.stroke}
                strokeWidth="2"
              />
            );
          })}
        </g>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-slate-100/60 rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-h-[460px] drop-shadow-sm select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>

        {/* 1. Kusen Luar (Outer Perimeter Frame) */}
        <rect
          x={x0}
          y={y0}
          width={W}
          height={H}
          fill={theme.frame}
          stroke={theme.stroke}
          strokeWidth="3"
          rx="2"
        />

        {/* 2. Isi Komponen Daun / Kaca / Rel */}
        {renderContent()}

        {/* 3. Anotasi Dimensi Lebar (Horizontal Dimension Bar di Atas) */}
        <line
          x1={x0}
          y1={y0 - 20}
          x2={x0 + W}
          y2={y0 - 20}
          stroke="#64748b"
          strokeWidth="1.5"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        <line x1={x0} y1={y0 - 28} x2={x0} y2={y0 - 10} stroke="#64748b" strokeWidth="1.5" />
        <line x1={x0 + W} y1={y0 - 28} x2={x0 + W} y2={y0 - 10} stroke="#64748b" strokeWidth="1.5" />
        <text
          x={x0 + W / 2}
          y={y0 - 28}
          textAnchor="middle"
          fill="#334155"
          fontSize="18"
          fontWeight="bold"
        >
          {W} mm
        </text>

        {/* 4. Anotasi Dimensi Tinggi (Vertical Dimension Bar di Kanan) */}
        <line
          x1={x0 + W + 20}
          y1={y0}
          x2={x0 + W + 20}
          y2={y0 + H}
          stroke="#64748b"
          strokeWidth="1.5"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        <line x1={x0 + W + 10} y1={y0} x2={x0 + W + 28} y2={y0} stroke="#64748b" strokeWidth="1.5" />
        <line x1={x0 + W + 10} y1={y0 + H} x2={x0 + W + 28} y2={y0 + H} stroke="#64748b" strokeWidth="1.5" />
        <text
          x={x0 + W + 32}
          y={y0 + H / 2 + 6}
          textAnchor="start"
          fill="#334155"
          fontSize="18"
          fontWeight="bold"
        >
          {H} mm
        </text>
      </svg>
      <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-3">
        <span>Dimensi Luar: {W} mm × {H} mm</span>
        <span>•</span>
        <span>Kusen: {color}</span>
      </div>
    </div>
  );
}
