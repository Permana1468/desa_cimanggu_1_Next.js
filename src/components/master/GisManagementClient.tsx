"use client";

import { useState, useEffect, useRef } from "react";
import { 
  getBoundaries, 
  saveBoundary, 
  deleteBoundary 
} from "@/actions/gis";
import { 
  Map, 
  Plus, 
  Trash2, 
  MapPin, 
  Edit3, 
  Upload, 
  Download, 
  Undo, 
  RotateCcw, 
  Save, 
  Layers, 
  Globe, 
  Check, 
  Loader2,
  X
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

interface Boundary {
  id: string;
  name: string;
  type: "DESA" | "DUSUN" | "RW" | "RT";
  parentName: string | null;
  coordinates: any; // [ [lat, lng], [lat, lng], ... ]
  color: string;
  createdAt: any;
}

interface Tenant {
  id: string;
  name: string;
}

interface GisManagementClientProps {
  initialBoundaries: any[];
  tenants: Tenant[];
  currentTenantId: string;
  villageStructure: any;
}

const PRESET_COLORS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" }
];

export default function GisManagementClient({
  initialBoundaries,
  tenants,
  currentTenantId,
  villageStructure
}: GisManagementClientProps) {
  const [boundaries, setBoundaries] = useState<Boundary[]>(initialBoundaries as Boundary[]);
  const [selectedTenantId, setSelectedTenantId] = useState(currentTenantId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"DESA" | "DUSUN" | "RW" | "RT">("DUSUN");
  const [parentName, setParentName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawVertices, setDrawVertices] = useState<[number, number][]>([]);

  // Leaflet Map Refs
  const mapRef = useRef<any>(null);
  const mapContainerId = "gis-admin-map";
  const drawnLayersGroupRef = useRef<any>(null);
  const drawingLayerGroupRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Load Boundaries when Tenant changes
  useEffect(() => {
    if (selectedTenantId === currentTenantId) {
      setBoundaries(initialBoundaries as Boundary[]);
      return;
    }
    
    async function loadTenantBoundaries() {
      setLoading(true);
      setError("");
      try {
        const res = await getBoundaries(selectedTenantId);
        if (res.success) {
          setBoundaries(res.data as Boundary[]);
        } else {
          setError(res.error || "Gagal memuat batas wilayah");
        }
      } catch (err: any) {
        setError("Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    }
    loadTenantBoundaries();
  }, [selectedTenantId, initialBoundaries, currentTenantId]);

  // Leaflet Initialization
  useEffect(() => {
    let mapInstance: any = null;

    async function initLeaflet() {
      // Dynamic import to prevent Node SSR window error
      const L = (await import("leaflet")).default;
      LRef.current = L;

      // Fix icon issues in Next.js/Leaflet
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

      // Default view center on Bogor region (Cibungbulang)
      mapInstance = L.map(mapContainerId, {
        zoomControl: true,
      }).setView([-6.5971, 106.6786], 13);
      
      mapRef.current = mapInstance;

      // Standard OpenStreetMap tiles (Reliable fallback to prevent gray map)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstance);


      drawnLayersGroupRef.current = L.layerGroup().addTo(mapInstance);
      drawingLayerGroupRef.current = L.layerGroup().addTo(mapInstance);

      // Initialize Geoman
      (window as any).L = L;
      await import("@geoman-io/leaflet-geoman-free");
      
      mapInstance.pm.setGlobalOptions({
        snappable: true,
        snapDistance: 20,
        allowSelfIntersection: false,
      });

      // Handle Geoman drawing completion
      mapInstance.on("pm:create", (e: any) => {
        const layer = e.layer;
        const coords = layer.getLatLngs()[0]; // outer ring
        const vertices: [number, number][] = coords.map((c: any) => [c.lat, c.lng]);
        
        setDrawVertices(vertices);
        setIsDrawing(false);
        
        // Remove geoman layer because we will render it via our React state
        layer.remove();
        drawTempDrawing(vertices);
      });

      // Draw initial polygons
      drawAllSavedPolygons();

      // Force Leaflet to recalculate container size to avoid gray map issue
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

  // Sync isDrawing with Map Interaction
  useEffect(() => {
    if (!mapRef.current) return;
    if (isDrawing) {
      mapRef.current.getContainer().style.cursor = "crosshair";
    } else {
      mapRef.current.getContainer().style.cursor = "";
      mapRef.current.pm.disableDraw();
    }
  }, [isDrawing]);

  // Watch boundaries and redraw whenever they change
  useEffect(() => {
    if (mapRef.current) {
      try {
        mapRef.current.invalidateSize();
      } catch (e) {}
    }
    drawAllSavedPolygons();
  }, [boundaries]);

  // Helper to draw saved polygons from DB
  const drawAllSavedPolygons = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = drawnLayersGroupRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    if (boundaries.length === 0) return;

    const bounds: any[] = [];

    boundaries.forEach((b) => {
      let coords: [number, number][] = [];
      try {
        coords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
      } catch (e) {
        console.error("Failed to parse coordinates for", b.name, e);
        return;
      }

      if (!Array.isArray(coords) || coords.length === 0) return;

      const polygon = L.polygon(coords, {
        color: b.color || "#3b82f6",
        fillColor: b.color || "#3b82f6",
        fillOpacity: 0.35,
        weight: 3,
        dashArray: b.type === "RT" ? "4, 6" : b.type === "RW" ? "6, 8" : undefined
      }).addTo(group);

      // Label Tooltip
      const parentLabel = b.parentName ? ` (Induk: ${b.parentName})` : "";
      polygon.bindTooltip(`<strong>Batas ${b.type}</strong>: ${b.name}${parentLabel}`, {
        sticky: true,
        className: "leaflet-custom-tooltip font-sans font-semibold rounded-lg bg-slate-900 text-white p-2 border-0 shadow-md"
      });

      // Click to edit
      polygon.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e); // Stop map click handler
        handleEditClick(b);
      });

      // Collect for bounding box fitting
      coords.forEach((c) => bounds.push(c));
    });

    // Fit map to fit all polgons beautifully if boundaries loaded
    if (bounds.length > 0) {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (err) {}
    }
  };

  // Helper to draw temporary vertices when drawing new polygon
  const drawTempDrawing = (vertices: [number, number][]) => {
    const L = LRef.current;
    const group = drawingLayerGroupRef.current;
    if (!L || !group) return;

    group.clearLayers();

    if (vertices.length === 0) return;

    // Draw markers for each vertex
    vertices.forEach((v, index) => {
      L.circleMarker(v, {
        radius: 6,
        color: "#f43f5e",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 3
      }).addTo(group)
      .bindTooltip(`Titik ${index + 1}`, { permanent: false, direction: "top" });
    });

    // Draw lines
    if (vertices.length >= 2) {
      L.polyline(vertices, {
        color: "#f43f5e",
        weight: 3,
        dashArray: "6, 6"
      }).addTo(group);
    }

    // Fill polygon if 3+ vertices
    if (vertices.length >= 3) {
      L.polygon(vertices, {
        color: "#f43f5e",
        fillColor: "#f43f5e",
        fillOpacity: 0.15,
        weight: 1
      }).addTo(group);
    }
  };

  // Handle vertex drawing controls
  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawVertices([]);
    setError("");
    if (mapRef.current) {
      mapRef.current.pm.enableDraw("Polygon", {
        snappable: true,
        snapDistance: 20,
      });
    }
  };

  const handleUndoVertex = () => {
    // With Geoman, undoing is tricky programmatically if we hide toolbar.
    // Geoman allows undoing last point via map.pm.Draw.Polygon._removeLastVertex() but it's internal.
    // It's safer to just provide Reset All.
  };

  const handleResetDraw = () => {
    setDrawVertices([]);
    drawTempDrawing([]);
    setIsDrawing(false);
    if (mapRef.current) {
      mapRef.current.pm.disableDraw();
    }
  };

  // Save Boundary Action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    let finalCoords = drawVertices;
    
    // If not drawing, we use the existing coordinates
    if (editingId && finalCoords.length === 0) {
      const boundaryToUpdate = boundaries.find(b => b.id === editingId);
      if (boundaryToUpdate) {
        finalCoords = boundaryToUpdate.coordinates;
      }
    }

    if (!name) {
      setError("Nama wilayah wajib diisi");
      setLoading(false);
      return;
    }

    if (finalCoords.length < 3) {
      setError("Poligon wajib memiliki minimal 3 titik koordinat! Silakan gambar di peta terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id: editingId || undefined,
        name,
        type,
        parentName: parentName || null,
        coordinates: finalCoords,
        color,
        tenantId: selectedTenantId
      };

      const res = await saveBoundary(payload);

      if (res.success) {
        setSuccess(editingId ? "Batas wilayah berhasil diperbarui!" : "Batas wilayah baru berhasil disimpan!");
        
        // Update local state list
        if (editingId) {
          setBoundaries((prev) => prev.map(b => b.id === editingId ? (res.data as Boundary) : b));
        } else {
          setBoundaries((prev) => [res.data as Boundary, ...prev]);
        }

        // Reset form
        resetForm();
      } else {
        setError(res.error || "Gagal menyimpan batas wilayah");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (b: Boundary) => {
    setError("");
    setSuccess("");
    setEditingId(b.id);
    setName(b.name);
    setType(b.type);
    setParentName(b.parentName || "");
    setColor(b.color);
    
    // Zoom map to the polygon
    const L = LRef.current;
    if (L && mapRef.current) {
      mapRef.current.fitBounds(L.polygon(b.coordinates).getBounds(), { padding: [50, 50] });
    }
    
    setIsDrawing(false);
    setDrawVertices([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus batas wilayah ini secara permanen?")) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await deleteBoundary(id, selectedTenantId);
      if (res.success) {
        setSuccess("Batas wilayah berhasil dihapus");
        setBoundaries((prev) => prev.filter(b => b.id !== id));
        if (editingId === id) resetForm();
      } else {
        setError(res.error || "Gagal menghapus batas wilayah");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setType("DUSUN");
    setParentName("");
    setColor("#3b82f6");
    setIsDrawing(false);
    setDrawVertices([]);
    if (drawingLayerGroupRef.current) {
      drawingLayerGroupRef.current.clearLayers();
    }
  };

  // Bulk Import GeoJSON
  const handleImportGeoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const geojson = JSON.parse(text);

        if (!geojson.features || !Array.isArray(geojson.features)) {
          setError("Format file tidak valid! Pastikan file adalah GeoJSON standard yang memiliki array 'features'.");
          return;
        }

        setLoading(true);
        let importedCount = 0;

        for (const feature of geojson.features) {
          const geometry = feature.geometry;
          const properties = feature.properties || {};

          if (geometry.type !== "Polygon") {
            continue; // Skip non-polygons for simplicity
          }

          // GeoJSON coordinates are [lng, lat], Leaflet is [lat, lng]. We need to map and reverse!
          const rawCoords = geometry.coordinates[0];
          const finalCoords: [number, number][] = rawCoords.map((c: any) => [c[1], c[0]]);

          // Guess metadata from properties
          const nameGuessed = properties.name || properties.nama || properties.id || `Wilayah_${Date.now()}`;
          const typeGuessed = properties.type || properties.tipe || "DUSUN";
          const parentGuessed = properties.parent || properties.induk || null;
          const colorGuessed = properties.color || properties.warna || "#3b82f6";

          const payload = {
            name: String(nameGuessed),
            type: (["DESA", "DUSUN", "RW", "RT"].includes(typeGuessed.toUpperCase()) ? typeGuessed.toUpperCase() : "DUSUN") as any,
            parentName: parentGuessed ? String(parentGuessed) : null,
            coordinates: finalCoords,
            color: colorGuessed,
            tenantId: selectedTenantId
          };

          const res = await saveBoundary(payload);
          if (res.success) {
            importedCount++;
            setBoundaries((prev) => [res.data as Boundary, ...prev]);
          }
        }

        if (importedCount > 0) {
          setSuccess(`GeoJSON Berhasil Diimpor! Berhasil mengimpor ${importedCount} poligon batas wilayah.`);
        } else {
          setError("Tidak ada poligon valid yang ditemukan dan diimpor.");
        }
      } catch (err: any) {
        setError("Gagal membaca berkas GeoJSON. Pastikan format JSON valid.");
      } finally {
        setLoading(false);
        if (e.target) e.target.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  // Bulk Export GeoJSON
  const handleExportGeoJSON = () => {
    if (boundaries.length === 0) {
      alert("Tidak ada data batas wilayah untuk diekspor.");
      return;
    }

    const geojson = {
      type: "FeatureCollection",
      features: boundaries.map((b) => {
        // Reverse Leaflet [lat, lng] back to GeoJSON [lng, lat]
        const leafletCoords = typeof b.coordinates === "string" ? JSON.parse(b.coordinates) : b.coordinates;
        const geojsonCoords = [leafletCoords.map((c: any) => [c[1], c[0]])];

        return {
          type: "Feature",
          properties: {
            id: b.id,
            name: b.name,
            type: b.type,
            parentName: b.parentName,
            color: b.color,
          },
          geometry: {
            type: "Polygon",
            coordinates: geojsonCoords,
          },
        };
      }),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `batas_wilayah_desa_cimanggu_1.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 1. SIDEBAR CONFIGURATION (Width 1/3) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Tenant Selector for Master Admin */}
        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold">Pilih Wilayah Desa (Tenant)</h2>
          </div>
          <select
            value={selectedTenantId}
            onChange={(e) => {
              setSelectedTenantId(e.target.value);
              resetForm();
            }}
            className="w-full bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none transition-all font-semibold"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drawing & Save Form */}
        <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {editingId ? "Edit Batas Wilayah" : "Tambah Batas Wilayah"}
            </h2>
            {editingId && (
              <button 
                onClick={resetForm}
                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Wilayah</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
              >
                <option value="DESA">Batas Desa (Keseluruhan)</option>
                <option value="DUSUN">Batas Dusun</option>
                <option value="RW">Batas RW</option>
                <option value="RT">Batas RT</option>
              </select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama / Nomor Wilayah</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "DUSUN" ? "Contoh: Dusun III" : type === "RW" ? "Contoh: 05" : type === "RT" ? "Contoh: 02" : "Contoh: Cimanggu I"}
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                required
              />
            </div>

            {/* Parent Name */}
            {type === "RT" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor RW Induk</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: 05"
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                  required
                />
              </div>
            )}

            {/* Color */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Warna Poligon</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center shadow-sm hover:scale-110"
                    style={{ 
                      backgroundColor: c.hex,
                      borderColor: color === c.hex ? "#1e293b" : "transparent"
                    }}
                  >
                    {color === c.hex && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing Tools Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-500" /> Gambar Poligon
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2.5 py-1 rounded-md">
                  {drawVertices.length} Titik
                </span>
              </div>

              {!isDrawing ? (
                <button
                  type="button"
                  onClick={handleStartDrawing}
                  className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> {editingId ? "Ganti Poligon Batas" : "Mulai Gambar Batas"}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    *Klik di atas peta untuk menambahkan titik. Titik akan otomatis menempel (snap) ke batas yang ada. Klik ganda untuk selesai.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResetDraw}
                      className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={12} /> Batal Menggambar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-xl border border-emerald-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Save size={16} /> {editingId ? "PERBARUI BATAS" : "SIMPAN BATAS WILAYAH"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bulk GIS Import / Export */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-500" size={18} />
            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Integrasi GeoJSON</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black text-center uppercase tracking-wider cursor-pointer transition-all border border-slate-100 flex flex-col items-center justify-center gap-2">
              <Upload size={16} className="text-indigo-500" />
              <span>Import GeoJSON</span>
              <input
                type="file"
                accept=".json,.geojson"
                onChange={handleImportGeoJSON}
                className="hidden"
                disabled={loading}
              />
            </label>

            <button
              onClick={handleExportGeoJSON}
              disabled={loading || boundaries.length === 0}
              className="py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black text-center uppercase tracking-wider transition-all border border-slate-100 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} className="text-emerald-500" />
              <span>Export GeoJSON</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. LIVE INTERACTIVE MAP & BOUNDARY LIST (Width 2/3) */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Map Container */}
        <div className="relative bg-white p-4 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          {isDrawing && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-full z-[1000] shadow-xl shadow-rose-600/30 flex items-center gap-2 animate-bounce">
              <MapPin size={12} /> Mode Menggambar Aktif
            </div>
          )}

          <div 
            id={mapContainerId} 
            className="w-full h-[600px] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner z-10"
          />
        </div>

        {/* Boundary Lists */}
        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Daftar Batas Wilayah Terdaftar</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Total {boundaries.length} poligon aktif</p>
          </div>

          {boundaries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-semibold">
              Belum ada batas wilayah yang digambar untuk desa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Induk/RW</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warna</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {boundaries.map((b) => (
                    <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <span className={`inline-block px-3 py-1 rounded-md text-[9px] font-black tracking-wider uppercase ${
                          b.type === "DESA" ? "bg-blue-50 text-blue-600" :
                          b.type === "DUSUN" ? "bg-indigo-50 text-indigo-600" :
                          b.type === "RW" ? "bg-amber-50 text-amber-600" :
                          "bg-rose-50 text-rose-600"
                        }`}>
                          {b.type}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-800 text-sm">{b.name}</td>
                      <td className="py-4 font-semibold text-slate-500 text-sm">{b.parentName || "-"}</td>
                      <td className="py-4">
                        <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: b.color }} />
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(b)}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit / Lihat di Peta"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
