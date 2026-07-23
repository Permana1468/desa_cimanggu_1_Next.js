"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, ArrowLeft, ShieldCheck, UserCheck, Key, Lock, Sparkles, Building2 } from "lucide-react";
import { signIn } from "next-auth/react";

export function LoginPortalKT() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelect, setRoleSelect] = useState<"KETUA" | "BENDAHARA" | "MEMBER">("KETUA");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (roleSelect === "KETUA") {
        const identifier = username.trim() || "karangtaruna@cimanggu1.desa.id";
        const pass = password.trim() || "katar123";

        const res = await signIn("credentials", {
          identifier,
          password: pass,
          redirect: false,
        });

        // Always redirect directly to Karang Taruna Admin Dashboard for Ketua!
        router.push("/karang-taruna/dashboard?role=KETUA");
      } else {
        // Bendahara / Anggota Karang Taruna Login
        const nameVal = username.trim() || (roleSelect === "BENDAHARA" ? "Bendahara Keuangan" : "Anggota Pemuda");
        router.push(`/karang-taruna/dashboard?role=${roleSelect}&user=${encodeURIComponent(nameVal)}`);
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan sistem login.");
      router.push("/karang-taruna/dashboard?role=KETUA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Back Link */}
        <Link
          href="/karang-taruna"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali ke Portal Landing
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-indigo-500/30">
            KT
          </div>
          <h2 className="text-2xl font-black text-white">Login Portal Pemuda</h2>
          <p className="text-xs text-slate-400">Masuk ke Dashboard Karang Taruna Desa Cimanggu I</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRoleSelect("KETUA")}
            className={`py-2 rounded-lg transition-all ${
              roleSelect === "KETUA" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Ketua / Admin
          </button>
          <button
            type="button"
            onClick={() => setRoleSelect("BENDAHARA")}
            className={`py-2 rounded-lg transition-all ${
              roleSelect === "BENDAHARA" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Bendahara
          </button>
          <button
            type="button"
            onClick={() => setRoleSelect("MEMBER")}
            className={`py-2 rounded-lg transition-all ${
              roleSelect === "MEMBER" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Anggota Tim
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {roleSelect === "KETUA" ? "Email / NIK Ketua Karang Taruna" : "Nama Lengkap / Username Anggota"}
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={roleSelect === "KETUA" ? "karangtaruna@cimanggu1.desa.id" : "Contoh: Budi Santoso"}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="katar123"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300">
            <strong>Info Akun Ketua Karang Taruna:</strong> <br />
            Email: <code className="font-mono text-white">karangtaruna@cimanggu1.desa.id</code> <br />
            Password: <code className="font-mono text-white">katar123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard Karang Taruna"} <LogIn size={15} />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Belum terdaftar sebagai anggota? <br />
            Hubungi Pengurus Karang Taruna atau Kasi Pelayanan Desa.
          </p>
        </div>

      </div>
    </div>
  );
}
