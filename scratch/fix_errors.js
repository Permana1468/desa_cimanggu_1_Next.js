const fs = require('fs');
const path = require('path');

// 1. Fix EOffice TS Error
const eoPath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarEOffice.tsx');
let eoContent = fs.readFileSync(eoPath, 'utf8');
eoContent = eoContent.replace('setModalType(activeTab)', 'setModalType(activeTab as "masuk" | "keluar")');
fs.writeFileSync(eoPath, eoContent);

// 2. Fix KatarGallery completely
const galPath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarGallery.tsx');
let galContent = fs.readFileSync(galPath, 'utf8');

// Replace standard mockup with dynamic
galContent = galContent.replace(
    'import React from "react";',
    'import React, { useState, useEffect } from "react";\nimport { getKatarGalleries, addKatarGallery, deleteKatarGallery } from "@/actions/katar";'
);

// We need to match the mockFiles definition block
const regex = /const mockFiles = \[[\s\S]*?\];/;
const replacement = `const [galleryData, setGalleryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"image" | "document">("image");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ fileName: "", fileUrl: "", category: "Dokumentasi" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getKatarGalleries();
        setGalleryData(data);
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addKatarGallery({
                fileName: formData.fileName,
                fileUrl: formData.fileUrl,
                type: modalType,
                category: formData.category
            });
            setShowModal(false);
            setFormData({ fileName: "", fileUrl: "", category: "Dokumentasi" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus file ini?")) return;
        try {
            await deleteKatarGallery(id);
            loadData();
        } catch (error) {
            alert("Gagal menghapus data");
        }
    };
    
    const mockFiles = galleryData;`;

galContent = galContent.replace(regex, replacement);

// Fix button uploads
galContent = galContent.replace(
    '<button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all shrink-0">',
    '<button onClick={() => {setModalType("document"); setShowModal(true);}} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all shrink-0">'
);

// We also need to add delete button to each item rendered
const downloadButtonRegex = /<button className="flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">[\s\S]*?<\/button>/;
const newDownloadButton = `<button className="flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                                            <Download size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(file.id)} className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-all">
                                            Hapus
                                        </button>`;
galContent = galContent.replace(downloadButtonRegex, newDownloadButton);

// Fix modal JSX 
if (!galContent.includes("Modal Tambah Galeri")) {
    const modalJSX = `
            {/* Modal Tambah Galeri */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-800 mb-6">Unggah File</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama File</label>
                                <input required type="text" value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder={"Laporan LPJ Agustus 2026"} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tipe</label>
                                <select value={modalType} onChange={e => setModalType(e.target.value as "image"|"document")} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                                    <option value="document">Dokumen PDF/Word</option>
                                    <option value="image">Gambar / Foto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                                    <option>Dokumentasi</option>
                                    <option>LPJ</option>
                                    <option>Proposal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Link URL File Asli</label>
                                <input required type="text" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="https://..." />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
`;
    const lastDivIndex = galContent.lastIndexOf('</div>');
    galContent = galContent.substring(0, lastDivIndex) + modalJSX + galContent.substring(lastDivIndex);
}

fs.writeFileSync(galPath, galContent);
console.log("Fixed gallery and eoffice");
