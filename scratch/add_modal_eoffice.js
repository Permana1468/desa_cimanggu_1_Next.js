const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarEOffice.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('setShowModal')) {
    content = content.replace(
        'const [loading, setLoading] = useState(true);',
        `const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"masuk" | "keluar">("masuk");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ noSurat: "", perihal: "", pengirim: "", tujuan: "" });`
    );

    content = content.replace(
        'const loadData = async () => {',
        `const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addKatarSurat({
                noSurat: formData.noSurat,
                perihal: formData.perihal,
                type: modalType,
                pengirim: formData.pengirim,
                tujuan: formData.tujuan
            });
            setShowModal(false);
            setFormData({ noSurat: "", perihal: "", pengirim: "", tujuan: "" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus surat ini?")) return;
        try {
            await deleteKatarSurat(id);
            loadData();
        } catch (error) {
            alert("Gagal menghapus data");
        }
    };

    const loadData = async () => {`
    );

    content = content.replace(
        '<button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">',
        '<button onClick={() => {setModalType(activeTab); setShowModal(true);}} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">'
    );

    // Replace the mapping of mockSuratMasuk and mockSuratKeluar to add delete button
    // The maps are `mockSuratMasuk.map` and `mockSuratKeluar.map`. We can just add the delete button on the mapping of `suratData` since we now just have `suratData.filter`.
    // Let's replace the td that has "Lihat Berkas"
    const tdAction = `<td className="p-4 text-center">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all">
                                                    Lihat Berkas
                                                </button>
                                            </td>`;
    const newTdAction = `<td className="p-4 text-center">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all">
                                                    Lihat Berkas
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} className="ml-2 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all">
                                                    Hapus
                                                </button>
                                            </td>`;
    content = content.replace(new RegExp(tdAction.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newTdAction); // but simpler string replace is enough
    content = content.split(tdAction).join(newTdAction);
    content = content.replace(/{s.tanggal}/g, '{new Date(s.tanggal).toLocaleDateString("id-ID")}');

    const modalJSX = `
            {/* Modal Tambah Surat */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-800 mb-6">Tambah Surat {modalType === "masuk" ? "Masuk" : "Keluar"}</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Surat</label>
                                <input required type="text" value={formData.noSurat} onChange={e => setFormData({...formData, noSurat: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="01/KT-DC/2026" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Perihal</label>
                                <input required type="text" value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Undangan Rapat" />
                            </div>
                            {modalType === "masuk" ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Pengirim</label>
                                    <input required type="text" value={formData.pengirim} onChange={e => setFormData({...formData, pengirim: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Pemerintah Desa" />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tujuan</label>
                                    <input required type="text" value={formData.tujuan} onChange={e => setFormData({...formData, tujuan: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Kepala Desa" />
                                </div>
                            )}
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
    console.log("EOffice modal added");
}
