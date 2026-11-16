"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { 
  X, 
  Camera, 
  KeyRound, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from "lucide-react";
import { updateProfile, changePassword } from "@/actions/settings";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface QuickProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "photo" | "password";
  session: any;
}

export function QuickProfileModal({
  isOpen,
  onClose,
  initialTab = "photo",
  session: propSession,
}: QuickProfileModalProps) {
  const router = useRouter();
  const { data: clientSession, update: updateSession } = useSession();
  const session = clientSession || propSession;
  const [activeTab, setActiveTab] = useState<"photo" | "password">(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User details
  const user = session?.user;
  const userName = user?.name || "Admin Desa";
  const userEmail = user?.email || "-";
  const userRole = (user?.role || "ADMIN_DESA").replace(/_/g, " ");

  // Photo state
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(user?.photo || null);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Synchronize previewPhoto with user session whenever modal opens
  React.useEffect(() => {
    if (isOpen && !isPhotoChanged) {
      setPreviewPhoto(user?.photo || null);
    }
  }, [isOpen, user?.photo, isPhotoChanged]);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  // Compress image client-side to keep DB fast and light (~30KB-50KB)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMessage({ type: "error", text: "Harap pilih berkas foto (JPG, PNG, atau WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage({ type: "error", text: "Ukuran berkas terlalu besar. Maksimum 5MB." });
      return;
    }

    setPhotoMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPreviewPhoto(compressedDataUrl);
          setIsPhotoChanged(true);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    setSavingPhoto(true);
    setPhotoMessage(null);
    try {
      const res = await updateProfile({ photo: previewPhoto });
      if (res.success) {
        setPhotoMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
        setIsPhotoChanged(false);
        if (updateSession) {
          await updateSession();
        }
        router.refresh();
      } else {
        setPhotoMessage({ type: "error", text: res.error || "Gagal memperbarui foto profil." });
      }
    } catch {
      setPhotoMessage({ type: "error", text: "Terjadi kesalahan sistem saat menyimpan foto." });
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil dan kembali ke avatar inisial?")) return;
    setSavingPhoto(true);
    setPhotoMessage(null);
    try {
      const res = await updateProfile({ photo: null });
      if (res.success) {
        setPreviewPhoto(null);
        setIsPhotoChanged(false);
        setPhotoMessage({ type: "success", text: "Foto profil berhasil dihapus." });
        if (updateSession) {
          await updateSession();
        }
        router.refresh();
      } else {
        setPhotoMessage({ type: "error", text: res.error || "Gagal menghapus foto." });
      }
    } catch {
      setPhotoMessage({ type: "error", text: "Terjadi kesalahan sistem." });
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Password baru harus memiliki minimal 6 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "Konfirmasi password baru tidak cocok!" });
      return;
    }

    setSavingPass(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPassMessage({ type: "success", text: "Password Anda berhasil diperbarui!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setPassMessage({ type: "error", text: res.error || "Gagal mengganti password." });
      }
    } catch {
      setPassMessage({ type: "error", text: "Terjadi kesalahan saat memproses password." });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Kelola Akun & Keamanan
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Perbarui foto profil dan kredensial keamanan akun Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4">
          <div className="flex bg-[#f4f7fc] p-1.5 rounded-full border border-slate-200/60">
            <button
              onClick={() => {
                setActiveTab("photo");
                setPhotoMessage(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "photo"
                  ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Camera size={15} />
              <span>Foto Profil</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("password");
                setPassMessage(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "password"
                  ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <KeyRound size={15} />
              <span>Ganti Password</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "photo" ? (
            /* TAB 1: UPLOAD / GANTI FOTO PROFIL */
            <div className="space-y-5">
              {photoMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    photoMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {photoMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{photoMessage.text}</span>
                </div>
              )}

              {/* Avatar Preview */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full bg-[#1d64ec] text-white font-black text-3xl flex items-center justify-center shadow-xl ring-4 ring-blue-100 overflow-hidden relative">
                    {previewPhoto ? (
                      <Image
                        src={previewPhoto}
                        alt="Foto Profil"
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Camera overlay badge */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Pilih Berkas Foto"
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#1d64ec] text-white flex items-center justify-center shadow-lg ring-3 ring-white hover:bg-blue-700 transition-transform active:scale-90 cursor-pointer"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{userName}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{userEmail}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d64ec] text-[9px] font-black uppercase tracking-wider">
                    {userRole}
                  </span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Photo Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-full bg-[#f4f7fc] hover:bg-blue-50 text-slate-700 hover:text-[#1d64ec] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200/70"
                >
                  <Upload size={16} />
                  <span>Pilih Berkas Foto Baru</span>
                </button>

                {isPhotoChanged && (
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    disabled={savingPhoto}
                    className="w-full py-3 px-4 rounded-full bg-[#1d64ec] hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingPhoto ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>Simpan Perubahan Foto</span>
                  </button>
                )}

                {previewPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={savingPhoto}
                    className="w-full py-2.5 px-4 rounded-full text-rose-500 hover:bg-rose-50 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus Foto Profil</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Mendukung format JPG, PNG, atau WebP. Foto akan otomatis dioptimasi agar memuat cepat di dashboard.
              </p>
            </div>
          ) : (
            /* TAB 2: RESET / GANTI PASSWORD */
            <form onSubmit={handleResetPassword} className="space-y-4">
              {passMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    passMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {passMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{passMessage.text}</span>
                </div>
              )}

              {/* Password Lama */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    required
                    className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#f4f7fc] border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d64ec] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#f4f7fc] border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d64ec] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    required
                    className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#f4f7fc] border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d64ec] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPass || !oldPassword || !newPassword || !confirmPassword}
                  className="w-full py-3 px-5 rounded-full bg-[#1d64ec] hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingPass ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  <span>Simpan Password Baru</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

