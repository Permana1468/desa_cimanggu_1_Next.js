"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MonitorSmartphone,
  UserCheck,
  Activity,
  Plus,
  X,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
  getPelayananQueues, 
  createPelayananQueue, 
  updateQueueStatus, 
  QueueItem 
} from "@/actions/pelayanan";

export function AntrianLoket({ session }: { session: any }) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [activeTicket, setActiveTicket] = useState<QueueItem | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    waiting: 0,
    processing: 0,
    completed: 0,
  });
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "processing" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState<string | null>(null);

  // Modal Ambil Tiket
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    nomorHp: "",
    loketKode: "1" as "1" | "2" | "3",
    service: "Pembuatan Surat Keterangan Usaha (SKU)",
    type: "Offline" as "Online" | "Offline",
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchQueues = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      const res = await getPelayananQueues();
      if (res.success) {
        setQueues(res.queues);
        setActiveTicket(res.activeTicket);
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to fetch queues:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
    const handleRefresh = () => fetchQueues();
    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    // Auto-refresh every 10 seconds for real-time synchronization with visibility guard
    const timer = setInterval(fetchQueues, 10000);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      clearInterval(timer);
    };
  }, [fetchQueues]);

  // Audio Chime Synthesizer
  const playChimeTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.18); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.22);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.9);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Indonesian Text-to-Speech (TTS) Announcement
  const handleCall = async (queue: QueueItem) => {
    setCallingId(queue.id);
    playChimeTone();

    // If currently waiting, set to processing in real-time
    if (queue.status === "waiting") {
      await updateQueueStatus(queue.id, "processing");
      await fetchQueues();
    }

    // Speak announcement
    setTimeout(() => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const spokenId = queue.id.split("").join(" "); // e.g. "A 0 0 1"
        const loketNumber = queue.loketKode;
        const text = `Nomor antrean ${spokenId}. Atas nama ${queue.nama}. Silakan menuju ke Loket ${loketNumber}.`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.rate = 0.88;
        utterance.pitch = 1.05;

        utterance.onend = () => setCallingId(null);
        utterance.onerror = () => setCallingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setCallingId(null);
      }
    }, 450);

    setSuccessToast(`Memanggil antrean ${queue.id} (${queue.nama}) ke Loket ${queue.loketKode}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: "waiting" | "processing" | "completed") => {
    const res = await updateQueueStatus(id, newStatus);
    if (res.success) {
      await fetchQueues();
      setSuccessToast(`Status antrean ${id} diperbarui menjadi ${newStatus === "completed" ? "Selesai" : newStatus}`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    setSubmitting(true);
    const res = await createPelayananQueue({
      nama: formData.nama,
      nik: formData.nik,
      nomorHp: formData.nomorHp,
      loketKode: formData.loketKode,
      service: formData.service,
      type: formData.type,
    });
    setSubmitting(false);

    if (res.success && res.item) {
      setIsModalOpen(false);
      setFormData({
        nama: "",
        nik: "",
        nomorHp: "",
        loketKode: "1",
        service: "Pembuatan Surat Keterangan Usaha (SKU)",
        type: "Offline",
      });
      await fetchQueues();
      setSuccessToast(`Tiket ${res.item.id} berhasil dicetak untuk ${res.item.nama}`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Filter queues
  const filteredQueues = queues.filter((q) => {
    const matchesTab =
      activeTab === "all" ? true : q.status === activeTab;
    const matchesSearch =
      searchQuery.trim() === "" ||
      q.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.nik && q.nik.includes(searchQuery));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 text-sm font-bold"
          >
            <Sparkles size={18} className="text-yellow-400 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800">Manajemen Antrean Loket</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[11px] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Sistem panggilan suara otomatis (TTS) & pembagian nomor antrean loket terpadu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tabs Filter */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
            {(
              [
                { id: "all", label: "Semua", count: stats.total },
                { id: "waiting", label: "Menunggu", count: stats.waiting },
                { id: "processing", label: "Diproses", count: stats.processing },
                { id: "completed", label: "Selesai", count: stats.completed },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === t.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === t.id ? "bg-blue-100 text-blue-700" : "bg-slate-200/70 text-slate-600"
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tombol Ambil Tiket Baru */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>+ Ambil Tiket Antrean</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Active Queue Display & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-[2rem] p-7 text-center text-white shadow-xl shadow-blue-600/25 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-widest text-cyan-200 mb-2">
                <Activity size={12} className="animate-pulse text-emerald-300" />
                <span>Sedang Dilayani</span>
              </div>

              <div className="text-6xl font-black tracking-tight my-2 drop-shadow-sm">
                {activeTicket ? activeTicket.id : "-"}
              </div>

              {activeTicket ? (
                <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-base text-white truncate">{activeTicket.nama}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 font-bold uppercase">
                      {activeTicket.type}
                    </span>
                  </div>
                  <p className="text-cyan-100 text-xs font-medium">{activeTicket.service}</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200 font-semibold">
                    <span>{activeTicket.loketNama}</span>
                    <span>{activeTicket.time}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-4 text-xs text-blue-100">
                  Belum ada antrean yang sedang aktif diproses.
                </div>
              )}

              <button
                onClick={() => activeTicket && handleCall(activeTicket)}
                disabled={!activeTicket || callingId === activeTicket?.id}
                className="w-full mt-5 bg-white text-blue-700 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg disabled:opacity-60 disabled:pointer-events-none"
              >
                {callingId === activeTicket?.id ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-blue-600" />
                    <span>Sedang Memanggil Suara...</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={18} className="text-blue-600" />
                    <span>Panggil Suara (TTS)</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Quick Stats Widget */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-sm">Statistik Hari Ini</h4>
              <button 
                onClick={() => fetchQueues()}
                title="Segarkan"
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100/70">
                <span className="text-slate-600 text-xs font-bold flex items-center gap-2">
                  <MonitorSmartphone size={16} className="text-blue-600" /> Online (Portal/WA)
                </span>
                <span className="font-black text-blue-700 text-sm">{stats.online}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/70">
                <span className="text-slate-600 text-xs font-bold flex items-center gap-2">
                  <Users size={16} className="text-emerald-600" /> Offline (Loket Fisik)
                </span>
                <span className="font-black text-emerald-700 text-sm">{stats.offline}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100/70">
                <span className="text-slate-600 text-xs font-bold flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" /> Menunggu Panggilan
                </span>
                <span className="font-black text-amber-700 text-sm">{stats.waiting}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Queue Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Search Bar & Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau nomor tiket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="text-xs text-slate-500 font-bold">
                Menampilkan <span className="text-blue-600 font-black">{filteredQueues.length}</span> antrean
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Tiket</th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warga / Pemohon</th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan Loket & Layanan</th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi Panggilan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueues.map((q) => (
                    <motion.tr
                      key={q.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        activeTicket?.id === q.id ? "bg-blue-50/30 font-semibold" : ""
                      }`}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-base text-slate-900 font-mono">{q.id}</span>
                          {q.type === "Online" ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-extrabold">Online</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">Offline</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-black text-slate-800 text-sm">{q.nama}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {q.nik ? `NIK: ${q.nik}` : q.time}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-700">
                        <div className="font-bold text-slate-800">{q.service}</div>
                        <div className="text-[11px] text-blue-600 font-semibold mt-0.5">{q.loketNama}</div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {q.status === "waiting" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold border border-amber-200">
                            <Clock size={12} /> Menunggu
                          </span>
                        )}
                        {q.status === "processing" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                            <Activity size={12} className="animate-pulse text-blue-600" /> Sedang Diproses
                          </span>
                        )}
                        {q.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                            <CheckCircle2 size={12} /> Selesai
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Panggil Suara */}
                          <button
                            onClick={() => handleCall(q)}
                            disabled={callingId === q.id}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 border border-blue-200 hover:border-transparent active:scale-95 disabled:opacity-50"
                            title="Panggil Suara Speaker"
                          >
                            <Volume2 size={14} />
                            <span>Panggil</span>
                          </button>

                          {/* Tombol Status */}
                          {q.status === "waiting" && (
                            <button
                              onClick={() => handleStatusChange(q.id, "processing")}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-xs transition-colors flex items-center gap-1 border border-indigo-200 hover:border-transparent"
                              title="Tandai Sedang Dilayani"
                            >
                              <UserCheck size={14} />
                              <span>Layani</span>
                            </button>
                          )}

                          {q.status === "processing" && (
                            <button
                              onClick={() => handleStatusChange(q.id, "completed")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold text-xs transition-colors flex items-center gap-1 border border-emerald-200 hover:border-transparent"
                              title="Tandai Selesai"
                            >
                              <CheckCircle2 size={14} />
                              <span>Selesai</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredQueues.length === 0 && !loading && (
                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle size={44} className="text-slate-300 mb-3" />
                  <p className="font-bold text-slate-600">Tidak ada data antrean ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau ganti filter tab.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Ambil Tiket Baru */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cetak Nomor Antrean Baru</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Penetapan tiket loket pelayanan warga Desa Cimanggu I.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Loket Pelayanan *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { kode: "1" as const, name: "Loket 1 (A)", sub: "Persuratan & SKTM" },
                      { kode: "2" as const, name: "Loket 2 (B)", sub: "KTP & Kependudukan" },
                      { kode: "3" as const, name: "Loket 3 (C)", sub: "Konsultasi & Bansos" },
                    ].map((loket) => (
                      <button
                        type="button"
                        key={loket.kode}
                        onClick={() => setFormData({ ...formData, loketKode: loket.kode })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          formData.loketKode === loket.kode
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="font-black text-xs">{loket.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{loket.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="3201..."
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="0812..."
                      value={formData.nomorHp}
                      onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Layanan / Keperluan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembuatan SKU, Surat Kematian, KTP Rusak"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kanal Kedatangan</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.type === "Offline"}
                        onChange={() => setFormData({ ...formData, type: "Offline" })}
                      />
                      <span>Offline (Hadir Langsung di Loket)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.type === "Online"}
                        onChange={() => setFormData({ ...formData, type: "Online" })}
                      />
                      <span>Online (Portal Desa)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>Terbitkan Tiket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
