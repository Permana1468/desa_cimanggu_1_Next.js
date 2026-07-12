"use client";

import { useState } from "react";
import { createUmkmStore } from "@/app/actions/umkm";
import { useRouter } from "next/navigation";
import { Store, ShoppingBag } from "lucide-react";

export default function CreateStoreForm({ userId, tenantId }: { userId: string, tenantId: string }) {
    const [storeName, setStoreName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createUmkmStore(userId, tenantId, storeName, description);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Store size={32} className="text-blue-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Buka Toko UMKM Anda</h1>
                <p className="text-gray-500 text-center text-sm mb-6">Lengkapi data di bawah ini untuk mulai berjualan di DesaMart.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-slate-900 bg-white"
                            value={storeName}
                            onChange={e => setStoreName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-slate-900 bg-white"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!storeName || loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors disabled:bg-blue-300"
                    >
                        {loading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </form>
            </div>
        </div>
    );
}
