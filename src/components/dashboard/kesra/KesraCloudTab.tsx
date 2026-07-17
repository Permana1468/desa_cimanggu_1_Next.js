"use client";

import { useState, useEffect } from "react";
import { FolderArchive, Upload, FileText, Download, RefreshCw, Save, AlertCircle, Image as ImageIcon, FileCode, Settings, Key, Mail, CheckCircle2, Link as LinkIcon, Database } from "lucide-react";

export function KesraCloudTab({ session }: any) {
  const [config, setConfig] = useState({
    folderId: "",
    clientEmail: "",
    privateKey: "",
    hasPrivateKey: false,
    connected: false
  });
  
  const [files, setFiles] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/drive/config");
      const data = await res.json();
      if (res.ok) {
        setConfig(prev => ({
          ...prev,
          folderId: data.folderId || "",
          clientEmail: data.clientEmail || "",
          hasPrivateKey: data.hasPrivateKey || false,
          connected: data.connected || false
        }));
        if (!data.connected) {
          // Do nothing, UI will show not connected
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingConfig(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config.connected && config.folderId) {
      fetchFiles(config.folderId);
    } else {
      setFiles([]);
    }
  }, [config.connected, config.folderId]);


  async function fetchFiles(fid: string) {
    if (!fid) return;
    setLoadingFiles(true);
    setError("");
    try {
      const res = await fetch(`/api/drive?folderId=${fid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data dari Google Drive");
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message);
      // If error occurs reading files, we might be disconnected or have invalid creds
      setConfig(prev => ({ ...prev, connected: false }));
    }
    setLoadingFiles(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config.folderId) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("folderId", config.folderId);
    formData.append("file", file);

    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengupload file");
      
      await fetchFiles(config.folderId);
    } catch (err: any) {
      setError(err.message);
    }
    setUploading(false);
    if (e.target) e.target.value = '';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("image")) return <ImageIcon className="text-blue-500" size={24} />;
    if (mimeType.includes("pdf")) return <FileText className="text-red-500" size={24} />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileCode className="text-green-500" size={24} />;
    return <FileText className="text-slate-500" size={24} />;
  };

  const formatSize = (bytes: string) => {
    if (!bytes) return "-";
    const b = parseInt(bytes);
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 pointer-events-none">
          <Database size={250} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <FolderArchive size={36} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">Cloud Storage Kesra</h2>
              <p className="text-blue-100 font-medium mt-1">Integrasi Penyimpanan Google Drive Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
            <div className={`w-3 h-3 rounded-full ${config.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'} shadow-[0_0_10px_currentColor]`} />
            <span className="font-bold text-sm tracking-wide">
              {loadingConfig ? "Mengecek..." : config.connected ? "TERHUBUNG KE GOOGLE" : "BELUM TERHUBUNG"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div className="text-sm">
            <p className="font-bold mb-1">Terjadi Kesalahan</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!config.connected && !loadingConfig && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Settings size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Integrasi Belum Dikonfigurasi</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Untuk menggunakan fitur Cloud Storage, Anda harus mengatur integrasi Google Drive terlebih dahulu.
          </p>
          <a 
            href="/dashboard/settings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            Buka Pengaturan Akun
          </a>
        </div>
      )}

      {/* File Manager Section */}
      {config.connected && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Database size={20} className="text-blue-500" />
                Daftar File Cloud
              </h3>
              <p className="text-sm text-slate-500">
                Menampilkan isi dari folder: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs ml-1">{config.folderId}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchFiles(config.folderId)}
                disabled={loadingFiles}
                className="p-2.5 text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center group"
                title="Refresh Daftar File"
              >
                <RefreshCw size={18} className={`group-hover:text-blue-600 transition-colors ${loadingFiles ? "animate-spin text-blue-600" : ""}`} />
              </button>
              
              <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
                {uploading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {uploading ? 'Mengupload...' : 'Upload File'}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama File</th>
                  <th className="px-6 py-4">Ukuran</th>
                  <th className="px-6 py-4">Tanggal Diupload</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingFiles ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <RefreshCw size={36} className="mb-4 animate-spin text-blue-500" />
                        <p className="text-base font-bold text-slate-600">Menyinkronkan dari Google Drive...</p>
                        <p className="text-sm mt-1">Harap tunggu sebentar</p>
                      </div>
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <FolderArchive size={56} className="mb-5 text-slate-200" />
                        <p className="text-lg font-bold text-slate-700">Folder masih kosong</p>
                        <p className="text-sm mt-1 max-w-sm text-center">Belum ada dokumen yang diupload ke dalam folder Google Drive ini. Klik tombol Upload File untuk menambahkan dokumen.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">{file.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                        {new Date(file.createdTime).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={file.webContentLink || file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700 bg-blue-50/80 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
                            title="Download File"
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
