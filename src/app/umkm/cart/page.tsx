"use client";

import Link from "next/link";
import { useCart } from "../CartContext";
import { ArrowLeft, Trash2, ShoppingBag, Receipt } from "lucide-react";
import { UmkmSafeImage } from "@/components/umkm/UmkmSafeImage";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/umkm" className="text-slate-600 hover:text-blue-600">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-lg font-black text-slate-900">Keranjang Belanja ({totalItems})</h1>
        </div>
        <Link href="/umkm/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          <Receipt size={15} /> Pesanan Saya
        </Link>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
            <ShoppingBag size={64} className="opacity-25 mb-4" />
            <p className="mb-4 font-bold">Keranjang belanja Anda masih kosong</p>
            <Link href="/umkm" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-bold text-sm">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-4">
                  <UmkmSafeImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border" />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                      {item.storeName && <p className="text-[11px] text-slate-400 font-semibold">{item.storeName}</p>}
                      <p className="text-blue-700 font-black mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          readOnly
                          className="w-11 text-center text-xs font-bold border-l border-r border-slate-300 outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 cursor-pointer"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-20">
              <h3 className="font-black text-slate-900 mb-4">Ringkasan Belanja</h3>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                <span>Subtotal ({totalItems} item)</span>
                <span className="font-bold text-slate-900">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t border-slate-200 my-4" />
              <div className="flex justify-between font-black text-slate-900 mb-5">
                <span>Estimasi Total</span>
                <span className="text-blue-700 text-lg">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <Link
                href="/umkm/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl hover:bg-blue-700 font-black text-sm transition-colors shadow-md shadow-blue-600/20"
              >
                Lanjut ke Pembayaran
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
