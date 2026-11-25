"use client";

import { useState } from "react";
import { useCart } from "../../CartContext";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductDetailClient({
  product,
  mobile = false,
}: {
  product: any;
  mobile?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const outOfStock = (product.stock || 0) <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      storeId: product.storeId,
      storeName: product.storeName,
      maxStock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      storeId: product.storeId,
      storeName: product.storeName,
      maxStock: product.stock,
    });
    router.push("/umkm/checkout");
  };

  if (mobile) {
    return (
      <>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-medium disabled:opacity-40"
        >
          <ShoppingCart size={20} className="mb-1" />
          <span className="text-[10px]">
            {outOfStock ? "Stok Habis" : added ? "Ditambahkan!" : "Keranjang"}
          </span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-[1.5] bg-blue-600 text-white font-bold flex items-center justify-center text-sm disabled:bg-slate-400"
        >
          {outOfStock ? "Habis" : "Beli Sekarang"}
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="w-20">Kuantitas</span>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={outOfStock}
            className="px-4 py-1.5 hover:bg-gray-100 font-bold"
          >
            -
          </button>
          <input
            type="number"
            value={outOfStock ? 0 : quantity}
            readOnly
            className="w-16 text-center border-l border-r border-gray-300 outline-none font-bold"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={outOfStock}
            className="px-4 py-1.5 hover:bg-gray-100 font-bold"
          >
            +
          </button>
        </div>
        <span className={outOfStock ? "text-rose-600 font-bold" : "text-slate-500 font-medium"}>
          {outOfStock ? "Stok habis" : `Tersisa ${product.stock} buah`}
        </span>
      </div>

      <div className="flex gap-4 mt-2">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex items-center gap-2 bg-blue-50 border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ShoppingCart size={18} />
          {added ? "Telah Ditambahkan" : "Masukkan Keranjang"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-slate-400 cursor-pointer"
        >
          {outOfStock ? "Stok Habis" : "Beli Sekarang"}
        </button>
      </div>
    </div>
  );
}
