import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, MessageSquare, Share2 } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const product = await prisma.umkmProduct.findUnique({
        where: { id: resolvedParams.id },
        include: { store: true }
    });

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header Mobile */}
            <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
                <Link href="/umkm" className="p-2 bg-gray-100 rounded-full text-gray-700">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 rounded-full text-gray-700"><Share2 size={20} /></button>
                    <Link href="/umkm/cart" className="p-2 bg-gray-100 rounded-full text-gray-700"><ShoppingCart size={20} /></Link>
                </div>
            </header>

            {/* Header Desktop */}
            <header className="hidden md:flex bg-blue-600 text-white py-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
                    <Link href="/umkm" className="text-2xl font-bold flex items-center gap-2">
                        <span>DesaMart</span>
                    </Link>
                    <Link href="/umkm/cart" className="relative p-2">
                        <ShoppingCart size={24} />
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto mt-0 md:mt-6 bg-white shadow-sm md:rounded-sm overflow-hidden flex flex-col md:flex-row">
                {/* Images */}
                <div className="w-full md:w-[450px] shrink-0">
                    <div className="aspect-square bg-gray-100 relative">
                        {(() => {
                            let image = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600";
                            try {
                                const parsed = JSON.parse(product.images);
                                if (parsed.length > 0) image = parsed[0];
                            } catch (e) {}
                            return <img src={image} alt={product.name} className="w-full h-full object-cover" />;
                        })()}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 p-4 md:p-6 flex flex-col">
                    <h1 className="text-xl md:text-2xl font-medium text-gray-800 leading-tight">{product.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex text-yellow-400">
                            {'★'.repeat(5)}
                        </div>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600">{product.sold} Terjual</span>
                    </div>

                    <div className="bg-gray-50 p-4 mt-4 rounded-sm flex items-end gap-2">
                        <span className="text-3xl font-bold text-blue-600">Rp{product.price.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Desktop client component for Add to Cart */}
                    <div className="hidden md:block mt-8">
                        <ProductDetailClient 
                            product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: (() => {
                                    try {
                                        const parsed = JSON.parse(product.images);
                                        return parsed[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
                                    } catch(e) { return "https://images.unsplash.com/photo-1542291026-7eec264c27ff"; }
                                })(),
                                storeId: product.storeId,
                                stock: product.stock
                            }} 
                        />
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h2 className="font-medium text-gray-800 bg-gray-50 p-3 rounded-sm">Deskripsi Produk</h2>
                        <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {product.description}
                        </div>
                    </div>
                    
                    <div className="mt-8 border-t border-gray-100 pt-6 flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                            {product.store.storeName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">{product.store.storeName}</h3>
                            <p className="text-xs text-gray-500">Aktif 5 menit lalu</p>
                        </div>
                        <button className="ml-auto border border-blue-600 text-blue-600 px-4 py-1.5 rounded-sm text-sm hover:bg-blue-50">Kunjungi Toko</button>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
                <button className="flex-1 py-3 flex flex-col items-center justify-center border-r border-gray-200 text-blue-600 bg-green-50">
                    <MessageSquare size={20} />
                    <span className="text-[10px] mt-1">Chat</span>
                </button>
                <div className="flex-[3] flex">
                    <ProductDetailClient 
                        mobile={true}
                        product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: (() => {
                                try {
                                    const parsed = JSON.parse(product.images);
                                    return parsed[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
                                } catch(e) { return "https://images.unsplash.com/photo-1542291026-7eec264c27ff"; }
                            })(),
                            storeId: product.storeId,
                            stock: product.stock
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}
