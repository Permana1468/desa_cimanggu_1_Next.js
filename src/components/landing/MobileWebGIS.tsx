"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const LandingWebGIS = dynamic(() => import('./LandingWebGIS'), { ssr: false });

export function MobileWebGIS({ containerId = "landing-webgis-map-mobile" }: { containerId?: string }) {
    return <LandingWebGIS containerId={containerId} />;
}
