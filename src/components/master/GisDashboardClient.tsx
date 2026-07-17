"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Users, Home, Map as MapIcon, Maximize, Minimize, Wifi, Activity, Search, Loader2, Target, X, ChevronLeft, Layers, Info, Filter, CloudSun, LogOut, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { getGisDashboardStats, searchWargaForGis } from "@/actions/gis";

export default function GisDashboardClient({
  boundaries,
  userName,
  tenantName,
  realStats,
  tenantId,
  userEmail
}: {
  boundaries: any[],
  userName: string,
  tenantName: string,
  realStats: { houses: number, families: number, population: number, poverty: number },
  tenantId: string,
  userEmail?: string | null
}) {
  const isPetugasKhusus = userEmail === "petagis@cimanggu1.desa.id";
  const mapRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [stats, setStats] = useState({
    houses: realStats.houses,
    families: realStats.families,
    population: realStats.population,
    poverty: realStats.poverty,
  });

  // UI States
  const [activeTab, setActiveTab] = useState<"LAYER" | "INFO" | "FILTER">("LAYER");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [layers, setLayers] = useState({
    satellite: true,
    desa: true,
    kadus: true,
    rw: true,
    rt: true,
  });

  // Thematic UI States
  const [activeThematicTab, setActiveThematicTab] = useState<"LAYER" | "INFO" | "FILTER">("LAYER");
  const [isThematicPanelOpen, setIsThematicPanelOpen] = useState(false);
  const [thematicLayers, setThematicLayers] = useState({
    kependudukan: false,
    perumahan: false,
    kesejahteraan: false,
    kesehatan: false,
    trantibum: false,
  });

  // Layer Refs for toggling without re-rendering map
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryDesaRef = useRef<L.Polygon | null>(null);
  const boundaryKadusRef = useRef<L.LayerGroup | null>(null);
  const boundaryRwRef = useRef<L.LayerGroup | null>(null);
  const boundaryRtRef = useRef<L.LayerGroup | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Search Function
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await searchWargaForGis(tenantId, searchQuery);
      if (res.success && res.data) {
        setSearchResult(res.data);
        if (res.data.hasLocation && mapRef.current && 'latitude' in res.data) {
          const dataWithLoc = res.data as any;
          // Fly to location
          mapRef.current.flyTo([dataWithLoc.latitude, dataWithLoc.longitude], 19, {
            animate: true,
            duration: 2
          });
          // Add temporary marker
          const marker = L.circleMarker([dataWithLoc.latitude, dataWithLoc.longitude], {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          }).addTo(mapRef.current);
          marker.bindPopup(`<b>${dataWithLoc.namaLengkap}</b><br>NIK: ${dataWithLoc.nik}`).openPopup();
        }
      } else {
        setSearchResult({ error: res.error || "Data tidak ditemukan" });
      }
    } catch (err) {
      setSearchResult({ error: "Gagal mencari data" });
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle Map Layers when 'layers' state changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Toggle Satellite
    if (satelliteLayerRef.current) {
      if (layers.satellite) satelliteLayerRef.current.addTo(map);
      else satelliteLayerRef.current.remove();
    }
    
    // Toggle Desa Mask
    if (boundaryDesaRef.current) {
      if (layers.desa) boundaryDesaRef.current.addTo(map);
      else boundaryDesaRef.current.remove();
    }

    // Toggle Kadus/Dusun
    if (boundaryKadusRef.current) {
      if (layers.kadus) boundaryKadusRef.current.addTo(map);
      else boundaryKadusRef.current.remove();
    }

    // Toggle RW
    if (boundaryRwRef.current) {
      if (layers.rw) boundaryRwRef.current.addTo(map);
      else boundaryRwRef.current.remove();
    }

    // Toggle RT
    if (boundaryRtRef.current) {
      if (layers.rt) boundaryRtRef.current.addTo(map);
      else boundaryRtRef.current.remove();
    }
  }, [layers]);

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    // Initialize Map
    const defaultCenter: L.LatLngTuple = [-6.591143529326943, 106.6668703358352]; // Bogor
    const map = L.map("gis-command-center", {
      zoomControl: false, // We hide default zoom control for cleaner UI
      attributionControl: false // Hide Leaflet attribution for fully immersive experience
    }).setView(defaultCenter, 15);

    mapRef.current = map;

    // SATELLITE LAYER (NO LABELS)
    satelliteLayerRef.current = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      maxZoom: 22,
      maxNativeZoom: 19
    }).addTo(map);

    // Add custom zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize LayerGroups for boundaries
    boundaryKadusRef.current = L.layerGroup().addTo(map);
    boundaryRwRef.current = L.layerGroup().addTo(map);
    boundaryRtRef.current = L.layerGroup().addTo(map);

    // DRAW BOUNDARIES
    const bounds: L.LatLng[] = [];

    if (boundaries.length > 0) {
      // 1. Draw Outer Mask if DESA exists
      const desaBoundary = boundaries.find(b => b.type === "DESA");
      if (desaBoundary) {
        let desaCoords: [number, number][] = [];
        try {
          desaCoords = typeof desaBoundary.coordinates === "string" ? JSON.parse(desaBoundary.coordinates) : desaBoundary.coordinates;
          if (desaCoords.length >= 3) {
            const outerBounds: [number, number][] = [
              [-90, -180], [90, -180], [90, 180], [-90, 180]
            ];
            boundaryDesaRef.current = L.polygon([outerBounds, desaCoords], {
              color: "transparent",
              fillColor: "#0f172a",
              fillOpacity: 0.75, // Darker mask for immersive command center
              interactive: false
            }).addTo(map);
          }
        } catch (e) { }
      }

      // 2. Draw actual boundaries (RT/RW/Dusun)
      boundaries.forEach(b => {
        let coords: [number, number][] = [];
        try {
          coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
        } catch (e) { return; }

        if (!Array.isArray(coords) || coords.length === 0) return;

        const polygon = L.polygon(coords as L.LatLngExpression[], {
          color: b.color || "#3b82f6",
          fillColor: b.color || "#3b82f6",
          fillOpacity: 0.2,
          weight: 2,
          dashArray: b.type === "RT" ? "4, 6" : b.type === "RW" ? "6, 8" : undefined
        });

        if (b.type === "DUSUN" && boundaryKadusRef.current) polygon.addTo(boundaryKadusRef.current);
        else if (b.type === "RW" && boundaryRwRef.current) polygon.addTo(boundaryRwRef.current);
        else if (b.type === "RT" && boundaryRtRef.current) polygon.addTo(boundaryRtRef.current);

        coords.forEach(c => bounds.push(L.latLng(c[0], c[1])));
      });

      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
      }
    }

    // REAL-TIME DATABASE POLLING
    const interval = setInterval(async () => {
      try {
        const res = await getGisDashboardStats(tenantId);
        if (res.success && res.data) {
          setStats({
            houses: res.data.houses,
            families: res.data.families,
            population: res.data.population,
            poverty: res.data.poverty
          });
        }
      } catch (err) { }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };

  }, [boundaries, tenantId]);

  // Fullscreen Handler
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (mapRef.current) {
        setTimeout(() => mapRef.current?.invalidateSize(), 300);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      {/* FULL SCREEN MAP CONTAINER */}
      <div id="gis-command-center" className="absolute inset-0 z-0 bg-[#0f172a]" />

      {/* FLOATING GLASSMORPHISM UI - TOP LEFT */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none w-[320px]">

        {/* Header / Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            {!isPetugasKhusus && (
              <Link href="/dashboard" className="w-10 h-10 bg-slate-900/60 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10">
                <ChevronLeft size={20} />
              </Link>
            )}
            <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_15px_rgba(50,150,246,0.4)] bg-white/0 p-0">
              <Image src="/images/LOGO-GIS.png" alt="Sensus GIS" width={50} height={50} className="object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight text-lg leading-tight uppercase" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>D-GIS CENTER</h1>
              <p className="text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-md">{tenantName}</p>
            </div>
          </div>
        </motion.div>

        {/* PANEL TOGGLE BUTTON */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase shadow-lg"
          >
            {isPanelOpen ? (
              <><ChevronUp size={14} /> Sembunyikan Panel Kontrol</>
            ) : (
              <><ChevronDown size={14} /> Tampilkan Panel Kontrol</>
            )}
          </button>
        </div>

        {/* TABBED MENU PANEL */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900/70 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col origin-top"
            >
              {/* Tabs */}
              <div className="flex border-b border-white/10">
            {[
              { id: "LAYER", icon: <Layers size={14} />, label: "LAYER" },
              { id: "INFO", icon: <Info size={14} />, label: "INFO" },
              { id: "FILTER", icon: <Filter size={14} />, label: "FILTER" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold tracking-widest transition-colors ${
                  activeTab === tab.id ? "bg-blue-500/20 text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "LAYER" && (
              <div className="flex flex-col gap-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Peta Dasar & Batas Wilayah</div>
                
                {[
                  { id: "satellite", label: "Citra Satelit (Foto Udara)", color: "text-blue-400" },
                  { id: "desa", label: "Masking Batas Desa", color: "text-slate-300" },
                  { id: "kadus", label: "Garis Batas Dusun", color: "text-amber-400" },
                  { id: "rw", label: "Garis Batas RW", color: "text-emerald-400" },
                  { id: "rt", label: "Garis Batas RT", color: "text-rose-400" },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                    <button 
                      onClick={() => setLayers(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {layers[item.id as keyof typeof layers] ? <ToggleRight size={24} className="text-blue-500" /> : <ToggleLeft size={24} className="text-slate-600" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "INFO" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <CloudSun size={24} className="text-amber-400" />
                  <div>
                    <div className="text-white font-bold text-sm">Cerah Berawan</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Kondisi Cuaca Area</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Data Kewilayahan</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                      <span className="text-slate-300">Total Luas Wilayah</span>
                      <span className="text-white font-mono">± 324 Ha</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                      <span className="text-slate-300">Ketinggian Mdpl</span>
                      <span className="text-white font-mono">150 - 250 m</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                      <span className="text-slate-300">Topografi</span>
                      <span className="text-white font-mono">Dataran Rendah</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "FILTER" && (
              <div className="flex flex-col gap-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pencarian Pintar</div>
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Cari NIK / Nama..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-10 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={14} className="absolute left-3 text-slate-400" />
                  <button type="submit" disabled={isSearching} className="absolute right-2 p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors disabled:opacity-50">
                    {isSearching ? <Loader2 size={12} className="animate-spin" /> : <Target size={12} />}
                  </button>
                </form>

                <AnimatePresence>
                  {searchResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 bg-white/5 rounded-xl p-3 border border-white/5 overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hasil Pencarian</span>
                        <button onClick={() => setSearchResult(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                      </div>
                      
                      {searchResult.error ? (
                        <div className="text-rose-400 text-xs font-semibold">{searchResult.error}</div>
                      ) : (
                        <div>
                          <div className="text-sm font-bold text-white leading-tight mb-1">{searchResult.namaLengkap}</div>
                          <div className="text-xs text-slate-300 font-mono mb-2">{searchResult.nik}</div>
                          
                          {searchResult.hasLocation ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              <MapIcon size={10} /> Lokasi Ditemukan
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              Lokasi Belum Dipetakan
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THEMATIC PANEL TOGGLE BUTTON */}
        <div className="pointer-events-auto mt-2">
          <button
            onClick={() => setIsThematicPanelOpen(!isThematicPanelOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase shadow-lg w-max"
          >
            {isThematicPanelOpen ? (
              <><ChevronUp size={14} /> Sembunyikan Panel Sektoral</>
            ) : (
              <><ChevronDown size={14} /> Tampilkan Panel Sektoral</>
            )}
          </button>
        </div>

        {/* THEMATIC TABBED PANEL */}
        <AnimatePresence>
          {isThematicPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900/70 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col origin-top"
            >
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: "LAYER", icon: <Layers size={14} />, label: "LAYER" },
                  { id: "INFO", icon: <Info size={14} />, label: "INFO" },
                  { id: "FILTER", icon: <Filter size={14} />, label: "FILTER" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveThematicTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold tracking-widest transition-colors ${
                      activeThematicTab === tab.id ? "bg-amber-500/20 text-amber-400 border-b-2 border-amber-500" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeThematicTab === "LAYER" && (
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Peta Tematik Sektoral</div>
                    
                    {[
                      { id: "kependudukan", label: "Administratif Kependudukan", color: "text-blue-400" },
                      { id: "perumahan", label: "Perumahan & Infrastruktur", color: "text-amber-400" },
                      { id: "kesejahteraan", label: "Kesejahteraan & Ekonomi", color: "text-emerald-400" },
                      { id: "kesehatan", label: "Kesehatan & Lingkungan", color: "text-teal-400" },
                      { id: "trantibum", label: "Trantibum & Mitigasi", color: "text-rose-400" },
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                        <button 
                          onClick={() => setThematicLayers(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          {thematicLayers[item.id as keyof typeof thematicLayers] ? <ToggleRight size={24} className="text-amber-500" /> : <ToggleLeft size={24} className="text-slate-600" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {activeThematicTab === "INFO" && (
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!Object.values(thematicLayers).some(v => v) && (
                      <div className="text-xs text-slate-400 text-center py-4 border border-white/5 border-dashed rounded-xl">Pilih minimal satu layer sektoral untuk melihat analisis data.</div>
                    )}
                    
                    {thematicLayers.kependudukan && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-3">
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border-b border-blue-500/20 pb-2 mb-2">Administratif Kependudukan</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5"><Users size={12} className="text-blue-400" /> Total Jiwa</span>
                          <span className="text-sm font-bold text-white">{stats.population.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 ml-4">Rasio Gender (L/P)</span>
                          <span className="text-xs font-mono text-white">1.14</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight border-t border-white/5 pt-2">Visualisasi Batas Wilayah & Sebaran Populasi. Analisis Demografi Desa secara Presisi.</div>
                      </motion.div>
                    )}

                    {thematicLayers.perumahan && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-3">
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-2">Perumahan & Infrastruktur</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5"><Home size={12} className="text-amber-400" /> Rumah Terdata</span>
                          <span className="text-sm font-bold text-white">{stats.houses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 ml-4">Struktur Permanen</span>
                          <span className="text-xs font-mono text-white">85%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight border-t border-white/5 pt-2">Pemetaan Lokasi Fisik & Jaringan Infrastruktur. Perencanaan & Pemeliharaan Aset Publik.</div>
                      </motion.div>
                    )}

                    {thematicLayers.kesejahteraan && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-3">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest border-b border-emerald-500/20 pb-2 mb-2">Kesejahteraan & Ekonomi</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5"><Activity size={12} className="text-emerald-400" /> Pra-Sejahtera</span>
                          <span className="text-sm font-bold text-rose-400">{stats.poverty.toLocaleString()} KK</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 ml-4">Distribusi UMKM</span>
                          <span className="text-xs font-mono text-white">Aktif / Terdata</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight border-t border-white/5 pt-2">Analisis Status Kesejahteraan & Potensi UMKM. Target Intervensi & Pemberdayaan Ekonomi.</div>
                      </motion.div>
                    )}

                    {thematicLayers.kesehatan && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-teal-500/30 rounded-xl p-3">
                        <div className="text-[10px] text-teal-400 font-bold uppercase tracking-widest border-b border-teal-500/20 pb-2 mb-2">Kesehatan & Lingkungan</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5"><Activity size={12} className="text-teal-400" /> Akses Sanitasi</span>
                          <span className="text-xs font-mono text-emerald-400">Tinggi</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 ml-4">Lokasi Posyandu</span>
                          <span className="text-xs font-mono text-white">4 Titik</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight border-t border-white/5 pt-2">Pemetaan Fasilitas Kesehatan & Akses Sanitasi. Pemantauan Kondisi Lingkungan Hidup.</div>
                      </motion.div>
                    )}

                    {thematicLayers.trantibum && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-3">
                        <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest border-b border-rose-500/20 pb-2 mb-2">Trantibum & Mitigasi</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5"><Target size={12} className="text-rose-400" /> Zona Rawan Banjir</span>
                          <span className="text-xs font-mono text-rose-400">Siaga</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-300 ml-4">Lokasi Poskamling</span>
                          <span className="text-xs font-mono text-white">Pemetaan Aktif</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight border-t border-white/5 pt-2">Identifikasi Potensi Bencana & Pos Keamanan. Perencanaan Mitigasi & Jalur Evakuasi Cepat.</div>
                      </motion.div>
                    )}
                  </div>
                )}
                {activeThematicTab === "FILTER" && (
                  <div className="text-xs text-slate-400 text-center py-4">Opsi filter sektoral belum tersedia.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EXPANDABLE AVATAR UI - TOP RIGHT */}
      <div className="absolute top-6 right-6 z-10 pointer-events-auto">
        <motion.div 
          initial="collapsed"
          whileHover="expanded"
          className="relative bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-full h-12 flex items-center justify-end overflow-hidden shadow-2xl transition-shadow hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          variants={{
            collapsed: { width: 48 }, // Just the circle size (w-12 = 48px)
            expanded: { width: "auto" }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Expanded Content (Only visible on hover) */}
          <motion.div 
            className="flex items-center gap-2 pr-2 pl-4 whitespace-nowrap"
            variants={{
              collapsed: { opacity: 0, x: 20 },
              expanded: { opacity: 1, x: 0 }
            }}
          >
            <div className="flex flex-col items-end mr-2">
              <span className="text-white text-xs font-bold leading-tight">{userName}</span>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider">{isPetugasKhusus ? "Petugas GIS" : "Administrator"}</span>
            </div>

            <button
              onClick={toggleFs}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors border border-white/5"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
            </button>

            <Link
              href={isPetugasKhusus ? "/api/auth/signout" : "/dashboard"}
              className="w-8 h-8 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 transition-colors"
              title="Keluar"
            >
              <LogOut size={12} />
            </Link>
          </motion.div>

          {/* The Avatar Circle (Always on right) */}
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-lg border-2 border-slate-900 rounded-full z-10 cursor-pointer">
            {userName.charAt(0)}
          </div>
        </motion.div>
      </div>

      {/* FLOATING GLASSMORPHISM UI - BOTTOM LEFT (STATISTICS) */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
        
        {/* Active Indicator Relocated */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-full w-max"
        >
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75" />
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">Sistem Aktif</span>
        </motion.div>

        {/* Stats Row */}
        <div className="flex gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl w-40 pointer-events-auto"
        >
          <div className="text-blue-400 mb-2"><Home size={20} /></div>
          <div className="text-3xl font-black text-white">{stats.houses.toLocaleString()}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Rumah Terdata</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl w-40 pointer-events-auto"
        >
          <div className="text-emerald-400 mb-2"><Users size={20} /></div>
          <div className="text-3xl font-black text-white">{stats.population.toLocaleString()}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Jiwa</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rose-900/40 backdrop-blur-md border border-rose-500/20 p-5 rounded-3xl shadow-2xl w-40 pointer-events-auto"
        >
          <div className="text-rose-400 mb-2"><Activity size={20} /></div>
          <div className="text-3xl font-black text-white">{stats.poverty.toLocaleString()}</div>
          <div className="text-[9px] text-rose-300 font-bold uppercase tracking-widest mt-1">Pra-Sejahtera</div>
        </motion.div>

      </div>
        </div>
    </>
  );
}
