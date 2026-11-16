import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Award, Sparkles, Quote, MapPin, CheckCircle2 } from 'lucide-react';
import { getVillageProfile } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Sambutan Kepala Desa Cimanggu I | Hernawan M. Sodik',
    description: 'Pesan resmi dan komitmen Kepala Desa Cimanggu I, Hernawan M. Sodik, untuk transformasi pelayanan digital dan kesejahteraan warga.',
};

export default async function SambutanPage() {
    const profile = await getVillageProfile();

    const defaultSambutan = `Assalamu’alaikum Warahmatullahi Wabarakatuh,

Sampurasun, puji dan syukur senantiasa kita panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa, atas limpahan rahmat, karunia, dan hidayah-Nya sehingga website resmi Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I ini dapat hadir sebagai jembatan komunikasi, transparansi informasi, dan pelayanan terpadu bagi seluruh warga masyarakat.

Sebagai Kepala Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor, saya menyampaikan apresiasi setinggi-tingginya kepada seluruh jajaran perangkat desa, Badan Permusyawaratan Desa (BPD), lembaga kemasyarakatan (LPM, Karang Taruna, TP-PKK, Posyandu Mawar, Puskesos, RT, dan RW), serta segenap elemen masyarakat yang senantiasa bahu-membahu bergotong royong membangun desa tercinta ini.

Di era transformasi digital saat ini, Pemerintah Desa Cimanggu I berkomitmen penuh untuk:
1. Menyelenggarakan tata kelola pemerintahan desa yang bersih, profesional, transparan, dan akuntabel.
2. Mempermudah akses pengurusan surat-menyurat mandiri secara online dan pelacakan status berkas secara real-time.
3. Menjamin akuntabilitas pengelolaan Anggaran Pendapatan dan Belanja Desa (APBDes) yang tepat sasaran demi kemaslahatan warga.
4. Mendorong kemandirian ekonomi keluarga melalui penguatan UMKM lokal, ketahanan pangan sektor pertanian, dan digitalisasi pasar desa.
5. Memastikan jaminan perlindungan sosial dan kesehatan keluarga melalui cakupan Universal Health Coverage (UHC) BPJS serta pemantauan gizi Posyandu Mawar 1–7.

Kami menyadari bahwa keberhasilan pembangunan desa hanya dapat tercapai melalui sinergi yang harmonis, partisipasi aktif, serta kritik membangun dari seluruh warga. Mari kita rawat tanah kelahiran kita demi mewujudkan Desa Cimanggu I yang Maju, Mandiri, Agamis, dan Sejahtera.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.`;

    const sambutanText = profile?.sambutan_kades?.trim() || defaultSambutan;

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/profil" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Profil Desa
                    </Link>
                    <Link href="/" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
                        Beranda Utama
                    </Link>
                </header>

                <main className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
                    {/* Header Title */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                            <Sparkles size={14} /> KEPALA DESA CIMANGGU I
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Sambutan Kepala Desa
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base font-light">
                            Pemerintah Desa Cimanggu I, Kec. Cibungbulang, Kab. Bogor
                        </p>
                    </div>

                    {/* Official Dignified Card */}
                    <div className="bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

                        {/* Kades Identity Banner */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10">
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-slate-950 shrink-0">
                                <Image
                                    src="/images/KADES_baru.png"
                                    alt="Hernawan M. Sodik - Kepala Desa Cimanggu I"
                                    fill
                                    className="object-contain object-bottom"
                                />
                            </div>
                            <div className="text-center sm:text-left space-y-1.5">
                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    PEMIMPIN DESA PERIODE BERJALAN
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white">HERNAWAN M. SODIK</h2>
                                <p className="text-sm font-bold text-amber-400">Kepala Desa Cimanggu I</p>
                                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                                    <MapPin size={13} /> Kec. Cibungbulang, Kab. Bogor, Jawa Barat
                                </p>
                            </div>
                        </div>

                        {/* Quote Highlight */}
                        <div className="my-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-400/20 flex gap-3 italic text-slate-200 text-sm sm:text-base">
                            <Quote size={28} className="text-amber-400 shrink-0 opacity-70" />
                            <span>
                                &quot;Mewujudkan Desa Cimanggu I yang Maju, Mandiri, Berakhlak Mulia, dan Sejahtera melalui keterpaduan teknologi digital, gotong royong, dan pelayanan masyarakat prima.&quot;
                            </span>
                        </div>

                        {/* Speech Content */}
                        <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-slate-300 whitespace-pre-line text-sm sm:text-base space-y-4">
                            {sambutanText}
                        </div>

                        {/* Signature Block */}
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-end text-right">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Ditetapkan di Cimanggu I</span>
                            <span className="text-base font-extrabold text-white mt-4">Hernawan M. Sodik</span>
                            <span className="text-xs font-bold text-amber-400">Kepala Desa Cimanggu I</span>
                        </div>
                    </div>

                    {/* Bottom Nav Links */}
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10 text-xs">
                        <Link href="/profil/visi-misi" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                            Lanjut ke Visi & Misi Desa →
                        </Link>
                        <Link href="/profil/sejarah" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                            Baca Sejarah Desa →
                        </Link>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
