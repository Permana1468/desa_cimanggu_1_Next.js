"use client";

import React from 'react';
import { useLandingTheme } from './LandingThemeProvider';
import { CampoSantoHero } from './CampoSantoHero';

export function LandingModeHandler({ children, siteData }: { children: React.ReactNode, siteData: any }) {
    const { isDualMode } = useLandingTheme();

    if (isDualMode) {
        return (
            <div className="w-full min-h-screen">
                <CampoSantoHero siteData={siteData} />
            </div>
        );
    }

    return <>{children}</>;
}
