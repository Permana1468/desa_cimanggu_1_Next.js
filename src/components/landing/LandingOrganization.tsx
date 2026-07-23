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
    <div className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-500 ${
        isMain 
            ? 'bg-gradient-to-b from-yellow-500/15 via-slate-900/90 to-[#080e1a] border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] w-52 md:w-64' 
            : 'bg-slate-900/60 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] w-48 md:w-56'
    } text-center z-10 hover:-translate-y-3 hover:scale-[1.03]`}>
        {/* Hover Cyber Beam Scan Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        <div className="relative z-10 flex flex-col items-center">
            {foto ? (
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl mb-4 overflow-hidden border-2 transition-all duration-500 group-hover:scale-110 ${
                    isMain 
                        ? 'border-yellow-400 animate-ring-master shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
                        : 'border-cyan-500/50 animate-ring-desa shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}>
                    <Image
                        src={foto}
                        alt={name}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                    isMain 
                        ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                        : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }`}>
                    <User size={32} />
                </div>
            )}

            {/* Role Title */}
            <h4 className={`text-[10px] md:text-xs font-black tracking-[0.2em] uppercase mb-1.5 transition-colors ${
                isMain ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-cyan-400 group-hover:text-cyan-300'
            }`}>
                {role}
            </h4>

            {/* Name */}
            <h3 className="text-sm md:text-base font-extrabold text-white leading-snug line-clamp-2">
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
        <section id="organisasi" className="scroll-mt-32">
            <ScrollReveal>
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                        <Shield size={16} />
                        <span>HOLOGRAPHIC LEADERSHIP MATRIX</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Struktur Perangkat Desa
                    </h2>
                </div>
            </ScrollReveal>

            <div className="flex flex-col items-center gap-8 relative">
                {/* Level 1: Kades */}
                <ScrollReveal>
                    <OrgCard role={orgData.kades.role} name={orgData.kades.name} foto={orgData.kades.foto} isMain={true} />
                </ScrollReveal>

                {/* Vertical Energy Connector 1 */}
                <div className="w-0.5 h-10 bg-gradient-to-b from-yellow-400 via-cyan-400 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

                {/* Level 2: Sekdes */}
                <ScrollReveal delay={150}>
                    <OrgCard role={orgData.sekdes.role} name={orgData.sekdes.name} foto={orgData.sekdes.foto} />
                </ScrollReveal>

                {/* Vertical Energy Connector 2 */}
                <div className="w-0.5 h-10 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

                {/* Level 3: Staff */}
                <ScrollReveal delay={300}>
                    <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
                        {orgData.staff.map((staff: any, idx: number) => (
                            <OrgCard key={idx} role={staff.role} name={staff.name} foto={staff.foto} />
                        ))}
                    </div>
                </ScrollReveal>

                {/* Level 4: Kadus */}
                <ScrollReveal delay={450}>
                    <div className="mt-8 flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 text-slate-400 font-extrabold uppercase tracking-widest text-xs mb-8 bg-slate-900/60 border border-white/10 px-6 py-2 rounded-full">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span>Kepala Dusun (Kadus) Wilayah</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {orgData.kadus.map((kadus: any, idx: number) => (
                                <OrgCard key={idx} role={kadus.role} name={kadus.name} foto={kadus.foto} />
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};
