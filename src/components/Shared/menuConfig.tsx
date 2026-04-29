import React from 'react';
import {
    Home, Clock, Wallet, FileText, Users, Settings, Activity,
    LogOut, ChevronDown, Pyramid, X, Menu, BarChart3, Database, Shield, Zap, Search,
    Briefcase, Map, MapPin, ChevronLeft, ChevronRight, LayoutGrid, Layers, Bell,
    User, Moon, Sun, MessageSquare, Calendar, RefreshCw, Store, ShoppingBag
} from 'lucide-react';

export const menuConfig = {
    ADMIN: [
        { title: 'Dashboard Utama', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Presensi Kehadiran', path: '/dashboard/rekap-kehadiran', icon: <Clock />, iconColor: 'text-amber-400', badge: 'Live' },
        {
            title: 'Aparatur Desa', 
            icon: <Pyramid />,
            iconColor: 'text-orange-400',
            subCategories: [
                {
                    title: 'Sekretariat',
                    subCategories: [
                        {
                            title: 'TU & Umum',
                            subMenus: [
                                { title: 'Buku Surat Masuk', path: '/dashboard/buku-surat' },
                                { title: 'Inventaris Desa', path: '/dashboard/inventaris-aset' },
                            ]
                        },
                        {
                            title: 'Keuangan Desa',
                            subMenus: [
                                { title: 'Buku Kas Umum', path: '/dashboard/buku-kas' },
                                { title: 'Realisasi Anggaran', path: '/dashboard/realisasi-anggaran' },
                            ]
                        },
                        {
                            title: 'Perencanaan',
                            subMenus: [
                                { title: 'Rencana Kerja (RAB)', path: '/dashboard/rab' },
                                { title: 'Musrenbang Desa', path: '/dashboard/rekap-musrenbang' },
                                { title: 'DED Proyek', path: '/dashboard/perencanaan' },
                                { title: 'Verifikasi Usulan', path: '/dashboard/verifikasi-usulan' },
                                { title: 'RPJMDes / RKP', path: '/dashboard/rpjmdes' },
                            ]
                        }
                    ]
                },
                {
                    title: 'Pelaksana Teknis',
                    subCategories: [
                        {
                            title: 'Pemerintahan',
                            subMenus: [
                                { title: 'Kependudukan', path: '/dashboard/pemerintahan' },
                                { title: 'Maps Spasial', path: '/dashboard/maps' },
                            ]
                        },
                        {
                            title: 'Kesejahteraan',
                            subMenus: [
                                { title: 'Proyek Fisik', path: '/dashboard/kesejahteraan' },
                                { title: 'Bantuan Sosial', path: '/dashboard/bansos' },
                            ]
                        },
                        {
                            title: 'Pelayanan',
                            subMenus: [
                                { title: 'Layanan Pengantar', path: '/dashboard/pelayanan' },
                            ]
                        }
                    ]
                },
                {
                    title: 'Wilayah Dusun',
                    subCategories: [
                        {
                            title: 'Dusun I & II',
                            subMenus: [
                                { title: 'Monitoring Dusun I', path: '/dashboard/data-dusun-1' },
                                { title: 'Monitoring Dusun II', path: '/dashboard/data-dusun-2' },
                            ]
                        },
                        {
                            title: 'Dusun III & IV',
                            subMenus: [
                                { title: 'Monitoring Dusun III', path: '/dashboard/data-dusun-3' },
                                { title: 'Monitoring Dusun IV', path: '/dashboard/data-dusun-4' },
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: 'Pasar Desa (UMKM)', icon: <Store />, iconColor: 'text-emerald-400',
            subMenus: [
                { title: 'Verifikasi Toko', path: '/dashboard/umkm/verifikasi' },
                { title: 'Manajemen Produk', path: '/dashboard/umkm/produk' },
            ]
        },
        {
            title: 'Pengaturan Web', icon: <Settings />, iconColor: 'text-purple-400',
            subMenus: [
                { title: 'Manajemen Pengguna', path: '/dashboard/users' },
                { title: 'Verifikasi Pendaftaran', path: '/dashboard/verify-users' },
                { title: 'Identitas Desa', path: '/dashboard/landing-setting' },
                { title: 'Carousel Background', path: '/dashboard/hero-carousel' },
                { title: 'Kelola Berita', path: '/dashboard/berita' },
                { title: 'Struktur Organisasi', path: '/dashboard/organisasi' },
            ]
        },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    LPM: [
        { title: 'Dashboard Utama', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Usulan Pembangunan', path: '/dashboard/usulan-pembangunan', icon: <Pyramid />, iconColor: 'text-amber-400' },
        { title: 'Pantau Proyek', path: '/dashboard/pantau-proyek', icon: <Activity />, iconColor: 'text-emerald-400' },
        { title: 'Buku Keuangan LPM', path: '/dashboard/lpm/keuangan', icon: <Wallet />, iconColor: 'text-green-400' },
        { title: 'Aspirasi Warga', path: '/dashboard/aspirasi-warga', icon: <MessageSquare />, iconColor: 'text-indigo-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    RT: [
        { title: 'Dashboard RT', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Data Warga (Kependudukan)', path: '/dashboard/pemerintahan', icon: <Users />, iconColor: 'text-orange-400' },
        { title: 'Mutasi Warga', path: '/dashboard/mutasi-warga', icon: <RefreshCw />, iconColor: 'text-amber-400' },
        { title: 'Peta Spasial RT', path: '/dashboard/maps', icon: <MapPin />, iconColor: 'text-emerald-400' },
        { title: 'E-Pelayanan', path: '/dashboard/pelayanan', icon: <FileText />, iconColor: 'text-indigo-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    RW: [
        { title: 'Dashboard RW', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Monitoring Warga', path: '/dashboard/pemerintahan', icon: <Users />, iconColor: 'text-orange-400' },
        { title: 'Rekap Mutasi', path: '/dashboard/mutasi-warga', icon: <RefreshCw />, iconColor: 'text-amber-400' },
        { title: 'Spasial Wilayah', path: '/dashboard/maps', icon: <MapPin />, iconColor: 'text-emerald-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    TP_PKK: [
        { title: 'Dashboard PKK', path: '/dashboard', icon: <Home />, iconColor: 'text-pink-400' },
        { title: 'Data Kader', path: '/dashboard/lpm/kader', icon: <Users />, iconColor: 'text-pink-400' },
        { title: 'Kegiatan PKK', path: '/dashboard/kegiatan-lpm', icon: <Calendar />, iconColor: 'text-amber-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    KARANG_TARUNA: [
        { title: 'Dashboard Katar', path: '/dashboard', icon: <Home />, iconColor: 'text-red-400' },
        { title: 'Program Kerja', path: '/dashboard/usulan-pembangunan', icon: <Zap />, iconColor: 'text-yellow-400' },
        { title: 'Agenda Kegiatan', path: '/dashboard/gotong-royong', icon: <Calendar />, iconColor: 'text-blue-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    BUMDES: [
        { title: 'Dashboard Bumdes', path: '/dashboard', icon: <Home />, iconColor: 'text-emerald-400' },
        { title: 'Laporan Keuangan', path: '/dashboard/buku-kas', icon: <Wallet />, iconColor: 'text-emerald-400' },
        { title: 'Aset Bumdes', path: '/dashboard/inventaris-aset', icon: <Database />, iconColor: 'text-amber-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    POSYANDU: [
        { title: 'Dashboard Posyandu', path: '/dashboard', icon: <Home />, iconColor: 'text-rose-400' },
        { title: 'E-KMS Posyandu', path: '/dashboard/e-kms', icon: <Activity />, iconColor: 'text-rose-400' },
        { title: 'Deteksi Stunting', path: '/dashboard/stunting', icon: <Shield />, iconColor: 'text-blue-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    PUSKESOS: [
        { title: 'Dashboard Puskesos', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-500' },
        { title: 'Penyaluran Bansos', path: '/dashboard/bansos', icon: <Pyramid />, iconColor: 'text-orange-400' },
        { title: 'Aspirasi Warga', path: '/dashboard/aspirasi-warga', icon: <MessageSquare />, iconColor: 'text-indigo-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    WARGA: [
        { title: 'Beranda Warga', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Kirim Aspirasi', path: '/dashboard/aspirasi-warga', icon: <MessageSquare />, iconColor: 'text-indigo-400' },
        { title: 'Profil Desa', path: '/dashboard/organisasi', icon: <FileText />, iconColor: 'text-amber-400' },
        { title: 'Peta Desa', path: '/dashboard/maps', icon: <Map />, iconColor: 'text-emerald-400' },
        { title: 'Chat Admin', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    SEKDES: [
        { title: 'Dashboard Sekdes', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Presensi Seluruh Staff', path: '/dashboard/rekap-kehadiran', icon: <Clock />, iconColor: 'text-amber-400' },
        { title: 'Inventaris Desa', path: '/dashboard/inventaris-aset', icon: <Database />, iconColor: 'text-amber-400' },
        { title: 'Administrasi Umum', path: '/dashboard/buku-surat', icon: <FileText />, iconColor: 'text-blue-300' },
        { title: 'RPJMDes / RKP', path: '/dashboard/rpjmdes', icon: <Pyramid />, iconColor: 'text-orange-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    KADUS: [
        { title: 'Dashboard Dusun', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Monitoring Warga', path: '/dashboard/pemerintahan', icon: <Users />, iconColor: 'text-orange-400' },
        { title: 'Usulan Musrenbang', path: '/dashboard/rekap-musrenbang', icon: <FileText />, iconColor: 'text-amber-400' },
        { title: 'Buku Dusun', path: '/dashboard/data-dusun-1', icon: <Database />, iconColor: 'text-emerald-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    STAF: [
        { title: 'Dashboard Staff', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Musrenbang Desa', path: '/dashboard/rekap-musrenbang', icon: <FileText />, iconColor: 'text-amber-400' },
        { title: 'Komunikasi Pesan', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ],
    OWNER_TOKO: [
        { title: 'Dashboard Utama', path: '/dashboard', icon: <Home />, iconColor: 'text-blue-400' },
        { title: 'Kelola Toko', path: '/toko/pengaturan', icon: <Store />, iconColor: 'text-yellow-400' },
        { title: 'Katalog Produk', path: '/toko/produk', icon: <ShoppingBag />, iconColor: 'text-emerald-400' },
        { title: 'Chat Admin', path: '/dashboard/pesan', icon: <MessageSquare />, iconColor: 'text-green-400' },
    ]
};
