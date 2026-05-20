"use client";

import { useState, useEffect, useRef } from "react";
import { getBoundaryPopulationStats, getAllBoundariesDensity } from "@/actions/gis";
import { 
  Layers, 
  Users, 
  Briefcase, 
  Heart, 
  MapPin, 
  TrendingUp, 
  Loader2, 
  X,
  UserCheck,
  Activity,
  Hash,
  Maximize,
  Minimize
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import "leaflet/dist/leaflet.css";

interface Boundary {
  id: string;
  name: string;
  type: "DESA" | "DUSUN" | "RW" | "RT";
  parentName: string | null;
  coordinates: any;
  color: string;
}

interface InteractiveVillageMapProps {
  tenantId: string;
  initialBoundaries: any[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#6366f1"];

export default function InteractiveVillageMap({
  tenantId,
  initialBoundaries
}: InteractiveVillageMapProps) {
  const [boundaries, setBoundaries] = useState<Boundary[]>(initialBoundaries as Boundary[]);
  const [visibleLayers, setVisibleLayers] = useState({
    DESA: true,
    DUSUN: true,
    RW: true,
    RT: true
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected region details
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [densityMap, setDensityMap] = useState<Record<string, number>>({});
  const [maxDensityByType, setMaxDensityByType] = useState<Record<string, number>>({});

  // Leaflet Map Refs
  const mapRef = useRef<any>(null);
  const mapContainerId = "gis-public-map";
  const layersGroupRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Initialize Map and Fetch Density
  useEffect(() => {
    let mapInstance: any = null;

    async function fetchDensity() {
      const res = await getAllBoundariesDensity(tenantId);
      if (res.success && res.data) {
        setDensityMap(res.data);
        // Calculate max by type
        const maxByType: Record<string, number> = { DESA: 0, DUSUN: 0, RW: 0, RT: 0 };
        initialBoundaries.forEach((b: any) => {
          const count = res.data[b.id] || 0;
          if (count > maxByType[b.type]) maxByType[b.type] = count;
        });
        setMaxDensityByType(maxByType);
      }
    }

    fetchDensity();

    async function initLeaflet() {
      const L = (await import("leaflet")).default;
      LRef.current = L;

      // Fix Default Icon markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Fix duplicate container initialization in React StrictMode
      const container = L.DomUtil.get(mapContainerId);
      if (container) {
        (container as any)._leaflet_id = null;
      }

      // Check if DESA boundary exists to set default view precisely
      const desaBoundary = initialBoundaries.find(b => b.type === "DESA");
      let defaultCenter: [number, number] = [-6.5971, 106.6786];
      let defaultZoom = 13;

      if (desaBoundary) {
        try {
          const coords = typeof desaBoundary.coordinates === "string" ? JSON.parse(desaBoundary.coordinates) : desaBoundary.coordinates;
          if (coords && coords.length > 0) {
            defaultCenter = coords[0];
            defaultZoom = 15;
          }
        } catch (e) {}
      }

      mapInstance = L.map(mapContainerId, {
        zoomControl: true,
      }).setView(defaultCenter, defaultZoom);

      mapRef.current = mapInstance;

      // Standard OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      layersGroupRef.current = L.layerGroup().addTo(mapInstance);

      // Dynamic Zoom Listener
      mapInstance.on("zoomend", () => {
        const z = mapInstance.getZoom();
        if (z < 14) {
          setVisibleLayers({ DESA: true, DUSUN: true, RW: false, RT: false });
        } else if (z >= 14 && z < 16) {
          setVisibleLayers({ DESA: false, DUSUN: false, RW: true, RT: false });
        } else {
          setVisibleLayers({ DESA: false, DUSUN: false, RW: false, RT: true });
        }
      });

      // Render Polygons
      drawBoundaries();

      // Recalculate layout size dynamically to fix gray map rendering
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
        }
      }, 600);
    }

    if (typeof window !== "undefined") {
      initLeaflet();
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapRef.current) {
        setTimeout(() => mapRef.current.invalidateSize(), 200);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Redraw when boundaries or layer toggles change
  useEffect(() => {
    if (mapRef.current) {
      try {
        mapRef.current.invalidateSize();
      } catch (e) {}
    }
    drawBoundaries();
  }, [boundaries, visibleLayers]);

  // Helper to draw polygons on active layers
  const drawBoundaries = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = layersGroupRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    // 1. Draw Inverted Polygon (Masking) if DESA exists
    const desaBoundary = boundaries.find(b => b.type === "DESA");
    if (desaBoundary) {
      let desaCoords: [number, number][] = [];
      try {
        desaCoords = typeof desaBoundary.coordinates === "string" ? JSON.parse(desaBoundary.coordinates) : desaBoundary.coordinates;
      } catch (e) {}

      if (desaCoords && desaCoords.length >= 3) {
        // Outer Bounds covering entire map range
        const outerBounds = [
          [-90, -180],
          [90, -180],
          [90, 180],
          [-90, 180]
        ];

        // GeoJSON style for holes: [outerRing, innerRing]
        L.polygon([outerBounds, desaCoords], {
          color: "transparent",
          fillColor: "#0f172a", // Dark slate mask
          fillOpacity: 0.65,
          interactive: false // So it doesn't block clicks on the actual boundaries
        }).addTo(group);
      }
    }

    // 2. Draw actual boundaries
    const filtered = boundaries.filter(b => visibleLayers[b.type]);
    if (filtered.length === 0) return;

    const bounds: any[] = [];

    filtered.forEach((b) => {
      let coords: [number, number][] = [];
      try {
        coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
      } catch (e) {
        return;
      }

      if (!Array.isArray(coords) || coords.length === 0) return;

      // Choropleth logic: calculate opacity and shade based on population density
      const popCount = densityMap[b.id] || 0;
      const maxPop = maxDensityByType[b.type] || 1;
      // Normalization factor (0.2 to 0.8)
      let calculatedOpacity = 0.15;
      if (maxPop > 0) {
        calculatedOpacity = 0.15 + (popCount / maxPop) * 0.65;
      }

      // Automatically make it darker if it's more populated
      const isSelected = selectedBoundary?.id === b.id;
      
      const polygon = L.polygon(coords, {
        color: b.color || "#3b82f6",
        fillColor: b.color || "#3b82f6",
        fillOpacity: isSelected ? 0.8 : calculatedOpacity,
        weight: isSelected ? 4 : (b.type === "DESA" ? 3 : 2),
        dashArray: b.type === "RT" ? "4, 6" : b.type === "RW" ? "6, 8" : undefined
      }).addTo(group);

      // Custom premium tooltip
      const parentLabel = b.parentName ? ` (RW: ${b.parentName})` : "";
      polygon.bindTooltip(`
        <div class="font-sans">
          <span class="text-[9px] font-black uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded-md mr-1.5">${b.type}</span>
          <span class="font-bold text-slate-900">${b.name}${parentLabel}</span>
          <div class="mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" style="background-color: ${b.color || '#3b82f6'}"></span>
            <span class="text-[10px] font-bold text-slate-700">${popCount.toLocaleString()} Jiwa</span>
          </div>
          <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 border-t border-slate-100 pt-1.5">Klik untuk Sensus Real-Time</p>
        </div>
      `, {
        sticky: true,
        className: "leaflet-voyager-tooltip border-0 shadow-lg p-3 rounded-2xl bg-white"
      });

      // Click event to fetch population stats
      polygon.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e);
        handleSelectBoundary(b);
      });

      coords.forEach(c => bounds.push(c));
    });

    if (bounds.length > 0 && !selectedBoundary) {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [30, 30] });
      } catch (e) {}
    }
  };

  const handleSelectBoundary = async (b: Boundary) => {
    setSelectedBoundary(b);
    setStats(null);
    setStatsError("");
    setStatsLoading(true);

    // Dynamic zoom to the polygon
    const L = LRef.current;
    if (L && mapRef.current) {
      mapRef.current.fitBounds(L.polygon(b.coordinates).getBounds(), { padding: [50, 50] });
    }

    try {
      const res = await getBoundaryPopulationStats({
        type: b.type,
        name: b.name,
        parentName: b.parentName,
        tenantId
      });

      if (res.success) {
        setStats(res.data);
      } else {
        setStatsError(res.error || "Gagal memuat statistik penduduk");
      }
    } catch (err: any) {
      setStatsError("Terjadi kesalahan jaringan");
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleLayer = (layer: "DESA" | "DUSUN" | "RW" | "RT") => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("gis-fullscreen-wrapper");
    if (!document.fullscreenElement) {
      container?.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 relative" id="gis-fullscreen-wrapper">
      {/* 1. MAP & CONTROLS (Width 2/3 or full if no selection) */}
      <div className={`flex-1 flex flex-col gap-6 ${isFullscreen ? 'p-6 bg-slate-50 overflow-y-auto' : ''}`}>
        
        {/* Layer Toggles Banner */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="text-blue-500" size={20} />
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Pilih Filter Layer Batas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aktifkan batas administratif desa</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleButton active={visibleLayers.DESA} onClick={() => toggleLayer("DESA")} label="Desa" color="bg-blue-500 text-blue-600 border-blue-100" />
            <ToggleButton active={visibleLayers.DUSUN} onClick={() => toggleLayer("DUSUN")} label="Dusun" color="bg-indigo-500 text-indigo-600 border-indigo-100" />
            <ToggleButton active={visibleLayers.RW} onClick={() => toggleLayer("RW")} label="RW" color="bg-amber-500 text-amber-600 border-amber-100" />
            <ToggleButton active={visibleLayers.RT} onClick={() => toggleLayer("RT")} label="RT" color="bg-rose-500 text-rose-600 border-rose-100" />
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white p-4 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
          
          {/* Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-8 right-8 z-[1000] bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 hover:scale-105 transition-all text-slate-700 hover:text-blue-600 border border-slate-100"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          <div 
            id={mapContainerId} 
            className={`w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner z-10 ${isFullscreen ? 'h-[80vh]' : 'h-[650px]'}`}
          />
        </div>

      </div>

      {/* 2. DEMOGRAPHICS SLIDE-OVER SIDEBAR (Width 1/3, dynamically sliding/rendered) */}
      {selectedBoundary && (
        <div className="w-full xl:w-[450px] bg-white p-6 md:p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl xl:sticky xl:top-6 self-start space-y-8 animate-in slide-in-from-right-8 duration-500 z-30 shrink-0">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-md text-[9px] font-black tracking-wider uppercase ${
                selectedBoundary.type === "DESA" ? "bg-blue-50 text-blue-600" :
                selectedBoundary.type === "DUSUN" ? "bg-indigo-50 text-indigo-600" :
                selectedBoundary.type === "RW" ? "bg-amber-50 text-amber-600" :
                "bg-rose-50 text-rose-600"
              }`}>
                {selectedBoundary.type}
              </span>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {selectedBoundary.name} {selectedBoundary.parentName && `(RW ${selectedBoundary.parentName})`}
              </h2>
            </div>
            <button
              onClick={() => setSelectedBoundary(null)}
              className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Real-time indicator & Alias ID */}
          {stats && (
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 w-fit">
                  <Activity size={12} className="animate-pulse" /> Sensus Real-Time Tersinkronisasi
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                  <Hash size={12} /> ID: <span className="text-slate-800 font-black tracking-wider">{stats.aliasId || "TIDAK-DIKETAHUI"}</span>
               </div>
            </div>
          )}

          {/* Stats Loading/Error */}
          {statsLoading && (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={36} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Menghitung Data Kependudukan...</p>
            </div>
          )}

          {statsError && (
            <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 text-center">
              {statsError}
            </div>
          )}

          {/* Demographics Visualization */}
          {stats && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Card Total Penduduk */}
              <div className="bg-slate-950 p-6 rounded-[2rem] text-white flex items-center justify-between relative overflow-hidden shadow-xl shadow-slate-950/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl animate-pulse" />
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Kependudukan Riil</span>
                  <p className="text-4xl font-black tabular-nums">{stats.total.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold">Jiwa Terdaftar di database</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 relative z-10 shrink-0">
                  <Users size={24} />
                </div>
              </div>

              {/* A. Rasio Jenis Kelamin (Donut Chart) */}
              <div className="space-y-3 p-5 border border-slate-100 rounded-[2rem] shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck size={14} className="text-blue-500" /> Rasio Jenis Kelamin
                </h4>
                {stats.gender.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">Tidak ada data jenis kelamin</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.gender}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={40}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {stats.gender.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2 pl-4">
                      {stats.gender.map((g: any, index: number) => (
                        <div key={g.name} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {g.name}
                          </span>
                          <span className="font-black text-slate-800 tabular-nums">{g.value} jiwa</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* B. Distibusi Kelompok Umur (Bar Chart) */}
              <div className="space-y-3 p-5 border border-slate-100 rounded-[2rem] shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" /> Distribusi Umur
                </h4>
                <div className="h-36 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.age} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '0', borderRadius: '12px', color: '#ffffff', fontFamily: 'sans-serif', fontSize: '10px' }} 
                        labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {stats.age.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* C. Pekerjaan Mayoritas (Horizontal Bars) */}
              <div className="space-y-3 p-5 border border-slate-100 rounded-[2rem] shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-500" /> Top 5 Pekerjaan Warga
                </h4>
                {stats.jobs.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">Tidak ada data pekerjaan</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    {stats.jobs.map((job: any, index: number) => {
                      const maxVal = Math.max(...stats.jobs.map((j: any) => j.value));
                      const percent = (job.value / maxVal) * 100;
                      return (
                        <div key={job.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 truncate max-w-[200px]">{job.name}</span>
                            <span className="text-slate-800 font-black tabular-nums">{job.value} jiwa</span>
                          </div>
                          <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* D. Status Pernikahan */}
              <div className="space-y-3 p-5 border border-slate-100 rounded-[2rem] shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Heart size={14} className="text-rose-500" /> Status Pernikahan
                </h4>
                <div className="flex flex-wrap gap-3 mt-2">
                  {stats.marital.map((m: any, index: number) => (
                    <div key={m.name} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-500">{m.name}:</span>
                      <span className="text-slate-800 font-black tabular-nums">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

function ToggleButton({ active, onClick, label, color }: any) {
  const activeClasses = active 
    ? `${color} bg-opacity-10 border-2`
    : "bg-slate-50 text-slate-400 border-slate-100 border-2";

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all ${activeClasses}`}
    >
      {label}
    </button>
  );
}
