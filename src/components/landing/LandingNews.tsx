"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, ChevronLeft, ChevronRight, Clock, ArrowUpRight, Newspaper } from 'lucide-react';
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
                    {newsData.slice(currentNewsIndex, currentNewsIndex + 3).map((news, idx) => (
                        <div
                            key={news.id}
                            className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/40 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-yellow-500/40 text-yellow-400 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></span>
                                        Kabar Desa
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
                                <a
                                    href={`/berita/${news.id}`}
                                    className="inline-flex items-center gap-2 text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider group/btn"
                                >
                                    <span>Baca Selengkapnya</span>
                                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};
