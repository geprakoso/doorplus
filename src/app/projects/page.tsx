"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Calendar, Layers, ArrowRight, Trash2 } from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  clientName: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  items: any[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newProject, setNewProject] = useState({
    name: "",
    clientName: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success && json.data) {
        setProjects(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setNewProject({ name: "", clientName: "", address: "", notes: "" });
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Hapus proyek "${name}" beserta seluruh rinciannya?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-amber-600" />
            <span>Manajemen Proyek & Rekapitulasi RAB</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kumpulkan seluruh pintu dan jendela satu rumah/gedung ke dalam satu proyek untuk akumulasi total belanja bahan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proyek Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Memuat daftar proyek...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-slate-800 text-base">Belum Ada Proyek</h3>
            <p className="text-sm text-slate-500 mt-1">
              Buat proyek baru atau lakukan perhitungan di Kalkulator lalu simpan hasilnya ke proyek.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition"
          >
            + Mulai Buat Proyek
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                    {proj.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteProject(proj.id, proj.name)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {proj.clientName && (
                  <p className="text-xs text-slate-600">
                    Klien: <span className="font-semibold text-slate-800">{proj.clientName}</span>
                  </p>
                )}

                {proj.address && (
                  <p className="text-xs text-slate-500 line-clamp-1">{proj.address}</p>
                )}

                <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <strong>{proj.items.length}</strong> Unit Item
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(proj.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={`/projects/${proj.id}`}
                  className="w-full py-2 px-3 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Lihat Detail & Rekap RAB</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Proyek Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Buat Proyek Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Proyek*:
                </label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Contoh: Rumah Tinggal 2 Lantai Bpk. Hendra"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Klien / Pemilik:
                </label>
                <input
                  type="text"
                  value={newProject.clientName}
                  onChange={(e) =>
                    setNewProject({ ...newProject, clientName: e.target.value })
                  }
                  placeholder="Contoh: Bpk. Hendra Wijaya"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat / Lokasi Proyek:
                </label>
                <input
                  type="text"
                  value={newProject.address}
                  onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                  placeholder="Contoh: Jl. Kemang Raya No. 12, Jakarta Selatan"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Proyek:
                </label>
                <textarea
                  value={newProject.notes}
                  onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                  placeholder="Catatan khusus, merk profil (misal: Alexindo / Dacon), dll."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
