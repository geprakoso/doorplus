"use client";

import React, { useState, useEffect } from "react";
import { Layers, Save, RefreshCw, Check, AlertCircle, Wrench } from "lucide-react";

interface ProfileItem {
  id: string;
  code: string;
  name: string;
  size: string;
  category: string;
  lengthMm: number;
  priceSilver: number;
  priceBrown: number;
  priceBlack: number;
  priceWhite: number;
}

interface GlassItem {
  id: string;
  code: string;
  name: string;
  thicknessMm: number;
  type: string;
  pricePerM2: number;
}

interface AccessoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  pricePerUnit: number;
}

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<"profiles" | "glasses" | "accessories">("profiles");
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [glasses, setGlasses] = useState<GlassItem[]>([]);
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/materials");
      const json = await res.json();
      if (json.success && json.data) {
        setProfiles(json.data.profiles);
        setGlasses(json.data.glasses);
        setAccessories(json.data.accessories);
      }
    } catch (e: any) {
      setMessage({ type: "error", text: "Gagal memuat master harga" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (id: string, field: string, value: number) => {
    setSavingId(id);
    try {
      const target = profiles.find((p) => p.id === id);
      if (!target) return;

      const updatedData = {
        priceSilver: field === "priceSilver" ? value : target.priceSilver,
        priceBrown: field === "priceBrown" ? value : target.priceBrown,
        priceBlack: field === "priceBlack" ? value : target.priceBlack,
        priceWhite: field === "priceWhite" ? value : target.priceWhite,
      };

      const res = await fetch("/api/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          id,
          data: updatedData,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );
      setMessage({ type: "success", text: "Harga profil berhasil diperbarui" });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal memperbarui harga" });
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateGlass = async (id: string, pricePerM2: number) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "glass",
          id,
          data: { pricePerM2 },
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setGlasses((prev) =>
        prev.map((g) => (g.id === id ? { ...g, pricePerM2 } : g))
      );
      setMessage({ type: "success", text: "Harga kaca berhasil disimpan" });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan harga kaca" });
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateAccessory = async (id: string, pricePerUnit: number) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "accessory",
          id,
          data: { pricePerUnit },
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setAccessories((prev) =>
        prev.map((a) => (a.id === id ? { ...a, pricePerUnit } : a))
      );
      setMessage({ type: "success", text: "Harga aksesoris berhasil disimpan" });
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan harga" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-600" />
            <span>Master Data & Manajemen Harga Material</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi harga per batang 6m untuk profil aluminium 3" & 4" (warna Silver, Coklat, Hitam, Putih), kaca per m², dan aksesoris.
          </p>
        </div>

        <button
          onClick={fetchMaterials}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition ${
            activeTab === "profiles"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Profil Aluminium 6 Meter ({profiles.length})
        </button>

        <button
          onClick={() => setActiveTab("glasses")}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition ${
            activeTab === "glasses"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Kaca Lembaran ({glasses.length})
        </button>

        <button
          onClick={() => setActiveTab("accessories")}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition ${
            activeTab === "accessories"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Aksesoris & Hardware ({accessories.length})
        </button>
      </div>

      {/* TAB 1: PROFILES */}
      {activeTab === "profiles" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 text-xs text-slate-500">
            Keterangan: Harga di bawah adalah harga untuk <strong>1 Batang Standar 6000 mm (6 meter)</strong>. Ubah angka dan tekan Enter atau klik di luar kotak untuk menyimpan langsung ke database.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama Profil</th>
                  <th className="px-4 py-3 text-center">Ukuran</th>
                  <th className="px-4 py-3 text-right">Harga Silver (Rp)</th>
                  <th className="px-4 py-3 text-right">Harga Coklat (Rp)</th>
                  <th className="px-4 py-3 text-right">Harga Hitam (Rp)</th>
                  <th className="px-4 py-3 text-right">Harga Putih (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.code}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          p.size === "3_INCH"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {p.size === "3_INCH" ? "3 Inci" : "4 Inci"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="1000"
                        defaultValue={p.priceSilver}
                        onBlur={(e) =>
                          handleUpdateProfile(p.id, "priceSilver", Number(e.target.value))
                        }
                        className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="1000"
                        defaultValue={p.priceBrown}
                        onBlur={(e) =>
                          handleUpdateProfile(p.id, "priceBrown", Number(e.target.value))
                        }
                        className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="1000"
                        defaultValue={p.priceBlack}
                        onBlur={(e) =>
                          handleUpdateProfile(p.id, "priceBlack", Number(e.target.value))
                        }
                        className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="1000"
                        defaultValue={p.priceWhite}
                        onBlur={(e) =>
                          handleUpdateProfile(p.id, "priceWhite", Number(e.target.value))
                        }
                        className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GLASSES */}
      {activeTab === "glasses" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 text-xs text-slate-500">
            Keterangan: Harga di bawah adalah harga per <strong>Meter Persegi (m²)</strong>.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama Kaca</th>
                  <th className="px-4 py-3 text-center">Ketebalan</th>
                  <th className="px-4 py-3 text-center">Tipe</th>
                  <th className="px-4 py-3 text-right">Harga per m² (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {glasses.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{g.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{g.code}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {g.thicknessMm} mm
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {g.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="1000"
                        defaultValue={g.pricePerM2}
                        onBlur={(e) => handleUpdateGlass(g.id, Number(e.target.value))}
                        className="w-36 text-right px-3 py-1 border border-slate-300 rounded font-mono text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESSORIES */}
      {activeTab === "accessories" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 text-xs text-slate-500">
            Keterangan: Harga aksesoris per satuan (meter, pasang, set, pcs, tube, ls).
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama Aksesoris / Hardware</th>
                  <th className="px-4 py-3 text-center">Kategori</th>
                  <th className="px-4 py-3 text-center">Satuan</th>
                  <th className="px-4 py-3 text-right">Harga Satuan (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessories.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{a.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{a.code}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 uppercase">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700 text-xs">
                      {a.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="500"
                        defaultValue={a.pricePerUnit}
                        onBlur={(e) => handleUpdateAccessory(a.id, Number(e.target.value))}
                        className="w-36 text-right px-3 py-1 border border-slate-300 rounded font-mono text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
