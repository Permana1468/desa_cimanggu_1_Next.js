"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
    createFinanceProposal, 
    updateProposalStatus, 
    convertProposalToInfrastrukturProject 
} from "@/actions/tracking";
import { 
    Banknote, 
    Plus, 
    Search, 
    Filter, 
    X, 
    PlusCircle, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Activity, 
    Loader2, 
    ExternalLink, 
    Calculator,
    ClipboardList,
    Layers
} from "lucide-react";

interface RabItem {
    item: string;
    satuan: string;
    volume: number;
    harga: number;
    total: number;
}

const JENIS_PEMBANGUNAN_OPTIONS = [
    { value: "JALAN_BETON", label: "Jalan Beton / Rigid Pavement" },
    { value: "DRAINASE_UDITCH", label: "Drainase U-Ditch" },
    { value: "BUIS_BETON", label: "Buis Beton (Gorong-gorong)" },
    { value: "TPT", label: "Tanggul Penahan Tanah (TPT)" },
    { value: "LAINNYA", label: "Fisik Lainnya (Kustom)" }
];

const SPEC_OPTIONS: Record<string, { value: string; label: string; estHarga?: number }[]> = {
    JALAN_BETON: [
        { value: "K-175", label: "Beton K-175 (Jalur Lambat)" },
        { value: "K-200", label: "Beton K-200 (Kekuatan Menengah)" },
        { value: "K-225", label: "Beton K-225 (Standar Jalan Desa)" },
        { value: "K-250", label: "Beton K-250 (Kekuatan Tinggi)" }
    ],
    DRAINASE_UDITCH: [
        { value: "30x30", label: "U-Ditch 30 x 30 x 120 cm", estHarga: 450000 },
        { value: "40x40", label: "U-Ditch 40 x 40 x 120 cm", estHarga: 550000 },
        { value: "50x50", label: "U-Ditch 50 x 50 x 120 cm", estHarga: 650000 }
    ],
    BUIS_BETON: [
        { value: "dia30", label: "Buis Beton Dia 30 cm (100 cm)", estHarga: 180000 },
        { value: "dia40", label: "Buis Beton Dia 40 cm (100 cm)", estHarga: 220000 },
        { value: "dia60", label: "Buis Beton Dia 60 cm (100 cm)", estHarga: 350000 },
        { value: "dia80", label: "Buis Beton Dia 80 cm (100 cm)", estHarga: 500000 }
    ],
    TPT: [
        { value: "pasangan_batu", label: "TPT Pasangan Batu Kali (Adukan 1:4)" }
    ]
};

export function FinancePageClient({ initialProposals }: { initialProposals: any[] }) {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "";
    const isLpm = role === "LPM";
    const isKaur = role === "KAUR_PERENCANAAN";

    const [proposals, setProposals] = useState<any[]>(initialProposals);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("PEMBANGUNAN");
    
    // Volume Calculator State
    const [panjang, setPanjang] = useState("");
    const [lebar, setLebar] = useState("");
    const [tebal, setTebal] = useState("");

    // Advanced fields
    const [jenisPembangunan, setJenisPembangunan] = useState("");
    const [spesifikasi, setSpesifikasi] = useState("");
    const [mutuBeton, setMutuBeton] = useState("K-225");
    const [uDitchCover, setUDitchCover] = useState(true);
    const [lebarAtas, setLebarAtas] = useState("");
    const [lebarBawah, setLebarBawah] = useState("");
    const [tinggi, setTinggi] = useState("");
    
    // RAB Builder State
    const [rabItems, setRabItems] = useState<RabItem[]>([
        { item: "Pekerjaan Persiapan / Galian", satuan: "Ls", volume: 1, harga: 500000, total: 500000 }
    ]);

    const getCalculatedDetails = () => {
        const p = parseFloat(panjang) || 0;
        const l = parseFloat(lebar) || 0;
        const t = parseFloat(tebal) || 0;
        const la = parseFloat(lebarAtas) || 0;
        const lb = parseFloat(lebarBawah) || 0;
        const h = parseFloat(tinggi) || 0;

        let calculatedVolume = 0;
        let unit = "m³";
        let materials: { name: string; qty: number; unit: string; price: number; total: number }[] = [];

        if (jenisPembangunan === "JALAN_BETON") {
            calculatedVolume = p * l * t;
            unit = "m³";
            
            let cementPerM3 = 7.42;
            let sandPerM3 = 0.50;
            let splitPerM3 = 0.75;
            
            if (mutuBeton === "K-175") {
                cementPerM3 = 6.52;
                sandPerM3 = 0.54;
                splitPerM3 = 0.74;
            } else if (mutuBeton === "K-200") {
                cementPerM3 = 7.04;
                sandPerM3 = 0.52;
                splitPerM3 = 0.74;
            } else if (mutuBeton === "K-225") {
                cementPerM3 = 7.42;
                sandPerM3 = 0.50;
                splitPerM3 = 0.75;
            } else if (mutuBeton === "K-250") {
                cementPerM3 = 7.68;
                sandPerM3 = 0.49;
                splitPerM3 = 0.75;
            }

            if (calculatedVolume > 0) {
                materials = [
                    { name: `Semen Portland (50kg) - Mix ${mutuBeton}`, qty: Math.ceil(calculatedVolume * cementPerM3), unit: "Sak", price: 72000, total: 0 },
                    { name: "Pasir Beton (Pasang)", qty: parseFloat((calculatedVolume * sandPerM3).toFixed(2)), unit: "m³", price: 250000, total: 0 },
                    { name: "Batu Split / Kerikil (1/2)", qty: parseFloat((calculatedVolume * splitPerM3).toFixed(2)), unit: "m³", price: 300000, total: 0 },
                    { name: "Jasa Bekisting & Pengecoran Jalan", qty: parseFloat(calculatedVolume.toFixed(2)), unit: "m³", price: 180000, total: 0 }
                ];
            }
        } else if (jenisPembangunan === "TPT") {
            calculatedVolume = ((la + lb) / 2) * h * p;
            unit = "m³";

            if (calculatedVolume > 0) {
                materials = [
                    { name: "Batu Belah / Batu Kali", qty: parseFloat((calculatedVolume * 1.2).toFixed(2)), unit: "m³", price: 280000, total: 0 },
                    { name: "Semen Portland (50kg) - TPT", qty: Math.ceil(calculatedVolume * 3.26), unit: "Sak", price: 72000, total: 0 },
                    { name: "Pasir Pasang", qty: parseFloat((calculatedVolume * 0.52).toFixed(2)), unit: "m³", price: 250000, total: 0 },
                    { name: "Jasa Pekerja & Pemasangan TPT", qty: parseFloat(calculatedVolume.toFixed(2)), unit: "m³", price: 150000, total: 0 }
                ];
            }
        } else if (jenisPembangunan === "DRAINASE_UDITCH") {
            calculatedVolume = p;
            unit = "m'";
            
            const pieces = Math.ceil(p / 1.2);
            let uDitchPrice = 450000;
            let coverPrice = 150000;
            let specLabel = "30 x 30 x 120 cm";

            if (spesifikasi === "40x40") {
                uDitchPrice = 550000;
                coverPrice = 180000;
                specLabel = "40 x 40 x 120 cm";
            } else if (spesifikasi === "50x50") {
                uDitchPrice = 650000;
                coverPrice = 220000;
                specLabel = "50 x 50 x 120 cm";
            }

            if (p > 0) {
                materials = [
                    { name: `Penyediaan Box U-Ditch ${specLabel}`, qty: pieces, unit: "Pcs", price: uDitchPrice, total: 0 }
                ];
                if (uDitchCover) {
                    materials.push({ name: `Penyediaan Cover/Tutup U-Ditch ${specLabel}`, qty: pieces * 2, unit: "Pcs", price: coverPrice, total: 0 });
                }
                materials.push({ name: "Pekerjaan Pemasangan & Galian U-Ditch", qty: p, unit: "M", price: 120000, total: 0 });
            }
        } else if (jenisPembangunan === "BUIS_BETON") {
            calculatedVolume = p;
            unit = "m'";

            const pieces = Math.ceil(p / 1.0);
            let buisPrice = 180000;
            let laborPrice = 90000;
            let specLabel = "Dia 30 cm";

            if (spesifikasi === "dia40") {
                buisPrice = 220000;
                specLabel = "Dia 40 cm";
            } else if (spesifikasi === "dia60") {
                buisPrice = 350000;
                specLabel = "Dia 60 cm";
                laborPrice = 100000;
            } else if (spesifikasi === "dia80") {
                buisPrice = 500000;
                specLabel = "Dia 80 cm";
                laborPrice = 120000;
            }

            if (p > 0) {
                materials = [
                    { name: `Penyediaan Buis Beton ${specLabel}`, qty: pieces, unit: "Pcs", price: buisPrice, total: 0 },
                    { name: "Pekerjaan Galian & Pemasangan Buis Beton", qty: p, unit: "M", price: laborPrice, total: 0 }
                ];
            }
        } else {
            calculatedVolume = p * l * t;
            unit = "m³";
        }

        materials = materials.map(m => ({ ...m, total: m.qty * m.price }));
        return { volume: calculatedVolume, unit, materials };
    };

    // Live calculations
    const calcVolume = () => {
        const { volume } = getCalculatedDetails();
        return volume;
    };

    const calcGrandTotal = () => {
        return rabItems.reduce((acc, item) => acc + (item.volume * item.harga), 0);
    };

    const handleAddRabRow = () => {
        setRabItems([...rabItems, { item: "", satuan: "Sak", volume: 1, harga: 0, total: 0 }]);
    };

    const handleRemoveRabRow = (index: number) => {
        const updated = [...rabItems];
        updated.splice(index, 1);
        setRabItems(updated);
    };

    const handleRabChange = (index: number, field: keyof RabItem, value: any) => {
        const updated = [...rabItems];
        if (field === "volume" || field === "harga") {
            const val = parseFloat(value) || 0;
            updated[index][field] = val as never;
            updated[index].total = updated[index].volume * updated[index].harga;
        } else {
            updated[index][field] = value as never;
        }
        setRabItems(updated);
    };

    // Submitting proposal
    const handleCreateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert("Harap lengkapi judul dan deskripsi usulan");
            return;
        }

        setSubmitting(true);
        try {
            let volumeStr = panjang && lebar && tebal ? `${panjang} x ${lebar} x ${tebal} m` : undefined;
            const volumeVal = calcVolume();

            if (jenisPembangunan === "JALAN_BETON") {
                volumeStr = `${panjang} x ${lebar} x ${tebal} m (Beton Mutu ${mutuBeton})`;
            } else if (jenisPembangunan === "TPT") {
                volumeStr = `TPT: P ${panjang}m, L.Atas ${lebarAtas}m, L.Bawah ${lebarBawah}m, T ${tinggi}m`;
            } else if (jenisPembangunan === "DRAINASE_UDITCH") {
                const specText = spesifikasi === "30x30" ? "30x30" : spesifikasi === "40x40" ? "40x40" : "50x50";
                volumeStr = `U-Ditch ${specText}: P ${panjang} m (${uDitchCover ? "dengan Cover" : "tanpa Cover"})`;
            } else if (jenisPembangunan === "BUIS_BETON") {
                const specText = spesifikasi === "dia30" ? "Dia 30" : spesifikasi === "dia40" ? "Dia 40" : spesifikasi === "dia60" ? "Dia 60" : "Dia 80";
                volumeStr = `Buis Beton ${specText}: P ${panjang} m`;
            }

            const payload = {
                title,
                description,
                category,
                amount: calcGrandTotal(),
                volume: volumeStr,
                kubikasi: jenisPembangunan === "DRAINASE_UDITCH" || jenisPembangunan === "BUIS_BETON" ? undefined : volumeVal,
                rab: rabItems
            };

            const result = await createFinanceProposal(payload);
            
            // Refresh proposal list (simulate fetch/add or update local state)
            alert("Usulan pembangunan berhasil dikirim ke Kaur Perencanaan");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Gagal membuat usulan");
        } finally {
            setSubmitting(false);
        }
    };

    // Verifikasi / Tolak Status
    const handleUpdateStatus = async (proposalId: string, newStatus: string, notes: string) => {
        setUpdatingStatus(proposalId);
        try {
            await updateProposalStatus(proposalId, newStatus, notes);
            alert(`Usulan berhasil diperbarui menjadi: ${newStatus}`);
            window.location.reload();
        } catch (error) {
            alert("Gagal memperbarui status usulan");
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Convert to InfrastrukturProject
    const handleConvertToProject = async (proposalId: string) => {
        setUpdatingStatus(proposalId);
        try {
            const res = await convertProposalToInfrastrukturProject(proposalId);
            if (res.success) {
                alert("Usulan pembangunan telah disetujui & otomatis dikonversi menjadi Proyek Fisik Infrastruktur!");
                window.location.reload();
            }
        } catch (error) {
            alert("Gagal mengonversi proyek");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filtered = proposals.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[80px] -mr-48 -mt-48" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-black tracking-tight">
                        {isLpm ? "Usulan Pembangunan LPM" : "Verifikasi Usulan Pembangunan"}
                    </h1>
                    <p className="text-slate-400 text-xs font-semibold mt-1.5 max-w-xl leading-relaxed">
                        {isLpm 
                            ? "Ajukan rencana pembangunan fisik infrastruktur desa dengan kalkulator volume otomatis dan rincian Bill of Quantities (RAB)."
                            : "Verifikasi dan validasi spesifikasi usulan pembangunan dari LPM sebelum didelegasikan menjadi proyek fisik desa."
                        }
                    </p>
                </div>
                {isLpm && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/15 flex items-center gap-2"
                    >
                        <Plus size={18} /> Buat Usulan Baru
                    </button>
                )}
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan judul atau pengaju..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="flex gap-2">
                    {["ALL", "PENDING", "VERIFIED", "APPROVED", "REJECTED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                                statusFilter === st 
                                    ? "bg-slate-900 text-white" 
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            {st === "ALL" ? "Semua" : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Proyek Pembangunan</th>
                                <th className="px-6 py-4">Pengaju / Lembaga</th>
                                <th className="px-6 py-4">Spesifikasi Volume</th>
                                <th className="px-6 py-4">Anggaran (RAB)</th>
                                <th className="px-6 py-4">Status Verifikasi</th>
                                <th className="px-6 py-4 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-xs">{p.title}</div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                        {p.user?.fullName}
                                        <span className="block text-[9px] font-black text-amber-600 uppercase tracking-widest mt-0.5">{p.user?.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.volume ? (
                                            <div>
                                                <div className="font-bold text-xs text-slate-700">{p.kubikasi ? `${p.kubikasi.toFixed(2)} m³` : "-"}</div>
                                                <div className="text-[9px] font-bold text-slate-400">Spec: {p.volume}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic text-[11px]">- non fisik -</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-800 text-xs">
                                        Rp {p.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedProposal(p)}
                                            className="px-3.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 transition-colors inline-flex items-center gap-1"
                                        >
                                            <ClipboardList size={12} /> Detail & Verifikasi
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-xs">
                                        Belum ada usulan pembangunan terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAIL MODAL */}
            {selectedProposal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProposal(null)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    <Calculator size={10} /> Detail Usulan Teknis
                                </div>
                                <h2 className="text-xl font-black text-slate-800 mt-2">{selectedProposal.title}</h2>
                            </div>
                            <button onClick={() => setSelectedProposal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
                            <div className="grid grid-cols-3 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Pengaju Usulan</span>
                                    <span className="font-bold text-slate-800 text-xs block mt-1">{selectedProposal.user?.fullName}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Dimensi & Kubikasi</span>
                                    <span className="font-bold text-slate-800 text-xs block mt-1">
                                        {selectedProposal.volume ? `${selectedProposal.volume} (${selectedProposal.kubikasi?.toFixed(2)} m³)` : "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Grand Total RAB</span>
                                    <span className="font-black text-emerald-600 text-xs block mt-1">Rp {selectedProposal.amount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-widest text-[9px] mb-2">Deskripsi Rencana Kerja</h4>
                                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium">{selectedProposal.description}</p>
                            </div>

                            {/* RAB Detail List */}
                            {selectedProposal.rab && Array.isArray(selectedProposal.rab) && (
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[9px] mb-3 flex items-center gap-1">
                                        <Layers size={12} className="text-slate-400" /> Rincian Bill of Quantities (RAB)
                                    </h4>
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-2.5">Item Uraian</th>
                                                    <th className="px-4 py-2.5">Volume</th>
                                                    <th className="px-4 py-2.5">Satuan</th>
                                                    <th className="px-4 py-2.5 text-right">Harga Satuan</th>
                                                    <th className="px-4 py-2.5 text-right">Total Uraian</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {(selectedProposal.rab as RabItem[]).map((r, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors font-medium">
                                                        <td className="px-4 py-2 text-slate-800 font-bold">{r.item}</td>
                                                        <td className="px-4 py-2 text-slate-600">{r.volume}</td>
                                                        <td className="px-4 py-2 text-slate-600">{r.satuan}</td>
                                                        <td className="px-4 py-2 text-slate-800 text-right">Rp {r.harga.toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-2 text-slate-900 text-right font-black">Rp {r.total.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tracking Logs */}
                            {selectedProposal.trackings && selectedProposal.trackings.length > 0 && (
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[9px] mb-3 flex items-center gap-1">
                                        <Activity size={12} className="text-slate-400" /> Riwayat Progress Usulan
                                    </h4>
                                    <div className="space-y-2 pl-2 border-l border-slate-100">
                                        {selectedProposal.trackings.map((t: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-start relative">
                                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 z-10 shrink-0" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{t.status} <span className="text-[10px] text-slate-400 font-normal">({new Date(t.createdAt).toLocaleString('id-ID')})</span></div>
                                                    <p className="text-slate-500 font-medium mt-0.5">{t.notes}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS FOR VERIFIER */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedProposal(null)} 
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold active:scale-95 transition-all text-xs"
                            >
                                Tutup Detail
                            </button>

                            {isKaur && selectedProposal.status === "PENDING" && (
                                <>
                                    <button 
                                        disabled={updatingStatus !== null}
                                        onClick={() => handleUpdateStatus(selectedProposal.id, "REJECTED", "Ditolak setelah ditinjau oleh Kaur Perencanaan")}
                                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all text-[10px] flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <XCircle size={14} /> Tolak Usulan
                                    </button>
                                    <button 
                                        disabled={updatingStatus !== null}
                                        onClick={() => handleUpdateStatus(selectedProposal.id, "VERIFIED", "Terverifikasi secara teknis oleh Kaur Perencanaan")}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all text-[10px] flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <CheckCircle2 size={14} /> Verifikasi Usulan
                                    </button>
                                </>
                            )}

                            {isKaur && selectedProposal.status === "VERIFIED" && (
                                <button 
                                    disabled={updatingStatus !== null}
                                    onClick={() => handleConvertToProject(selectedProposal.id)}
                                    className="px-5 py-2.5 bg-[#0f172a] hover:bg-black text-white rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all text-[10px] flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <ExternalLink size={14} /> Konversi Ke Proyek Fisik
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE PROPOSAL MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Form Usulan Pembangunan Fisik</h2>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">Rancang detail pembangunan fisik untuk diajukan ke Kaur Perencanaan.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProposal} className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nama Usulan Pembangunan</label>
                                    <input required placeholder="Contoh: Pengaspalan Jalan Lingkungan RT 02/01" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kategori Usulan</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-emerald-500/20">
                                        <option value="PEMBANGUNAN">Pembangunan Fisik</option>
                                        <option value="OPERASIONAL">Operasional Lembaga</option>
                                        <option value="SOSIAL">Bantuan Sosial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Deskripsi & Rincian Lokasi</label>
                                <textarea required placeholder="Jelaskan detail usulan pembangunan dan lokasi pengerjaan secara lengkap..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-emerald-500/20 min-h-[80px]" />
                            </div>

                            {/* Volume Calculator */}
                            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-800">
                                    <Calculator size={18} />
                                    <h4 className="font-black uppercase tracking-wider text-[10px]">Volume Calculator & Analisa Bahan (Fisik)</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Jenis Pembangunan</label>
                                        <select 
                                            value={jenisPembangunan} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setJenisPembangunan(val);
                                                if (val === "DRAINASE_UDITCH") {
                                                    setSpesifikasi("30x30");
                                                } else if (val === "BUIS_BETON") {
                                                    setSpesifikasi("dia30");
                                                } else if (val === "JALAN_BETON") {
                                                    setSpesifikasi("K-225");
                                                    setMutuBeton("K-225");
                                                } else if (val === "TPT") {
                                                    setSpesifikasi("pasangan_batu");
                                                } else {
                                                    setSpesifikasi("");
                                                }
                                            }}
                                            className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
                                        >
                                            <option value="">-- Pilih Jenis --</option>
                                            {JENIS_PEMBANGUNAN_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {jenisPembangunan && SPEC_OPTIONS[jenisPembangunan] && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Spesifikasi / Mutu</label>
                                            <select 
                                                value={spesifikasi} 
                                                onChange={e => {
                                                    setSpesifikasi(e.target.value);
                                                    if (jenisPembangunan === "JALAN_BETON") {
                                                        setMutuBeton(e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
                                            >
                                                {SPEC_OPTIONS[jenisPembangunan].map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {jenisPembangunan === "TPT" && (
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Panjang (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 50" value={panjang} onChange={e => setPanjang(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Tinggi Rata-rata (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 1.5" value={tinggi} onChange={e => setTinggi(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Lebar Atas (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 0.3" value={lebarAtas} onChange={e => setLebarAtas(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Lebar Bawah (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 0.8" value={lebarBawah} onChange={e => setLebarBawah(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                    </div>
                                )}

                                {jenisPembangunan === "DRAINASE_UDITCH" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Panjang Saluran (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 120" value={panjang} onChange={e => setPanjang(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Tutup / Cover</label>
                                            <select 
                                                value={uDitchCover ? "yes" : "no"} 
                                                onChange={e => setUDitchCover(e.target.value === "yes")}
                                                className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
                                            >
                                                <option value="yes">Dengan Cover (Tutup)</option>
                                                <option value="no">Tanpa Cover (Terbuka)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {jenisPembangunan === "BUIS_BETON" && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Panjang Pasang (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 10" value={panjang} onChange={e => setPanjang(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                    </div>
                                )}

                                {(jenisPembangunan === "JALAN_BETON" || jenisPembangunan === "LAINNYA" || !jenisPembangunan) && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Panjang (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 100" value={panjang} onChange={e => setPanjang(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Lebar (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 3" value={lebar} onChange={e => setLebar(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Tinggi/Tebal (m)</label>
                                            <input type="number" step="0.01" placeholder="Contoh: 0.12" value={tebal} onChange={e => setTebal(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-900" />
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    const { volume, unit, materials } = getCalculatedDetails();
                                    if (volume <= 0) return null;
                                    return (
                                        <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100 space-y-3">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                <span className="text-[11px] font-bold text-emerald-800">
                                                    Dimensi: <span className="font-black text-xs">{volume.toFixed(2)} {unit}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newRab = materials.map(m => ({
                                                            item: m.name,
                                                            satuan: m.unit,
                                                            volume: m.qty,
                                                            harga: m.price,
                                                            total: m.total
                                                        }));
                                                        setRabItems(newRab);
                                                    }}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                                                >
                                                    Terapkan ke RAB Builder
                                                </button>
                                            </div>
                                            {materials.length > 0 && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">Rencana Kebutuhan Material & Jasa:</span>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                        {materials.map((m, idx) => (
                                                            <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded-lg font-medium border border-slate-100">
                                                                <span className="text-slate-600 truncate max-w-[70%]">{m.name}</span>
                                                                <span className="font-bold text-slate-800">{m.qty} {m.unit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* RAB Builder Table */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-[9px]">Rancangan Anggaran Biaya (RAB) Builder</h4>
                                    <button 
                                        type="button" 
                                        onClick={handleAddRabRow}
                                        className="text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all"
                                    >
                                        <PlusCircle size={14} /> Tambah Uraian
                                    </button>
                                </div>
                                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-2.5 w-[40%]">Uraian Pekerjaan / Material</th>
                                                <th className="px-4 py-2.5 w-[15%]">Volume</th>
                                                <th className="px-4 py-2.5 w-[15%]">Satuan</th>
                                                <th className="px-4 py-2.5 w-[20%]">Harga Satuan (Rp)</th>
                                                <th className="px-4 py-2.5 text-right w-[10%]">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {rabItems.map((item, idx) => (
                                                <tr key={idx} className="font-medium">
                                                    <td className="p-2">
                                                        <input required placeholder="Contoh: Semen Portland" value={item.item} onChange={e => handleRabChange(idx, "item", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500/20" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input required type="number" value={item.volume} onChange={e => handleRabChange(idx, "volume", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500/20" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input required placeholder="Contoh: Sak" value={item.satuan} onChange={e => handleRabChange(idx, "satuan", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500/20" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input required type="number" value={item.harga} onChange={e => handleRabChange(idx, "harga", e.target.value)} className="w-full bg-slate-50 border-none rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500/20" />
                                                    </td>
                                                    <td className="p-2 text-right pr-4">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveRabRow(idx)}
                                                            className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="font-bold text-slate-500">Estimasi Total Proyek:</span>
                                    <span className="font-black text-sm text-slate-800">Rp {calcGrandTotal().toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Banknote size={16} /> Ajukan Usulan Pembangunan</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        VERIFIED: "bg-blue-50 text-blue-600 border-blue-100",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
    };
    return (
        <span className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${colors[status] || "bg-slate-50"}`}>
            {status}
        </span>
    );
}
