"use client";
import dynamic from 'next/dynamic';
import React from 'react';

export const OverviewCharts = dynamic(() => import('./OverviewCharts').then(mod => mod.OverviewCharts), {
    ssr: false,
    loading: () => (
        <div className="h-64 w-full bg-slate-50 animate-pulse rounded-[3.5rem] flex items-center justify-center font-black text-slate-300">
            PREPARING ANALYTICS...
        </div>
    )
});
