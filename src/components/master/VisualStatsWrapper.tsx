"use client";
import dynamic from 'next/dynamic';
import React from 'react';

export const VisualStats = dynamic(() => import('./VisualStats').then(mod => mod.VisualStats), {
    ssr: false,
    loading: () => (
        <div className="h-96 w-full bg-slate-100 animate-pulse rounded-[3.5rem] flex items-center justify-center font-black text-slate-300">
            LOADING ANALYTICS...
        </div>
    )
});
