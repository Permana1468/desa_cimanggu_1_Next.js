"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Map, Trash2, MapPin, Phone, User, Home, Loader2, AlertCircle } from "lucide-react";
import { getKesraGisList, addKesraGis, deleteKesraGis } from "@/actions/kesra";
import { getBoundaries } from "@/actions/gis";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import "leaflet/dist/leaflet.css";

export function PuskesosGisTab({ session }: any) {
  const [wargas, setWargas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterKerentanan, setFilterKerentanan] = useState("ALL");
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [boundaries, setBoundaries] = useState<any[]>([]);

  const LRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const mapContainerId = "kesra-gis-map";
  const markersGroupRef = useRef<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tenantId = session?.user?.tenantId || "";
      const [res, boundsRes] = await Promise.all([
        getKesraGisList(),
        tenantId ? getBoundaries(tenantId) : { success: false, data: [] }
      ]);
      setWargas(res);
      if (boundsRes.success && boundsRes.data) {
        setBoundaries(boundsRes.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Initialize Map
  const renderMarkers = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = markersGroupRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    const filtered = wargas.filter(w => {
      const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase()) || w.nik.includes(search);
      const matchFilter = filterKerentanan === "ALL" || w.kategoriKerentanan === filterKerentanan;
      return matchSearch && matchFilter;
    });

    filtered.forEach(w => {
      // Choose color based on category
      // Red: MISKIN_EKSTREM, Yellow/Orange: RENTAN, Green: MAMPU
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
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([w.latitude, w.longitude], { icon: customIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11px; color: #334155; width: 180px;">
          <h4 style="margin: 0 0 5px; font-weight: bold; font-size: 12px; color: #0f172a;">${w.nama}</h4>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; color: white; background-color: ${color}; margin-bottom: 8px;">
            ${catLabel}
          </span>
          <p style="margin: 0 0 4px;"><b>NIK:</b> ${w.nik}</p>
          <p style="margin: 0 0 4px;"><b>Telp:</b> ${w.kontak || "-"}</p>
          <p style="margin: 0 0 4px;"><b>Posisi:</b> ${w.latitude.toFixed(5)}, ${w.longitude.toFixed(5)}</p>
          ${w.fotoRumah ? `<img src="${w.fotoRumah}" style="width: 100%; height: 70px; object-cover; border-radius: 6px; margin-top: 6px;" alt="Rumah" />` : ""}
        </div>
      `;
      
      marker.bindTooltip(popupHtml, { direction: 'top', className: 'gis-tooltip' });
      marker.bindPopup(popupHtml); // keep click functionality as fallback
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

      // Fix icon URL
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

      // Default center around Cimanggu / Bogor area
      const centerCoord: [number, number] = [-6.6267, 106.6713];
      
      mapInstance = L.map(mapContainerId).setView(centerCoord, 14);
      mapRef.current = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Draw DESA mask
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

          // Focus on desa boundary
          mapInstance.fitBounds(L.polygon(desaCoords).getBounds(), { padding: [50, 50] });
        }
      }

      markersGroupRef.current = L.layerGroup().addTo(mapInstance);

      // Render markers if any
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
  }, [loading, wargas, filterKerentanan]);


  const handleDeleteWarga = async (id: string) => {
    if (confirm("Hapus data GIS titik rumah warga ini?")) {
      await deleteKesraGis(id);
      fetchData();
    }
  };

  const focusOnMap = (lat: number, lng: number, w: any) => {
    setSelectedWarga(w);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
    }
  };

  const filteredWargas = wargas.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase()) || w.nik.includes(search);
    const matchFilter = filterKerentanan === "ALL" || w.kategoriKerentanan === filterKerentanan;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            GIS & Geotagging Keluarga Rentan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pemetaan sebaran rumah warga dengan tingkat kerentanan kemiskinan dan bedah rumah.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Titik Warga
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Map Visual */}
        <div className="xl:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[550px]">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 justify-between items-center bg-slate-50/50">
            <div className="flex gap-1">
              {[
                { label: "Semua", val: "ALL", bg: "bg-slate-100 text-slate-700" },
                { label: "Miskin Ekstrem", val: "MISKIN_EKSTREM", bg: "bg-red-100 text-red-700" },
                { label: "Rentan", val: "RENTAN", bg: "bg-amber-100 text-amber-700" },
                { label: "Mampu", val: "MAMPU", bg: "bg-emerald-100 text-emerald-700" }
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilterKerentanan(f.val)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    filterKerentanan === f.val 
                      ? f.bg + " ring-2 ring-indigo-500/20" 
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-bold text-slate-400">Total: {filteredWargas.length} Titik Rumah</div>
          </div>
          
          {/* Leaflet container */}
          <div id={mapContainerId} className="flex-1 w-full z-10" />
        </div>

        {/* Right Side: List Warga Panel */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[550px]">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-1.5">
            <MapPin size={16} className="text-indigo-500" /> Daftar Lokasi Rumah Warga
          </h3>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kepala keluarga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : filteredWargas.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Tidak ada data titik warga.</div>
            ) : (
              filteredWargas.map((w) => (
                <div
                  key={w.id}
                  onClick={() => focusOnMap(w.latitude, w.longitude, w)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedWarga?.id === w.id
                      ? "border-indigo-500 bg-indigo-50/20"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{w.nama}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{w.nik}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white ${
                      w.kategoriKerentanan === "MISKIN_EKSTREM" ? "bg-red-500" : w.kategoriKerentanan === "RENTAN" ? "bg-amber-500" : "bg-emerald-500"
                    }`}>
                      {w.kategoriKerentanan === "MISKIN_EKSTREM" ? "Ekstrem" : w.kategoriKerentanan === "RENTAN" ? "Rentan" : "Mampu"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100/50">
                    <span className="flex items-center gap-0.5"><Phone size={10} /> {w.kontak || "-"}</span>
                    <span className="flex items-center gap-0.5"><MapPin size={10} /> {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}</span>
                  </div>

                  {selectedWarga?.id === w.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {w.fotoRumah && (
                        <div className="flex items-center gap-1.5">
                          <Home size={12} className="text-slate-400" />
                          <a href={w.fotoRumah} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 hover:underline">Foto Kondisi Rumah</a>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWarga(w.id);
                        }}
                        className="text-[9px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 ml-auto"
                      >
                        <Trash2 size={10} /> Hapus
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
        <ModalTambahGis onClose={() => setShowModal(false)} onRefresh={fetchData} session={session} />
      )}
    </div>
  );
}

function ModalTambahGis({ onClose, onRefresh, session }: any) {
  const [loading, setLoading] = useState(false);
  const [fotoRumah, setFotoRumah] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraGis({
      nik: fd.get("nik")?.toString(),
      nama: fd.get("nama"),
      latitude: parseFloat(fd.get("latitude") as string) || 0,
      longitude: parseFloat(fd.get("longitude") as string) || 0,
      fotoRumah: fd.get("fotoRumah")?.toString() || null,
      kategoriKerentanan: fd.get("kategoriKerentanan"),
      kontak: fd.get("kontak") || null
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Koordinat Rumah Warga</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data geografis rumah penerima bansos/bedah rumah</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK Kepala Keluarga *</label>
            <input name="nik" required type="text" maxLength={16} placeholder="16 digit NIK" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Warga *</label>
            <input name="nama" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Latitude *</label>
              <input name="latitude" required type="number" step="0.00000001" placeholder="-6.6267" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Longitude *</label>
              <input name="longitude" required type="number" step="0.00000001" placeholder="106.6713" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori Kerentanan</label>
              <select name="kategoriKerentanan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="MISKIN_EKSTREM">MISKIN EKSTREM</option>
                <option value="RENTAN">RENTAN SOSIAL</option>
                <option value="MAMPU">MAMPU</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">No. Kontak / WA</label>
              <input name="kontak" type="text" placeholder="08xxxxxxxxxx" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="block text-xs font-semibold text-slate-600 mb-2">Foto Kondisi Rumah</h4>
            <ImageUpload 
              localOnly={false}
              label="Upload Foto Rumah" 
              defaultValue={fotoRumah} 
              onUploadSuccess={setFotoRumah} 
            />
            <input type="hidden" name="fotoRumah" value={fotoRumah} />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Titik"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
