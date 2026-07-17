"use client";

import { useState } from "react";
import { MessageCircle, Send, AlertTriangle, CheckCircle2, Loader2, Smartphone, QrCode } from "lucide-react";

export default function WhatsappIntegrationClient() {
  const [activeTab, setActiveTab] = useState<"fonnte" | "webjs">("fonnte");
  
  // Fonnte State
  const [targetNumber, setTargetNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });

  const handleTestFonnte = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const res = await fetch("/api/whatsapp/fonnte/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetNumber, message })
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ type: "success", msg: "Pesan berhasil dikirim via Fonnte!" });
      } else {
        setStatus({ type: "error", msg: data.error || "Gagal mengirim pesan." });
      }
    } catch (err: any) {
      setStatus({ type: "error", msg: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("fonnte")}
          className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === "fonnte" ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}
        >
          Fonnte API (Disarankan)
        </button>
        <button
          onClick={() => setActiveTab("webjs")}
          className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "webjs" ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/30" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}
        >
          WhatsApp Web.js <AlertTriangle size={14} className={activeTab === "webjs" ? "text-amber-300" : "text-amber-500"} />
        </button>
      </div>

      {activeTab === "fonnte" && (
        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Smartphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Koneksi Fonnte Aktif</h2>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Token Terdeteksi
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Sistem saat ini menggunakan token Fonnte rahasia yang telah dikonfigurasi. Anda dapat menguji pengiriman pesan secara langsung di bawah ini.
            </p>

            <form onSubmit={handleTestFonnte} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Tujuan (Gunakan format 08...)</label>
                <input
                  type="text"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pesan Uji Coba</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik pesan testing di sini..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm min-h-[100px] resize-none"
                  required
                />
              </div>

              {status.msg && (
                <div className={`p-4 rounded-xl text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Kirim Pesan Test</>}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-center">
            <h3 className="font-black text-slate-900 tracking-tight mb-4">Fitur Notifikasi (Segera Hadir)</h3>
            <ul className="space-y-4">
              {[
                "Notifikasi warga baru mendaftar",
                "Update status pengajuan surat warga",
                "Notifikasi laporan pengaduan masuk",
                "Blast pengumuman ke seluruh Ketua RT"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "webjs" && (
        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Limitasi Infrastruktur Serverless</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
              Library <code className="bg-slate-100 px-2 py-1 rounded text-rose-500">whatsapp-web.js</code> memerlukan proses browser Chromium (*Headless Chrome*) yang berjalan terus-menerus (24/7) di belakang layar untuk mempertahankan koneksi sesi WA Web. 
              <br/><br/>
              Sistem Desa Cimanggu I saat ini dibangun menggunakan arsitektur <strong>Next.js (Serverless)</strong>. Serverless secara otomatis mematikan proses (*sleep*) setelah beberapa detik ketika tidak ada request. Oleh karena itu, <code>whatsapp-web.js</code> <strong>tidak akan stabil dan akan sering terputus</strong> jika dijalankan secara langsung di dalam kode aplikasi ini.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 max-w-2xl mx-auto text-left flex items-start gap-4">
            <QrCode className="text-amber-600 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-black text-amber-900 text-sm">Solusi Eksekusi WA Web.js</h4>
              <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                Jika Anda benar-benar ingin menggunakan metode <em>QR Code Scanner</em> gratisan, Anda harus menyiapkan satu buah <strong>VPS Server khusus (Node.js/Express)</strong> terpisah dari aplikasi ini yang berjalan menggunakan PM2 atau Docker, yang berfungsi sebagai &quot;Gateway Microservice&quot; khusus untuk merender <code>whatsapp-web.js</code>.
                <br/><br/>
                Untuk keamanan, keandalan tingkat *Enterprise*, dan kemudahan *maintenance*, <strong>penggunaan Fonnte API sangat direkomendasikan</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
