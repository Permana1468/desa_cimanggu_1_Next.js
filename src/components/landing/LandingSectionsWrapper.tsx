"use client";

import React from 'react';
import { useLandingTheme } from './LandingThemeProvider';

export function LandingSectionsWrapper({ children }: { children: React.ReactNode }) {
    const { isDualMode } = useLandingTheme();

    if (isDualMode) {
        return null;
    }

    return <>{children}</>;
}
