"use client";

import { useState } from "react";
import { useCart } from "../../CartContext";
import { ShoppingCart } from "lucide-react";

export default function ProductDetailClient({ product, mobile = false }: { product: any, mobile?: boolean }) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            storeId: product.storeId
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (mobile) {
        return (
            <>
                <button onClick={handleAddToCart} className="flex-1 bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-medium">
                    <ShoppingCart size={20} className="mb-1" />
                    <span className="text-[10px]">{added ? "Ditambahkan!" : "Masukkan Keranjang"}</span>
                </button>
                <button className="flex-[1.5] bg-blue-600 text-white font-medium flex items-center justify-center text-sm">
                    Beli Sekarang
                </button>
            </>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="w-20">Kuantitas</span>
                <div className="flex border border-gray-300 rounded-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-1 hover:bg-gray-50">-</button>
                    <input type="number" value={quantity} readOnly className="w-16 text-center border-l border-r border-gray-300 outline-none" />
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-1 hover:bg-gray-50">+</button>
                </div>
                <span>Tersisa {product.stock} buah</span>
            </div>
            
            <div className="flex gap-4 mt-4">
                <button onClick={handleAddToCart} className="flex items-center gap-2 bg-blue-50 border border-blue-600 text-blue-600 px-6 py-3 rounded-sm font-medium hover:bg-blue-100 transition-colors">
                    <ShoppingCart size={20} />
                    {added ? "Telah Ditambahkan" : "Masukkan Keranjang"}
                </button>
                <button className="bg-blue-600 text-white px-10 py-3 rounded-sm font-medium hover:bg-blue-700 transition-colors">
                    Beli Sekarang
                </button>
            </div>
        </div>
    );
}
