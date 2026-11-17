"use client";

import React, { useState, useEffect } from "react";
import { CalculationResult } from "@/lib/calculator/types";
import { FolderPlus, Check, X } from "lucide-react";

interface SaveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationResult: CalculationResult;
}

export default function SaveToProjectModal({
  isOpen,
  onClose,
  calculationResult,
}: SaveToProjectModalProps) {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setItemName(`${calculationResult.presetName} (${calculationResult.input.widthMm}x${calculationResult.input.heightMm})`);
      fetchProjects();
    }
  }, [isOpen, calculationResult]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setProjects(json.data);
        setSelectedProjectId(json.data[0].id);
        setIsCreatingNew(false);
      } else {
        setIsCreatingNew(true);
      }
    } catch (e) {
      console.error(e);
      setIsCreatingNew(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let targetProjectId = selectedProjectId;

      if (isCreatingNew) {
        if (!newProjectName.trim()) {
          throw new Error("Masukkan nama proyek baru");
        }
        const createRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newProjectName.trim() }),
        });
        const createJson = await createRes.json();
        if (!createJson.success) throw new Error(createJson.message);
        targetProjectId = createJson.data.id;
      }

      const itemRes = await fetch(`/api/projects/${targetProjectId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName.trim() || calculationResult.presetName,
          category: calculationResult.category,
          presetCode: calculationResult.input.presetCode,
          width: calculationResult.input.widthMm,
          height: calculationResult.input.heightMm,
          quantity: calculationResult.input.quantity,
          frameSize: calculationResult.input.frameSize,
          frameThickness: calculationResult.input.frameThicknessMm || 40,
          color: calculationResult.input.color,
          glassCode: calculationResult.input.glassCode,
          calculationResult,
        }),
      });

      const itemJson = await itemRes.json();
      if (!itemJson.success) throw new Error(itemJson.message);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan ke proyek");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Simpan ke Proyek RAB</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Berhasil disimpan ke proyek!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Label / Nama Item dalam Proyek:
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: P1 - Pintu Utama Ruang Depan"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Pilih Proyek:</label>
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {isCreatingNew ? "Gunakan Proyek yang Ada" : "+ Buat Proyek Baru"}
                </button>
              )}
            </div>

            {isCreatingNew ? (
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Masukkan nama proyek baru (e.g. Rumah Tinggal Bpk. Hendra)"
                required={isCreatingNew}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
