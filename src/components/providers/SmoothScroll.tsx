"use client";
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Cek preferensi pengguna untuk kurangi gerakan (aksesibilitas)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Skip Lenis hanya pada layar HP kecil (< 768px) agar menggunakan momentum scroll native GPU 120Hz bawaan mobile
        // JANGAN gunakan navigator.maxTouchPoints > 0 karena laptop modern dengan touchscreen (ThinkPad, XPS, Yoga, Asus)
        // atau laptop dengan touchpad presisi akan salah dideteksi sebagai HP sehingga smooth scroll Lenis mati total.
        const isMobileScreen = window.innerWidth < 768;
        if (isMobileScreen) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.0,
            syncTouch: false, // Biarkan sentuhan jari pada layar laptop tetap menggunakan scroll native
            infinite: false,
            autoResize: true,
            anchors: true, // Smooth scroll otomatis dan presisi saat klik tautan anchor (#profil, dll)
        });

        // Simpan instance lenis ke window untuk debugging & integrasi jika diperlukan
        (window as any).__lenis = lenis;

        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            delete (window as any).__lenis;
        };
    }, []);

    return <>{children}</>;
}
