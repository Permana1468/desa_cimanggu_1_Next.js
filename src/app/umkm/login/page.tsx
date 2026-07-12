"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Eye, EyeOff, QrCode, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";

export default function UmkmLogin() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<"password" | "qr">("password");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials", {
            identifier,
            password,
            redirect: false,
        });
        
        setLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            router.push("/umkm");
            router.refresh();
        }
    };

    const loginGoogle = () => signIn("google", { callbackUrl: "/umkm" });
    const loginFacebook = () => signIn("facebook", { callbackUrl: "/umkm" });

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-10 py-5 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Link href="/umkm" className="flex items-center gap-2 text-blue-600">
                        <ShoppingBag size={40} className="fill-blue-600 text-white p-1" />
                        <span className="text-3xl font-medium tracking-tight">DesaMart</span>
                    </Link>
                    <span className="text-2xl font-normal text-gray-700 mt-1">Log In</span>
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

                {/* Login Box */}
                <div className="w-full max-w-[400px] bg-white rounded shadow-xl p-8 z-10 lg:ml-auto lg:mr-[15%] mx-4">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium text-gray-800">Log In {loginMethod === "qr" && "dengan QR"}</h2>
                        
                        {/* Toggle QR / Password Button */}
                        <div className="relative group cursor-pointer" onClick={() => setLoginMethod(prev => prev === "qr" ? "password" : "qr")}>
                            {loginMethod === "password" ? (
                                <>
                                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs px-2 py-1 absolute right-12 -top-1 font-bold rounded shadow-sm whitespace-nowrap z-10 after:content-[''] after:absolute after:top-1.5 after:-right-[6px] after:border-[6px] after:border-transparent after:border-l-yellow-50 after:z-20 before:content-[''] before:absolute before:top-1.5 before:-right-[7.5px] before:border-[7px] before:border-transparent before:border-l-yellow-300 before:z-0">
                                        Log in dengan QR
                                    </div>
                                    <button className="text-blue-600 p-1 hover:bg-gray-50 rounded transition-colors">
                                        <QrCode size={36} strokeWidth={1.5} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs px-2 py-1 absolute right-12 -top-1 font-bold rounded shadow-sm whitespace-nowrap z-10 after:content-[''] after:absolute after:top-1.5 after:-right-[6px] after:border-[6px] after:border-transparent after:border-l-yellow-50 after:z-20 before:content-[''] before:absolute before:top-1.5 before:-right-[7.5px] before:border-[7px] before:border-transparent before:border-l-yellow-300 before:z-0">
                                        Log in dengan Password
                                    </div>
                                    <button className="text-blue-600 p-1 hover:bg-gray-50 rounded transition-colors">
                                        <KeyRound size={36} strokeWidth={1.5} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {loginMethod === "password" ? (
                        <>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="No. Handphone/Username/Email" 
                                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors text-slate-900 bg-white"
                                        value={identifier}
                                        onChange={e => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Password" 
                                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:outline-none transition-colors pr-24 text-slate-900 bg-white"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-500 hover:text-gray-700 border-r border-gray-300 pr-2"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <Link href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Lupa<br/>Password?</Link>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={!identifier || !password || loading}
                                    className={`w-full py-3 mt-4 text-white uppercase text-sm font-medium transition-colors ${identifier && password && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                                >
                                    {loading ? "Memproses..." : "Log In"}
                                </button>
                            </form>

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

                            <div className="mt-6 text-center text-[10px] text-gray-500 max-w-xs mx-auto">
                                Dengan login, kamu menyetujui <Link href="#" className="text-blue-600">Syarat, Ketentuan dan Kebijakan dari DesaMart</Link> & <Link href="#" className="text-blue-600">Kebijakan Privasi</Link> DesaMart.
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://desamart.id/login" alt="QR Code" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded flex items-center justify-center shadow-md">
                                    <ShoppingBag size={24} className="fill-blue-600 text-white p-0.5" />
                                </div>
                            </div>
                            <p className="text-gray-700 font-medium text-lg text-center mb-2">Scan kode QR dengan Aplikasi<br/>DesaMart</p>
                            <button className="text-blue-600 font-medium mb-6">Cara Scan</button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Baru di DesaMart? <Link href="/umkm/register" className="text-blue-600 font-medium">Daftar</Link>
                    </div>
                </div>
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
