"use client";

import { useEffect, useState } from "react";
import { getInfrastrukturProjects, upsertInfrastrukturProject, deleteInfrastrukturProject, saveProjectRab } from "@/actions/dashboard";
import { syncRabFromMasterTemplate, getOfficialTemplates } from "@/actions/google";
import { useSession } from "next-auth/react";
import { Building, Plus, Save, Trash2, HardHat, FileText, Calculator, FileSpreadsheet, Printer, PlusCircle, XCircle, Loader2 } from "lucide-react";

export default function InfrastrukturPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email || "";
    const isKaurPerencanaan = role === "KAUR_PERENCANAAN" || (role === "KAUR" && email.includes("perencanaan"));
    const canEdit = role === "ADMIN_MASTER" || isKaurPerencanaan;
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

    // RAB States
    const [selectedProjectForRab, setSelectedProjectForRab] = useState<any | null>(null);
    const [showRabEditorModal, setShowRabEditorModal] = useState(false);
    const [showRabListModal, setShowRabListModal] = useState(false);
    const [rabItems, setRabItems] = useState<any[]>([]);
    const [submittingRab, setSubmittingRab] = useState(false);
    
    // Templates
    const [officialTemplates, setOfficialTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [syncingTemplate, setSyncingTemplate] = useState(false);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await getOfficialTemplates();
                const spreadsheets = res.filter((t: any) => t.type === "SPREADSHEET");
                setOfficialTemplates(spreadsheets);
                if (spreadsheets.length > 0) {
                    setSelectedTemplateId(spreadsheets[0].googleId);
                }
            } catch (error) {
                console.error("Gagal memuat template resmi:", error);
            }
        }
        fetchTemplates();
    }, []);

    const handleOpenRabModal = (project: any) => {
        setSelectedProjectForRab(project);
        setRabItems((project.rab as any[]) || []);
        setShowRabEditorModal(true);
    };

    const handleAddRabRow = (category: "BAHAN" | "ALAT" | "UPAH" | "OPERASIONAL") => {
        setRabItems([...rabItems, {
            category,
            item: "",
            satuan: "Unit",
            volume: 0,
            volSwadaya: 0,
            volApbd: 0,
            harga: 0,
            swadayaTotal: 0,
            apbdTotal: 0,
            total: 0,
            ppn: 0,
            pph21: 0,
            pph22: 0,
            pph23: 0
        }]);
    };

    const handleRemoveRabRow = (index: number) => {
        const updated = [...rabItems];
        updated.splice(index, 1);
        setRabItems(updated);
    };

    const handleRabChange = (index: number, field: string, value: any) => {
        const updated = [...rabItems];
        const val = (field === "volume" || field === "harga" || field === "volSwadaya") ? (parseFloat(value) || 0) : value;
        updated[index] = { ...updated[index], [field]: val };

        if (field === "volume" || field === "harga" || field === "volSwadaya") {
            const vol = updated[index].volume;
            const price = updated[index].harga;
            const volSwad = updated[index].volSwadaya;
            const volAp = Math.max(0, vol - volSwad);

            updated[index].volApbd = volAp;
            updated[index].swadayaTotal = volSwad * price;
            updated[index].apbdTotal = volAp * price;
            updated[index].total = vol * price;
        }

        setRabItems(updated);
    };

    const calcGrandTotal = () => {
        return rabItems.reduce((sum, item) => sum + (item.volume * item.harga), 0);
    };

    const handleSyncTemplate = async () => {
        setSyncingTemplate(true);
        try {
            const template = officialTemplates.find(t => t.googleId === selectedTemplateId);
            const res = await syncRabFromMasterTemplate(
                selectedTemplateId || undefined, 
                template?.range || undefined
            );
            if (res.success && res.rabItems && res.rabItems.length > 0) {
                const normalized: any[] = res.rabItems.map((r: any) => {
                    const item = r.item || "";
                    const volume = parseFloat(r.volume) || 0;
                    const volSwadaya = parseFloat(r.volSwadaya) || 0;
                    const volApbd = parseFloat(r.volApbd) || Math.max(0, volume - volSwadaya);
                    const satuan = r.satuan || "Unit";
                    const harga = parseFloat(r.harga) || 0;
                    
                    let category = r.category;
                    if (!category) {
                        const text = item.toLowerCase();
                        if (text.includes("upah") || text.includes("tukang") || text.includes("pekerja") || text.includes("harian") || text.includes("tenaga")) {
                            category = "UPAH";
                        } else if (text.includes("sewa") || text.includes("alat") || text.includes("molen") || text.includes("mixer") || text.includes("vibrator") || text.includes("mesin")) {
                            category = "ALAT";
                        } else if (text.includes("konsumsi") || text.includes("koordinasi") || text.includes("rapat") || text.includes("atk") || text.includes("cetak") || text.includes("dokumentasi") || text.includes("spanduk") || text.includes("operasional") || text.includes("honor")) {
                            category = "OPERASIONAL";
                        } else {
                            category = "BAHAN";
                        }
                    }

                    return {
                        category: category as any,
                        item,
                        satuan,
                        volume,
                        volSwadaya,
                        volApbd,
                        harga,
                        swadayaTotal: volSwadaya * harga,
                        apbdTotal: volApbd * harga,
                        total: volume * harga,
                        ppn: parseFloat(r.ppn) || 0,
                        pph21: parseFloat(r.pph21) || 0,
                        pph22: parseFloat(r.pph22) || 0,
                        pph23: parseFloat(r.pph23) || 0
                    };
                });
                setRabItems(normalized);
                alert(`Berhasil sinkronisasi ${normalized.length} baris RAB dari template "${template?.name || 'Resmi'}"!`);
            } else {
                alert("Gagal sinkronisasi: template kosong atau tidak valid.");
            }
        } catch (error: any) {
            alert(error.message || "Gagal sinkronisasi dari template.");
        } finally {
            setSyncingTemplate(false);
        }
    };

    const handleSaveRab = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectForRab) return;

        setSubmittingRab(true);
        try {
            await saveProjectRab(selectedProjectForRab.id, rabItems);
            alert("RAB Resmi berhasil disimpan!");
            setShowRabEditorModal(false);
            loadData();
        } catch (error) {
            alert("Gagal menyimpan RAB Resmi");
        } finally {
            setSubmittingRab(false);
        }
    };

    // Print Helpers
    const printSingleRab = (project: any) => {
        const rabItems = (project.rab as any[]) || [];
        const categories = [
            { id: "BAHAN", label: "I. BAHAN (MATERIAL)" },
            { id: "ALAT", label: "II. ALAT (PERALATAN)" },
            { id: "UPAH", label: "III. UPAH (TENAGA KERJA)" },
            { id: "OPERASIONAL", label: "IV. BIAYA OPERASIONAL" }
        ];

        let grandTotal = 0;
        let grandSwadayaTotal = 0;
        let grandApbdTotal = 0;

        let rowsHtml = "";
        categories.forEach(cat => {
            const catItems = rabItems.filter(item => item.category === cat.id);
            rowsHtml += `
                <tr style="background-color: #f8fafc; font-weight: bold;">
                    <td colspan="7" style="padding: 8px; border: 1px solid #cbd5e1;">${cat.label}</td>
                </tr>
            `;
            if (catItems.length === 0) {
                rowsHtml += `
                    <tr>
                        <td colspan="7" style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-style: italic;">Tidak ada item</td>
                    </tr>
                `;
            } else {
                catItems.forEach((item, idx) => {
                    const volTotal = parseFloat(item.volume) || 0;
                    const volSwadaya = parseFloat(item.volSwadaya) || 0;
                    const volApbd = Math.max(0, volTotal - volSwadaya);
                    const harga = parseFloat(item.harga) || 0;
                    const total = volTotal * harga;
                    const swadayaVal = volSwadaya * harga;
                    const apbdVal = volApbd * harga;

                    grandTotal += total;
                    grandSwadayaTotal += swadayaVal;
                    grandApbdTotal += apbdVal;

                    rowsHtml += `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.item}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${volTotal} ${item.satuan}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Rp ${harga.toLocaleString('id-ID')}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Rp ${swadayaVal.toLocaleString('id-ID')}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Rp ${apbdVal.toLocaleString('id-ID')}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">Rp ${total.toLocaleString('id-ID')}</td>
                        </tr>
                    `;
                });
            }
        });

        const printContent = `
            <html>
            <head>
                <title>RAB Resmi - ${project.namaProyek}</title>
                <style>
                    body { font-family: sans-serif; color: #334155; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th { background-color: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .header-table td { padding: 4px 0; border: none; }
                    .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
                    .signature-box { text-align: center; width: 45%; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-weight: 900;">RENCANA ANGGARAN BIAYA (RAB) RESMI</h2>
                    <h3 style="margin: 5px 0 0 0; font-weight: bold; color: #475569;">DESA CIMANGGU I</h3>
                </div>
                
                <table class="header-table" style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 15%; font-weight: bold;">Nama Proyek</td>
                        <td>: ${project.namaProyek}</td>
                        <td style="width: 15%; font-weight: bold;">Provinsi</td>
                        <td>: Jawa Barat</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Jenis Kegiatan</td>
                        <td>: ${project.jenisPekerjaan}</td>
                        <td style="font-weight: bold;">Kabupaten</td>
                        <td>: Bogor</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Lokasi Proyek</td>
                        <td>: ${project.lokasi || "-"}</td>
                        <td style="font-weight: bold;">Kecamatan</td>
                        <td>: Caringin</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Volume Fisik</td>
                        <td>: ${project.volumeTotal ? `${project.volumeTotal} m³` : '-'} (${project.dimensiPanjang || 0}m x ${project.dimensiLebar || 0}m x ${project.dimensiTinggi || 0}m)</td>
                        <td style="font-weight: bold;">Desa</td>
                        <td>: Cimanggu I</td>
                    </tr>
                </table>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%; text-align: center;">NO</th>
                            <th style="width: 35%;">URAIAN / MATERIAL</th>
                            <th style="width: 12%; text-align: center;">VOL TOTAL</th>
                            <th style="width: 12%; text-align: right;">HARGA SATUAN</th>
                            <th style="width: 12%; text-align: right;">SWADAYA</th>
                            <th style="width: 12%; text-align: right;">APBD (DESA)</th>
                            <th style="width: 12%; text-align: right;">TOTAL HARGA</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="font-weight: 900; background-color: #e2e8f0; font-size: 13px;">
                            <td colspan="4" style="padding: 10px; border: 1px solid #cbd5e1;">TOTAL ANGGARAN BIAYA</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Rp ${grandSwadayaTotal.toLocaleString('id-ID')}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Rp ${grandApbdTotal.toLocaleString('id-ID')}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Rp ${grandTotal.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="signature-section">
                    <div class="signature-box">
                        <p>Disetujui,</p>
                        <p style="font-weight: bold; margin-top: 10px;">Kepala Desa Cimanggu I</p>
                        <br/><br/><br/>
                        <p style="text-decoration: underline; font-weight: bold;">HERNAWAN M. SODIK</p>
                    </div>
                    <div class="signature-box">
                        <p>Dibuat oleh,</p>
                        <p style="font-weight: bold; margin-top: 10px;">Tim Pelaksana Kegiatan (TPK)</p>
                        <br/><br/><br/>
                        <p style="text-decoration: underline; font-weight: bold;">FERRY GUNAWAN</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const windowPrint = window.open('', '', 'width=900,height=800');
        windowPrint?.document.write(printContent);
        windowPrint?.document.close();
        windowPrint?.focus();
        setTimeout(() => {
            windowPrint?.print();
            windowPrint?.close();
        }, 500);
    };

    const printAllRabsList = (projectsWithRab: any[]) => {
        let rowsHtml = "";
        let totalBudget = 0;

        projectsWithRab.forEach((p, idx) => {
            const rItems = (p.rab as any[]) || [];
            const projectTotal = rItems.reduce((sum, item) => sum + ((parseFloat(item.volume) || 0) * (parseFloat(item.harga) || 0)), 0);
            totalBudget += projectTotal;

            rowsHtml += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${p.namaProyek}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;">${p.jenisPekerjaan}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;">${p.lokasi || "-"}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${p.volumeTotal ? `${p.volumeTotal} m³` : '-'}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #16a34a;">Rp ${projectTotal.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });

        const printContent = `
            <html>
            <head>
                <title>Daftar Rekapitulasi RAB Resmi - Desa Cimanggu I</title>
                <style>
                    body { font-family: sans-serif; color: #334155; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th { background-color: #f1f5f9; padding: 12px 10px; border: 1px solid #cbd5e1; text-align: left; }
                    .signature-section { margin-top: 60px; display: flex; justify-content: flex-end; }
                    .signature-box { text-align: center; width: 300px; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-weight: 900; letter-spacing: 0.5px;">DAFTAR REKAPITULASI RAB RESMI PEMBANGUNAN</h2>
                    <h3 style="margin: 5px 0 0 0; font-weight: bold; color: #475569;">DESA CIMANGGU I • TAHUN ANGGARAN 2026</h3>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%; text-align: center;">NO</th>
                            <th style="width: 30%;">NAMA PROYEK</th>
                            <th style="width: 20%;">JENIS PEKERJAAN</th>
                            <th style="width: 20%;">LOKASI</th>
                            <th style="width: 10%; text-align: center;">VOLUME</th>
                            <th style="width: 15%; text-align: right;">TOTAL ANGGARAN RAB</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="font-weight: 900; background-color: #e2e8f0; font-size: 13px;">
                            <td colspan="5" style="padding: 12px 10px; border: 1px solid #cbd5e1; text-align: right;">GRAND TOTAL ANGGARAN REKAPITULASI</td>
                            <td style="padding: 12px 10px; border: 1px solid #cbd5e1; text-align: right; color: #16a34a;">Rp ${totalBudget.toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="signature-section">
                    <div class="signature-box">
                        <p>Mengetahui,</p>
                        <p style="font-weight: bold;">Kepala Desa Cimanggu I</p>
                        <br/><br/><br/><br/>
                        <p style="text-decoration: underline; font-weight: bold; margin-bottom: 0;">HERNAWAN M. SODIK</p>
                        <p style="font-size: 10px; color: #64748b; margin-top: 2px;">NIP. 197405122009061002</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const windowPrint = window.open('', '', 'width=1000,height=800');
        windowPrint?.document.write(printContent);
        windowPrint?.document.close();
        windowPrint?.focus();
        setTimeout(() => {
            windowPrint?.print();
            windowPrint?.close();
        }, 500);
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
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowRabListModal(true)} 
                        className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
                    >
                        <FileSpreadsheet size={16} /> Daftar RAB Resmi
                    </button>
                    {canEdit && (
                        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                            <Plus size={16} /> Proyek Baru
                        </button>
                    )}
                </div>
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
                                    <button 
                                        onClick={() => handleOpenRabModal(p)} 
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg tooltip" 
                                        title={canEdit ? "Buat/Edit RAB Resmi" : "Lihat/Cetak RAB Resmi"}
                                    >
                                        <Calculator size={16} />
                                    </button>
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
            
            {showRabListModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Daftar RAB Resmi Proyek</h2>
                                <p className="text-slate-500 text-sm">Daftar proyek fisik yang telah memiliki Rencana Anggaran Biaya (RAB) resmi.</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => printAllRabsList(projects.filter(p => p.rab && (p.rab as any[]).length > 0))} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                                    <Printer size={16} /> Cetak Rekapitulasi
                                </button>
                                <button onClick={() => setShowRabListModal(false)} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-4 py-4">Proyek</th>
                                        <th className="px-4 py-4">Lokasi & Volume</th>
                                        <th className="px-4 py-4 text-right">Total RAB (Rp)</th>
                                        <th className="px-4 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.filter(p => p.rab && (p.rab as any[]).length > 0).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-medium">Belum ada RAB resmi yang dibuat.</td>
                                        </tr>
                                    ) : (
                                        projects.filter(p => p.rab && (p.rab as any[]).length > 0).map((p, i) => {
                                            const rItems = (p.rab as any[]) || [];
                                            const total = rItems.reduce((sum, item) => sum + ((parseFloat(item.volume) || 0) * (parseFloat(item.harga) || 0)), 0);
                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-slate-800 text-sm">{p.namaProyek}</div>
                                                        <div className="text-[11px] text-slate-500">{p.jenisPekerjaan}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-slate-700 text-sm">{p.lokasi || "-"}</div>
                                                        <div className="text-[11px] text-slate-500">{p.volumeTotal ? `${p.volumeTotal} m³` : '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="font-black text-emerald-600">Rp {total.toLocaleString('id-ID')}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => printSingleRab(p)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg tooltip" title="Cetak RAB">
                                                                <Printer size={16} />
                                                            </button>
                                                            {canEdit && (
                                                                <button onClick={() => { setShowRabListModal(false); handleOpenRabModal(p); }} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg tooltip" title="Edit RAB">
                                                                    <Calculator size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showRabEditorModal && selectedProjectForRab && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">RAB Resmi: {selectedProjectForRab.namaProyek}</h2>
                                <p className="text-slate-500 text-sm">{selectedProjectForRab.jenisPekerjaan} • {selectedProjectForRab.lokasi}</p>
                            </div>
                            <button onClick={() => setShowRabEditorModal(false)} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {canEdit && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">Sinkron dari Master Template RAB</div>
                                            <div className="text-[10px] text-slate-500">Pilih template standar dari Master Admin dan otomatis buat item RAB.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={selectedTemplateId} 
                                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            <option value="" disabled>Pilih Template...</option>
                                            {officialTemplates.map(t => (
                                                <option key={t.id} value={t.googleId}>{t.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button"
                                            disabled={syncingTemplate || !selectedTemplateId}
                                            onClick={handleSyncTemplate}
                                            className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            {syncingTemplate ? <Loader2 className="animate-spin" size={14} /> : <FileSpreadsheet size={14} />} Sinkron
                                        </button>
                                    </div>
                                </div>
                            )}

                            {[
                                { id: "BAHAN", label: "I. BAHAN (MATERIAL)" },
                                { id: "ALAT", label: "II. ALAT (PERALATAN)" },
                                { id: "UPAH", label: "III. UPAH (TENAGA KERJA)" },
                                { id: "OPERASIONAL", label: "IV. BIAYA OPERASIONAL" }
                            ].map((cat) => {
                                const itemsWithOriginalIndices = rabItems
                                    .map((item, idx) => ({ item, idx }))
                                    .filter(x => x.item.category === cat.id);

                                const catSubtotal = itemsWithOriginalIndices.reduce(
                                    (sum, x) => sum + (x.item.volume * x.item.harga), 
                                    0
                                );

                                return (
                                    <div key={cat.id} className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{cat.label}</span>
                                            {canEdit && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleAddRabRow(cat.id as any)}
                                                    className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all bg-emerald-50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <PlusCircle size={14} /> Tambah Item
                                                </button>
                                            )}
                                        </div>

                                        {itemsWithOriginalIndices.length === 0 ? (
                                            <div className="text-center py-6 text-slate-400 font-medium text-xs italic bg-white rounded-xl border border-dashed border-slate-200">
                                                Belum ada item untuk kategori ini.
                                            </div>
                                        ) : (
                                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                                <table className="w-full text-left table-fixed">
                                                    <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                        <tr>
                                                            <th className="px-3 py-3 w-[5%] text-center">NO</th>
                                                            <th className="px-3 py-3 w-[25%]">Uraian / Material</th>
                                                            <th className="px-3 py-3 w-[10%]">Vol Total</th>
                                                            <th className="px-3 py-3 w-[10%]">Vol Swadaya</th>
                                                            <th className="px-3 py-3 w-[10%]">Vol APBD</th>
                                                            <th className="px-3 py-3 w-[10%]">Satuan</th>
                                                            <th className="px-3 py-3 w-[13%]">Harga (Rp)</th>
                                                            <th className="px-3 py-3 w-[12%] text-right">Total (Rp)</th>
                                                            {canEdit && <th className="px-3 py-3 w-[5%] text-center"></th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 text-[11px]">
                                                        {itemsWithOriginalIndices.map((x, subIdx) => {
                                                            const { item, idx } = x;
                                                            return (
                                                                <tr key={idx} className="font-medium hover:bg-slate-50/50 group">
                                                                    <td className="p-2 text-center font-bold text-slate-400">
                                                                        {subIdx + 1}
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled={!canEdit} required placeholder="Uraian" value={item.item} onChange={e => handleRabChange(idx, "item", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors disabled:bg-transparent" />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled={!canEdit} required type="number" min="0" value={item.volume} onChange={e => handleRabChange(idx, "volume", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors disabled:bg-transparent text-center" />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled={!canEdit} required type="number" min="0" value={item.volSwadaya} onChange={e => handleRabChange(idx, "volSwadaya", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors disabled:bg-transparent text-center" />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled type="number" value={item.volApbd} className="w-full bg-slate-100/50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-500 cursor-not-allowed text-center" />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled={!canEdit} required placeholder="Pcs" value={item.satuan} onChange={e => handleRabChange(idx, "satuan", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors disabled:bg-transparent text-center" />
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <input disabled={!canEdit} required type="number" min="0" value={item.harga} onChange={e => handleRabChange(idx, "harga", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors disabled:bg-transparent" />
                                                                    </td>
                                                                    <td className="p-2 text-right font-black text-slate-700 pr-4">
                                                                        {(item.volume * item.harga).toLocaleString('id-ID')}
                                                                    </td>
                                                                    {canEdit && (
                                                                        <td className="p-2 text-center">
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => handleRemoveRabRow(idx)}
                                                                                className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="flex justify-end text-[11px] font-black text-slate-500 bg-white/60 p-3 rounded-xl border border-slate-100">
                                            <span>Subtotal: <span className="text-slate-800 ml-2 text-sm">Rp {catSubtotal.toLocaleString('id-ID')}</span></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-lg">
                                <span className="font-bold text-xs uppercase tracking-widest text-slate-400">Total Biaya (RAB):</span>
                                <span className="font-black text-xl text-emerald-400">Rp {calcGrandTotal().toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => printSingleRab(selectedProjectForRab)} className="px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold transition-all flex items-center gap-2">
                                    <Printer size={18} /> Cetak
                                </button>
                                {canEdit && (
                                    <button 
                                        onClick={handleSaveRab}
                                        disabled={submittingRab} 
                                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {submittingRab ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                                        Simpan RAB Resmi
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
