"use client";

import React, { useState, useMemo } from "react";
import { 
    Users, Search, Plus, Edit2, Trash2, X, Download, Upload, 
    Filter, MapPin, CheckCircle2, AlertCircle, Loader2, FileText,
    ChevronLeft, ChevronRight, MoreHorizontal, User, Briefcase, Map,
    FileSpreadsheet, UserPlus, Fingerprint, Home, Heart, GraduationCap, Users2, Globe,
    Activity, ShieldCheck, Building, History, Settings, Printer, Calendar
} from "lucide-react";
import { upsertResident, deleteResident, bulkImportResidents, deleteAllResidents, bulkDeleteResidents } from "@/actions/master";
import { fetchGoogleSheetData } from "@/actions/google";
import ExcelJS from "exceljs";
import { WARGA_FIELDS, DEFAULT_WARGA_FORM, isWargaDataIncomplete } from "@/lib/wargaSchema";
import { formatWilayah, formatDusun } from "@/lib/formatters";

const FieldIconMap: Record<string, any> = {
    nik: Fingerprint,
    noKK: Home,
    namaLengkap: User,
    jenisKelamin: Users,
    tempatLahir: MapPin,
    tanggalLahir: Calendar,
    agama: ShieldCheck,
    pendidikan: GraduationCap,
    pekerjaan: Briefcase,
    golonganDarah: Activity,
    statusKawin: Heart,
    hubunganKeluarga: Users2,
    kewarganegaraan: Globe,
    namaAyah: User,
    namaIbu: User,
    alamat: Map,
    dusun: MapPin,
    rw: MapPin,
    rt: MapPin,
    tenantId: Building
};

function HoverMask({ value }: { value: string }) {
    const [visible, setVisible] = useState(false);
    if (!value) return <span>-</span>;
    const getMasked = (val: string) => {
        if (val.length <= 6) return "*".repeat(val.length);
        return val.substring(0, 6) + "*".repeat(val.length - 6);
    };
    return (
        <span 
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onClick={() => setVisible(!visible)}
            className="cursor-pointer transition-all duration-200 hover:text-blue-600 select-all font-mono"
            title="Arahkan kursor atau klik untuk melihat lengkap"
        >
            {visible ? value : getMasked(value)}
        </span>
    );
}

interface Resident {
    id: string;
    nik: string;
    noKK: string;
    namaLengkap: string;
    jenisKelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    dusun: string;
    tenant: { name: string };
    tenantId: string;
    pekerjaan: string | null;
    agama: string;
    pendidikan: string | null;
    golonganDarah: string | null;
    statusKawin: string;
    hubunganKeluarga: string;
    kewarganegaraan: string;
    namaAyah: string | null;
    namaIbu: string | null;
    tanggalLahir: any;
    tempatLahir: string;
}

interface ResidentManagementGlobalProps {
    initialResidents: Resident[];
    tenants: { id: string; name: string }[];
    villageStructure: { dusun: { name: string, rw: { name: string, rt: string[] }[] }[] };
}

export function ResidentManagementGlobal({ initialResidents, tenants, villageStructure }: ResidentManagementGlobalProps) {
    const [residents, setResidents] = useState(initialResidents);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTenant, setSelectedTenant] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [editingResident, setEditingResident] = useState<any>(null);

    // Bulk Selection & Deletion States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [paperSize, setPaperSize] = useState("A4");
    const [sortBy, setSortBy] = useState("default");

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Dynamic Import States
    const [importStep, setImportStep] = useState<"UPLOAD" | "MAPPING" | "PREVIEW">("UPLOAD");
    const [excelData, setExcelData] = useState<any[]>([]);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

    // Google Sheets Integration States
    const [importSource, setImportSource] = useState<"FILE" | "GOOGLE_SHEET">("FILE");
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [sheetRange, setSheetRange] = useState("Sheet1!A1:Z500");

    const DB_FIELDS = useMemo(() => [
        { key: "nik", label: "NIK", required: true },
        { key: "noKK", label: "No KK", required: true },
        { key: "namaLengkap", label: "Nama Lengkap", required: true },
        { key: "jenisKelamin", label: "Jenis Kelamin (L/P)", required: true },
        { key: "tempatLahir", label: "Tempat Lahir", required: true },
        { key: "tanggalLahir", label: "Tanggal Lahir", required: true },
        { key: "umur", label: "Umur", required: false },
        { key: "agama", label: "Agama", required: false },
        { key: "pendidikan", label: "Pendidikan", required: false },
        { key: "pekerjaan", label: "Pekerjaan", required: false },
        { key: "golonganDarah", label: "Golongan Darah", required: false },
        { key: "statusKawin", label: "Status Perkawinan", required: false },
        { key: "hubunganKeluarga", label: "Hubungan Keluarga", required: false },
        { key: "kewarganegaraan", label: "Kewarganegaraan", required: false },
        { key: "namaAyah", label: "Nama Ayah", required: false },
        { key: "namaIbu", label: "Nama Ibu", required: false },
        { key: "alamat", label: "Alamat Lengkap", required: true },
        { key: "rt", label: "RT", required: true },
        { key: "rw", label: "RW", required: true },
        { key: "dusun", label: "Dusun", required: true },
    ], []);

    const [formData, setFormData] = useState({
        ...DEFAULT_WARGA_FORM,
        tenantId: tenants[0]?.id || ""
    });

    const [filterIncomplete, setFilterIncomplete] = useState(false);

    const filteredResidents = useMemo(() => {
        const filtered = residents.filter(r => {
            const matchSearch = r.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                r.nik.includes(searchQuery) || 
                                (r.noKK && r.noKK.includes(searchQuery));
            const matchTenant = selectedTenant === "all" || r.tenantId === selectedTenant;
            const matchIncomplete = !filterIncomplete || isWargaDataIncomplete(r);
            return matchSearch && matchTenant && matchIncomplete;
        });

        const PENDIDIKAN_ORDER: Record<string, number> = {
            "TIDAK_SEKOLAH": 0,
            "SD": 1,
            "SMP": 2,
            "SMA": 3,
            "D3": 4,
            "S1": 5,
            "S2": 6,
            "S3": 7
        };

        return [...filtered].sort((a, b) => {
            if (sortBy === "kk") {
                const kkA = a.noKK || "";
                const kkB = b.noKK || "";
                if (kkA !== kkB) return kkA.localeCompare(kkB);
                const roleOrder: Record<string, number> = {
                    "KEPALA_KELUARGA": 0,
                    "ISTRI": 1,
                    "ANAK": 2,
                    "MERTUA": 3,
                    "ORANG_TUA": 4,
                    "LAINNYA": 5
                };
                const orderA = roleOrder[a.hubunganKeluarga] ?? 99;
                const orderB = roleOrder[b.hubunganKeluarga] ?? 99;
                return orderA - orderB;
            }
            if (sortBy === "umur-asc") {
                const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
                const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
                return dateB - dateA; // Youngest first (most recent date)
            }
            if (sortBy === "umur-desc") {
                const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
                const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
                return dateA - dateB; // Oldest first
            }
            if (sortBy === "pendidikan") {
                const orderA = PENDIDIKAN_ORDER[a.pendidikan || ""] ?? -1;
                const orderB = PENDIDIKAN_ORDER[b.pendidikan || ""] ?? -1;
                return orderB - orderA; // Higher education first
            }
            return a.namaLengkap.localeCompare(b.namaLengkap);
        });
    }, [residents, searchQuery, selectedTenant, filterIncomplete, sortBy]);

    // Reset page index on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTenant]);

    const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

    const paginatedResidents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredResidents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredResidents, currentPage, itemsPerPage]);

    const handleOpenModal = (resident?: any) => {
        if (resident) {
            setEditingResident(resident);
            setFormData({
                nik: resident.nik || "",
                noKK: resident.noKK || "",
                namaLengkap: resident.namaLengkap || "",
                jenisKelamin: resident.jenisKelamin || "LAKI_LAKI",
                tempatLahir: resident.tempatLahir || "",
                tanggalLahir: resident.tanggalLahir ? new Date(resident.tanggalLahir).toISOString().split('T')[0] : "",
                pekerjaan: resident.pekerjaan || "",
                agama: resident.agama || "ISLAM",
                pendidikan: resident.pendidikan || "SD",
                golonganDarah: resident.golonganDarah || "-",
                statusKawin: resident.statusKawin || "BELUM_KAWIN",
                hubunganKeluarga: resident.hubunganKeluarga || "KEPALA_KELUARGA",
                kewarganegaraan: resident.kewarganegaraan || "WNI",
                namaAyah: resident.namaAyah || "",
                namaIbu: resident.namaIbu || "",
                alamat: resident.alamat || "",
                rt: resident.rt || "",
                rw: resident.rw || "",
                dusun: resident.dusun || "",
                tenantId: resident.tenantId
            });
        } else {
            setEditingResident(null);
            setFormData({
                ...DEFAULT_WARGA_FORM,
                tenantId: selectedTenant === "all" ? tenants[0]?.id : selectedTenant
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await upsertResident({
                id: editingResident?.id,
                ...formData
            });
            if (editingResident) {
                setResidents(residents.map(r => r.id === editingResident.id ? { ...r, ...result } : r));
            } else {
                setResidents([result as any, ...residents]);
            }
            setIsModalOpen(false);
            alert("Data kependudukan berhasil disimpan!");
        } catch (error) {
            alert("Gagal menyimpan data kependudukan.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus data kependudukan ini?")) return;
        try {
            await deleteResident(id);
            setResidents(residents.filter(r => r.id !== id));
            setSelectedIds(prev => prev.filter(item => item !== id));
        } catch (error) {
            alert("Gagal menghapus data.");
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const pageIds = paginatedResidents.map(r => r.id);
            setSelectedIds(pageIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const msg = `Apakah Anda yakin ingin menghapus ${selectedIds.length} data warga terpilih secara permanen?`;
        if (!confirm(msg)) return;

        try {
            setIsSaving(true);
            await bulkDeleteResidents(selectedIds);
            setResidents(prev => prev.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
            alert("Data terpilih berhasil dihapus!");
        } catch (error) {
            alert("Gagal menghapus data terpilih.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetAll = async () => {
        const tenantName = selectedTenant === "all" ? "Semua Desa" : tenants.find(t => t.id === selectedTenant)?.name || "Desa Terpilih";
        const msg = `⚠️ PERINGATAN CRITICAL ⚠️\n\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA warga untuk wilayah [${tenantName}] secara permanen?\n\nTindakan ini tidak dapat dibatalkan!`;
        if (!confirm(msg)) return;

        const doubleConfirm = prompt(`Ketik "HAPUS SEMUA DATA" untuk mengonfirmasi tindakan ini:`);
        if (doubleConfirm !== "HAPUS SEMUA DATA") {
            alert("Konfirmasi gagal. Penghapusan dibatalkan.");
            return;
        }

        try {
            setIsSaving(true);
            const res = await deleteAllResidents(selectedTenant);
            setResidents(prev => {
                if (selectedTenant === "all") return [];
                return prev.filter(r => r.tenantId !== selectedTenant);
            });
            setSelectedIds([]);
            alert(`Berhasil menghapus seluruh data kependudukan (${res.count} jiwa)!`);
        } catch (error) {
            alert("Gagal menghapus data.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        const tenantName = selectedTenant === "all" ? "DESA CIIMANGGU I" : tenants.find(t => t.id === selectedTenant)?.name.toUpperCase() || "DESA CIIMANGGU I";
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Gagal membuka jendela cetak. Pastikan pop-up blocker Anda dinonaktifkan.");
            return;
        }

        let pageStyleSize = "A4 landscape";
        if (paperSize === "F4") {
            pageStyleSize = "330mm 215mm";
        } else if (paperSize === "LEGAL") {
            pageStyleSize = "355.6mm 215.9mm";
        }

        const tableRows = filteredResidents.map((r, index) => {
            // Age calculation
            let ageStr = "-";
            if (r.tanggalLahir) {
                const dob = new Date(r.tanggalLahir);
                if (!isNaN(dob.getTime())) {
                    const today = new Date();
                    let years = today.getFullYear() - dob.getFullYear();
                    let months = today.getMonth() - dob.getMonth();
                    let days = today.getDate() - dob.getDate();
                    if (days < 0) {
                        months--;
                        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                        days += prevMonth.getDate();
                    }
                    if (months < 0) {
                        years--;
                        months += 12;
                    }
                    ageStr = `${years} Tahun, ${months} Bulan, ${days} Hari`;
                }
            }

            // Date birth formatting (M/D/YYYY)
            let dobFormatted = "-";
            if (r.tanggalLahir) {
                const dob = new Date(r.tanggalLahir);
                if (!isNaN(dob.getTime())) {
                    dobFormatted = `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`;
                }
            }

            // Gender mapping
            const genderStr = r.jenisKelamin === "LAKI_LAKI" ? "LAKI-LAKI" : "PEREMPUAN";

            // Status Perkawinan mapping
            let statusKawinStr = "-";
            if (r.statusKawin === "KAWIN") statusKawinStr = "KAWIN";
            else if (r.statusKawin === "BELUM_KAWIN") statusKawinStr = "BELUM KAWIN";
            else if (r.statusKawin === "CERAI_HIDUP") statusKawinStr = "CERAI HIDUP";
            else if (r.statusKawin === "CERAI_MATI") statusKawinStr = "CERAI MATI";

            return `
                <tr>
                    <td style="font-family: monospace; text-align: center;">${r.nik}</td>
                    <td style="font-family: monospace; text-align: center;">${r.noKK}</td>
                    <td>${r.namaLengkap.toUpperCase()}</td>
                    <td style="text-align: center;">${genderStr}</td>
                    <td>${(r.tempatLahir || "BOGOR").toUpperCase()}</td>
                    <td style="text-align: center;">${dobFormatted}</td>
                    <td style="white-space: nowrap;">${ageStr}</td>
                    <td style="text-align: center;">${r.agama.toUpperCase()}</td>
                    <td style="text-align: center;">${(r.pendidikan || "SD").toUpperCase()}</td>
                    <td>${(r.pekerjaan || "BELUM BEKERJA").toUpperCase()}</td>
                    <td style="text-align: center;">${(r.golonganDarah || "-").toUpperCase()}</td>
                    <td style="text-align: center;">${statusKawinStr}</td>
                    <td>${r.hubunganKeluarga.replace(/_/g, " ").toUpperCase()}</td>
                    <td style="text-align: center;">${r.kewarganegaraan.toUpperCase()}</td>
                    <td>${(r.namaAyah || "-").toUpperCase()}</td>
                    <td>${(r.namaIbu || "-").toUpperCase()}</td>
                    <td>${(r.alamat || "-").toUpperCase()}</td>
                    <td style="text-align: center;">${r.rt}</td>
                    <td style="text-align: center;">${r.rw}</td>
                    <td>${(r.dusun || "-").toUpperCase()}</td>
                </tr>
            `;
        }).join("");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Buku Induk Kependudukan - ${tenantName}</title>
                    <style>
                        @page {
                            size: ${pageStyleSize};
                            margin: 10mm;
                        }
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 8px;
                            color: #000;
                            margin: 0;
                            padding: 0;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .header h1 {
                            font-size: 14px;
                            font-weight: bold;
                            margin: 0;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 7.5px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 4px 3px;
                        }
                        th {
                            font-weight: bold;
                            text-align: center;
                            text-transform: uppercase;
                        }
                        .highlight-header {
                            background-color: #ffff00 !important; /* Bright Yellow like spreadsheet */
                            color: #000;
                            font-size: 8px;
                        }
                        tr:nth-child(even) {
                            background-color: #fcfcfc;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>BUKU INDUK KEPENDUDUKAN ${tenantName}</h1>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th class="highlight-header">NIK</th>
                                <th class="highlight-header">NO KK</th>
                                <th class="highlight-header">NAMA LENGKAP</th>
                                <th class="highlight-header">JENIS KELAMIN</th>
                                <th class="highlight-header">TEMPAT LAHIR</th>
                                <th class="highlight-header">TANGGAL LAHIR</th>
                                <th class="highlight-header">UMUR</th>
                                <th class="highlight-header">AGAMA</th>
                                <th class="highlight-header">PENDIDIKAN</th>
                                <th class="highlight-header">PEKERJAAN</th>
                                <th class="highlight-header">GOL. DARAH</th>
                                <th class="highlight-header">STATUS PERKAWINAN</th>
                                <th class="highlight-header">HUBUNGAN KELUARGA</th>
                                <th class="highlight-header">KEWARGA NEGARAAN</th>
                                <th class="highlight-header">NAMA AYAH</th>
                                <th class="highlight-header">NAMA IBU</th>
                                <th class="highlight-header">KP</th>
                                <th class="highlight-header">RT</th>
                                <th class="highlight-header">RW</th>
                                <th class="highlight-header">DUSUN</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formData.tenantId) {
            alert("Pilih file dan tenant tujuan terlebih dahulu.");
            return;
        }

        setIsImporting(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer as any);
            const worksheet = workbook.worksheets[0];
            
            const rawRows: any[][] = [];
            worksheet.eachRow({ includeEmpty: true }, (row) => {
                const rowValues: any[] = [];
                const maxCol = row.cellCount;
                for (let colNum = 1; colNum <= maxCol; colNum++) {
                    const cell = row.getCell(colNum);
                    rowValues.push(cell.text !== undefined && cell.text !== null ? cell.text : "");
                }
                rawRows.push(rowValues);
            });

            const { headers, data } = processRawSheetData(rawRows);
            if (headers.length === 0) {
                alert("Data kosong atau tidak memiliki header.");
                return;
            }

            setExcelHeaders(headers);
            setExcelData(data);

            // Robust Auto-Match logic using synonyms
            const initialMapping: Record<string, string> = {};
            DB_FIELDS.forEach(field => {
                const synonyms = fieldSynonyms[field.key] || [];
                
                // 1. Exact match
                let match = headers.find(h => {
                    const cleanH = h.trim().toLowerCase();
                    return synonyms.some(syn => cleanH === syn);
                });
                
                // 2. Inclusion match
                if (!match) {
                    match = headers.find(h => {
                        const cleanH = h.trim().toLowerCase();
                        // Only match if the spreadsheet header contains the synonym.
                        // This prevents false positives like "NAMA" matching "namaAyah" / "namaIbu".
                        return synonyms.some(syn => cleanH.includes(syn));
                    });
                }
                
                if (match) {
                    initialMapping[field.key] = match;
                }
            });

            // Special Case: TEMPAT, TGL. LAHIR (Merged header splitting)
            const tempatHeader = initialMapping["tempatLahir"];
            if (tempatHeader) {
                const cleanT = tempatHeader.toLowerCase();
                if (cleanT.includes("tempat") && (cleanT.includes("tgl") || cleanT.includes("tanggal") || cleanT.includes("lahir"))) {
                    const idx = headers.indexOf(tempatHeader);
                    if (idx !== -1 && idx + 1 < headers.length) {
                        initialMapping["tanggalLahir"] = headers[idx + 1];
                    }
                }
            }

            setColumnMapping(initialMapping);
            setImportStep("MAPPING");

        } catch (error) {
            alert("Gagal membaca file Excel. Pastikan format sesuai.");
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const handleImportGoogleSheet = async () => {
        const rawId = spreadsheetId.trim();
        if (!rawId || !sheetRange.trim() || !formData.tenantId) {
            alert("Harap isi Spreadsheet ID, Range, dan pilih tenant tujuan.");
            return;
        }

        // Auto-extract Spreadsheet ID if a full URL is provided
        let targetId = rawId;
        const urlMatch = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (urlMatch && urlMatch[1]) {
            targetId = urlMatch[1];
        }

        setIsImporting(true);
        try {
            const rows = await fetchGoogleSheetData(targetId, sheetRange.trim());
            if (!rows || rows.length === 0) {
                alert("Data kosong atau tidak memiliki header.");
                return;
            }

            const { headers, data } = processRawSheetData(rows);
            if (headers.length === 0) {
                alert("Data kosong atau tidak memiliki header.");
                return;
            }

            setExcelHeaders(headers);
            setExcelData(data);

            // Robust Auto-Match logic using synonyms
            const initialMapping: Record<string, string> = {};
            DB_FIELDS.forEach(field => {
                const synonyms = fieldSynonyms[field.key] || [];
                
                // 1. Exact match
                let match = headers.find(h => {
                    const cleanH = h.trim().toLowerCase();
                    return synonyms.some(syn => cleanH === syn);
                });
                
                // 2. Inclusion match
                if (!match) {
                    match = headers.find(h => {
                        const cleanH = h.trim().toLowerCase();
                        // Only match if the spreadsheet header contains the synonym.
                        return synonyms.some(syn => cleanH.includes(syn));
                    });
                }
                
                if (match) {
                    initialMapping[field.key] = match;
                }
            });

            // Special Case: TEMPAT, TGL. LAHIR (Merged header splitting)
            const tempatHeader = initialMapping["tempatLahir"];
            if (tempatHeader) {
                const cleanT = tempatHeader.toLowerCase();
                if (cleanT.includes("tempat") && (cleanT.includes("tgl") || cleanT.includes("tanggal") || cleanT.includes("lahir"))) {
                    const idx = headers.indexOf(tempatHeader);
                    if (idx !== -1 && idx + 1 < headers.length) {
                        initialMapping["tanggalLahir"] = headers[idx + 1];
                    }
                }
            }

            setColumnMapping(initialMapping);
            setImportStep("MAPPING");

        } catch (error: any) {
            alert(error.message || "Gagal mengambil data dari Google Sheets. Pastikan ID dan range sesuai.");
        } finally {
            setIsImporting(false);
        }
    };

    const executeImport = async () => {
        setIsImporting(true);
        try {
            // Helper for cleaning numeric strings like NIK and KK
            const cleanNumeric = (val: any) => {
                if (val === undefined || val === null) return "";
                return String(val).replace(/['`\s\-_]/g, "").trim();
            };

            // Helper for robust Date parsing
            const parseDate = (val: any): Date => {
                if (!val) return new Date("1970-01-01");
                if (val instanceof Date) return val;
                
                const str = String(val).trim();
                if (!str) return new Date("1970-01-01");
                
                if (/^\d+(\.\d+)?$/.test(str)) {
                    const serial = parseFloat(str);
                    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                    const msPerDay = 24 * 60 * 60 * 1000;
                    return new Date(excelEpoch.getTime() + serial * msPerDay);
                }
                
                const parsed = Date.parse(str);
                if (!isNaN(parsed)) return new Date(parsed);
                
                const parts = str.split(/[-\/.]/);
                if (parts.length === 3) {
                    if (parts[0].length === 4) {
                        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    } else if (parts[2].length === 4) {
                        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                    } else if (parts[2].length === 2) {
                        const yr = parseInt(parts[2], 10) + (parseInt(parts[2], 10) > 30 ? 1900 : 2000);
                        return new Date(yr, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                    }
                }
                return new Date("1970-01-01");
            };

            const normalizeStatusKawin = (val: any): string => {
                const s = String(val || "").toUpperCase().trim();
                if (s === "B" || s.includes("BELUM")) return "BELUM_KAWIN";
                if (s === "K" || s === "KAWIN" || s === "S" || s.includes("NIKAH")) return "KAWIN";
                if (s.includes("CERAI HIDUP") || s === "CH") return "CERAI_HIDUP";
                if (s.includes("CERAI MATI") || s === "CM") return "CERAI_MATI";
                return "BELUM_KAWIN";
            };

            const normalizeHubunganKeluarga = (val: any): string => {
                const h = String(val || "").toUpperCase().trim();
                if (h.includes("KEPALA") || h === "KK") return "KEPALA_KELUARGA";
                if (h.includes("ISTRI")) return "ISTRI";
                if (h.includes("ANAK")) return "ANAK";
                if (h.includes("MERTUA")) return "MERTUA";
                if (h.includes("MENANTU")) return "MENANTU";
                if (h.includes("CUCU")) return "CUCU";
                if (h.includes("ORANG TUA") || h.includes("ORTU")) return "ORANG_TUA";
                if (h.includes("FAMILI") || h.includes("LAIN")) return "FAMILI_LAIN";
                if (h.includes("PEMBANTU")) return "PEMBANTU";
                return "KEPALA_KELUARGA";
            };

            const normalizeKewarganegaraan = (val: any): string => {
                const k = String(val || "").toUpperCase().trim();
                if (k.includes("WNA") || k === "2") return "WNA";
                return "WNI";
            };

            // Helper to automatically look up Dusun name from RT/RW and villageStructure
            const getResolvedDusun = (rtVal: string, rwVal: string): string => {
                if (!villageStructure || !villageStructure.dusun) return "";
                const cleanRt = String(rtVal).replace(/^0+/, "").trim();
                const cleanRw = String(rwVal).replace(/^0+/, "").trim();
                
                for (const d of villageStructure.dusun) {
                    if (!d.rw) continue;
                    for (const r of d.rw) {
                        const currentRwClean = String(r.name).replace(/^0+/, "").trim();
                        if (currentRwClean === cleanRw) {
                            if (r.rt) {
                                const hasRt = r.rt.some((rtName: string) => 
                                    String(rtName).replace(/^0+/, "").trim() === cleanRt
                                );
                                if (hasRt) return d.name;
                            }
                        }
                    }
                }
                if (villageStructure.dusun.length > 0) {
                    return villageStructure.dusun[0].name;
                }
                return "";
            };

            const formattedData = excelData.map(row => {
                // Check if the row has any content to avoid importing blank rows
                const hasAnyContent = Object.values(row).some(val => val !== undefined && val !== null && String(val).trim() !== "");
                if (!hasAnyContent) return null;

                const nameRaw = String(row[columnMapping['namaLengkap']] || "").trim();
                const nikRaw = cleanNumeric(row[columnMapping['nik']]);
                
                // If it's a completely empty data row (e.g. has some border but no name/nik), skip it
                if (!nameRaw && !nikRaw) return null;

                // Auto-generate temporary NIK if missing or too short
                let nik = nikRaw;
                if (!nik || nik.length < 10) {
                    nik = "TEMP-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().substring(9);
                }

                // Auto-generate temporary No KK if missing
                let noKK = cleanNumeric(row[columnMapping['noKK']]);
                if (!noKK) {
                    noKK = "TEMP-KK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
                }

                const namaLengkap = nameRaw || "WARGA TANPA NAMA";
                
                const jkRaw = String(row[columnMapping['jenisKelamin']] || "").toUpperCase();
                const jk = jkRaw === "L" || jkRaw === "LAKI-LAKI" || jkRaw === "LAKI_LAKI" ? "LAKI_LAKI" : "PEREMPUAN";
                
                const tempatLahir = String(row[columnMapping['tempatLahir']] || "Belum Diisi").trim();
                const tanggalLahir = parseDate(row[columnMapping['tanggalLahir']]);
                const agama = String(row[columnMapping['agama']] || "ISLAM").toUpperCase().trim();
                const pendidikan = String(row[columnMapping['pendidikan']] || "Belum Diisi").trim();
                const pekerjaan = String(row[columnMapping['pekerjaan']] || "Belum Diisi").trim();
                const golonganDarah = String(row[columnMapping['golonganDarah']] || "-").trim();
                
                const statusKawin = normalizeStatusKawin(row[columnMapping['statusKawin']]);
                const hubunganKeluarga = normalizeHubunganKeluarga(row[columnMapping['hubunganKeluarga']]);
                const kewarganegaraan = normalizeKewarganegaraan(row[columnMapping['kewarganegaraan']]);
                
                const namaAyah = String(row[columnMapping['namaAyah']] || "Belum Diisi").trim();
                const namaIbu = String(row[columnMapping['namaIbu']] || "Belum Diisi").trim();
                const alamat = String(row[columnMapping['alamat']] || "Belum Diisi").trim();
                
                const rt = cleanNumeric(row[columnMapping['rt']]) || "001";
                const rw = cleanNumeric(row[columnMapping['rw']]) || "001";
                
                // Resolve Dusun
                let dusun = String(row[columnMapping['dusun']] || "").trim();
                if (!dusun) {
                    dusun = getResolvedDusun(rt, rw);
                }
                if (!dusun) {
                    dusun = "Dusun I";
                }

                return {
                    nik,
                    noKK,
                    namaLengkap,
                    jenisKelamin: jk,
                    tempatLahir,
                    tanggalLahir,
                    agama,
                    pendidikan,
                    pekerjaan,
                    golonganDarah,
                    statusKawin,
                    hubunganKeluarga,
                    kewarganegaraan,
                    namaAyah,
                    namaIbu,
                    alamat,
                    rt,
                    rw,
                    dusun
                };
            }).filter((item): item is NonNullable<typeof item> => item !== null);

            if (formattedData.length === 0) {
                alert("Tidak ada data warga valid untuk diimpor. Pastikan file tidak kosong.");
                setIsImporting(false);
                return;
            }

            await bulkImportResidents(formattedData, formData.tenantId);
            alert(`Berhasil mengimpor ${formattedData.length} data kependudukan!`);
            window.location.reload(); 
        } catch (error: any) {
            console.error("Import Error: ", error);
            alert(`Gagal mengimpor data kependudukan. Detail: ${error?.message || "Kesalahan database"}`);
            setIsImporting(false);
        }
    };

    const closeImportModal = () => {
        if (isImporting) return;
        setIsImportOpen(false);
        setTimeout(() => {
            setImportStep("UPLOAD");
            setExcelData([]);
            setExcelHeaders([]);
            setColumnMapping({});
            setImportSource("FILE");
            setSpreadsheetId("");
            setSheetRange("Sheet1!A1:Z500");
        }, 300);
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* HEADER SECTION */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Fingerprint size={12} /> Big Data Kependudukan
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Citizen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Database</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Manajemen terpusat data kependudukan desa digital. Data ini terintegrasi otomatis dengan pendaftaran akun warga.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari NIK, KK, atau Nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-slate-200/40"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex items-center">
                            <select 
                                value={paperSize}
                                onChange={(e) => setPaperSize(e.target.value)}
                                className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 pl-5 pr-8 py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-emerald-100/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none"
                            >
                                <option value="A4">A4 (Landscape)</option>
                                <option value="F4">F4 / Folio</option>
                                <option value="LEGAL">Legal (Landscape)</option>
                            </select>
                            <span className="absolute right-3.5 pointer-events-none text-emerald-600/80 text-[10px] font-black">▼</span>
                        </div>
                        <button 
                            onClick={handlePrint}
                            className="bg-emerald-600 text-white border border-emerald-600/20 px-6 py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-emerald-600/10 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Cetak Buku Induk
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={handleResetAll}
                            className="bg-rose-50 text-rose-600 border border-rose-100/50 px-6 py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-rose-100/10 hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Hapus Semua
                        </button>
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="bg-slate-100 text-slate-700 px-6 py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-slate-200/20 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Upload size={18} /> Import
                        </button>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="bg-slate-950 text-white px-8 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-950/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            <Plus size={20} /> Tambah Data
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-transparent">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Wilayah:</span>
                    <select 
                        value={selectedTenant}
                        onChange={e => setSelectedTenant(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer"
                    >
                        <option value="all">Semua Desa</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-transparent">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutkan:</span>
                    <select 
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer"
                    >
                        <option value="default">Nama (A-Z)</option>
                        <option value="kk">No Kartu Keluarga</option>
                        <option value="umur-desc">Umur (Tua ke Muda)</option>
                        <option value="umur-asc">Umur (Muda ke Tua)</option>
                        <option value="pendidikan">Pendidikan</option>
                    </select>
                </div>
                {selectedIds.length > 0 && (
                    <button 
                        disabled={isSaving}
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100/50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                    >
                        <Trash2 size={12} /> Hapus Terpilih ({selectedIds.length})
                    </button>
                )}
                <div className="flex-1" />
                <button 
                    onClick={() => setFilterIncomplete(prev => !prev)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        filterIncomplete 
                            ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/10" 
                            : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                    }`}
                >
                    <AlertCircle size={12} /> Perlu Lengkap ({residents.filter(isWargaDataIncomplete).length})
                </button>
                <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    Total: {filteredResidents.length} Jiwa
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="pl-10 pr-4 py-8 w-12">
                                    <input 
                                        type="checkbox" 
                                        checked={paginatedResidents.length > 0 && paginatedResidents.every(r => selectedIds.includes(r.id))}
                                        onChange={handleSelectAll}
                                        className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biodata Lengkap</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NIK & NO KK</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domisili</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Keluarga</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedResidents.map((r) => (
                                <tr key={r.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                    <td className="pl-10 pr-4 py-8">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(r.id)}
                                            onChange={() => handleSelectOne(r.id)}
                                            className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${r.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {r.namaLengkap.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none mb-1">{r.namaLengkap}</span>
                                                    {isWargaDataIncomplete(r) && (
                                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                                                            <AlertCircle size={10} /> Belum Lengkap
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={12} className="text-slate-300" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{r.pekerjaan || "BELUM BEKERJA"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl w-fit">
                                                <Fingerprint size={12} className="text-slate-400" />
                                                <code className="text-[11px] font-mono font-black text-slate-600"><HoverMask value={r.nik} /></code>
                                            </div>
                                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-xl w-fit">
                                                <Home size={12} className="text-amber-500" />
                                                <code className="text-[11px] font-mono font-black text-amber-700"><HoverMask value={r.noKK} /></code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-600 line-clamp-1 max-w-[200px]">{r.alamat}</p>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className="text-blue-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatWilayah(r.rt, r.rw, r.dusun)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 text-[9px] font-black rounded-lg uppercase border border-purple-100">
                                                <Users2 size={10} /> {r.hubunganKeluarga.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Heart size={10} className="text-rose-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.statusKawin.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            <button onClick={() => handleOpenModal(r)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden p-5 md:p-8 space-y-6 bg-slate-50/50">
                    {paginatedResidents.map((r) => (
                        <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 space-y-6 active:scale-95 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(r.id)}
                                        onChange={() => handleSelectOne(r.id)}
                                        className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${r.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {r.namaLengkap.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 leading-none mb-1">{r.namaLengkap}</p>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{r.tenant.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(r)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">NIK / KK</p>
                                    <p className="text-[11px] font-mono font-black text-slate-600 tracking-tight"><HoverMask value={r.nik} /></p>
                                    <p className="text-[11px] font-mono font-black text-amber-600 tracking-tight"><HoverMask value={r.noKK} /></p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Hub. Keluarga</p>
                                    <p className="text-[10px] font-black uppercase text-slate-600">{r.hubunganKeluarga.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8 bg-slate-50/50 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tampilkan:</span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={e => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }} 
                                    className="bg-transparent border-none p-0 text-xs font-black text-slate-700 focus:ring-0 cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <span className="text-xs font-bold text-slate-400">
                                Menampilkan {filteredResidents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(filteredResidents.length, currentPage * itemsPerPage)} dari {filteredResidents.length} warga
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-100 transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (currentPage > 3 && totalPages > 5) {
                                    if (currentPage + 2 <= totalPages) {
                                        pageNum = currentPage - 3 + i + 1;
                                    } else {
                                        pageNum = totalPages - 5 + i + 1;
                                    }
                                }
                                return (
                                    <button 
                                        key={pageNum}
                                        type="button"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-blue-500/10' : 'bg-white border border-slate-100 text-slate-600 hover:text-blue-600 hover:border-blue-100'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button 
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-100 transition-all shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* EPIC MODAL - FULL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSaving && setIsModalOpen(false)} />
                    
                    <div className="bg-white rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl w-full max-w-5xl relative overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] animate-in slide-in-from-bottom duration-500">
                        <div className="bg-slate-950 p-10 md:p-12 text-white relative shrink-0">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{editingResident ? "Update Citizen" : "New Resident"}</h2>
                                    <p className="text-blue-400 text-[10px] font-black mt-4 uppercase tracking-[0.3em]">Official Demographic Registration Terminal</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20"><FileSpreadsheet size={16} /></div>
                                    Form Isian Warga (Sesuai Kolom Buku Induk)
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {WARGA_FIELDS.map((field) => {
                                        const Icon = FieldIconMap[field.key] || User;
                                        if (field.key === "dusun") {
                                            return (
                                                <FormGroup key={field.key} label={field.label} icon={Icon}>
                                                    <select 
                                                        required={field.required}
                                                        value={formData.dusun} 
                                                        onChange={e => setFormData({...formData, dusun: e.target.value, rw: "", rt: ""})} 
                                                        className="form-input-premium appearance-none animate-in fade-in"
                                                    >
                                                        <option value="">- Pilih Dusun -</option>
                                                        {villageStructure.dusun.map(d => (
                                                            <option key={d.name} value={d.name}>{formatDusun(d.name)}</option>
                                                        ))}
                                                    </select>
                                                </FormGroup>
                                            );
                                        }
                                        if (field.key === "rw") {
                                            return (
                                                <FormGroup key={field.key} label={field.label} icon={Icon}>
                                                    <select 
                                                        required={field.required}
                                                        value={formData.rw} 
                                                        onChange={e => setFormData({...formData, rw: e.target.value, rt: ""})} 
                                                        className="form-input-premium appearance-none animate-in fade-in"
                                                        disabled={!formData.dusun}
                                                    >
                                                        <option value="">- Pilih RW -</option>
                                                        {villageStructure.dusun.find(d => d.name === formData.dusun)?.rw.map(r => (
                                                            <option key={r.name} value={r.name}>{r.name}</option>
                                                        ))}
                                                    </select>
                                                </FormGroup>
                                            );
                                        }
                                        if (field.key === "rt") {
                                            return (
                                                <FormGroup key={field.key} label={field.label} icon={Icon}>
                                                    <select 
                                                        required={field.required}
                                                        value={formData.rt} 
                                                        onChange={e => setFormData({...formData, rt: e.target.value})} 
                                                        className="form-input-premium appearance-none animate-in fade-in"
                                                        disabled={!formData.rw}
                                                    >
                                                        <option value="">- Pilih RT -</option>
                                                        {villageStructure.dusun.find(d => d.name === formData.dusun)?.rw.find(r => r.name === formData.rw)?.rt.map(rt => (
                                                            <option key={rt} value={rt}>{rt}</option>
                                                        ))}
                                                    </select>
                                                </FormGroup>
                                            );
                                        }
                                        
                                        if (field.type === "select") {
                                            return (
                                                <FormGroup key={field.key} label={field.label} icon={Icon}>
                                                    <select 
                                                        value={formData[field.key as keyof typeof formData] || ""} 
                                                        onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                                                        className="form-input-premium appearance-none animate-in fade-in"
                                                    >
                                                        {field.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </FormGroup>
                                            );
                                        }

                                        return (
                                            <FormGroup key={field.key} label={field.label} icon={Icon}>
                                                <input 
                                                    required={field.required}
                                                    type={field.type}
                                                    value={formData[field.key as keyof typeof formData] || ""} 
                                                    onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                                                    placeholder={field.placeholder} 
                                                    className="form-input-premium animate-in fade-in" 
                                                />
                                            </FormGroup>
                                        );
                                    })}

                                    <FormGroup label="Wilayah Desa (Tenant)" icon={Building}>
                                        <select required value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} className="form-input-premium appearance-none">
                                            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </FormGroup>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="pt-10 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-slate-50/0 pointer-events-none">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="pointer-events-auto flex-1 py-6 rounded-[2rem] text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white transition-all border border-transparent hover:border-slate-100">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="pointer-events-auto flex-[2] bg-slate-950 text-white py-6 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-900/30 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                                    {editingResident ? "Perbarui Data Warga" : "Simpan Data Permanen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL - Premium Layout */}
            {isImportOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={closeImportModal} />
                    <div className={`bg-white w-full rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 flex flex-col ${importStep === "UPLOAD" ? 'max-w-lg' : 'max-w-4xl h-[90vh]'}`}>
                        <div className="p-10 bg-slate-950 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Import Ecosystem</h3>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Massive Population Sync</p>
                            </div>
                            <button onClick={closeImportModal} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {importStep === "UPLOAD" && (
                            <div className="p-10 space-y-8">
                                <FormGroup label="Target Desa Destinasi" icon={Building}>
                                    <select value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} className="form-input-premium appearance-none">
                                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </FormGroup>

                                {/* Import Source Switcher */}
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setImportSource("FILE")}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            importSource === "FILE"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                        Excel File (.xlsx)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImportSource("GOOGLE_SHEET")}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            importSource === "GOOGLE_SHEET"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                        Google Sheets Sync
                                    </button>
                                </div>

                                {importSource === "FILE" ? (
                                    <div className="relative p-12 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-6 text-center group hover:border-blue-500/30 transition-all bg-slate-50/50">
                                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50">
                                            {isImporting ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800">Tarik File Excel ke Sini</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format: .xlsx (Max 50MB)</p>
                                        </div>
                                        <input type="file" accept=".xlsx" onChange={handleImportExcel} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isImporting} />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <FormGroup label="Spreadsheet ID" icon={FileSpreadsheet}>
                                            <input 
                                                type="text" 
                                                value={spreadsheetId} 
                                                onChange={e => setSpreadsheetId(e.target.value)} 
                                                placeholder="Contoh: 1BxiMVs0XRA5nFMdKvB..." 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                disabled={isImporting}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Sheet Range" icon={FileText}>
                                            <input 
                                                type="text" 
                                                value={sheetRange} 
                                                onChange={e => setSheetRange(e.target.value)} 
                                                placeholder="Contoh: Sheet1!A1:Z500" 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                disabled={isImporting}
                                            />
                                        </FormGroup>
                                        <button 
                                            type="button"
                                            onClick={handleImportGoogleSheet}
                                            disabled={isImporting}
                                            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[2rem] text-sm font-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {isImporting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                            Tarik Data dari Google Sheet
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {importStep === "MAPPING" && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    <h4 className="text-lg font-black text-slate-900">Pencocokan Kolom Data</h4>
                                    <p className="text-xs text-slate-500 mt-1">Sistem mendeteksi kolom dari file Anda. Harap cocokkan dengan field database.</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {DB_FIELDS.map(field => (
                                            <div key={field.key} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                                        {field.label}
                                                        {field.required && <span className="text-rose-500">*</span>}
                                                    </span>
                                                </div>
                                                <select 
                                                    value={columnMapping[field.key] || ""} 
                                                    onChange={e => setColumnMapping({...columnMapping, [field.key]: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                                                >
                                                    <option value="">-- Abaikan (Kosongkan) --</option>
                                                    {excelHeaders.map((h, index) => <option key={`${h}-${index}`} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
                                    <button onClick={() => setImportStep("UPLOAD")} className="px-8 py-4 rounded-3xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">Kembali</button>
                                    <button onClick={() => setImportStep("PREVIEW")} className="px-8 py-4 rounded-3xl text-sm font-black bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all">Lanjut Pratinjau</button>
                                </div>
                            </div>
                        )}

                        {importStep === "PREVIEW" && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    <h4 className="text-lg font-black text-slate-900">Pratinjau Data Kependudukan</h4>
                                    <p className="text-xs text-slate-500 mt-1">Tinjau ulang 5 data pertama sebelum menyimpan secara permanen.</p>
                                </div>
                                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                {DB_FIELDS.map(f => (
                                                    <th key={f.key} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {excelData.slice(0, 5).map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    {DB_FIELDS.map(f => {
                                                        let val = row[columnMapping[f.key]];
                                                        
                                                        // Automatically calculate age string from parsed date of birth if key is 'umur'
                                                        if (f.key === "umur") {
                                                            const dobVal = row[columnMapping['tanggalLahir']];
                                                            if (dobVal) {
                                                                const dob = parseSpreadsheetDate(dobVal);
                                                                if (!isNaN(dob.getTime())) {
                                                                    const today = new Date();
                                                                    let years = today.getFullYear() - dob.getFullYear();
                                                                    let months = today.getMonth() - dob.getMonth();
                                                                    let days = today.getDate() - dob.getDate();
                                                                    if (days < 0) {
                                                                        months--;
                                                                        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                                                                        days += prevMonth.getDate();
                                                                    }
                                                                    if (months < 0) {
                                                                        years--;
                                                                        months += 12;
                                                                    }
                                                                    val = `${years} Tahun, ${months} Bulan, ${days} Hari`;
                                                                }
                                                            }
                                                        }
                                                        
                                                        const isMissing = f.required && !val;
                                                        return (
                                                            <td key={f.key} className="px-4 py-3 text-xs font-medium text-slate-700">
                                                                {isMissing ? <span className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-1"><AlertCircle size={10}/> Kosong</span> : val || "-"}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {excelData.length > 5 && (
                                        <p className="text-center text-xs font-bold text-slate-400 mt-6">...dan {excelData.length - 5} baris lainnya.</p>
                                    )}
                                </div>
                                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
                                    <button disabled={isImporting} onClick={() => setImportStep("MAPPING")} className="px-8 py-4 rounded-3xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-50">Kembali</button>
                                    <button disabled={isImporting} onClick={executeImport} className="px-8 py-4 rounded-3xl text-sm font-black bg-slate-950 text-white shadow-xl shadow-slate-900/30 hover:bg-blue-600 transition-all flex items-center gap-3 disabled:opacity-50">
                                        {isImporting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        Mulai Import Massal ({excelData.length} Baris)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .form-input-premium {
                    width: 100%;
                    background-color: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 1.25rem;
                    padding: 1.25rem 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: #0f172a;
                    transition: all 0.3s;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .form-input-premium:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
                }
                .form-input-premium::placeholder {
                    color: #cbd5e1;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

function FormGroup({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Icon size={12} /></div>
                {label}
            </label>
            <div className="relative">
                {children}
            </div>
        </div>
    )
}

// Synonyms helper for mapping database columns
const fieldSynonyms: Record<string, string[]> = {
    nik: ["nik", "n.i.k.", "nomor induk", "nomor induk kependudukan"],
    noKK: ["kk", "no. kk", "no kk", "nomor kk", "kartu keluarga", "nomor kartu keluarga"],
    namaLengkap: ["nama", "nama lengkap", "fullname", "nama_lengkap"],
    jenisKelamin: ["jenis kelamin", "jk", "sex", "gender", "kelamin", "j.k.", "jenis_kelamin"],
    tempatLahir: ["tempat lahir", "tempat_lahir", "tmpt lahir", "tempat"],
    tanggalLahir: ["tanggal lahir", "tgl lahir", "tgl. lahir", "tanggal_lahir", "tgl", "lahir", "tanggal"],
    umur: ["umur", "usia", "age"],
    agama: ["agama", "religion"],
    pendidikan: ["pendidikan", "school", "education"],
    pekerjaan: ["pekerjaan", "job", "profession", "work"],
    golonganDarah: ["golongan darah", "gol darah", "goldar", "gol. darah", "darah"],
    statusKawin: ["status kawin", "status perkawinan", "status pernikahan", "status perka", "status"],
    hubunganKeluarga: ["hubungan keluarga", "hubungan", "shdk", "kedudukan dalam keluarga", "kedudukan keluarga", "status hubungan", "kedudukan"],
    kewarganegaraan: ["kewarganegaraan", "warga negara", "wn"],
    namaAyah: ["ayah", "nama ayah"],
    namaIbu: ["ibu", "nama ibu"],
    alamat: ["alamat", "alamat lengkap", "alamat_lengkap"],
    rt: ["rt", "r.t.", "alamat - rt", "alamat rt"],
    rw: ["rw", "r.w.", "alamat - rw", "alamat rw"],
    dusun: ["dusun", "lingkungan", "wilayah", "dusun/dukuh"]
};

// Interface for intelligent sheet parsing
interface ParsedSheetResult {
    headers: string[];
    data: Record<string, string>[];
}

// Intelligent multi-row header merging and numbering row detection
function processRawSheetData(rows: any[][]): ParsedSheetResult {
    if (!rows || rows.length === 0) {
        return { headers: [], data: [] };
    }

    // Convert all cells to string and trim
    const stringRows = rows.map(row => 
        row.map(cell => (cell !== undefined && cell !== null) ? String(cell).trim() : "")
    );

    // 1. Find the header row by scoring
    let headerRowIndex = 0;
    let maxScore = -1;
    for (let i = 0; i < Math.min(stringRows.length, 10); i++) {
        const score = getRowHeaderScore(stringRows[i]);
        if (score > maxScore) {
            maxScore = score;
            headerRowIndex = i;
        }
    }

    // Default to first row if no good header is found
    if (maxScore <= 0) {
        headerRowIndex = 0;
    }

    const mainHeaderRow = stringRows[headerRowIndex];
    const finalHeaders: string[] = [...mainHeaderRow];

    // 2. Check if the next row contains sub-headers (like RT, RW)
    const nextRowIndex = headerRowIndex + 1;
    let dataStartRowIndex = nextRowIndex;

    if (nextRowIndex < stringRows.length) {
        const nextRow = stringRows[nextRowIndex];
        // If the next row has non-empty values where the main header is empty (due to merge) or has RT/RW
        let hasSubHeaders = false;
        for (let i = 0; i < mainHeaderRow.length; i++) {
            const mainCell = mainHeaderRow[i];
            const subCell = nextRow[i] || "";
            if (subCell && (!mainCell || subCell.toLowerCase() === "rt" || subCell.toLowerCase() === "rw")) {
                hasSubHeaders = true;
                break;
            }
        }

        if (hasSubHeaders) {
            // Reconstruct headers
            let currentMainHeader = "";
            for (let i = 0; i < mainHeaderRow.length; i++) {
                if (mainHeaderRow[i]) {
                    currentMainHeader = mainHeaderRow[i];
                }
                const subCell = nextRow[i] || "";
                if (subCell) {
                    if (currentMainHeader && currentMainHeader !== subCell) {
                        finalHeaders[i] = `${currentMainHeader} - ${subCell}`;
                    } else {
                        finalHeaders[i] = subCell;
                    }
                } else {
                    finalHeaders[i] = currentMainHeader;
                }
            }
            dataStartRowIndex = nextRowIndex + 1;
        }
    }

    // Ensure all headers are unique and not empty
    const uniqueHeaders = finalHeaders.map((h, i) => {
        let name = h.trim();
        if (!name) {
            // Look left to see if it was a merged column
            let leftName = "";
            for (let j = i - 1; j >= 0; j--) {
                if (finalHeaders[j]) {
                    leftName = finalHeaders[j];
                    break;
                }
            }
            if (leftName) {
                name = `${leftName} (Kolom ${i + 1})`;
            } else {
                name = `Kolom_${i + 1}`;
            }
        }
        return name;
    });

    // Handle duplicates
    const seen: Record<string, number> = {};
    const headers = uniqueHeaders.map(h => {
        if (seen[h] !== undefined) {
            seen[h]++;
            return `${h}_${seen[h]}`;
        } else {
            seen[h] = 0;
            return h;
        }
    });

    // 3. Parse data rows
    const dataRows = stringRows.slice(dataStartRowIndex);
    const data: Record<string, string>[] = [];

    for (const row of dataRows) {
        // Skip numbering row if detected
        if (isNumberingRow(row)) {
            continue;
        }

        // Skip completely empty rows
        if (row.every(cell => !cell)) {
            continue;
        }

        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index] !== undefined ? row[index] : "";
        });
        data.push(rowData);
    }

    return { headers, data };
}

function getRowHeaderScore(row: string[]): number {
    let score = 0;
    row.forEach(cell => {
        const c = String(cell || "").trim().toLowerCase();
        if (c === "nama" || c === "nama lengkap") score += 2;
        if (c === "nik") score += 2;
        if (c === "no. kk" || c === "no kk") score += 2;
        if (c === "jenis kelamin" || c === "jk") score += 2;
        if (c === "tempat, tgl. lahir" || c === "tempat lahir") score += 2;
        if (c === "agama") score += 1;
        if (c === "pekerjaan") score += 1;
        if (c === "pendidikan") score += 1;
    });
    return score;
}

function isNumberingRow(row: string[]): boolean {
    const numbers = row.map(c => Number(String(c || "").trim())).filter(n => !isNaN(n) && n > 0);
    if (numbers.length > 4) {
        let sequential = true;
        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] !== numbers[i - 1] + 1 && numbers[i] !== numbers[i - 1]) {
                sequential = false;
                break;
            }
        }
        return sequential;
    }
    return false;
}

// Helper for robust Date parsing from Excel/Google Sheets
export function parseSpreadsheetDate(val: any): Date {
    if (!val) return new Date("1970-01-01");
    if (val instanceof Date) return val;
    
    const str = String(val).trim();
    if (!str) return new Date("1970-01-01");
    
    if (/^\d+(\.\d+)?$/.test(str)) {
        const serial = parseFloat(str);
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const msPerDay = 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + serial * msPerDay);
    }
    
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) return new Date(parsed);
    
    const parts = str.split(/[-\/.]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else if (parts[2].length === 4) {
            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        } else if (parts[2].length === 2) {
            const yr = parseInt(parts[2], 10) + (parseInt(parts[2], 10) > 30 ? 1900 : 2000);
            return new Date(yr, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
    }
    return new Date("1970-01-01");
}

