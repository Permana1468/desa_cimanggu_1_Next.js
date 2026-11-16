"use client";

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { 
    ChevronLeft, 
    ChevronRight, 
    ArrowLeft, 
    ShieldCheck, 
    Quote, 
    Instagram, 
    Facebook, 
    Youtube, 
    Phone, 
    Sparkles, 
    CheckCircle2
} from 'lucide-react';

interface AparaturItem {
    id: number;
    name: string;
    role: string;
    level: string;
    photo: string;
    motto: string;
    uniformType: string;
    tupoksi: string[];
    // Supercell Stage 1 Card Theme
    cardBg: string;
    cardTextColor: string;
    cardTagColor: string;
    // Stage 2 Detail Theme
    detailBg: string;
    textColor: string;
    subtextColor: string;
    accentColor: string;
    badgeStyle: string;
    btnStyle: string;
    auraGlow: string;
    isLightTheme: boolean;
}

interface CampoSantoOrganisasiProps {
    siteData?: any;
    orgData?: any;
    uiConfig?: any;
    onBackToHero?: () => void;
}

// Helper to provide distinctive styling, mottos, and tupoksi based on role
function getOfficialTheme(roleOrPosition: string, index: number) {
    const r = (roleOrPosition || "").toLowerCase();
    
    if (r.includes('kades') || r.includes('kepala desa')) {
        return {
            level: "PIMPINAN PEMERINTAH DESA",
            uniformType: "Seragam PDU Putih Resmi",
            cardBg: "bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 shadow-[0_15px_35px_rgba(245,158,11,0.4)]",
            cardTextColor: "text-slate-950",
            cardTagColor: "text-slate-900/80 font-bold",
            detailBg: "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]",
            textColor: "text-slate-900",
            subtextColor: "text-slate-700",
            accentColor: "text-amber-700",
            badgeStyle: "bg-amber-100 text-amber-900 border-amber-400/60 shadow-sm",
            btnStyle: "bg-slate-900 text-white hover:bg-amber-600 shadow-xl",
            auraGlow: "rgba(245, 158, 11, 0.25)",
            isLightTheme: true,
            defaultMotto: "Mengabdi dengan ketulusan hati, menjunjung tinggi integritas, serta menghadirkan transparansi dan pelayanan digital terbaik untuk seluruh warga Desa Cimanggu I.",
            defaultTupoksi: [
                "Menyelenggarakan Pemerintahan Desa, melaksanakan Pembangunan Desa, pembinaan kemasyarakatan, dan pemberdayaan masyarakat.",
                "Memimpin dan bertanggung jawab penuh atas tata kelola APBDes serta transparansi anggaran desa.",
                "Menetapkan Peraturan Desa bersama BPD dan mengawasi implementasi Sistem Digitalisasi Desa (SDD)."
            ]
        };
    }
    
    if (r.includes('sekdes') || r.includes('sekretaris')) {
        return {
            level: "PIMPINAN ADMINISTRASI DESA",
            uniformType: "Seragam Jas Royal Navy",
            cardBg: "bg-gradient-to-b from-blue-500 via-indigo-600 to-indigo-800 shadow-[0_15px_35px_rgba(59,130,246,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-cyan-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0284c7]",
            textColor: "text-white",
            subtextColor: "text-cyan-100/90",
            accentColor: "text-cyan-300",
            badgeStyle: "bg-cyan-950/80 text-cyan-300 border-cyan-400/50",
            btnStyle: "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black hover:from-cyan-400 hover:to-blue-500 shadow-xl",
            auraGlow: "rgba(6, 182, 212, 0.4)",
            isLightTheme: false,
            defaultMotto: "Mewujudkan tertib administrasi yang akuntabel, efisien, dan modern berbasis teknologi geospasial demi kecepatan pelayanan warga.",
            defaultTupoksi: [
                "Mengordinasikan penyusunan rancangan Peraturan Desa dan Keputusan Kepala Desa.",
                "Mengelola administrasi kependudukan, arsip digital, dan operasional kantor desa.",
                "Mengawasi presensi biometrik aparatur desa (E-Absensi) dan pengumpulan data statistik kependudukan."
            ]
        };
    }

    if (r.includes('keuangan')) {
        return {
            level: "KEPALA URUSAN KEUANGAN",
            uniformType: "Seragam Dinas Khaki Emerald",
            cardBg: "bg-gradient-to-b from-emerald-500 via-teal-600 to-emerald-900 shadow-[0_15px_35px_rgba(16,185,129,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-emerald-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#0f172a]",
            textColor: "text-white",
            subtextColor: "text-emerald-100/90",
            accentColor: "text-emerald-300",
            badgeStyle: "bg-emerald-950/80 text-emerald-300 border-emerald-400/50",
            btnStyle: "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-500 shadow-xl",
            auraGlow: "rgba(16, 185, 129, 0.4)",
            isLightTheme: false,
            defaultMotto: "Setiap rupiah APBDes adalah amanah rakyat yang harus dikelola secara akuntabel, efisien, dan tepat sasaran.",
            defaultTupoksi: [
                "Mengelola administrasi keuangan desa, penerimaan, dan pengeluaran kas APBDes.",
                "Menyusun laporan pertanggungjawaban realisasi APBDes dan verifikasi bukti SPJ.",
                "Pengawasan integrasi rekening kas desa serta pelaporan keuangan digital."
            ]
        };
    }

    if (r.includes('tata usaha') || r.includes('umum')) {
        return {
            level: "KEPALA URUSAN UMUM & TU",
            uniformType: "Seragam Dinas Biru Safir",
            cardBg: "bg-gradient-to-b from-sky-500 via-blue-600 to-sky-900 shadow-[0_15px_35px_rgba(14,165,233,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-sky-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#082f49] via-[#0c4a6e] to-[#0f172a]",
            textColor: "text-white",
            subtextColor: "text-sky-100/90",
            accentColor: "text-sky-300",
            badgeStyle: "bg-sky-950/80 text-sky-300 border-sky-400/50",
            btnStyle: "bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-black hover:from-sky-400 hover:to-blue-500 shadow-xl",
            auraGlow: "rgba(14, 165, 233, 0.4)",
            isLightTheme: false,
            defaultMotto: "Menata arsip, logistik operasional balai desa, dan korespondensi kedinasan yang rapi, cepat, dan terorganisir.",
            defaultTupoksi: [
                "Mengelola tata naskah dinas, ekspedisi persuratan, dan kearsipan elektronik desa.",
                "Menyusun inventarisasi aset dan kekayaan milik Pemerintah Desa Cimanggu I.",
                "Menyiapkan kelengkapan rapat kedinasan dan sarana prasarana operasional kantor."
            ]
        };
    }

    if (r.includes('perencanaan')) {
        return {
            level: "KEPALA URUSAN PERENCANAAN",
            uniformType: "Seragam Dinas Slate Modern",
            cardBg: "bg-gradient-to-b from-indigo-500 via-purple-600 to-slate-900 shadow-[0_15px_35px_rgba(99,102,241,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-indigo-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a]",
            textColor: "text-white",
            subtextColor: "text-indigo-100/90",
            accentColor: "text-indigo-300",
            badgeStyle: "bg-indigo-950/80 text-indigo-300 border-indigo-400/50",
            btnStyle: "bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-950 font-black hover:from-indigo-400 hover:to-purple-500 shadow-xl",
            auraGlow: "rgba(99, 102, 241, 0.4)",
            isLightTheme: false,
            defaultMotto: "Merencanakan pembangunan desa berbasis data faktual, kebutuhan riil warga, dan prinsip keberlanjutan.",
            defaultTupoksi: [
                "Menyusun dokumen perencanaan desa (RPJMDes dan RKPDes) serta memfasilitasi Musrenbangdes.",
                "Menghimpun dan mengolah data geospasial profil pembangunan wilayah.",
                "Menyusun evaluasi dan pelaporan berkala program kerja tahunan desa."
            ]
        };
    }

    if (r.includes('pemerintahan')) {
        return {
            level: "KEPALA SEKSI PEMERINTAHAN",
            uniformType: "Seragam Batik Terracotta Sunset",
            cardBg: "bg-gradient-to-b from-red-500 via-rose-600 to-rose-900 shadow-[0_15px_35px_rgba(244,63,94,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-amber-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#450a0a] via-[#2a081a] to-[#7c2d12]",
            textColor: "text-white",
            subtextColor: "text-amber-100/90",
            accentColor: "text-amber-300",
            badgeStyle: "bg-amber-950/80 text-amber-300 border-amber-400/50",
            btnStyle: "bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black hover:from-amber-400 hover:to-red-500 shadow-xl",
            auraGlow: "rgba(245, 158, 11, 0.4)",
            isLightTheme: false,
            defaultMotto: "Melayani tata ruang dan batas wilayah dengan keadilan, kepastian hukum, serta akurasi pemetaan geospasial WebGIS.",
            defaultTupoksi: [
                "Melaksanakan manajemen pertanahan, ketertiban umum, dan pendataan kependudukan.",
                "Pengawasan pemetaan batas wilayah RT/RW dan pembaruan data WebGIS Desa.",
                "Memfasilitasi penataan administrasi batas tanah warga dan perizinan dasar."
            ]
        };
    }

    if (r.includes('kesejahteraan')) {
        return {
            level: "KEPALA SEKSI KESEJAHTERAAN",
            uniformType: "Seragam Batik Wastra Hijau Lumut",
            cardBg: "bg-gradient-to-b from-teal-500 via-teal-700 to-emerald-950 shadow-[0_15px_35px_rgba(20,184,166,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-teal-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#134e4a] via-[#042f2e] to-[#0f172a]",
            textColor: "text-white",
            subtextColor: "text-teal-100/90",
            accentColor: "text-teal-300",
            badgeStyle: "bg-teal-950/80 text-teal-300 border-teal-400/50",
            btnStyle: "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black hover:from-teal-400 hover:to-emerald-500 shadow-xl",
            auraGlow: "rgba(20, 184, 166, 0.4)",
            isLightTheme: false,
            defaultMotto: "Mendorong pembangunan infrastruktur desa yang bermutu serta memajukan perekonomian dan kesejahteraan warga tani.",
            defaultTupoksi: [
                "Mengawal pelaksanaan pembangunan sarana prasarana fisik dan infrastruktur lingkungan.",
                "Melakukan pembinaan kegiatan kepemudaan, keolahragaan, seni budaya, dan keagamaan.",
                "Mendorong pengembangan sektor pertanian, ketahanan pangan, dan pemberdayaan ekonomi masyarakat."
            ]
        };
    }

    if (r.includes('pelayanan')) {
        return {
            level: "KEPALA SEKSI PELAYANAN",
            uniformType: "Seragam Jas Slate Modern",
            cardBg: "bg-gradient-to-b from-amber-600 via-orange-600 to-stone-900 shadow-[0_15px_35px_rgba(217,119,6,0.4)]",
            cardTextColor: "text-white",
            cardTagColor: "text-amber-200/90 font-bold",
            detailBg: "bg-gradient-to-br from-[#451a03] via-[#292524] to-[#0c0a09]",
            textColor: "text-white",
            subtextColor: "text-amber-100/90",
            accentColor: "text-amber-300",
            badgeStyle: "bg-amber-950/80 text-amber-300 border-amber-400/50",
            btnStyle: "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black hover:from-amber-400 hover:to-orange-500 shadow-xl",
            auraGlow: "rgba(245, 158, 11, 0.4)",
            isLightTheme: false,
            defaultMotto: "Memberikan pelayanan sosial dan kesehatan masyarakat yang tanggap, ramah, serta inklusif bagi seluruh lapisan warga.",
            defaultTupoksi: [
                "Melaksanakan pembinaan pelayanan kesehatan masyarakat (Posyandu & E-KMS).",
                "Memfasilitasi pengajuan bantuan sosial (Bansos, PKH, UHC) dan surat keterangan kependudukan.",
                "Pemberdayaan kelompok usaha warga dan perlindungan sosial kemasyarakatan."
            ]
        };
    }

    // Default for Kepala Dusun (Kadus) or any other position:
    const palette = [
        {
            bg: "bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900 shadow-[0_15px_35px_rgba(245,158,11,0.4)]",
            detail: "bg-gradient-to-br from-[#451a03] via-[#292524] to-[#1c0410]",
            accent: "text-amber-300",
            badge: "bg-amber-950/80 text-amber-300 border-amber-400/50",
            btn: "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-500 shadow-xl",
            glow: "rgba(245, 158, 11, 0.4)"
        },
        {
            bg: "bg-gradient-to-b from-cyan-600 via-blue-700 to-slate-950 shadow-[0_15px_35px_rgba(8,145,178,0.4)]",
            detail: "bg-gradient-to-br from-[#083344] via-[#0f172a] to-[#1c0410]",
            accent: "text-cyan-300",
            badge: "bg-cyan-950/80 text-cyan-300 border-cyan-400/50",
            btn: "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black hover:from-cyan-400 hover:to-blue-500 shadow-xl",
            glow: "rgba(6, 182, 212, 0.4)"
        },
        {
            bg: "bg-gradient-to-b from-rose-600 via-pink-700 to-slate-950 shadow-[0_15px_35px_rgba(225,29,72,0.4)]",
            detail: "bg-gradient-to-br from-[#4c0519] via-[#0f172a] to-[#1c0410]",
            accent: "text-rose-300",
            badge: "bg-rose-950/80 text-rose-300 border-rose-400/50",
            btn: "bg-gradient-to-r from-rose-500 to-pink-600 text-slate-950 font-black hover:from-rose-400 hover:to-pink-500 shadow-xl",
            glow: "rgba(244, 63, 94, 0.4)"
        },
        {
            bg: "bg-gradient-to-b from-emerald-600 via-teal-700 to-slate-950 shadow-[0_15px_35px_rgba(5,150,105,0.4)]",
            detail: "bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-[#1c0410]",
            accent: "text-emerald-300",
            badge: "bg-emerald-950/80 text-emerald-300 border-emerald-400/50",
            btn: "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-500 shadow-xl",
            glow: "rgba(16, 185, 129, 0.4)"
        }
    ];

    const p = palette[index % palette.length];
    return {
        level: roleOrPosition.toUpperCase().includes('DUSUN') ? "KEPALA WILAYAH DUSUN" : "PERANGKAT DESA",
        uniformType: "Seragam Dinas Lapangan Terpadu",
        cardBg: p.bg,
        cardTextColor: "text-white",
        cardTagColor: "text-amber-200/90 font-bold",
        detailBg: p.detail,
        textColor: "text-white",
        subtextColor: "text-slate-200",
        accentColor: p.accent,
        badgeStyle: p.badge,
        btnStyle: p.btn,
        auraGlow: p.glow,
        isLightTheme: false,
        defaultMotto: "Mengayomi dan mendampingi warga di tingkat dusun dan RT/RW demi kemajuan bersama dan ketertiban lingkungan.",
        defaultTupoksi: [
            "Membantu Kepala Desa dalam pelaksanaan tugas pelayanan di wilayah kerja dusun.",
            "Melakukan pembinaan ketenteraman, ketertiban, dan kerukunan warga antarkampung.",
            "Mengawal kelancaran pelaksanaan pembangunan dan penyaluran bantuan sosial tepat sasaran."
        ]
    };
}

export function CampoSantoOrganisasi({ siteData, orgData, uiConfig, onBackToHero }: CampoSantoOrganisasiProps) {
    const [viewMode, setViewMode] = useState<'carousel' | 'detail'>('carousel');
    const [selectedOfficialIndex, setSelectedOfficialIndex] = useState<number>(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Resolve Social Media Links dynamically from CMS
    const socialLinks = {
        instagram: uiConfig?.socialLinks?.instagram || siteData?.socialLinks?.instagram || "https://instagram.com/pemdescimanggu1",
        facebook: uiConfig?.socialLinks?.facebook || siteData?.socialLinks?.facebook || "https://facebook.com/pemdescimanggu1",
        youtube: uiConfig?.socialLinks?.youtube || siteData?.socialLinks?.youtube || "https://youtube.com/@DesaCimanggu1Official",
        whatsapp: uiConfig?.socialLinks?.whatsapp || siteData?.socialLinks?.whatsapp || "https://wa.me/6281289001126"
    };

    // Dynamically build the full official list from CMS orgData
    const aparaturList: AparaturItem[] = useMemo(() => {
        const list: AparaturItem[] = [];
        let autoId = 1;

        // 1. Kades (Level 0)
        const kades = orgData?.kades || {
            name: "Hernawan M. Sodik",
            role: "Kepala Desa Cimanggu I",
            foto: "/images/KADES_baru.png"
        };
        const kadesTheme = getOfficialTheme(kades.role || "Kepala Desa", 0);
        list.push({
            id: autoId++,
            name: kades.name?.toUpperCase() || "HERNAWAN M. SODIK",
            role: kades.role?.toUpperCase() || "KEPALA DESA CIMANGGU I",
            level: kadesTheme.level,
            photo: kades.foto || "/images/KADES_baru.png",
            motto: kadesTheme.defaultMotto,
            uniformType: kadesTheme.uniformType,
            tupoksi: kadesTheme.defaultTupoksi,
            cardBg: kadesTheme.cardBg,
            cardTextColor: kadesTheme.cardTextColor,
            cardTagColor: kadesTheme.cardTagColor,
            detailBg: kadesTheme.detailBg,
            textColor: kadesTheme.textColor,
            subtextColor: kadesTheme.subtextColor,
            accentColor: kadesTheme.accentColor,
            badgeStyle: kadesTheme.badgeStyle,
            btnStyle: kadesTheme.btnStyle,
            auraGlow: kadesTheme.auraGlow,
            isLightTheme: kadesTheme.isLightTheme
        });

        // 2. Sekdes (Level 1)
        const sekdes = orgData?.sekdes || {
            name: "Fajar Tri Apriana",
            role: "Sekretaris Desa",
            foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
        };
        const sekdesTheme = getOfficialTheme(sekdes.role || "Sekretaris Desa", 1);
        list.push({
            id: autoId++,
            name: sekdes.name?.toUpperCase() || "FAJAR TRI APRIANA",
            role: sekdes.role?.toUpperCase() || "SEKRETARIS DESA",
            level: sekdesTheme.level,
            photo: sekdes.foto || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
            motto: sekdesTheme.defaultMotto,
            uniformType: sekdesTheme.uniformType,
            tupoksi: sekdesTheme.defaultTupoksi,
            cardBg: sekdesTheme.cardBg,
            cardTextColor: sekdesTheme.cardTextColor,
            cardTagColor: sekdesTheme.cardTagColor,
            detailBg: sekdesTheme.detailBg,
            textColor: sekdesTheme.textColor,
            subtextColor: sekdesTheme.subtextColor,
            accentColor: sekdesTheme.accentColor,
            badgeStyle: sekdesTheme.badgeStyle,
            btnStyle: sekdesTheme.btnStyle,
            auraGlow: sekdesTheme.auraGlow,
            isLightTheme: sekdesTheme.isLightTheme
        });

        // 3. Staff & Kaur/Kasi (Level 2)
        if (Array.isArray(orgData?.staff) && orgData.staff.length > 0) {
            orgData.staff.forEach((member: any, idx: number) => {
                const theme = getOfficialTheme(member.role || "", idx + 2);
                list.push({
                    id: autoId++,
                    name: member.name?.toUpperCase() || `APARATUR DESA ${idx + 1}`,
                    role: member.role?.toUpperCase() || "PERANGKAT DESA",
                    level: theme.level,
                    photo: member.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
                    motto: theme.defaultMotto,
                    uniformType: theme.uniformType,
                    tupoksi: theme.defaultTupoksi,
                    cardBg: theme.cardBg,
                    cardTextColor: theme.cardTextColor,
                    cardTagColor: theme.cardTagColor,
                    detailBg: theme.detailBg,
                    textColor: theme.textColor,
                    subtextColor: theme.subtextColor,
                    accentColor: theme.accentColor,
                    badgeStyle: theme.badgeStyle,
                    btnStyle: theme.btnStyle,
                    auraGlow: theme.auraGlow,
                    isLightTheme: theme.isLightTheme
                });
            });
        }

        // 4. Kadus / Kepala Dusun (Level 3)
        if (Array.isArray(orgData?.kadus) && orgData.kadus.length > 0) {
            orgData.kadus.forEach((member: any, idx: number) => {
                const theme = getOfficialTheme(member.role || "Kepala Dusun", idx + 10);
                list.push({
                    id: autoId++,
                    name: member.name?.toUpperCase() || `KEPALA DUSUN ${idx + 1}`,
                    role: member.role?.toUpperCase() || `KEPALA DUSUN ${idx + 1}`,
                    level: theme.level,
                    photo: member.foto || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop",
                    motto: theme.defaultMotto,
                    uniformType: theme.uniformType,
                    tupoksi: theme.defaultTupoksi,
                    cardBg: theme.cardBg,
                    cardTextColor: theme.cardTextColor,
                    cardTagColor: theme.cardTagColor,
                    detailBg: theme.detailBg,
                    textColor: theme.textColor,
                    subtextColor: theme.subtextColor,
                    accentColor: theme.accentColor,
                    badgeStyle: theme.badgeStyle,
                    btnStyle: theme.btnStyle,
                    auraGlow: theme.auraGlow,
                    isLightTheme: theme.isLightTheme
                });
            });
        }

        return list;
    }, [orgData]);

    const currentOfficial = aparaturList[selectedOfficialIndex] || aparaturList[0];

    // Carousel Scroll Handlers (Stage 1)
    const scrollCarousel = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const scrollAmount = direction === 'left' ? -320 : 320;
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full h-screen bg-[#1c0410] text-white font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
            
            {/* TOP-LEFT ANIMATED ICON-ONLY BACK BUTTON */}
            <div className="fixed top-4 left-4 sm:top-6 sm:left-8 z-50">
                <button
                    onClick={() => {
                        if (viewMode === 'detail') {
                            setViewMode('carousel');
                        } else if (onBackToHero) {
                            onBackToHero();
                        }
                    }}
                    className={`min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full border shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 group cursor-pointer ${
                        viewMode === 'detail' && currentOfficial?.isLightTheme 
                            ? 'bg-slate-900/90 text-white hover:bg-amber-600 border-slate-700' 
                            : 'bg-black/75 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    }`}
                    title={viewMode === 'detail' ? 'Kembali ke Carousel' : 'Kembali ke Beranda'}
                    aria-label="Kembali"
                >
                    <ArrowLeft size={20} className="animate-pulse group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* ========================================================================= */}
            {/* STAGE 1: SUPERCELL-STYLE CHARACTER CAROUSEL SELECTOR STAGE (FULL SCREEN WIDTH) */}
            {/* ========================================================================= */}
            {viewMode === 'carousel' ? (
                <div className="w-full flex-1 flex flex-col justify-between my-auto overflow-y-auto lg:overflow-hidden pt-12 sm:pt-14">
                    
                    {/* Header */}
                    <div className="text-center space-y-1.5 px-4 pt-2">
                        <h1 
                            className="text-fluid-h1 font-black text-white uppercase tracking-tight"
                            style={{
                                fontFamily: "'Impact', 'Trebuchet MS', 'Arial Black', sans-serif",
                                textShadow: '0 4px 16px rgba(0,0,0,0.8), 0 0 45px rgba(245,158,11,0.35)'
                            }}
                        >
                            STRUKTUR ORGANISASI
                        </h1>
                        <p className="text-amber-100/90 text-xs sm:text-sm font-medium max-w-2xl mx-auto">
                            Jajaran {aparaturList.length} aparatur Pemerintah Desa Cimanggu I yang bertugas mengabdi demi kemajuan warga, efisiensi pelayanan, dan transparansi tata kelola.
                        </p>
                    </div>

                    {/* SUPERCELL-STYLE CAROUSEL STAGE (FULL SCREEN WIDTH) */}
                    <div className="relative w-full my-auto py-4 sm:py-6">
                        <div 
                            ref={carouselRef}
                            className="flex items-end justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-10 px-4 sm:px-8 scroll-smooth w-full"
                        >
                            {aparaturList.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedOfficialIndex(idx);
                                        setViewMode('detail');
                                    }}
                                    className="relative flex-none w-56 sm:w-64 lg:w-72 cursor-pointer group transition-all duration-500 transform hover:-translate-y-4 hover:scale-105"
                                >
                                    {/* Top Cutout Photo Bursting OUT of Card Base */}
                                    <div className="relative w-full h-48 sm:h-56 lg:h-60 z-20 overflow-visible">
                                        <Image
                                            src={item.photo}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
                                            className="object-cover object-top filter saturate-[1.2] drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-500"
                                            style={{
                                                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                                                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                                            }}
                                        />
                                    </div>

                                    {/* Rounded Color Card Base (Supercell Style) */}
                                    <div className={`relative -mt-10 rounded-3xl p-5 pt-8 text-left ${item.cardBg} transition-all duration-500 z-10 border border-white/20`}>
                                        <div className={`text-[9px] sm:text-[10px] uppercase tracking-widest ${item.cardTagColor}`}>
                                            {item.level}
                                        </div>
                                        <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight mt-1 leading-tight line-clamp-1 ${item.cardTextColor}`}>
                                            {item.name}
                                        </h3>
                                        <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider block mt-1 opacity-90 line-clamp-1 ${item.cardTextColor}`}>
                                            {item.role}
                                        </span>

                                        <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">
                                                LIHAT DETAIL TUPOKSI
                                            </span>
                                            <div className="bg-slate-950/80 text-amber-400 p-1.5 rounded-full shadow-md group-hover:scale-110 transition-transform">
                                                <ChevronRight size={13} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTTOM CAROUSEL CONTROLS BAR (FULL BLEED LEFT TO RIGHT) */}
                    <div className="w-full px-6 sm:px-12 lg:px-16 py-3 sm:py-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-white/80 text-xs">
                        {/* Dynamic Social Links */}
                        <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-2 px-1 min-h-[44px]">
                                <Facebook size={15} />
                                <span>Facebook</span>
                            </a>
                            <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-2 px-1 min-h-[44px]">
                                <Youtube size={15} />
                                <span>Youtube</span>
                            </a>
                            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-2 px-1 min-h-[44px]">
                                <Instagram size={15} />
                                <span>Instagram</span>
                            </a>
                            <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-2 px-1 min-h-[44px]">
                                <Phone size={15} />
                                <span>WhatsApp</span>
                            </a>
                        </div>

                        {/* Animated Icon-Only Prev & Next Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => scrollCarousel('left')}
                                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/60 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg group"
                                title="Sebelumnya"
                                aria-label="Slide sebelumnya"
                            >
                                <ChevronLeft size={18} className="animate-pulse group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <button
                                onClick={() => scrollCarousel('right')}
                                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/60 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg group"
                                title="Berikutnya"
                                aria-label="Slide berikutnya"
                            >
                                <ChevronRight size={18} className="animate-pulse group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            ) : (
                /* ========================================================================= */
                /* STAGE 2: ULTRA-PREMIUM PURE TEXT & FULL PNG PHOTO DETAIL VIEW */
                /* ========================================================================= */
                <div 
                    className={`w-full flex-1 transition-colors duration-700 ease-in-out flex flex-col justify-between p-4 sm:p-8 lg:p-12 ${currentOfficial.detailBg} ${currentOfficial.textColor} overflow-y-auto lg:overflow-hidden pt-14`}
                >
                    {/* FULL-SCREEN SPLIT SHOWCASE */}
                    <div className="relative w-full max-w-7xl mx-auto my-auto py-2 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                        
                        {/* LEFT COLUMN: SHIFTED LEFT, PURE TEXT ONLY */}
                        <div className="w-full lg:w-[52%] space-y-4 z-20 text-left pl-2 sm:pl-6 lg:pl-10">
                            
                            {/* Role Badge Text */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1 rounded-full border ${currentOfficial.badgeStyle}`}>
                                    {currentOfficial.level}
                                </span>
                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${currentOfficial.subtextColor}`}>
                                    • {currentOfficial.uniformType}
                                </span>
                            </div>

                            {/* Massive Urban Painted Name */}
                            <div className="space-y-0.5">
                                <h1 
                                    className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none drop-shadow-md"
                                    style={{
                                        fontFamily: "'Impact', 'Trebuchet MS', 'Arial Black', sans-serif"
                                    }}
                                >
                                    {currentOfficial.name}
                                </h1>
                                <h2 className={`text-base sm:text-xl font-black uppercase tracking-widest ${currentOfficial.accentColor}`}>
                                    {currentOfficial.role}
                                </h2>
                            </div>

                            {/* Short Motto / Vision Quote */}
                            <div className="space-y-1 py-0.5">
                                <Quote size={20} className={`${currentOfficial.accentColor} opacity-80`} />
                                <p className={`text-xs sm:text-sm lg:text-base font-serif italic leading-relaxed ${currentOfficial.subtextColor}`}>
                                    &quot;{currentOfficial.motto}&quot;
                                </p>
                            </div>

                            {/* PURE TEXT TUPOKSI BREAKDOWN LIST */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className={currentOfficial.accentColor} />
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-90">
                                        TUGAS POKOK & FUNGSI (TUPOKSI)
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {currentOfficial.tupoksi.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <CheckCircle2 size={15} className={`${currentOfficial.accentColor} shrink-0 mt-0.5`} />
                                            <p className="text-xs font-medium leading-relaxed opacity-95">
                                                {point}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ANIMATED ICON-ONLY PREVIOUS & NEXT SWITCHES */}
                            <div className="flex items-center gap-3 pt-3 border-t border-current/15">
                                <button
                                    onClick={() => setSelectedOfficialIndex((prev) => (prev === 0 ? aparaturList.length - 1 : prev - 1))}
                                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg group ${
                                        currentOfficial.isLightTheme 
                                            ? 'bg-slate-900 text-white hover:bg-amber-600 border-slate-700' 
                                            : 'bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950 border-white/20'
                                    }`}
                                    title="Aparatur Sebelumnya"
                                >
                                    <ChevronLeft size={18} className="animate-pulse group-hover:-translate-x-0.5 transition-transform" />
                                </button>

                                <button
                                    onClick={() => setSelectedOfficialIndex((prev) => (prev === aparaturList.length - 1 ? 0 : prev + 1))}
                                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg group ${
                                        currentOfficial.isLightTheme 
                                            ? 'bg-slate-900 text-white hover:bg-amber-600 border-slate-700' 
                                            : 'bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950 border-white/20'
                                    }`}
                                    title="Aparatur Berikutnya"
                                >
                                    <ChevronRight size={18} className="animate-pulse group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: SHIFTED RIGHT, PURE PORTRAIT PNG PHOTO ONLY */}
                        <div className="relative w-full lg:w-[48%] h-[400px] sm:h-[500px] lg:h-[calc(100vh-140px)] flex items-end justify-end pr-2 sm:pr-6 lg:pr-10 z-10">
                            
                            {/* Glowing Atmosphere Aura */}
                            <div 
                                className="absolute inset-0 rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-700"
                                style={{
                                    background: `radial-gradient(circle at 50% 50%, ${currentOfficial.auraGlow} 0%, transparent 70%)`
                                }}
                            />

                            {/* Official Full PNG Portrait */}
                            <div className="relative w-full h-full max-w-md lg:max-w-lg transition-transform duration-700 transform scale-100 hover:scale-105">
                                <Image
                                    key={currentOfficial.id}
                                    src={currentOfficial.photo}
                                    alt={currentOfficial.name}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 48vw"
                                    className="object-cover object-top filter saturate-[1.15] drop-shadow-2xl transition-opacity duration-700"
                                    style={{
                                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                    {/* Footer */}
                    <div className="max-w-4xl mx-auto text-center opacity-70 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] pt-1">
                        {uiConfig?.footerCopyright || "© 2026 PEMERINTAH DESA CIMANGGU I • KECAMATAN CIBUNGBULANG • KABUPATEN BOGOR"}
                    </div>

                </div>
            )}
        </div>
    );
}
