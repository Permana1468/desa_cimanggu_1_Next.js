"use client";

import React, { useEffect, useRef, useState, createContext, useContext } from "react";

const TOTAL_FRAMES = 300;

const getFramePath = (index: number) => {
    const frameNum = String(index + 1).padStart(3, "0");
    return `/images/dream/ezgif-frame-${frameNum}.jpg`;
};

const ScrollProgressContext = createContext<number>(0);

export const useScrollProgress = () => useContext(ScrollProgressContext);

interface DreamScrollCanvasProps {
    children?: React.ReactNode;
}

export function DreamScrollCanvas({ children }: DreamScrollCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Preload frame sequence into memory
    useEffect(() => {
        const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            images[i] = img;
        }
        imagesRef.current = images;
    }, []);

    // Canvas render & 3D Scroll Parallax Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let currentFrame = 0;
        let targetFrame = 0;

        const updateCanvasSize = () => {
            if (!canvas) return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;
            const targetWidth = Math.round(width * dpr);
            const targetHeight = Math.round(height * dpr);

            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
            }
        };

        const drawImageCover = (img: HTMLImageElement, scale: number = 1.0) => {
            if (!ctx || !canvas || !img.complete || img.naturalWidth === 0) return;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            const imageAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvas.width / canvas.height;

            let drawWidth = canvas.width * scale;
            let drawHeight = canvas.height * scale;

            if (canvasAspect > imageAspect) {
                drawWidth = canvas.width * scale;
                drawHeight = (canvas.width / imageAspect) * scale;
            } else {
                drawHeight = canvas.height * scale;
                drawWidth = (canvas.height * imageAspect) * scale;
            }

            const offsetX = (canvas.width - drawWidth) / 2;
            const offsetY = (canvas.height - drawHeight) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };

        const render = () => {
            updateCanvasSize();

            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const totalScrollable = rect.height - window.innerHeight;
                if (totalScrollable > 0) {
                    const scrollY = -rect.top;
                    const progress = Math.max(0, Math.min(1, scrollY / totalScrollable));
                    setScrollProgress(progress);

                    targetFrame = Math.min(
                        TOTAL_FRAMES - 1,
                        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
                    );
                }
            }

            // Smooth LERP for frame transitions
            currentFrame += (targetFrame - currentFrame) * 0.12;
            const targetIndex = Math.round(currentFrame);

            // Dynamic 3D camera forward push (1.0 -> 1.06 scale)
            const progressRatio = currentFrame / (TOTAL_FRAMES - 1);
            const cameraParallaxScale = 1.0 + progressRatio * 0.06;

            let imgToDraw: HTMLImageElement | null = null;
            if (imagesRef.current[targetIndex] && imagesRef.current[targetIndex].complete && imagesRef.current[targetIndex].naturalWidth > 0) {
                imgToDraw = imagesRef.current[targetIndex];
            } else {
                for (let i = targetIndex; i >= 0; i--) {
                    if (imagesRef.current[i] && imagesRef.current[i].complete && imagesRef.current[i].naturalWidth > 0) {
                        imgToDraw = imagesRef.current[i];
                        break;
                    }
                }
                if (!imgToDraw) {
                    for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
                        if (imagesRef.current[i] && imagesRef.current[i].complete && imagesRef.current[i].naturalWidth > 0) {
                            imgToDraw = imagesRef.current[i];
                            break;
                        }
                    }
                }
            }

            if (imgToDraw) {
                lastDrawnImageRef.current = imgToDraw;
                drawImageCover(imgToDraw, cameraParallaxScale);
            } else if (lastDrawnImageRef.current) {
                drawImageCover(lastDrawnImageRef.current, cameraParallaxScale);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <ScrollProgressContext.Provider value={scrollProgress}>
            <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
                {/* Fixed Fullscreen Canvas Viewport */}
                <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full block object-cover antialiased"
                        style={{ imageRendering: "auto", filter: "blur(0.8px) contrast(1.03) saturate(1.05)" }}
                    />
                    {/* Transparent Black Aesthetic Layer (Layer Hitam Transparan & Cinematic Dark Mist Overlay) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/65 backdrop-blur-[1px] pointer-events-none z-10" />
                </div>

                {/* 3D Parallax Stage Overlay */}
                {children}
            </div>
        </ScrollProgressContext.Provider>
    );
}

interface ParallaxStageProps {
    startProgress: number;
    endProgress: number;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export function ParallaxStage({ startProgress, endProgress, children, className = "", id }: ParallaxStageProps) {
    const progress = useScrollProgress();

    const stageLen = endProgress - startProgress;
    let opacity = 0;
    let scale = 0.85;

    if (progress >= startProgress && progress <= endProgress) {
        const stageRel = (progress - startProgress) / stageLen;

        if (startProgress === 0) {
            // Hero Stage 1: Fully visible at load (progress = 0)
            if (stageRel > 0.65) {
                const fadeOut = (1 - stageRel) / 0.35;
                opacity = fadeOut;
                scale = 1.0 + (1 - fadeOut) * 0.15; // 1.0 -> 1.15
            } else {
                opacity = 1;
                scale = 1.0;
            }
        } else if (stageRel < 0.25) {
            const fadeIn = stageRel / 0.25;
            opacity = fadeIn;
            scale = 0.88 + fadeIn * 0.12; // 0.88 -> 1.0
        } else if (stageRel > 0.75) {
            const fadeOut = (1 - stageRel) / 0.25;
            if (endProgress >= 0.99) {
                opacity = 1;
                scale = 1.0;
            } else {
                opacity = fadeOut;
                scale = 1.0 + (1 - fadeOut) * 0.15; // 1.0 -> 1.15
            }
        } else {
            opacity = 1;
            scale = 1.0;
        }
    } else if (startProgress === 0 && progress < startProgress) {
        opacity = 1;
        scale = 1.0;
    } else if (endProgress >= 0.99 && progress >= endProgress) {
        opacity = 1;
        scale = 1.0;
    }

    const isActive = opacity > 0.05;

    return (
        <div
            id={id}
            className={`fixed inset-0 flex flex-col justify-center items-center pt-24 md:pt-28 pb-8 px-4 sm:px-12 transition-all duration-300 ease-out ${
                isActive ? "pointer-events-auto" : "pointer-events-none"
            } ${className}`}
            style={{
                opacity: opacity,
                transform: `scale(${scale})`,
                zIndex: isActive ? 30 : 0,
            }}
        >
            {children}
        </div>
    );
}
