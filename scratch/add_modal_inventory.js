const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarInventory.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('setShowModal')) {
    content = content.replace(
        'const [loading, setLoading] = useState(true);',
        `const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: "", category: "Fasilitas Olahraga", quantity: 1, condition: "Baik", status: "Tersedia" });`
    );

    content = content.replace(
        'const loadData = async () => {',
        `const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addKatarInventory({
                name: formData.name,
                category: formData.category,
                quantity: Number(formData.quantity),
                condition: formData.condition,
                status: formData.status
            });
            setShowModal(false);
            setFormData({ name: "", category: "Fasilitas Olahraga", quantity: 1, condition: "Baik", status: "Tersedia" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus inventaris ini?")) return;
        try {
            await deleteKatarInventory(id);
            loadData();
        } catch (error) {
            alert("Gagal menghapus data");
        }
    };

    const loadData = async () => {`
    );

    content = content.replace(
        '<button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">',
        '<button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0">'
    );

    const rowContent = `
                                            <td className="p-4 text-center">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all">
                                                    Lihat Detail
                                                </button>
                                            </td>`;
    const newRowContent = `
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDelete(i.id)} className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all">
                                                    Hapus
                                                </button>
                                            </td>`;
    content = content.replace(rowContent, newRowContent);

    const modalJSX = `
            {/* Modal Tambah Barang */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-800 mb-6">Tambah Inventaris Baru</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Barang</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Bola Voli Mikasa" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                                        <option>Fasilitas Olahraga</option>
                                        <option>Peralatan Event</option>
                                        <option>Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah</label>
                                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kondisi</label>
                                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                                        <option>Baik</option>
                                        <option>Rusak Ringan</option>
                                        <option>Rusak Berat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm">
                                        <option>Tersedia</option>
                                        <option>Dipinjam</option>
                                    </select>
                                </div>
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
    console.log("Inventory modal added");
}
