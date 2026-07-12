"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, X, RefreshCw, Info, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerUmkmUser } from "@/app/actions/auth";
import { sendWhatsappOtp } from "@/app/actions/otp";
import { signIn } from "next-auth/react";

const CAPTCHA_IMAGES = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400",
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=400",
];

export default function UmkmRegister() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [modal, setModal] = useState<"none" | "terms" | "puzzle" | "sendOtp">("none");
    
    // Form States
    const [nik, setNik] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    
    // UI States
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Puzzle states
    const [captchaImg, setCaptchaImg] = useState(CAPTCHA_IMAGES[0]);
    const [sliderPos, setSliderPos] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [puzzleSolved, setPuzzleSolved] = useState(false);
    const puzzleTarget = 150; // The X position to match the puzzle piece
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleNextStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber) {
            setModal("terms");
        }
    };

    const handleTermsAgree = () => {
        setCaptchaImg(CAPTCHA_IMAGES[Math.floor(Math.random() * CAPTCHA_IMAGES.length)]);
        setSliderPos(0);
        setPuzzleSolved(false);
        setModal("puzzle");
    };

    const handleRefreshPuzzle = () => {
        setCaptchaImg(CAPTCHA_IMAGES[Math.floor(Math.random() * CAPTCHA_IMAGES.length)]);
        setSliderPos(0);
        setPuzzleSolved(false);
    };

    // Slider logic
    const handlePointerDown = () => {
        if (!puzzleSolved) setIsDragging(true);
    };

    const handlePointerMove = (e: React.PointerEvent | PointerEvent) => {
        if (!isDragging) return;
        if (sliderRef.current) {
            const rect = sliderRef.current.getBoundingClientRect();
            let newX = ('clientX' in e ? e.clientX : (e as any).touches?.[0]?.clientX) - rect.left - 24; // 24 is half button width
            if (newX < 0) newX = 0;
            if (newX > rect.width - 48) newX = rect.width - 48;
            setSliderPos(newX);
        }
    };

    const handlePointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        // Check if matched
        if (Math.abs(sliderPos - puzzleTarget) < 10) {
            setPuzzleSolved(true);
            setSliderPos(puzzleTarget); // Snap to exact
            setTimeout(() => {
                setModal("none");
                setPuzzleSolved(false);
                setStep(3); // Langsung ke form Nama & Password
            }, 1000);
        } else {
            // Snap back
            setSliderPos(0);
        }
    };

    useEffect(() => {
        const handleUp = () => handlePointerUp();
        const handleMove = (e: any) => handlePointerMove(e);
        
        if (isDragging) {
            window.addEventListener('pointerup', handleUp);
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('touchend', handleUp);
            window.addEventListener('touchmove', handleMove);
        }

        return () => {
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('touchend', handleUp);
            window.removeEventListener('touchmove', handleMove);
        };
    }, [isDragging, sliderPos]);


    const handleSendOtp = async () => {
        setLoading(true);
        // Generate random 4 digit OTP
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(newOtp);

        const res = await sendWhatsappOtp(phoneNumber, newOtp);
        if (res.success) {
            setModal("none");
            setStep(2);
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // In real world, verify with backend. Here we verify with state.
        if (otp === generatedOtp || process.env.NODE_ENV === "development") {
            setStep(3);
        } else {
            alert("OTP salah. Silakan coba lagi.");
        }
    };

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await registerUmkmUser(nik, phoneNumber, fullName, password);
        if (res.success) {
            alert("Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi oleh Admin Master agar dapat digunakan.");
            router.push("/umkm/login");
        } else {
            alert(res.error);
            setLoading(false);
        }
    };

    const loginGoogle = () => {
        signIn("google", { callbackUrl: "/umkm" });
    };

    const loginFacebook = () => {
        signIn("facebook", { callbackUrl: "/umkm" });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-10 py-5 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Link href="/umkm" className="flex items-center gap-2 text-blue-600">
                        <ShoppingBag size={40} className="fill-blue-600 text-white p-1" />
                        <span className="text-3xl font-medium tracking-tight">DesaMart</span>
                    </Link>
                    <span className="text-2xl font-normal text-gray-700 mt-1">Daftar</span>
                </div>
                <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-sm">
                    Butuh bantuan?
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 bg-blue-600 flex items-center justify-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="hidden lg:flex flex-col items-center justify-center absolute left-[15%] text-white text-center">
                    <ShoppingBag size={150} className="fill-white text-blue-600" />
                    <h1 className="text-6xl font-medium mt-4 tracking-tighter">DesaMart</h1>
                    <p className="text-2xl mt-4 font-light tracking-wide">Lebih Hemat Lebih Cepat</p>
                </div>

                {/* Register Box */}
                <div className="w-full max-w-[400px] bg-white rounded shadow-xl p-8 z-10 lg:ml-auto lg:mr-[15%] mx-4 relative">
                    <h2 className="text-xl font-medium text-gray-800 mb-8">
                        {step === 1 ? "Daftar" : step === 2 ? "Masukkan Kode OTP" : "Buat Password"}
                    </h2>

                    {step === 1 && (
                        <form onSubmit={handleNextStep1} className="space-y-6">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Nomor Telepon" 
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={!phoneNumber}
                                className={`w-full py-3 mt-4 text-white uppercase text-sm font-medium transition-colors ${phoneNumber ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                            >
                                Berikutnya
                            </button>

                            <div className="mt-6 flex items-center">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="px-3 text-xs text-gray-400">ATAU</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button type="button" onClick={loginFacebook} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 hover:bg-gray-50 transition-colors">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12.001 2C6.478 2 2.001 6.477 2.001 12c0 4.991 3.657 9.128 8.438 9.879V15.3h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 3.3h-2.33v6.579c4.781-.751 8.438-4.888 8.438-9.879 0-5.523-4.477-10-10-10z" fill="#1877f2"/></svg>
                                    <span className="text-sm text-gray-600">Facebook</span>
                                </button>
                                <button type="button" onClick={loginGoogle} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 hover:bg-gray-50 transition-colors">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span className="text-sm text-gray-600">Google</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <p className="text-sm text-gray-600 mb-4">Kode OTP telah dikirimkan ke WhatsApp Anda di nomor <strong>{phoneNumber}</strong></p>
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Masukkan 4 digit OTP" 
                                    maxLength={4}
                                    className="w-full border border-gray-300 px-4 py-3 text-center tracking-widest text-lg focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={otp.length < 4}
                                className={`w-full py-3 mt-4 text-white uppercase text-sm font-medium transition-colors ${otp.length >= 4 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                            >
                                Lanjut
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleFinalRegister} className="space-y-4">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Nomor Induk Kependudukan (NIK)" 
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                    value={nik}
                                    onChange={e => setNik(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Nama Lengkap (Sesuai KTP)" 
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <input 
                                    type="password" 
                                    placeholder="Password" 
                                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={!nik || !fullName || !password || loading}
                                className={`w-full py-3 mt-4 text-white uppercase text-sm font-medium transition-colors ${nik && fullName && password && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                            >
                                {loading ? "Memproses..." : "Daftar"}
                            </button>
                        </form>
                    )}

                    {step === 1 && (
                        <>
                            <div className="mt-6 text-center text-[10px] text-gray-500 max-w-xs mx-auto">
                                Dengan mendaftar, Anda setuju dengan <Link href="#" className="text-blue-600">Syarat, Ketentuan</Link> dan <Link href="#" className="text-blue-600">Kebijakan Privasi</Link> DesaMart.
                            </div>
                            <div className="mt-6 text-center text-sm text-gray-500">
                                Punya akun? <Link href="/umkm/login" className="text-blue-600 font-medium">Log In</Link>
                            </div>
                        </>
                    )}
                </div>

                {/* MODALS OVERLAY */}
                {modal !== "none" && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        
                        {/* 1. Terms Modal */}
                        {modal === "terms" && (
                            <div className="bg-white rounded max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Simak Ketentuan Akun DesaMart</h3>
                                    <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                                        Dengan mendaftar & menggunakan DesaMart, saya mengakui telah membaca dan menyetujui <span className="text-blue-600 cursor-pointer">Syarat, Ketentuan dan Kebijakan dari DesaMart</span> & <span className="text-blue-600 cursor-pointer">Kebijakan Privasi</span> DesaMart.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => setModal("none")} className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={handleTermsAgree} className="px-8 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700">Setuju</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Puzzle Modal */}
                        {modal === "puzzle" && (
                            <div className="bg-white w-[350px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-medium text-gray-800">Verifikasi untuk melanjutkan</h3>
                                    <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                </div>
                                <div className="p-4">
                                    <div className="aspect-[16/9] bg-slate-200 relative mb-4 overflow-hidden rounded-sm group select-none">
                                        <img src={captchaImg} className="w-full h-full object-cover" alt="captcha" draggable={false} />
                                        
                                        {/* Puzzle Target Hole */}
                                        {!puzzleSolved && (
                                            <div 
                                                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 shadow-inner rounded-sm backdrop-blur-[2px]"
                                                style={{ left: `${puzzleTarget}px` }}
                                            />
                                        )}

                                        {/* The Draggable Puzzle Piece */}
                                        {!puzzleSolved && (
                                            <div 
                                                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-sm border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] overflow-hidden"
                                                style={{ left: `${sliderPos}px` }}
                                            >
                                                <img 
                                                    src={captchaImg} 
                                                    className="absolute w-[318px] h-[178px] object-cover max-w-none" 
                                                    style={{ left: `-${sliderPos}px`, top: '-58px' }} 
                                                    alt="piece"
                                                    draggable={false}
                                                />
                                            </div>
                                        )}

                                        {puzzleSolved && (
                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                                <CheckCircle2 size={48} className="text-green-500 drop-shadow-lg" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Slider Container */}
                                    <div ref={sliderRef} className="bg-gray-100 p-1 relative rounded-sm h-12 flex items-center overflow-hidden select-none">
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none">
                                            {puzzleSolved ? "Berhasil diverifikasi" : "Geser untuk menyelesaikan puzzle"}
                                        </div>
                                        
                                        {/* Slider button */}
                                        <div 
                                            onPointerDown={handlePointerDown}
                                            className={`relative z-10 w-12 h-10 flex items-center justify-center text-white rounded-sm shadow transition-colors touch-none ${puzzleSolved ? 'bg-green-500' : isDragging ? 'bg-blue-700 cursor-grabbing' : 'bg-blue-600 cursor-grab hover:bg-blue-700'}`}
                                            style={{ transform: `translateX(${sliderPos}px)` }}
                                        >
                                            <ArrowRight size={20} className={puzzleSolved ? 'opacity-0' : 'opacity-100'} />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 text-gray-400">
                                        <span className="text-[10px]">ID:OJjpbfzERtC05cx8WmLoRfQinfwn4B48</span>
                                        <div className="flex gap-2">
                                            <RefreshCw size={16} onClick={handleRefreshPuzzle} className="cursor-pointer hover:text-gray-600" />
                                            <Info size={16} className="cursor-pointer hover:text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Send OTP Modal */}
                        {modal === "sendOtp" && (
                            <div className="bg-white rounded max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6">
                                    <p className="text-gray-700 mb-8 leading-relaxed">
                                        DesaMart akan mengirim Kode OTP via WhatsApp ke <br/>
                                        <strong>{phoneNumber}</strong>
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setModal("none")} disabled={loading} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 text-sm">Batal</button>
                                        <button onClick={() => setModal("none")} disabled={loading} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 text-sm">Metode Lain</button>
                                        <button onClick={handleSendOtp} disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-medium shadow-sm ${loading ? 'opacity-50' : ''}`}>
                                            {loading ? 'Mengirim...' : 'Kirim ke WhatsApp'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>
            
            {/* Simple Footer */}
            <footer className="bg-white py-8 border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-500">
                    <p>© 2026 DesaMart. Hak Cipta Dilindungi.</p>
                    <p>Negara & Daerah: Indonesia</p>
                </div>
            </footer>
        </div>
    );
}
