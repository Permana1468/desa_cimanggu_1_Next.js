"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, FileText, UploadCloud, FolderArchive, Trash2, X, ExternalLink } from "lucide-react";
import { getKatarGalleries, addKatarGallery, deleteKatarGallery } from "@/actions/katar";

interface GalleryItem { id: string; fileName: string; type: string; size: string; fileUrl: string; category: string; date: Date; }

export function KatarGallery({ session }: { session: any }) {
  const [files, setFiles] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fileName: "", fileUrl: "", type: "document" as "image" | "document", category: "LPJ", size: "—" });

  const loadData = async () => {
    setLoading(true);
    const data = await getKatarGalleries();
    setFiles(data as GalleryItem[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addKatarGallery(form);
      setShowModal(false);
      setForm({ fileName: "", fileUrl: "", type: "document", category: "LPJ", size: "—" });
      loadData();
    } catch { alert("Gagal menyimpan data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus file ini dari arsip?")) return;
    await deleteKatarGallery(id);
    loadData();
  };

  const filters = ["Semua", "LPJ", "Dokumentasi", "Proposal"];
  const filtered = files.filter((f) => activeFilter === "Semua" || f.category === activeFilter);
  const docs = filtered.filter((f) => f.type === "document");
  const images = filtered.filter((f) => f.type === "image");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Galeri & Arsip LPJ</h2>
          <p className="text-slate-500 text-sm">Ruang penyimpanan digital untuk dokumentasi foto/video dan arsip dokumen LPJ.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all shrink-0">
          <UploadCloud size={17} /> Unggah File
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === f ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}>
            {f === "Semua" && <FolderArchive size={14} />}
            {f === "LPJ" && <FileText size={14} />}
            {f === "Dokumentasi" && <ImageIcon size={14} />}
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400 text-center py-12">Memuat data...</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
          <FolderArchive className="mx-auto text-slate-200 mb-3" size={44} />
          <p className="text-slate-400 font-medium">Belum ada file tersimpan.</p>
          <p className="text-slate-300 text-xs mt-1">Klik &quot;Unggah File&quot; untuk menambahkan file pertama.</p>
        </div>
      )}

      {/* Documents */}
      {!loading && docs.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm"><FileText size={16} className="text-rose-500" /> Dokumen & Laporan ({docs.length})</h3>
          </div>
          <div className="p-4 space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{doc.fileName}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                      <span>{doc.category}</span>
                      <span>•</span>
                      <span>{new Date(doc.date).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all">
                    <ExternalLink size={12} /> Buka
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {!loading && images.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm"><ImageIcon size={16} className="text-blue-500" /> Foto & Dokumentasi ({images.length})</h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
                <div className="h-32 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                  {img.fileUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.fileUrl} alt={img.fileName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-700 truncate">{img.fileName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-bold text-slate-400">{new Date(img.date).toLocaleDateString("id-ID")}</span>
                    <button onClick={() => handleDelete(img.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Unggah File / Arsip</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama File *</label>
                <input required type="text" value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="LPJ Agustusan 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tipe File</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "image" | "document" })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option value="document">📄 Dokumen (PDF/Word)</option>
                    <option value="image">🖼️ Gambar / Foto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                    <option>LPJ</option><option>Dokumentasi</option><option>Proposal</option><option>Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Link URL File *</label>
                <input required type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="https://drive.google.com/..." />
                <p className="text-[10px] text-slate-400 mt-1">Unggah file ke Google Drive terlebih dahulu, lalu tempel link-nya di sini.</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-slate-800 hover:bg-slate-900 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
