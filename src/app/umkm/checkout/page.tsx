"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import { ArrowLeft, MapPin, CheckCircle } from "lucide-react";
import { createCheckout } from "@/app/actions/umkm";

export default function CheckoutPage() {
    const { cart, totalAmount, clearCart } = useCart();
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        if (!address) {
            alert("Mohon isi alamat pengiriman");
            return;
        }

        setLoading(true);
        // We need buyerId. In a real app we would get this from useSession
        // For now, we will assume a generic checkout or fetch session in action
        // Actually, we must use server action and pass session from there or here.
        // Let's import session here
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (!session?.user) {
            alert("Harap login terlebih dahulu");
            router.push("/umkm/login");
            return;
        }

        const user = session.user as any;
        
        // Group items by store
        const storeGroups = cart.reduce((acc, item) => {
            if(!acc[item.storeId]) acc[item.storeId] = [];
            acc[item.storeId].push(item);
            return acc;
        }, {} as Record<string, typeof cart>);

        // Process each store order
        for (const storeId of Object.keys(storeGroups)) {
            const items = storeGroups[storeId];
            const storeTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            await createCheckout(
                storeId,
                user.id,
                storeTotal,
                address,
                items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }))
            );
        }

        setLoading(false);
        setSuccess(true);
        clearCart();
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <CheckCircle size={80} className="text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
                <p className="text-gray-600 text-center mb-6">Pesanan Anda telah diteruskan ke penjual dan menunggu konfirmasi. Pembayaran dilakukan secara COD.</p>
                <Link href="/umkm" className="bg-blue-600 text-white px-6 py-2 rounded-sm hover:bg-blue-700 transition-colors">
                    Kembali Belanja
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Keranjang kosong. <Link href="/umkm" className="text-blue-600">Kembali belanja</Link></p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 flex items-center gap-3">
                <Link href="/umkm/cart" className="text-gray-600 hover:text-blue-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-medium text-gray-800">Checkout</h1>
            </header>

            <main className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-4">
                {/* Alamat */}
                <div className="bg-white p-4 rounded-sm shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-blue-600 font-medium">
                        <MapPin size={18} />
                        <h2>Alamat Pengiriman</h2>
                    </div>
                    <textarea 
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-blue-500" 
                        rows={3} 
                        placeholder="Masukkan alamat lengkap (RT/RW, Patokan)"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    ></textarea>
                </div>

                {/* Ringkasan Item */}
                <div className="bg-white p-4 rounded-sm shadow-sm">
                    <h2 className="font-medium text-gray-800 mb-4">Produk Dipesan</h2>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</span>
                                        <span className="font-medium">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metode Pembayaran */}
                <div className="bg-white p-4 rounded-sm shadow-sm">
                    <h2 className="font-medium text-gray-800 mb-3">Metode Pembayaran</h2>
                    <div className="border border-blue-600 bg-blue-50 text-blue-800 p-3 rounded text-sm font-medium">
                        Bayar di Tempat (COD)
                    </div>
                </div>

                {/* Total */}
                <div className="bg-white p-4 rounded-sm shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4 text-gray-800">
                        <span className="font-medium text-lg">Total Pembayaran</span>
                        <span className="font-bold text-xl text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <button 
                        onClick={handleCheckout} 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium py-3 rounded-sm hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? "Memproses..." : "Buat Pesanan"}
                    </button>
                </div>
            </main>
        </div>
    );
}
