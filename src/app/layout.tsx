import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Calculator, Layers, FolderKanban, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "DoorPlus - Kalkulator Aluminium, Kaca & Cutting List",
  description:
    "Aplikasi web kalkulator material aluminium, kaca, cutting list, dan optimasi batangan 6 meter berbasis PostgreSQL.",
};

export default function RootLayout({
  children,
}: ReadnextLayoutProps<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight tracking-tight text-slate-900">
                  Door<span className="text-blue-600">Plus</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  BOM & 1D Cutting Optimizer
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition"
              >
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Kalkulator</span>
              </Link>

              <Link
                href="/projects"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition"
              >
                <FolderKanban className="w-4 h-4 text-amber-600" />
                <span>Proyek RAB</span>
              </Link>

              <Link
                href="/materials"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Master Harga</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DoorPlus — Sistem Perhitungan Material Aluminium & Kaca Presisi.</p>
        </footer>
      </body>
    </html>
  );
}

type ReadnextLayoutProps<T> = T;
