"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getBoundaries } from '@/actions/gis';
import "leaflet/dist/leaflet.css";

let cachedBoundaries: any[] | null = null;

export default function LandingWebGIS({ containerId = "landing-webgis-map" }: { containerId?: string }) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const mapContainerId = containerId;
    const LRef = useRef<any>(null);
    const layersGroupRef = useRef<any>(null);
    const [isNearViewport, setIsNearViewport] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // 1. Intersection Observer: Hanya load Leaflet dan tile satelit saat user scroll mendekati section peta
    useEffect(() => {
        const target = wrapperRef.current;
        if (!target) return;

        // Jika container disembunyikan oleh CSS (misal tampilan mobile di desktop atau sebaliknya), jangan inisialisasi
        if (target.offsetParent === null) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsNearViewport(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "350px 0px" } // Pre-load 350px sebelum masuk layar agar mulus
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, []);

    const drawBoundaries = (boundaries: any[], L: any, map: any, group: any) => {
        if (!L || !map || !group) return;
        group.clearLayers();

        // 1. Draw masking if DESA exists
        const desaBoundary = boundaries.find(b => b.type === "DESA");
        if (desaBoundary) {
            let desaCoords = [];
            try { 
                desaCoords = typeof desaBoundary.coordinates === "string" ? JSON.parse(desaBoundary.coordinates) : desaBoundary.coordinates; 
            } catch(e){}
            if (desaCoords && desaCoords.length > 0) {
                const outerBounds = [[-90, -180], [90, -180], [90, 180], [-90, 180]];
                L.polygon([outerBounds, desaCoords], {
                    color: "transparent", 
                    fillColor: "#020617", // slate-950
                    fillOpacity: 0.7, 
                    interactive: false
                }).addTo(group);
                
                // Fit bounds to Desa to center the map
                map.fitBounds(L.polygon(desaCoords).getBounds(), { padding: [30, 30] });
            }
        }

        // 2. Draw all boundaries with Cyber/Holographic style
        boundaries.forEach(b => {
            let coords = [];
            try { 
                coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates; 
            } catch(e) { return; }
            if (!coords || coords.length === 0) return;
            
            const isDesa = b.type === "DESA";
            const color = isDesa ? "#22d3ee" : (b.color || "#38bdf8"); // cyan-400 or light-blue

            L.polygon(coords, {
                color: color,
                fillColor: color,
                fillOpacity: isDesa ? 0.05 : 0.15,
                weight: isDesa ? 3 : 1,
                dashArray: b.type === "RT" ? "2, 4" : b.type === "RW" ? "4, 6" : undefined,
                className: "webgis-neon-polygon"
            }).addTo(group);
        });
    };

    useEffect(() => {
        if (!isNearViewport) return;

        let isMounted = true;
        import("leaflet").then((L) => {
            if (!isMounted) return;
            LRef.current = L;

            if (!mapRef.current) {
                const containerEl = document.getElementById(mapContainerId);
                if (!containerEl) return;

                const map = L.map(mapContainerId, {
                    zoomControl: false,
                    attributionControl: false,
                    scrollWheelZoom: false,
                    dragging: false
                }).setView([-6.5892, 106.634], 14);

                // Google Earth / Satellite
                L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    maxZoom: 19,
                }).addTo(map);

                layersGroupRef.current = L.featureGroup().addTo(map);
                mapRef.current = map;
                setIsMapLoaded(true);
            }

            if (cachedBoundaries) {
                drawBoundaries(cachedBoundaries, L, mapRef.current, layersGroupRef.current);
            } else {
                // Fetch Boundaries for standard Tenant ID
                const tenantId = "f93e947c-1a9b-47a3-913b-2ea2a4290732";
                getBoundaries(tenantId).then((res) => {
                    if (res.success && res.data) {
                        cachedBoundaries = res.data;
                        drawBoundaries(res.data, L, mapRef.current, layersGroupRef.current);
                    }
                });
            }
        });

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isNearViewport, mapContainerId]);

    return (
        <div ref={wrapperRef} className="absolute inset-0 z-0 w-full h-full">
            <div 
                id={mapContainerId} 
                className={`absolute inset-0 z-0 w-full h-full mix-blend-screen opacity-80 transition-opacity duration-700 ${isMapLoaded ? 'opacity-80' : 'opacity-0'}`} 
            />
            {!isMapLoaded && (
                <div className="absolute inset-0 bg-[#020617] flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin opacity-40" />
                </div>
            )}
        </div>
    );
}
