"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface LandingNewsProps {
    newsData: any[];
}

export const LandingNews = ({ newsData }: LandingNewsProps) => {
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

    const nextNews = () => {
        setCurrentNewsIndex((prev) => (prev === newsData.length - 1 ? 0 : prev + 1));
    };

    const prevNews = () => {
        setCurrentNewsIndex((prev) => (prev === 0 ? newsData.length - 1 : prev - 1));
    };

    if (newsData.length === 0) return null;

    return (
        <section id="berita" className="scroll-mt-32">
            <ScrollReveal>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="text-left">
                        <h3 className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-3">Kabar Desa</h3>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white">Berita & Informasi Terbaru</h2>
                    </div>
                    {newsData.length > 3 && (
                        <div className="flex gap-3">
                            <button onClick={prevNews} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextNews} className="w-12 h-12 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsData.slice(currentNewsIndex, currentNewsIndex + 3).map((news, idx) => (
                        <div key={news.id} className="group bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all hover:-translate-y-2">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    src={news.image}
                                    alt={news.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    News
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 text-slate-400 text-xs mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {news.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        5 min read
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                                    {news.title}
                                </h4>
                                <a href={`/berita/${news.id}`} className="text-sm font-bold text-yellow-500 flex items-center gap-2 group/btn">
                                    Baca Selengkapnya <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};
