const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarFinance.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('setShowModal')) {
    // 1. Add state for modal and form
    content = content.replace(
        'const [loading, setLoading] = useState(true);',
        `const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"in" | "out">("in");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ description: "", amount: "", receiptUrl: "" });`
    );

    // 2. Add functions
    content = content.replace(
        'const loadData = async () => {',
        `const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addKatarFinance({
                description: formData.description,
                amount: Number(formData.amount),
                type: modalType,
                receiptUrl: formData.receiptUrl
            });
            setShowModal(false);
            setFormData({ description: "", amount: "", receiptUrl: "" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus transaksi ini?")) return;
        try {
            await deleteKatarFinance(id);
            loadData();
        } catch (error) {
            alert("Gagal menghapus data");
        }
    };

    const loadData = async () => {`
    );

    // 3. Attach onClick to buttons
    content = content.replace(
        '<button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0">',
        '<button onClick={() => {setModalType("in"); setShowModal(true);}} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0">'
    );
    content = content.replace(
        '<button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all shrink-0">',
        '<button onClick={() => {setModalType("out"); setShowModal(true);}} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all shrink-0">'
    );

    // 4. Update the mapping rendering (add delete button and format date)
    // Find the row rendering
    const rowContent = `
                                            <td className="p-4 text-center">
                                                {f.receiptUrl ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                                        <UploadCloud size={12} /> {f.receiptUrl}
                                                    </span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>`;
    
    const newRowContent = `
                                            <td className="p-4 text-center">
                                                {f.receiptUrl ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                                        <UploadCloud size={12} /> {f.receiptUrl}
                                                    </span>
                                                ) : <span className="text-slate-300">-</span>}
                                                <button onClick={() => handleDelete(f.id)} className="ml-3 text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                                            </td>`;
    content = content.replace(rowContent, newRowContent);
    content = content.replace(/{f.date}/g, '{new Date(f.date).toLocaleDateString("id-ID")}');

    // 5. Add Modal JSX at the end before last </div>
    const modalJSX = `
            {/* Modal Tambah Keuangan */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-800 mb-6">
                            {modalType === "in" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan</label>
                                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="Contoh: Beli Bola" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="50000" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Link Bukti (Opsional)</label>
                                <input type="text" value={formData.receiptUrl} onChange={e => setFormData({...formData, receiptUrl: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" placeholder="https://..." />
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
    
    // 6. Calculate total dynamically (currently hardcoded as 2.350.000)
    // Find where the total is rendered, it was like `<div className="text-3xl md:text-4xl font-black text-white">Rp 2.350.000</div>`
    // Wait, let's use a regex to replace the balance display
    content = content.replace(
        '<div className="text-3xl md:text-4xl font-black text-white">Rp 2.350.000</div>',
        '<div className="text-3xl md:text-4xl font-black text-white">Rp {financeData.reduce((acc, f) => f.type === "in" ? acc + f.amount : acc - f.amount, 0).toLocaleString("id-ID")}</div>'
    );

    fs.writeFileSync(file, content);
    console.log("Finance modal added");
}
