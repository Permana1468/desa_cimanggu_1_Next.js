"use client";

import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
    onUploadSuccess: (url: string) => void;
    defaultValue?: string;
    label?: string;
    bucket?: string;
    localOnly?: boolean;
}

export function ImageUpload({ 
    onUploadSuccess, 
    defaultValue = "", 
    label = "Upload Gambar",
    bucket = "village-assets",
    localOnly = false
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(defaultValue);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];

            if (localOnly) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const MAX_WIDTH = 900;
                        const MAX_HEIGHT = 900;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0, width, height);

                        // Compress to JPEG with 0.8 quality for smaller file size without being blurry
                        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
                        
                        setPreviewUrl(compressedBase64);
                        onUploadSuccess(compressedBase64);
                        setUploading(false);
                    };
                    img.src = reader.result as string;
                };
                reader.readAsDataURL(file);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal mengunggah");
            }

            if (data?.url) {
                setPreviewUrl(data.url);
                onUploadSuccess(data.url);
            }
        } catch (error: any) {
            alert(`Gagal mengunggah gambar: ${error.message}`);
        } finally {
            if (!localOnly) setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>}
            
            <div className="relative group overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] min-h-[160px] flex flex-col items-center justify-center transition-all hover:border-blue-400/50">
                {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                type="button"
                                onClick={() => setPreviewUrl("")}
                                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-6">
                        {uploading ? (
                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                        ) : (
                            <Upload size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        )}
                        <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">
                            {uploading ? "Sedang Mengunggah..." : "Pilih atau Seret Foto"}
                        </span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleUpload} 
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
