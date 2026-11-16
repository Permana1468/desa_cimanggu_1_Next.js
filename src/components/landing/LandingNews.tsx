"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, ChevronLeft, ChevronRight, Clock, ArrowUpRight, Newspaper, X, Tag } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface LandingNewsProps {
    newsData: any[];
}

export const LandingNews = ({ newsData }: LandingNewsProps) => {
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [selectedNews, setSelectedNews] = useState<any | null>(null);

    const nextNews = () => {
        if (!newsData.length) return;
        setCurrentNewsIndex((prev) => (prev + 1) % newsData.length);
    };

    const prevNews = () => {
        if (!newsData.length) return;
        setCurrentNewsIndex((prev) => (prev - 1 + newsData.length) % newsData.length);
    };

    if (newsData.length === 0) return null;

    const displayedCount = Math.min(3, newsData.length);
    const displayedNews = [];
    for (let i = 0; i < displayedCount; i++) {
        displayedNews.push(newsData[(currentNewsIndex + i) % newsData.length]);
    }

    return (
        <section id="berita" className="scroll-mt-32">
            <ScrollReveal>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="text-left">
                        <div className="flex items-center gap-2 text-yellow-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                            <Newspaper size={16} className="text-yellow-400 animate-pulse" />
                            <span>KABAR DESA TERKINI</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                            Berita & Informasi Digital
                        </h2>
                    </div>
                    {newsData.length > 3 && (
                        <div className="flex gap-3">
                            <button
                                onClick={prevNews}
                                className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-lg"
                                aria-label="Berita Sebelumnya"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextNews}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black flex items-center justify-center hover:from-yellow-400 hover:to-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                aria-label="Berita Selanjutnya"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedNews.map((news, idx) => (
                        <div
                            key={`${news.id}-${idx}`}
                            className="group bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden hover:border-amber-400/50 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <Image
                                        src={news.image}
                                        alt={news.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-md border border-yellow-400/50 text-yellow-300 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></span>
                                        {news.category || "Kabar Desa"}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-slate-400 text-xs mb-4">
                                        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                                            <Calendar size={14} />
                                            {news.date}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock size={14} />
                                            5 min read
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-extrabold text-white mb-4 line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors">
                                        {news.title}
                                    </h4>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <button
                                    type="button"
                                    onClick={() => setSelectedNews(news)}
                                    className="inline-flex items-center gap-2 text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider group/btn cursor-pointer"
                                >
                                    <span>Baca Selengkapnya</span>
                                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollReveal>

            {/* Modal Detail Berita Real-Time */}
            {selectedNews && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedNews(null)}
                >
                    <div 
                        className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                            <Image
                                src={selectedNews.image}
                                alt={selectedNews.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40"></div>
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20"
                            >
                                <X size={18} />
                            </button>
                            <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                <span className="bg-amber-500/90 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                    {selectedNews.category || "Informasi Resmi"}
                                </span>
                                <span className="text-xs text-slate-300 font-bold bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                    {selectedNews.date}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 custom-scrollbar">
                            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                {selectedNews.title}
                            </h3>
                            <div className="w-20 h-1 bg-amber-400 rounded-full" />
                            <div className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line space-y-3">
                                {selectedNews.content ? (
                                    <p>{selectedNews.content}</p>
                                ) : (
                                    <p>Informasi resmi terbaru dari Pemerintah Desa Cimanggu I. Kunjungi kantor desa atau hubungi layanan administrasi online untuk pertanyaan lebih lanjut seputar pengumuman ini.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
