"use client";
import React from 'react';
import Image from 'next/image';
import ScrollReveal from '../ScrollReveal';

interface OrgCardProps {
    role: string;
    name: string;
    foto?: string;
    isMain?: boolean;
}

const OrgCard = ({ role, name, foto, isMain = false }: OrgCardProps) => (
    <div className={`group relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-500 ${isMain ? 'bg-gradient-to-b from-yellow-500/10 to-[#0f172a] border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-[#1e293b]/60 border-white/10 backdrop-blur-md'} w-44 md:w-52 text-center z-10 hover:-translate-y-3 hover:scale-[1.03] hover:shadow-2xl hover:border-blue-400/30 hover:bg-[#1e293b]/80`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 ${isMain ? 'bg-yellow-500/5 blur-xl' : 'bg-blue-500/5 blur-xl'}`}></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20"></div>

        <div className="relative z-10 flex flex-col items-center">
            {foto ? (
                <div className={`relative w-14 h-14 rounded-full mb-3 overflow-hidden border-2 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 ${isMain ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-slate-700 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
                    <Image
                        src={foto}
                        alt={name}
                        fill
                        sizes="56px"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className={`w-14 h-14 rounded-full mb-3 flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 shadow-inner ${isMain ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-blue-500/20 text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'} `}>
                    👤
                </div>
            )}
            <h4 className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1.5 transition-colors ${isMain ? 'text-yellow-400' : 'text-blue-400 group-hover:text-blue-300'}`}>
                {role}
            </h4>
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
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
                    <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">Struktur Organisasi</h3>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white">Perangkat Desa</h2>
                </div>
            </ScrollReveal>

            <div className="flex flex-col items-center gap-12">
                {/* Level 1: Kades */}
                <ScrollReveal>
                    <OrgCard role={orgData.kades.role} name={orgData.kades.name} foto={orgData.kades.foto} isMain={true} />
                </ScrollReveal>

                {/* Level 2: Sekdes */}
                <ScrollReveal delay={200}>
                    <OrgCard role={orgData.sekdes.role} name={orgData.sekdes.name} foto={orgData.sekdes.foto} />
                </ScrollReveal>

                {/* Level 3: Staff */}
                <ScrollReveal delay={400}>
                    <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
                        {orgData.staff.map((staff: any, idx: number) => (
                            <OrgCard key={idx} role={staff.role} name={staff.name} foto={staff.foto} />
                        ))}
                    </div>
                </ScrollReveal>

                {/* Level 4: Kadus */}
                <ScrollReveal delay={600}>
                    <div className="mt-8">
                        <h4 className="text-center text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Kepala Dusun</h4>
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
