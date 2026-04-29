import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <div className="w-16 h-16 bg-[#1e293b]/60 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                    <Loader size={32} className="text-blue-400 animate-spin" />
                </div>
            </div>
            
            <h3 className="mt-8 text-xl font-bold text-white tracking-tight">
                Menyiapkan Halaman...
            </h3>
            <p className="mt-2 text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                Mohon tunggu sejenak sementara sistem memuat modul data terbaik untuk Anda.
            </p>
        </div>
    );
};

export default LoadingScreen;
