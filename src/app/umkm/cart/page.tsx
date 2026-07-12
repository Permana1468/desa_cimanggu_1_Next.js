"use client";

import Link from "next/link";
import { useCart } from "../CartContext";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/umkm" className="text-gray-600 hover:text-blue-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-medium text-gray-800">Keranjang Belanja</h1>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                        <ShoppingBag size={64} className="opacity-30 mb-4" />
                        <p className="mb-4">Keranjang belanja Anda masih kosong</p>
                        <Link href="/umkm" className="bg-blue-600 text-white px-6 py-2 rounded-sm hover:bg-blue-700">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-sm shadow-sm flex gap-4">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded border" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                                            <p className="text-blue-600 font-bold mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex border border-gray-300 rounded">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">-</button>
                                                <input type="number" value={item.quantity} readOnly className="w-12 text-center text-sm border-l border-r border-gray-300 outline-none" />
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-4 rounded-sm shadow-sm h-fit sticky top-20">
                            <h3 className="font-medium text-gray-800 mb-4">Ringkasan Belanja</h3>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Total Harga ({cart.length} barang)</span>
                                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="border-t border-gray-200 my-4"></div>
                            <div className="flex justify-between font-bold text-gray-800 mb-6">
                                <span>Total Belanja</span>
                                <span className="text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <Link href="/umkm/checkout" className="block w-full bg-blue-600 text-white text-center py-3 rounded-sm hover:bg-blue-700 font-medium transition-colors">
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
