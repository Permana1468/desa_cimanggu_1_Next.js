"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Map, 
  Trash2, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  Loader2, 
  RefreshCw, 
  Crosshair, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { getKesraGisList, addKesraGis, deleteKesraGis } from "@/actions/kesra";
import { getBoundaries } from "@/actions/gis";
import { syncSensusToGisPuskesos } from "@/actions/puskesos";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { CitizenSearchInput } from "./CitizenSearchInput";
import "leaflet/dist/leaflet.css";

export function PuskesosGisTab({ session }: any) {
  const [wargas, setWargas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterKerentanan, setFilterKerentanan] = useState("ALL");
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [boundaries, setBoundaries] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const LRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const mapContainerId = "kesra-gis-map";
  const markersGroupRef = useRef<any>(null);
  const tenantId = session?.user?.tenantId || "cimanggu-1";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, boundsRes] = await Promise.all([
        getKesraGisList(),
        tenantId ? getBoundaries(tenantId) : { success: false, data: [] }
      ]);
      setWargas(res || []);
      if (boundsRes.success && boundsRes.data) {
        setBoundaries(boundsRes.data);
      }
    } catch (e) {
      console.error("Gagal memuat GIS Puskesos:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncFromSensus = async () => {
    if (confirm("Sinkronkan sebaran koordinat rumah warga rentan dari data sensus kependudukan & UHC Desa Cimanggu I?")) {
      try {
        setIsSyncing(true);
        const res = await syncSensusToGisPuskesos(tenantId);
        alert(`Berhasil menyinkronkan ${res.addedCount} titik lokasi rumah warga rentan ke peta GIS!`);
        fetchData();
      } catch (err: any) {
        alert(err.message || "Gagal menyinkronkan data GIS sensus");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Render markers
  const renderMarkers = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = markersGroupRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    const filtered = wargas.filter(w => {
      const matchSearch = w.nama?.toLowerCase().includes(search.toLowerCase()) || w.nik?.includes(search);
      const matchFilter = filterKerentanan === "ALL" || w.kategoriKerentanan === filterKerentanan;
      return matchSearch && matchFilter;
    });

    filtered.forEach(w => {
      let color = "#10b981"; // green
      let catLabel = "Mampu";
      if (w.kategoriKerentanan === "MISKIN_EKSTREM") {
        color = "#ef4444"; // red
        catLabel = "Miskin Ekstrem";
      } else if (w.kategoriKerentanan === "RENTAN") {
        color = "#f59e0b"; // yellow
        catLabel = "Rentan Sosial";
      }

      const customIcon = L.divIcon({
        className: "custom-marker-pin",
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([w.latitude, w.longitude], { icon: customIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11px; color: #334155; width: 190px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 12px; color: #0f172a;">${w.nama}</h4>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; color: white; background-color: ${color}; margin-bottom: 6px;">
            ${catLabel}
          </span>
          <p style="margin: 0 0 3px;"><b>NIK:</b> ${w.nik}</p>
          <p style="margin: 0 0 3px;"><b>Kontak:</b> ${w.kontak || "-"}</p>
          <p style="margin: 0 0 3px;"><b>Koordinat:</b> ${w.latitude.toFixed(5)}, ${w.longitude.toFixed(5)}</p>
          ${w.fotoRumah ? `<img src="${w.fotoRumah}" style="width: 100%; height: 75px; object-fit: cover; border-radius: 6px; margin-top: 6px;" alt="Rumah" />` : ""}
        </div>
      `;
      
      marker.bindTooltip(popupHtml, { direction: 'top', className: 'gis-tooltip' });
      marker.bindPopup(popupHtml);
      marker.addTo(group);
    });
  };

  useEffect(() => {
    if (loading) return;

    let isMounted = true;
    let mapInstance: any = null;

    async function initLeaflet() {
      const L = (await import("leaflet")).default;
      if (!isMounted) return;
      LRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const container = L.DomUtil.get(mapContainerId);
      if (container) {
        (container as any)._leaflet_id = null;
      }

      // Koordinat pusat Desa Cimanggu I
      const centerCoord: [number, number] = [-6.6267, 106.6713];
      
      mapInstance = L.map(mapContainerId).setView(centerCoord, 14);
      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Boundary polygon Desa Cimanggu I
      const desaBoundary = boundaries.find((b: any) => b.type === "DESA");
      if (desaBoundary) {
        let desaCoords: [number, number][] = [];
        try {
          desaCoords = typeof desaBoundary.coordinates === "string" ? JSON.parse(desaBoundary.coordinates) : desaBoundary.coordinates;
        } catch (e) {}

        if (desaCoords && desaCoords.length >= 3) {
          const outerBounds = [[-90, -180], [90, -180], [90, 180], [-90, 180]];
          L.polygon([outerBounds, desaCoords] as any, {
            color: "transparent",
            fillColor: "#0f172a",
            fillOpacity: 0.65,
            interactive: false 
          }).addTo(mapInstance);

          mapInstance.fitBounds(L.polygon(desaCoords).getBounds(), { padding: [40, 40] });
        }
      }

      markersGroupRef.current = L.layerGroup().addTo(mapInstance);

      if (wargas.length > 0) {
        renderMarkers();
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [loading, boundaries]);

  useEffect(() => {
    if (markersGroupRef.current && LRef.current) {
      renderMarkers();
    }
  }, [wargas, search, filterKerentanan]);

  const handleDeleteWarga = async (id: string) => {
    if (confirm("Hapus data GIS titik rumah warga ini?")) {
      await deleteKesraGis(id);
      fetchData();
    }
  };

  const focusOnMap = (lat: number, lng: number, w: any) => {
    setSelectedWarga(w);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
    }
  };

  const filteredWargas = wargas.filter(w => {
    const matchSearch = w.nama?.toLowerCase().includes(search.toLowerCase()) || w.nik?.includes(search);
    const matchFilter = filterKerentanan === "ALL" || w.kategoriKerentanan === filterKerentanan;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
            Sistem Informasi Geografis (GIS)
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-600" />
            GIS & Geotagging Keluarga Rentan
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Pemetaan geospasial sebaran rumah warga rentan kemiskinan dan usulan bedah rumah Desa Cimanggu I.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncFromSensus}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {isSyncing ? "Menyinkronkan..." : "Sinkronkan Dari Sensus Warga"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Titik Warga
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Map Visual */}
        <div className="xl:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[560px]">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 justify-between items-center bg-slate-50/50">
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: "Semua", val: "ALL", bg: "bg-slate-900 text-white" },
                { label: "Miskin Ekstrem", val: "MISKIN_EKSTREM", bg: "bg-red-500 text-white" },
                { label: "Rentan Sosial", val: "RENTAN", bg: "bg-amber-500 text-white" },
                { label: "Mampu", val: "MAMPU", bg: "bg-emerald-600 text-white" }
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilterKerentanan(f.val)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterKerentanan === f.val 
                      ? f.bg + " shadow-sm" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total: <strong className="text-slate-900">{filteredWargas.length}</strong> Titik Rumah
            </div>
          </div>
          
          {/* Leaflet map container */}
          <div id={mapContainerId} className="flex-1 w-full z-10" />
        </div>

        {/* Right Side: List Warga Panel */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[560px]">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
            <MapPin size={16} className="text-indigo-600" /> Daftar Lokasi Rumah Warga
          </h3>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kepala keluarga atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                Memuat titik GIS...
              </div>
            ) : filteredWargas.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <p className="font-bold text-slate-600 text-sm">Belum ada titik rumah</p>
                <p className="mt-1">Klik tombol &apos;Sinkronkan Dari Sensus Warga&apos; di atas untuk memuat peta otomatis.</p>
              </div>
            ) : (
              filteredWargas.map((w) => (
                <div
                  key={w.id}
                  onClick={() => focusOnMap(w.latitude, w.longitude, w)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedWarga?.id === w.id
                      ? "border-indigo-500 bg-indigo-50/30 shadow-xs"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{w.nama}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIK: {w.nik}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shrink-0 ${
                      w.kategoriKerentanan === "MISKIN_EKSTREM" ? "bg-red-500" : w.kategoriKerentanan === "RENTAN" ? "bg-amber-500" : "bg-emerald-500"
                    }`}>
                      {w.kategoriKerentanan === "MISKIN_EKSTREM" ? "Ekstrem" : w.kategoriKerentanan === "RENTAN" ? "Rentan" : "Mampu"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-mono"><MapPin size={11} className="text-indigo-500" /> {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {w.kontak || "-"}</span>
                  </div>

                  {selectedWarga?.id === w.id && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {w.fotoRumah && (
                        <div className="flex items-center gap-1.5">
                          <Home size={12} className="text-slate-400" />
                          <a href={w.fotoRumah} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline font-bold">Foto Rumah</a>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWarga(w.id);
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 ml-auto"
                      >
                        <Trash2 size={12} /> Hapus Titik
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ModalTambahGis 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchData} 
          session={session} 
          tenantId={tenantId}
        />
      )}
    </div>
  );
}

function ModalTambahGis({ onClose, onRefresh, session, tenantId }: any) {
  const [loading, setLoading] = useState(false);
  const [fotoRumah, setFotoRumah] = useState("");
  const [latitude, setLatitude] = useState("-6.6267");
  const [longitude, setLongitude] = useState("106.6713");
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
  const [kontak, setKontak] = useState("");

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi GPS.");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(7));
        setLongitude(pos.coords.longitude.toFixed(7));
        setIsGettingGps(false);
      },
      (err) => {
        alert("Gagal mendapatkan lokasi GPS: " + err.message);
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedCitizen) {
      alert("Silakan pilih warga dari data sensus kependudukan.");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.target);
    try {
      await addKesraGis({
        nik: selectedCitizen.nik,
        nama: selectedCitizen.namaLengkap,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        fotoRumah: fotoRumah || null,
        kategoriKerentanan: fd.get("kategoriKerentanan"),
        kontak: kontak || null
      });
      alert("Titik koordinat rumah warga berhasil disimpan!");
      onRefresh();
      onClose();
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan titik warga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-800">Tambah Koordinat Rumah Warga</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pemetaan geolokasi rumah penerima bansos / bedah rumah</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Warga Kepala Keluarga (Terintegrasi Kependudukan) *
            </label>
            <CitizenSearchInput
              tenantId={tenantId}
              onSelect={(c) => setSelectedCitizen(c)}
              placeholder="Ketik NIK atau Nama kepala keluarga..."
              required={true}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Koordinat Lokasi Rumah</span>
              <button
                type="button"
                onClick={handleGetGps}
                disabled={isGettingGps}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
              >
                <Crosshair size={12} className={isGettingGps ? "animate-spin" : ""} />
                {isGettingGps ? "Membaca GPS..." : "Ambil GPS Saya"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Latitude</label>
                <input 
                  required 
                  type="number" 
                  step="0.0000001" 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Longitude</label>
                <input 
                  required 
                  type="number" 
                  step="0.0000001" 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tingkat Kerentanan *</label>
              <select name="kategoriKerentanan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="MISKIN_EKSTREM">MISKIN EKSTREM</option>
                <option value="RENTAN">RENTAN SOSIAL</option>
                <option value="MAMPU">MAMPU</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">No. Kontak / WA</label>
              <input 
                type="text" 
                placeholder="08xxxxxxxxxx" 
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto Kondisi Rumah</label>
            <ImageUpload 
              localOnly={false}
              label="Upload Foto Rumah" 
              defaultValue={fotoRumah} 
              onUploadSuccess={setFotoRumah} 
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 font-bold shadow-md shadow-indigo-600/20">
              {loading ? "Menyimpan..." : "Simpan Titik Warga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
