"use client";

import { useState } from "react";
import { Search, Plus, Filter, LayoutGrid, List as ListIcon, Info, Package, Image as ImageIcon } from "lucide-react";
import { addProduct, deleteProduct } from "@/app/actions/umkm";

export default function SellerDashboardClient({ store, products, orders }: { store: any, products: any[], orders: any[] }) {
    const [activeTab, setActiveTab] = useState("Semua");
    const [isAdding, setIsAdding] = useState(false);
    
    // Add product form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);

    const tabs = ["Semua", `Live (${products.length})`, `Pesanan (${orders.length})`];

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Using single image for simplicity, wrapped in array
        const res = await addProduct(store.id, {
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            images: [image || "https://picsum.photos/400"]
        });
        setLoading(false);
        if (res.success) {
            setIsAdding(false);
            // Reset form
            setName(""); setDescription(""); setPrice(""); setStock(""); setImage("");
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Hapus produk ini?")) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h1 className="text-xl font-medium text-gray-800">Toko: {store.storeName}</h1>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 flex items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> {isAdding ? "Batal Tambah" : "Tambah Produk Baru"}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:text-blue-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="p-6 flex-1 flex flex-col bg-gray-50/50">
                {isAdding && (
                    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 mb-6">
                        <h2 className="text-lg font-medium mb-4">Tambah Produk Baru</h2>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Nama Produk</label>
                                    <input type="text" className="w-full border p-2 rounded" required value={name} onChange={e=>setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Harga (Rp)</label>
                                    <input type="number" className="w-full border p-2 rounded" required value={price} onChange={e=>setPrice(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Stok</label>
                                    <input type="number" className="w-full border p-2 rounded" required value={stock} onChange={e=>setStock(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">URL Gambar (Opsional)</label>
                                    <input type="text" placeholder="https://..." className="w-full border p-2 rounded" value={image} onChange={e=>setImage(e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Deskripsi</label>
                                    <textarea className="w-full border p-2 rounded" rows={3} required value={description} onChange={e=>setDescription(e.target.value)}></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded">
                                    {loading ? "Menyimpan..." : "Simpan Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table Header Controls */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                    <div className="flex gap-4">
                        <span className="font-bold text-gray-800">{products.length} Produk</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex border border-gray-300 rounded-sm overflow-hidden">
                            <button className="p-1.5 bg-gray-100 text-blue-600"><ListIcon size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="border border-gray-200 rounded-sm bg-white overflow-hidden flex-1 overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-[#f6f6f6] text-gray-500 text-xs border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-normal">Produk</th>
                                <th className="p-4 font-normal text-center w-32">Harga</th>
                                <th className="p-4 font-normal text-center w-32">Stok</th>
                                <th className="p-4 font-normal text-center w-32">Terjual</th>
                                <th className="p-4 font-normal text-center w-32">Status</th>
                                <th className="p-4 font-normal text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-24">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Package size={48} className="mb-4 opacity-50" />
                                            <p>Tidak ada produk</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((prod) => {
                                    const images = JSON.parse(prod.images);
                                    return (
                                        <tr key={prod.id} className="border-b border-gray-100">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={images[0]} alt={prod.name} className="w-12 h-12 object-cover border rounded" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{prod.name}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{prod.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-medium text-blue-600">Rp {prod.price.toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-center">{prod.stock}</td>
                                            <td className="p-4 text-center">{prod.sold}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{prod.status}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDelete(prod.id)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
