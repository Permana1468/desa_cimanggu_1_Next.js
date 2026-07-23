"use client";
import React, { useEffect, useRef } from 'react';
import { useLandingTheme } from './LandingThemeProvider';

export const TechNightCanvas: React.FC = () => {
    const { isNightMode } = useLandingTheme();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Track mouse position for interactive light aura
        let mouseX = width / 2;
        let mouseY = height / 2;
        let targetMouseX = mouseX;
        let targetMouseY = mouseY;

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Optimized Particle System for 60fps performance
        const isMobile = width < 768;
        const particleCount = isMobile ? 18 : 35;
        const particles: Array<{
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            color: string;
            alpha: number;
            pulseSpeed: number;
        }> = [];

        const colors = [
            'rgba(59, 130, 246, ',   // Blue
            'rgba(168, 85, 247, ',   // Purple
            'rgba(6, 182, 212, ',    // Cyan
            'rgba(234, 179, 8, ',    // Gold/Yellow
        ];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4 - 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.7 + 0.3,
                pulseSpeed: Math.random() * 0.02 + 0.005,
            });
        }

        // Light Beams (Shooting Cyber Beams)
        const beamCount = isMobile ? 3 : 5;
        const beams: Array<{
            x: number;
            y: number;
            length: number;
            speed: number;
            angle: number;
            width: number;
            color: string;
            opacity: number;
        }> = [];

        for (let i = 0; i < beamCount; i++) {
            beams.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 180 + 80,
                speed: Math.random() * 1.2 + 0.6,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                width: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.4 + 0.2,
            });
        }

        let time = 0;

        const render = () => {
            time += 0.015;

            // Interpolate mouse position for smooth glow
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            ctx.clearRect(0, 0, width, height);

            // 1. Draw Ambient Mouse Interactive Cyber Light Aura
            const mouseGradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, 350
            );
            mouseGradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
            mouseGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
            mouseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = mouseGradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Moving Tech Beams
            beams.forEach((beam) => {
                beam.x += Math.cos(beam.angle) * beam.speed;
                beam.y += Math.sin(beam.angle) * beam.speed;

                if (beam.x > width + 200 || beam.y > height + 200) {
                    beam.x = -100;
                    beam.y = Math.random() * height * 0.8;
                }

                const grad = ctx.createLinearGradient(
                    beam.x,
                    beam.y,
                    beam.x - Math.cos(beam.angle) * beam.length,
                    beam.y - Math.sin(beam.angle) * beam.length
                );
                grad.addColorStop(0, beam.color + beam.opacity + ')');
                grad.addColorStop(1, beam.color + '0)');

                ctx.beginPath();
                ctx.moveTo(beam.x, beam.y);
                ctx.lineTo(
                    beam.x - Math.cos(beam.angle) * beam.length,
                    beam.y - Math.sin(beam.angle) * beam.length
                );
                ctx.strokeStyle = grad;
                ctx.lineWidth = beam.width;
                ctx.stroke();
            });

            // 3. Draw & Connect Floating Glowing Particles
            const maxDistSq = 90 * 90;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Pulsing glow alpha
                const currentAlpha = Math.abs(Math.sin(time * p.pulseSpeed + i)) * p.alpha;

                // Draw Core Particle & Glow in single pass
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = p.color + currentAlpha + ')';
                ctx.fill();

                // Connect nearby particles (using squared distance for fast check)
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistSq) {
                        const lineAlpha = (1 - Math.sqrt(distSq) / 90) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isNightMode]);

    if (!isNightMode) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Dark Ambient Gradient Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#070c18] to-[#04070e] opacity-95"></div>

            {/* Cyber Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay"></div>

            {/* Glowing Ambient Light Orbs */}
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-2/3 -right-48 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-[140px] animate-breathing"></div>
            <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>

            {/* Real-time HTML5 Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        </div>
    );
};
