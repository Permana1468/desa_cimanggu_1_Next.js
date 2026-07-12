const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarGallery.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('setShowModal')) {
    content = content.replace(
        'const [loading, setLoading] = useState(true);',
        `const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"image" | "document">("image");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ fileName: "", fileUrl: "", category: "Dokumentasi" });`
    );

    content = content.replace(
        'const loadData = async () => {',
        `const handleAdd = async (e: React.FormEvent) => {
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

    const loadData = async () => {`
    );

    content = content.replace(
        '<button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">',
        '<button onClick={() => {setModalType("image"); setShowModal(true);}} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">'
    );
    
    // For uploading LPJ document
    content = content.replace(
        '<button className="flex items-center gap-2 bg-white text-indigo-700 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all">',
        '<button onClick={() => {setModalType("document"); setShowModal(true);}} className="flex items-center gap-2 bg-white text-indigo-700 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all">'
    );

    // Add delete buttons on map outputs
    content = content.replace(
        '</h4>\n                                    </div>\n                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">',
        '</h4>\n                                    </div>\n                                    <button onClick={() => handleDelete(photo.id)} className="text-[10px] text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">Hapus</button>\n                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">'
    );

    content = content.replace(
        '</h4>\n                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">\n                                                <span className="flex items-center gap-1"><FileText size={12} /> {doc.size}</span>\n                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>\n                                                <span>{doc.date}</span>\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all">',
        '</h4>\n                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">\n                                                <span className="flex items-center gap-1"><FileText size={12} /> {doc.size}</span>\n                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>\n                                                <span>{new Date(doc.date).toLocaleDateString("id-ID")}</span>\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <div className="flex items-center gap-2">\n                                    <button onClick={() => handleDelete(doc.id)} className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all">Hapus</button>\n                                    <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all">'
    );

    const modalJSX = `
            {/* Modal Tambah Galeri */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-800 mb-6">Unggah {modalType === "image" ? "Foto Dokumentasi" : "Dokumen LPJ"}</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama File</label>
                                <input required type="text" value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder={modalType === "image" ? "Foto Kegiatan Gotong Royong" : "Laporan LPJ Agustus 2026"} />
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
                                <label className="block text-xs font-bold text-slate-500 mb-1">Link URL</label>
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
    const lastDivIndex = content.lastIndexOf('</div>');
    content = content.substring(0, lastDivIndex) + modalJSX + content.substring(lastDivIndex);
    fs.writeFileSync(file, content);
    console.log("Gallery modal added");
}
