"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export function RefreshNodeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      router.refresh();
      toast.success("Node data berhasil disegarkan!");
    } catch {
      toast.error("Gagal menyegarkan data.");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="bg-slate-950 text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-60"
    >
      <RefreshCw size={14} className={loading ? "animate-spin text-blue-400" : ""} />
      <span>{loading ? "Menyinkron..." : "Refresh Node"}</span>
    </button>
  );
}

