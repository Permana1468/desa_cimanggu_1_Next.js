"use client";
import React from 'react';
import Image from 'next/image';
import { User, Shield, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface OrgCardProps {
    role: string;
    name: string;
    foto?: string;
    isMain?: boolean;
}

const OrgCard = ({ role, name, foto, isMain = false }: OrgCardProps) => (
    <div className="group relative flex flex-col items-center justify-center p-4 text-center z-10 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
        <div className="relative flex flex-col items-center">
            {foto ? (
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full mb-3 overflow-hidden border-2 transition-all duration-500 group-hover:scale-110 ${
                    isMain 
                        ? 'border-yellow-400 shadow-[0_0_30px_rgba(245,158,11,0.7)] ring-4 ring-yellow-400/20' 
                        : 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/20'
                }`}>
                    <Image
                        src={foto}
                        alt={name}
                        fill
                        sizes="96px"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full mb-3 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                    isMain 
                        ? 'bg-gradient-to-b from-yellow-500/30 to-amber-600/30 border-2 border-yellow-400 text-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.6)]' 
                        : 'bg-gradient-to-b from-cyan-500/30 to-blue-600/30 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                }`}>
                    <User size={38} />
                </div>
            )}

            {/* Role Title (Pure Floating 3D Typography - No Cards) */}
            <h4 className={`text-[11px] md:text-xs font-black tracking-[0.2em] uppercase mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-colors ${
                isMain ? 'text-yellow-300' : 'text-cyan-300 group-hover:text-yellow-300'
            }`}>
                {role}
            </h4>

            {/* Name (Pure Floating Glowing Text) */}
            <h3 className="text-base md:text-lg font-extrabold text-white leading-snug drop-shadow-[0_4px_15px_rgba(0,0,0,0.95)]">
                {name}
            </h3>
        </div>
    </div>
);

interface LandingOrganizationProps {
    orgData: any;
}

export const LandingOrganization = ({ orgData }: LandingOrganizationProps) => {
    return (
        <section id="organisasi" className="w-full space-y-8">
            <ScrollReveal>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-yellow-300 font-extrabold tracking-[0.25em] uppercase text-xs drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        <Shield size={16} />
                        <span>HOLOGRAPHIC LEADERSHIP MATRIX</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 tracking-tight drop-shadow-[0_6px_25px_rgba(0,0,0,0.95)]">
                        Struktur Perangkat Desa
                    </h2>
                </div>
            </ScrollReveal>

            <div className="flex flex-col items-center gap-6 relative">
                {/* Level 1: Kades */}
                <ScrollReveal>
                    <OrgCard role={orgData.kades.role} name={orgData.kades.name} foto={orgData.kades.foto} isMain={true} />
                </ScrollReveal>

                {/* Vertical Laser Beam Connector */}
                <div className="w-0.5 h-8 bg-gradient-to-b from-yellow-400 via-cyan-400 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.9)]"></div>

                {/* Level 2: Sekdes */}
                <ScrollReveal delay={100}>
                    <OrgCard role={orgData.sekdes.role} name={orgData.sekdes.name} foto={orgData.sekdes.foto} />
                </ScrollReveal>

                {/* Vertical Laser Beam Connector */}
                <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.9)]"></div>

                {/* Level 3: Staff & Kadus (Pure Floating 3D Badges) */}
                <ScrollReveal delay={200}>
                    <div className="flex flex-wrap justify-center gap-8 max-w-5xl">
                        {orgData.staff?.map((staff: any, idx: number) => (
                            <OrgCard key={idx} role={staff.role} name={staff.name} foto={staff.foto} />
                        ))}
                    </div>
                </ScrollReveal>

                {/* Level 4: Kadus */}
                {orgData.kadus && orgData.kadus.length > 0 && (
                    <ScrollReveal delay={300}>
                        <div className="flex flex-col items-center w-full pt-4">
                            <div className="inline-flex items-center gap-2 text-cyan-300 font-extrabold uppercase tracking-widest text-xs mb-6 px-4 py-1.5 rounded-full bg-black/30 border border-white/20 backdrop-blur-md drop-shadow">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span>Kepala Dusun (Kadus) Wilayah</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-8">
                                {orgData.kadus.map((kadus: any, idx: number) => (
                                    <OrgCard key={idx} role={kadus.role} name={kadus.name} foto={kadus.foto} />
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </section>
    );
};
