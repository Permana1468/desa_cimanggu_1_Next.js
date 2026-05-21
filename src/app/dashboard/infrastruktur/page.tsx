"use client";

import { useEffect, useState } from "react";
import { getInfrastrukturProjects, upsertInfrastrukturProject, deleteInfrastrukturProject } from "@/actions/dashboard";
import { useSession } from "next-auth/react";
import { Building, Plus, Save, Trash2, HardHat, FileText } from "lucide-react";

export default function InfrastrukturPage() {
    const { data: session } = useSession();
    const canEdit = ["KAUR_PERENCANAAN", "ADMIN_MASTER"].includes((session?.user as any)?.role);
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
        namaProyek: "", jenisPekerjaan: "", lokasi: "", dimensiPanjang: "", dimensiLebar: "", dimensiTinggi: "", anggaran: "", sumberDana: "", status: "PERENCANAAN"
    });

    useEffect(() => {
        if (session?.user?.tenantId) {
            loadData();
        }
    }, [session]);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getInfrastrukturProjects(session?.user?.tenantId || "");
        setProjects(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const volume = (parseFloat(formData.dimensiPanjang) || 0) * (parseFloat(formData.dimensiLebar) || 0) * (parseFloat(formData.dimensiTinggi) || 0);
            
            await upsertInfrastrukturProject({
                ...formData,
                dimensiPanjang: parseFloat(formData.dimensiPanjang) || null,
                dimensiLebar: parseFloat(formData.dimensiLebar) || null,
                dimensiTinggi: parseFloat(formData.dimensiTinggi) || null,
                volumeTotal: volume || null,
                anggaran: parseFloat(formData.anggaran) || 0,
                tenantId: session?.user?.tenantId
            });
            setShowModal(false);
            setFormData({ namaProyek: "", jenisPekerjaan: "", lokasi: "", dimensiPanjang: "", dimensiLebar: "", dimensiTinggi: "", anggaran: "", sumberDana: "", status: "PERENCANAAN" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan proyek");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus proyek ini?")) {
            await deleteInfrastrukturProject(id);
            loadData();
        }
    };

    const exportLPJ = (project: any) => {
        // Implementasi sederhana untuk draf LPJ
        const printContent = `
            <h2>Laporan Pertanggungjawaban (Draf)</h2>
            <p><strong>Nama Proyek:</strong> ${project.namaProyek}</p>
            <p><strong>Jenis Pekerjaan:</strong> ${project.jenisPekerjaan}</p>
            <p><strong>Lokasi:</strong> ${project.lokasi}</p>
            <p><strong>Volume Fisik:</strong> ${project.volumeTotal} m3 (P: ${project.dimensiPanjang}m x L: ${project.dimensiLebar}m x T: ${project.dimensiTinggi}m)</p>
            <p><strong>Anggaran:</strong> Rp ${project.anggaran.toLocaleString('id-ID')}</p>
            <p><strong>Status:</strong> ${project.status}</p>
        `;
        const windowPrint = window.open('', '', 'width=800,height=600');
        windowPrint?.document.write(printContent);
        windowPrint?.document.close();
        windowPrint?.focus();
        windowPrint?.print();
        windowPrint?.close();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <HardHat size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Infrastruktur & Pembangunan</h1>
                        <p className="text-slate-500 text-sm">Pemantauan proyek fisik dan dimensi lapangan.</p>
                    </div>
                </div>
                {canEdit && (
                    <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        <Plus size={16} /> Proyek Baru
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 pl-4">Proyek</th>
                            <th className="pb-4">Spesifikasi Fisik (PxLxT)</th>
                            <th className="pb-4">Anggaran & Sumber</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right pr-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading...</td></tr>
                        ) : projects.map((p: any) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="font-bold text-slate-800 text-sm">{p.namaProyek}</div>
                                    <div className="text-[10px] text-slate-500">{p.jenisPekerjaan} • {p.lokasi}</div>
                                </td>
                                <td className="py-4">
                                    <div className="font-bold text-slate-700 text-sm">{p.volumeTotal ? `${p.volumeTotal} m³` : '-'}</div>
                                    <div className="text-[10px] text-slate-400">P:{p.dimensiPanjang || 0}m L:{p.dimensiLebar || 0}m T:{p.dimensiTinggi || 0}m</div>
                                </td>
                                <td className="py-4">
                                    <div className="font-bold text-emerald-600 text-sm">Rp {p.anggaran.toLocaleString('id-ID')}</div>
                                    <div className="text-[10px] text-slate-500">{p.sumberDana}</div>
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{p.status}</span>
                                </td>
                                <td className="py-4 text-right pr-4 flex justify-end gap-2">
                                    <button onClick={() => exportLPJ(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg tooltip" title="Ekspor Draft LPJ">
                                        <FileText size={16} />
                                    </button>
                                    {canEdit && (
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-slate-800 mb-6">Tambah Proyek Fisik</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Nama Proyek</label>
                                    <input required value={formData.namaProyek} onChange={e => setFormData({...formData, namaProyek: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Jenis Pekerjaan</label>
                                    <input required value={formData.jenisPekerjaan} onChange={e => setFormData({...formData, jenisPekerjaan: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200 placeholder-slate-300" placeholder="Jalan / Drainase / Gedung" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-600">Lokasi</label>
                                <input required value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Panjang (m)</label>
                                    <input type="number" step="0.01" value={formData.dimensiPanjang} onChange={e => setFormData({...formData, dimensiPanjang: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Lebar (m)</label>
                                    <input type="number" step="0.01" value={formData.dimensiLebar} onChange={e => setFormData({...formData, dimensiLebar: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Tinggi/Tebal (m)</label>
                                    <input type="number" step="0.01" value={formData.dimensiTinggi} onChange={e => setFormData({...formData, dimensiTinggi: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Total Anggaran (Rp)</label>
                                    <input required type="number" value={formData.anggaran} onChange={e => setFormData({...formData, anggaran: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Sumber Dana</label>
                                    <input required value={formData.sumberDana} onChange={e => setFormData({...formData, sumberDana: e.target.value})} className="w-full px-4 py-2 mt-1 rounded-xl border border-slate-200" placeholder="Dana Desa / Banprov" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2"><Save size={16}/> Simpan Proyek</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
