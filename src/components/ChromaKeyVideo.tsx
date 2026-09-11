"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ChromaKeyVideoProps {
  src: string;
  className?: string;
  // Green screen removal thresholds
  chromaR?: number;  // max R
  chromaG?: number;  // min G to be "green"
  chromaB?: number;  // max B
  threshold?: number; // 0-255, how aggressive
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function ChromaKeyVideo({
  src,
  className = '',
  chromaR = 100,
  chromaG = 100,
  chromaB = 100,
  threshold = 80,
  onTimeUpdate,
}: ChromaKeyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Chroma key: detect green screen pixels
      // Green screen: high G, low R and B relative to G
      const isGreen = g > threshold && g > r * 1.4 && g > b * 1.4;

      if (isGreen) {
        data[i + 3] = 0; // make transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (onTimeUpdate && !video.paused) {
      onTimeUpdate(video.currentTime, video.duration || 8);
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [threshold, onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      setReady(true);
      video.play().catch(() => {});
    };

    video.addEventListener('loadeddata', handleReady);
    video.addEventListener('play', () => {
      animFrameRef.current = requestAnimationFrame(processFrame);
    });
    video.addEventListener('pause', () => {
      cancelAnimationFrame(animFrameRef.current);
    });
    video.addEventListener('ended', () => {
      cancelAnimationFrame(animFrameRef.current);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [processFrame]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden video element for source */}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Canvas renders chroma-keyed output */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s' }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
