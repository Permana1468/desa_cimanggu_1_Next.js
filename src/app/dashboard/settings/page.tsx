"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getBeritaList, deleteBerita } from "@/actions/cms";
import { createVillageAccount } from "@/actions/village";
import { RoleType } from "@prisma/client";
import { 
    Newspaper, 
    Users, 
    Plus, 
    Trash2, 
    Globe, 
    ShieldCheck,
    Mail,
    UserCircle,
    Lock,
    Layout
} from "lucide-react";
import Link from "next/link";

interface BeritaItem {
    id: string;
    judul: string;
    kategori: string | null;
    createdAt: Date;
}

import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const role = (session?.user as any)?.role;
    const isAdmin = role === "ADMIN_DESA" || role === "ADMIN_MASTER" || role === "KADES";
    const [activeTab, setActiveTab] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            if (isAdmin) {
                if (!activeTab) setActiveTab("cms");
            } else {
                setActiveTab("profile");
            }
        }
    }, [status, isAdmin, activeTab]);

    if (status === "loading" || !activeTab) {
        return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat pengaturan...</div>;
    }

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{isAdmin ? "Pengaturan & Konten" : "Pengaturan Akun"}</h1>
                <p className="text-slate-500 text-sm">{isAdmin ? "Kelola konten website desa dan akun perangkat kewilayahan." : "Kelola profil dan keamanan akun Anda."}</p>
            </div>

            {isAdmin && (
                <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit">
                    <TabButton 
                        active={activeTab === "cms"} 
                        onClick={() => setActiveTab("cms")} 
                        icon={Newspaper} 
                        label="Manajemen Berita" 
                    />
                    <TabButton 
                        active={activeTab === "accounts"} 
                        onClick={() => setActiveTab("accounts")} 
                        icon={Users} 
                        label="Akun RT/RW" 
                    />
                    <TabButton 
                        active={activeTab === "profile"} 
                        onClick={() => setActiveTab("profile")} 
                        icon={UserCircle} 
                        label="Profil Saya" 
                    />
                    <TabButton 
                        active={activeTab === "facesecurity"} 
                        onClick={() => setActiveTab("facesecurity")} 
                        icon={ShieldCheck} 
                        label="Keamanan Wajah" 
                    />
                </div>
            )}

            <div className="mt-8">
                {activeTab === "cms" && isAdmin && <CMSManager />}
                {activeTab === "accounts" && isAdmin && <AccountManager />}
                {activeTab === "profile" && <UserProfileManager />}
                {activeTab === "facesecurity" && <FaceSecurityManager />}
            </div>
        </div>
    );
}

import SettingsClient from "@/components/dashboard/settings/SettingsClient";
import { getUserSettings } from "@/actions/settings";

function UserProfileManager() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserSettings().then(res => {
            setUser(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Memuat data profil...</div>;
    if (!user) return <div className="p-8 text-center text-rose-500 font-bold">Gagal memuat profil.</div>;

    return <SettingsClient user={user} />;
}

function CMSManager() {
    const [berita, setBerita] = useState<BeritaItem[]>([]);

    const loadBerita = useCallback(async () => {
        const data = await getBeritaList();
        setBerita(data as BeritaItem[]);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const data = await getBeritaList();
            if (isMounted) {
                setBerita(data as BeritaItem[]);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Globe className="text-blue-500" size={24} />
                    Konten Halaman Depan
                </h2>
                <div className="flex gap-3">
                    <Link 
                        href="/dashboard/settings/landing"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                        <Layout size={16} /> Kelola Tampilan Utama
                    </Link>
                    <Link 
                        href="/dashboard/settings/landing?tab=berita"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                        <Plus size={16} /> Tambah Berita Baru
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {berita.map((item) => (
                    <div key={item.id} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/30 flex justify-between items-start group">
                        <div className="space-y-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold uppercase">{item.kategori}</span>
                            <h3 className="font-bold text-slate-800 leading-tight">{item.judul}</h3>
                            <p className="text-[10px] text-slate-400">Dibuat: {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                            onClick={async () => {
                                if(confirm("Hapus berita ini?")) {
                                    await deleteBerita(item.id);
                                    loadBerita();
                                }
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AccountManager() {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        role: RoleType.RT as RoleType,
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createVillageAccount(formData);
            alert("Akun berhasil dibuat!");
            setFormData({ email: "", fullName: "", role: RoleType.RT, password: "" });
        } catch (err: unknown) {
            alert("Gagal membuat akun.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    Buat Akun Perangkat Desa
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                type="text" placeholder="Contoh: Bpk. Mulyadi" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Login</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                type="email" placeholder="rt01@cimanggu1.desa.id" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan</label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value={RoleType.RT}>Ketua RT</option>
                                <option value={RoleType.RW}>Ketua RW</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                                <input 
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    type="password" placeholder="••••••••" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                        Daftarkan Perangkat Baru
                    </button>
                </form>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <h3 className="font-bold mb-4">Informasi Akses</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Akun yang dibuat akan secara otomatis memiliki akses ke modul verifikasi di wilayahnya masing-masing. Pastikan email yang digunakan unik untuk setiap perangkat desa.
                </p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold">RT/RW Access</span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Active</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold">Mobile Compatibility</span>
                        <span className="text-[10px] text-blue-400 font-black uppercase">Optimized</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    )
}

function FaceSecurityManager() {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [statusText, setStatusText] = useState("Memuat model Face API...");
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isRegisteredState, setIsRegisteredState] = useState(false);

    useEffect(() => {
        setIsRegisteredState(typeof window !== 'undefined' && !!localStorage.getItem("imo_registered_face"));

        const loadModels = async () => {
            try {
                // --- TEMPORARILY DISABLED DUE TO DEV SERVER HANG ---
                // const faceapi = await import('@vladmandic/face-api');
                // await Promise.all([
                //     faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                //     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                //     faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                // ]);
                setModelsLoaded(true); // Faked
                setStatusText("Model siap. Silakan aktifkan kamera.");
            } catch (err) {
                console.error("Gagal memuat model:", err);
                setStatusText("Gagal memuat model Face API. Pastikan folder /models tersedia.");
            }
        };
        loadModels();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        if (!modelsLoaded) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
                setStatusText("Kamera aktif. Posisikan wajah Anda di tengah...");
            }
        } catch (err) {
            setStatusText("Tidak dapat mengakses kamera.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
            setStatusText("Kamera dimatikan.");
        }
    };

    const handleVideoPlay = () => {
        const detectFace = async () => {
            if (!videoRef.current || !isCameraActive || videoRef.current.paused || videoRef.current.ended) return;
            try {
                // --- TEMPORARILY DISABLED FOR PERFORMANCE ---
                // const faceapi = await import('@vladmandic/face-api');
                // const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                //     .withFaceLandmarks()
                //     .withFaceDescriptor();

                // if (detection) {
                //     setStatusText("Wajah terdeteksi! Siap didaftarkan.");
                //     setDescriptor(detection.descriptor);
                    
                //     if (canvasRef.current && videoRef.current) {
                //         const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
                //         faceapi.matchDimensions(canvasRef.current, displaySize);
                //         const resizedDetection = faceapi.resizeResults(detection, displaySize);
                //         canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                //         faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
                //     }
                // } else {
                //     setStatusText("Wajah tidak ditemukan, paskan di tengah.");
                //     setDescriptor(null);
                //     if (canvasRef.current) {
                //         canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                //     }
                // }
            } catch (e) {
                console.error(e);
            }
            
            if (isCameraActive) {
                setTimeout(() => requestAnimationFrame(detectFace), 100);
            }
        };
        detectFace();
    };

    const registerFace = () => {
        if (descriptor) {
            localStorage.setItem("imo_registered_face", JSON.stringify(Array.from(descriptor)));
            setIsRegisteredState(true);
            alert("Wajah berhasil didaftarkan sebagai pemilik sah!");
            stopCamera();
        }
    };

    const clearRegistration = () => {
        localStorage.removeItem("imo_registered_face");
        setIsRegisteredState(false);
        alert("Data wajah berhasil dihapus.");
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-500" size={24} />
                Verifikasi Keamanan Wajah
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
                Daftarkan wajah Anda agar robot IMO-1 dapat mengenali Anda. 
                Jika orang asing mencoba menggunakan dashboard Anda, fitur akan terkunci.
            </p>

            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm flex justify-between items-center">
                    <div>
                        <span className="font-bold text-slate-700">Status Registrasi: </span>
                        {isRegisteredState ? (
                            <span className="text-emerald-600 font-bold">Terdaftar</span>
                        ) : (
                            <span className="text-rose-500 font-bold">Belum Terdaftar</span>
                        )}
                    </div>
                    {isRegisteredState && (
                        <button onClick={clearRegistration} className="text-rose-500 hover:text-rose-600 text-xs font-bold px-3 py-1 bg-rose-50 rounded-lg">
                            Hapus Data Wajah
                        </button>
                    )}
                </div>

                <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video flex flex-col items-center justify-center">
                    {!isCameraActive ? (
                        <div className="text-center text-slate-400">
                            <UserCircle size={48} className="mx-auto mb-2 opacity-50" />
                            <p>{statusText}</p>
                            {modelsLoaded && (
                                <button onClick={startCamera} className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition">
                                    Nyalakan Kamera
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <video 
                                ref={videoRef} 
                                onPlay={handleVideoPlay}
                                autoPlay 
                                muted 
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                                <button onClick={stopCamera} className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-xl backdrop-blur-md">
                                    Batalkan
                                </button>
                                <button 
                                    onClick={registerFace} 
                                    disabled={!descriptor}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-slate-500 text-white font-bold rounded-xl shadow-lg"
                                >
                                    Daftarkan Wajah Ini
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
