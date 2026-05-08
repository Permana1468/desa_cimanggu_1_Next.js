"use client";
import { Clock } from "lucide-react";

export default function TrackingPage() {
    return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Clock size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Tracking Layanan</h1>
            <p className="text-slate-500 max-w-md text-center">Fitur pelacakan progres layanan sedang dalam tahap optimalisasi untuk memberikan data yang lebih akurat.</p>
        </div>
    );
}
