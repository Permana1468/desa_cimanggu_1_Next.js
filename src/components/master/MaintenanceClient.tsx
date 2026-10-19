"use client";

import React, { useState, useTransition } from "react";
import { 
  ALL_SYSTEM_FEATURES, 
  FeatureDefinition, 
  MaintenanceSettings 
} from "@/lib/maintenanceConfig";
import { 
  toggleFeatureAction, 
  toggleGlobalMaintenanceAction, 
  bulkToggleFeaturesAction,
  updateFeatureNoticeAction 
} from "@/actions/maintenance";
import { 
  Power, 
  Wrench, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  RotateCcw, 
  Globe, 
  Filter, 
  Layers, 
  Info,
  X,
  FileText,
  Store,
  Map,
  QrCode,
  HeartHandshake,
  Monitor,
  Megaphone,
  Database,
  PieChart,
  ShieldCheck,
  HardHat,
  Building2,
  Briefcase,
  Archive,
  Activity,
  FileCheck,
  Users,
  UserCog,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { MaintenanceNotice } from "@/components/common/MaintenanceNotice";

// Dynamic Icon Resolver
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Store,
  Map,
  QrCode,
  HeartHandshake,
  Monitor,
  Megaphone,
  Database,
  PieChart,
  ShieldCheck,
  HardHat,
  Building2,
  Briefcase,
  Archive,
  Activity,
  FileCheck,
  Users,
  UserCog,
  MessageSquare,
  Sparkles
};

interface MaintenanceClientProps {
  initialSettings: MaintenanceSettings;
}

export function MaintenanceClient({ initialSettings }: MaintenanceClientProps) {
  const [settings, setSettings] = useState<MaintenanceSettings>(initialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "maintenance">("all");
  
  // Pending transition for smooth UI
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | null>(null);
  const [editNoticeText, setEditNoticeText] = useState("");
  const [previewFeature, setPreviewFeature] = useState<{ name: string; notice: string; category: string } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Statistics
  const totalCount = ALL_SYSTEM_FEATURES.length;
  const maintenanceCount = ALL_SYSTEM_FEATURES.filter(f => settings.features[f.id]?.enabled === false).length;
  const onlineCount = totalCount - maintenanceCount;

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // ── TOGGLE SINGLE FEATURE ──────────────────────────────────────────────
  const handleToggleFeature = (feature: FeatureDefinition, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature.id]: {
          ...prev.features[feature.id],
          enabled: newStatus
        }
      }
    }));

    startTransition(async () => {
      try {
        const res = await toggleFeatureAction(feature.id, newStatus);
        if (res.success) {
          setSettings(res.settings);
          showNotification(
            "success", 
            `${feature.name} kini ${newStatus ? 'ONLINE (Aktif)' : 'MAINTENANCE (Non-aktif)'}`
          );
        }
      } catch (err: any) {
        // Revert
        setSettings(prev => ({
          ...prev,
          features: {
            ...prev.features,
            [feature.id]: {
              ...prev.features[feature.id],
              enabled: currentStatus
            }
          }
        }));
        showNotification("error", err.message || "Gagal mengubah status fitur.");
      }
    });
  };

  // ── TOGGLE GLOBAL MAINTENANCE ───────────────────────────────────────────
  const handleToggleGlobal = (currentGlobal: boolean) => {
    const newGlobal = !currentGlobal;
    const confirmMsg = newGlobal
      ? "PERINGATAN: Mengaktifkan Global Maintenance akan menghentikan akses ke seluruh fitur dan menu portal untuk semua pengguna umum. Lanjutkan?"
      : "Nonaktifkan Global Maintenance dan kembalikan akses portal normal?";

    if (!window.confirm(confirmMsg)) return;

    setSettings(prev => ({ ...prev, isGlobalMaintenance: newGlobal }));

    startTransition(async () => {
      try {
        const res = await toggleGlobalMaintenanceAction(newGlobal);
        if (res.success) {
          setSettings(res.settings);
          showNotification(
            "success", 
            newGlobal ? "Global Maintenance Mode TELAH DIAKTIFKAN." : "Global Maintenance Mode Dinonaktifkan."
          );
        }
      } catch (err: any) {
        setSettings(prev => ({ ...prev, isGlobalMaintenance: currentGlobal }));
        showNotification("error", err.message || "Gagal mengubah mode pemeliharaan global.");
      }
    });
  };

  // ── BULK ACTIONS ────────────────────────────────────────────────────────
  const handleBulkToggle = (turnOnline: boolean) => {
    const actionLabel = turnOnline ? "MENGAKTIFKAN SEMUA FITUR" : "MEMATIKAN SEMUA FITUR (MAINTENANCE)";
    if (!window.confirm(`Apakah Anda yakin ingin ${actionLabel}?`)) return;

    const allIds = ALL_SYSTEM_FEATURES.map(f => f.id);
    startTransition(async () => {
      try {
        const res = await bulkToggleFeaturesAction(allIds, turnOnline);
        if (res.success) {
          setSettings(res.settings);
          showNotification("success", `Seluruh fitur berhasil diatur ke ${turnOnline ? 'ONLINE' : 'MAINTENANCE'}.`);
        }
      } catch (err: any) {
        showNotification("error", err.message || "Gagal melakukan aksi massal.");
      }
    });
  };

  // ── SAVE CUSTOM NOTICE ──────────────────────────────────────────────────
  const handleSaveNotice = async () => {
    if (!editingFeature) return;

    startTransition(async () => {
      try {
        const res = await updateFeatureNoticeAction(editingFeature.id, editNoticeText);
        if (res.success) {
          setSettings(res.settings);
          setEditingFeature(null);
          showNotification("success", `Pesan pemeliharaan untuk ${editingFeature.name} berhasil diperbarui.`);
        }
      } catch (err: any) {
        showNotification("error", err.message || "Gagal memperbarui pesan pemeliharaan.");
      }
    });
  };

  // ── FILTER FEATURES ─────────────────────────────────────────────────────
  const filteredFeatures = ALL_SYSTEM_FEATURES.filter(feature => {
    const matchesSearch = 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.paths.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory;

    const isEnabled = settings.features[feature.id]?.enabled !== false;
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "online" ? isEnabled :
      !isEnabled;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification Alert */}
      {feedbackMsg && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-top duration-300 ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30" 
            : "bg-rose-600 text-white border-rose-500 shadow-rose-600/30"
        }`}>
          {feedbackMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ── 1. GLOBAL COMMAND & STATS HEADER ─────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0d1629] to-slate-950 rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider mb-3">
                <Wrench size={12} />
                Pusat Kontrol Mode Pemeliharaan (Maintenance Engine)
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Kelola Akses & Maintenance Fitur
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed">
                Kendali terpusat untuk mematikan atau mengaktifkan fitur dan modul website. Saat fitur dimatikan (OFF), pengguna umum akan melihat pemberitahuan pemeliharaan secara real-time.
              </p>
            </div>

            {/* Global Master Killswitch */}
            <div className={`p-5 rounded-2xl border transition-all ${
              settings.isGlobalMaintenance 
                ? "bg-rose-950/60 border-rose-500/50 shadow-xl shadow-rose-900/30" 
                : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Master Killswitch
                  </span>
                  <span className="text-sm font-black text-white block">
                    {settings.isGlobalMaintenance ? "Global Maintenance: AKTIF" : "Global Maintenance: Non-Aktif"}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleGlobal(settings.isGlobalMaintenance)}
                  disabled={isPending}
                  className={`relative w-16 h-9 rounded-full transition-colors p-1 flex items-center ${
                    settings.isGlobalMaintenance ? "bg-rose-600" : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  aria-label="Toggle Global Maintenance"
                >
                  <div className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.isGlobalMaintenance ? "translate-x-7" : "translate-x-0"
                  } flex items-center justify-center text-slate-900`}>
                    <Power size={14} className={settings.isGlobalMaintenance ? "text-rose-600" : "text-slate-500"} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Bulk Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Modul</span>
              <span className="text-2xl font-black text-white tabular-nums mt-0.5 block">{totalCount} Fitur</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Online (Aktif)</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums mt-0.5 block">{onlineCount} Fitur</span>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Maintenance (OFF)</span>
              <span className="text-2xl font-black text-rose-400 tabular-nums mt-0.5 block">{maintenanceCount} Fitur</span>
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <button
                onClick={() => handleBulkToggle(true)}
                disabled={isPending}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 size={13} />
                <span>Nyalakan Semua (ON)</span>
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                disabled={isPending}
                className="w-full py-2 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Wrench size={13} />
                <span>Matikan Semua (OFF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & CATEGORY FILTERS ─────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Cari fitur, rute URL, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("online")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "online" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setStatusFilter("maintenance")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "maintenance" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-rose-700"
              }`}
            >
              Maintenance ({maintenanceCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs font-bold text-slate-600">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={12} /> Kategori:
          </span>
          {[
            { id: "all", label: "Semua Kategori" },
            { id: "publik", label: "Layanan Publik" },
            { id: "desa", label: "Dashboard Desa" },
            { id: "resident", label: "Portal Warga" },
            { id: "integrasi", label: "Integrasi Sistem" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. FEATURE CARDS GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredFeatures.map(feature => {
          const isEnabled = settings.features[feature.id]?.enabled !== false;
          const currentNotice = settings.features[feature.id]?.notice || feature.defaultNotice;
          const IconComp: any = iconMap[feature.iconName] || Wrench;

          return (
            <div
              key={feature.id}
              className={`rounded-2xl sm:rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isEnabled
                  ? "bg-white border-slate-200/80 shadow-sm hover:shadow-md"
                  : "bg-gradient-to-br from-rose-50/70 to-amber-50/40 border-rose-200 shadow-md shadow-rose-100 ring-1 ring-rose-200"
              }`}
            >
              <div>
                {/* Card Top: Icon & Status Toggle Switch */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isEnabled
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-rose-100 text-rose-700 border-rose-200 animate-pulse"
                    }`}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {feature.categoryLabel}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
                        {feature.name}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFeature(feature, isEnabled)}
                      disabled={isPending}
                      className={`relative w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
                        isEnabled 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                      aria-label={`Toggle ${feature.name}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-0"
                      } flex items-center justify-center`}>
                        <Power size={12} className={isEnabled ? "text-emerald-600" : "text-rose-600"} />
                      </div>
                    </button>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      isEnabled ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {isEnabled ? "ONLINE (ON)" : "MAINTENANCE (OFF)"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                  {feature.description}
                </p>

                {/* Path tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {feature.paths.map(p => (
                    <span 
                      key={p} 
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Maintenance Notice Box if OFF */}
                {!isEnabled && (
                  <div className="bg-rose-100/70 border border-rose-200/80 rounded-xl p-3 mb-4 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Pesan Pemeliharaan Aktif:</span>
                    </div>
                    <p className="text-rose-950 font-medium text-[11px] leading-relaxed italic">
                      &ldquo;{currentNotice}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setEditingFeature(feature);
                    setEditNoticeText(currentNotice);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <Edit3 size={13} />
                  <span>Atur Pesan</span>
                </button>

                <button
                  onClick={() => {
                    setPreviewFeature({
                      name: feature.name,
                      notice: currentNotice,
                      category: feature.categoryLabel
                    });
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-bold transition-colors"
                >
                  <Eye size={13} />
                  <span>Preview Layar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. MODAL: EDIT CUSTOM NOTICE ─────────────────────────────── */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Atur Pesan Pemeliharaan</h3>
                  <span className="text-xs text-slate-400 font-semibold">{editingFeature.name}</span>
                </div>
              </div>
              <button 
                onClick={() => setEditingFeature(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Pemberitahuan untuk Warga / Pengguna:
              </label>
              <textarea
                rows={4}
                value={editNoticeText}
                onChange={(e) => setEditNoticeText(e.target.value)}
                placeholder="Tuliskan alasan pemeliharaan atau estimasi waktu selesai..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 block">
                Pesan ini akan otomatis tampil saat warga atau admin desa mengakses {editingFeature.name}.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setEditNoticeText(editingFeature.defaultNotice)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Reset Pesan Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingFeature(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveNotice}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md shadow-blue-600/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. MODAL: LIVE PREVIEW LAYAR PEMELIHARAAN ─────────────────── */}
      {previewFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
          <div className="max-w-2xl w-full relative">
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Eye size={14} className="text-emerald-400" />
                Simulasi Tampilan Pengguna Umum (Warga & Admin Desa)
              </span>
              <button
                onClick={() => setPreviewFeature(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Tutup Preview"
              >
                <X size={18} />
              </button>
            </div>

            <MaintenanceNotice 
              featureName={previewFeature.name}
              reason={previewFeature.notice}
              category={previewFeature.category}
              isMasterPreview={true}
              homeUrl="/master-admin/maintenance"
            />
          </div>
        </div>
      )}

    </div>
  );
}
