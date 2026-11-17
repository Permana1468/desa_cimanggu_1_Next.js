#!/usr/bin/env python3
"""
Sistem Digitalisasi Desa Cimanggu I - Modul AI Posyandu
Engine Analisis Pertumbuhan Balita & Prediksi Risiko Stunting (WHO Anthropometry Standards)
Penulis: MUHAMAD ALDIANSYAH
"""

import sys
import json
import math
from datetime import datetime, date

# Standar WHO MGRS (Multicentre Growth Reference Study) Median & SD Aproksimasi per Bulan (0 - 60 Bulan)
# [Bulan, Median_TB_Laki, SD_TB_Laki, Median_TB_Perempuan, SD_TB_Perempuan, Median_BB_Laki, SD_BB_Laki, Median_BB_Perempuan, SD_BB_Perempuan]
WHO_GROWTH_TABLE = {
    0:  (49.9, 1.9, 49.1, 1.9, 3.3, 0.4, 3.2, 0.4),
    1:  (54.7, 2.0, 53.7, 2.0, 4.5, 0.5, 4.2, 0.5),
    2:  (58.4, 2.1, 57.1, 2.1, 5.6, 0.6, 5.1, 0.6),
    3:  (61.4, 2.2, 59.8, 2.2, 6.4, 0.7, 5.8, 0.7),
    4:  (63.9, 2.3, 62.1, 2.2, 7.0, 0.8, 6.4, 0.7),
    5:  (65.9, 2.4, 64.0, 2.3, 7.5, 0.8, 6.9, 0.8),
    6:  (67.6, 2.4, 65.7, 2.4, 7.9, 0.8, 7.3, 0.8),
    7:  (69.2, 2.5, 67.3, 2.4, 8.3, 0.9, 7.6, 0.9),
    8:  (70.6, 2.5, 68.7, 2.5, 8.6, 0.9, 7.9, 0.9),
    9:  (72.0, 2.6, 70.1, 2.5, 8.9, 0.9, 8.2, 0.9),
    10: (73.3, 2.6, 71.5, 2.6, 9.2, 1.0, 8.5, 0.9),
    11: (74.5, 2.6, 72.8, 2.6, 9.4, 1.0, 8.7, 1.0),
    12: (75.7, 2.7, 74.0, 2.6, 9.6, 1.0, 8.9, 1.0),
    18: (82.3, 3.0, 80.7, 2.9, 10.9, 1.2, 10.2, 1.1),
    24: (87.8, 3.3, 86.4, 3.2, 12.2, 1.4, 11.5, 1.3),
    30: (92.4, 3.6, 91.1, 3.5, 13.3, 1.5, 12.7, 1.5),
    36: (96.1, 3.8, 95.1, 3.8, 14.3, 1.7, 13.9, 1.7),
    42: (99.9, 4.1, 99.0, 4.0, 15.3, 1.9, 15.0, 1.9),
    48: (103.3, 4.3, 102.7, 4.3, 16.3, 2.1, 16.1, 2.1),
    54: (106.7, 4.6, 106.2, 4.5, 17.3, 2.3, 17.2, 2.3),
    60: (110.0, 4.8, 109.4, 4.7, 18.3, 2.5, 18.2, 2.5),
}

def get_who_reference(bulan: int, is_male: bool):
    """Interpolasi linier parameter WHO berdasarkan usia dalam bulan."""
    bulan = max(0, min(60, bulan))
    keys = sorted(WHO_GROWTH_TABLE.keys())
    
    if bulan in WHO_GROWTH_TABLE:
        row = WHO_GROWTH_TABLE[bulan]
    else:
        # Interpolasi linier antar titik terdekat
        lower = max(k for k in keys if k <= bulan)
        upper = min(k for k in keys if k >= bulan)
        frac = (bulan - lower) / (upper - lower) if upper != lower else 0
        r1, r2 = WHO_GROWTH_TABLE[lower], WHO_GROWTH_TABLE[upper]
        row = tuple(r1[i] + frac * (r2[i] - r1[i]) for i in range(len(r1)))

    if is_male:
        return {
            "median_tb": row[0], "sd_tb": row[1],
            "median_bb": row[4], "sd_bb": row[5]
        }
    else:
        return {
            "median_tb": row[2], "sd_tb": row[3],
            "median_bb": row[6], "sd_bb": row[7]
        }

def hitung_zscore(nilai: float, median: float, sd: float) -> float:
    """Menghitung Z-Score standar deviasi: Z = (Nilai - Median) / SD"""
    if sd <= 0:
        return 0.0
    return round((nilai - median) / sd, 2)

def hitung_usia_bulan(tgl_lahir_str: str, tgl_ukur_str: str = None) -> int:
    """Menghitung selisih usia balita dalam bulan."""
    try:
        tgl_lahir = datetime.fromisoformat(tgl_lahir_str.replace("Z", "+00:00")).date()
    except Exception:
        tgl_lahir = datetime.strptime(tgl_lahir_str.split("T")[0], "%Y-%m-%d").date()

    if tgl_ukur_str:
        try:
            tgl_ukur = datetime.fromisoformat(tgl_ukur_str.replace("Z", "+00:00")).date()
        except Exception:
            tgl_ukur = datetime.strptime(tgl_ukur_str.split("T")[0], "%Y-%m-%d").date()
    else:
        tgl_ukur = date.today()

    months = (tgl_ukur.year - tgl_lahir.year) * 12 + (tgl_ukur.month - tgl_lahir.month)
    if tgl_ukur.day < tgl_lahir.day:
        months = max(0, months - 1)
    return max(0, months)

def analisis_pertumbuhan(payload: dict) -> dict:
    """
    Fungsi utama analisis AI pertumbuhan balita & proyeksi stunting.
    Input payload:
    {
      "namaLengkap": "...",
      "tanggalLahir": "YYYY-MM-DD",
      "jenisKelamin": "L" | "P" | "LAKI_LAKI" | "PEREMPUAN",
      "beratBadan": float (kg),
      "tinggiBadan": float (cm),
      "lingkarKepala": float (cm, opsional),
      "historyRecords": [{"tanggal": "...", "beratBadan": float, "tinggiBadan": float}, ...]
    }
    """
    nama = payload.get("namaLengkap", "Balita")
    tgl_lahir_str = payload.get("tanggalLahir", "")
    bb = float(payload.get("beratBadan") or 0)
    tb = float(payload.get("tinggiBadan") or 0)
    jk_raw = str(payload.get("jenisKelamin", "L")).upper()
    is_male = jk_raw in ["L", "LAKI_LAKI", "LAKI-LAKI", "PRIA"]

    usia_bulan = hitung_usia_bulan(tgl_lahir_str)
    ref = get_who_reference(usia_bulan, is_male)

    # 1. Hitung Z-Score WHO
    z_haz = hitung_zscore(tb, ref["median_tb"], ref["sd_tb"]) if tb > 0 else 0.0
    z_waz = hitung_zscore(bb, ref["median_bb"], ref["sd_bb"]) if bb > 0 else 0.0

    # 2. Klasifikasi Status Gizi & Antropometri Kemenkes
    # TB/U (Tinggi Badan menurut Usia)
    if tb <= 0:
        status_stunting = "Belum Ada Pengukuran TB"
        is_stunted = False
    elif z_haz < -3.0:
        status_stunting = "Sangat Pendek (Severely Stunted)"
        is_stunted = True
    elif -3.0 <= z_haz < -2.0:
        status_stunting = "Pendek (Stunted)"
        is_stunted = True
    elif -2.0 <= z_haz <= 2.0:
        status_stunting = "Normal (Gizi Baik)"
        is_stunted = False
    else:
        status_stunting = "Tinggi (Above Normal)"
        is_stunted = False

    # BB/U (Berat Badan menurut Usia)
    if bb <= 0:
        status_bb = "Belum Ada Pengukuran BB"
    elif z_waz < -3.0:
        status_bb = "Gizi Buruk (Severely Underweight)"
    elif -3.0 <= z_waz < -2.0:
        status_bb = "Gizi Kurang (Underweight)"
    elif -2.0 <= z_waz <= 1.0:
        status_bb = "Berat Badan Normal"
    else:
        status_bb = "Risiko Berat Badan Berlebih"

    # 3. Analisis Velocity / Laju Pertumbuhan dari Riwayat (Trajectory Analysis)
    history = payload.get("historyRecords", [])
    valid_hist = [
        r for r in history
        if (float(r.get("beratBadan") or 0) > 0 or float(r.get("tinggiBadan") or 0) > 0)
    ]
    sorted_hist = sorted(valid_hist, key=lambda x: str(x.get("tanggal", "")))

    # Cari riwayat pembanding sebelumnya
    prev_record = None
    if len(sorted_hist) >= 2:
        last_rec = sorted_hist[-1]
        last_bb = float(last_rec.get("beratBadan") or 0)
        last_tb = float(last_rec.get("tinggiBadan") or 0)
        # Jika rekaman terakhir di history sama dengan data pengukuran saat ini, ambil rekaman sebelumnya
        if (abs(last_bb - bb) < 0.01 and abs(last_tb - tb) < 0.01) or len(sorted_hist) > 1:
            prev_record = sorted_hist[-2]
        else:
            prev_record = sorted_hist[-1]
    elif len(sorted_hist) == 1:
        single_rec = sorted_hist[0]
        single_bb = float(single_rec.get("beratBadan") or 0)
        single_tb = float(single_rec.get("tinggiBadan") or 0)
        if abs(single_bb - bb) > 0.01 or abs(single_tb - tb) > 0.01:
            prev_record = single_rec

    growth_trend = "PENGUKURAN_AWAL (Basis Data)"
    proyeksi_risiko_60_hari = "RENDAH (Pola Pertumbuhan Optimal)"
    warning_flag = False

    if prev_record:
        prev_bb = float(prev_record.get("beratBadan") or 0)
        prev_tb = float(prev_record.get("tinggiBadan") or 0)
        delta_bb = round(bb - prev_bb, 2) if prev_bb > 0 and bb > 0 else 0.0
        delta_tb = round(tb - prev_tb, 2) if prev_tb > 0 and tb > 0 else 0.0

        if delta_bb < 0 or delta_tb < 0:
            growth_trend = f"MENURUN (ΔBB: {delta_bb:+}kg, ΔTB: {delta_tb:+}cm)"
            warning_flag = True
        elif delta_bb < 0.2:  # Kenaikan kurang dari 200 gram per bulan
            growth_trend = f"MELAMBAT / Faltering (ΔBB: {delta_bb:+}kg)"
            warning_flag = True
        else:
            growth_trend = f"BERTUMBUH POSITIF (ΔBB: {delta_bb:+}kg, ΔTB: {delta_tb:+}cm)"

        # Prediksi 60 hari ke depan
        if is_stunted:
            proyeksi_risiko_60_hari = "SANGAT_TINGGI"
        elif warning_flag or z_haz < -1.5 or z_waz < -1.5:
            proyeksi_risiko_60_hari = "TINGGI"
        elif -2.0 <= z_haz <= -1.0:
            proyeksi_risiko_60_hari = "SEDANG (Waspada Garis Kuning KMS)"
        else:
            proyeksi_risiko_60_hari = "RENDAH (Pola Pertumbuhan Optimal)"
    else:
        # Jika belum ada data riwayat pembanding
        if is_stunted:
            proyeksi_risiko_60_hari = "SANGAT_TINGGI"
        elif z_haz < -1.5 or z_waz < -1.5:
            proyeksi_risiko_60_hari = "SEDANG"
        elif bb <= 0 and tb <= 0:
            growth_trend = "BELUM_DIUKUR"
            proyeksi_risiko_60_hari = "BELUM_TERDATA"
        else:
            growth_trend = "PENGUKURAN_AWAL (Basis Data)"
            proyeksi_risiko_60_hari = "RENDAH (Pola Pertumbuhan Optimal)"

    # 4. Rekomendasi Menu PMT & Intervensi Lokal Desa Cimanggu I
    rekomendasi_pmt = []
    if bb <= 0 and tb <= 0:
        rekomendasi_pmt.append("Lakukan penimbangan berat badan & pengukuran tinggi badan pada jadwal Posyandu berikutnya.")
        rekomendasi_pmt.append("Bawa buku KIA/KMS untuk pencatatan grafik tumbuh kembang balita.")
    elif is_stunted or proyeksi_risiko_60_hari in ["TINGGI", "SANGAT_TINGGI"]:
        rekomendasi_pmt.append("Intervensi PMT Pemulihan tinggi protein hewani (Telur ayam 1-2 butir/hari, hati ayam, ikan kembung/lele).")
        rekomendasi_pmt.append("Pemberian Taburia / Multivitamin & Mineral balita dari Bidan Desa.")
        rekomendasi_pmt.append("Kunjungan rumah (Home Visit) kader Posyandu untuk evaluasi sanitasi & air bersih keluarga.")
    elif proyeksi_risiko_60_hari.startswith("SEDANG"):
        rekomendasi_pmt.append("Tingkatkan frekuensi kudapan padat gizi (Bubur kacang hijau santan kelapa, biskuit balita, puding susu).")
        rekomendasi_pmt.append("Pantau penimbangan berkala 14 hari ke depan di Posyandu setempat.")
    else:
        rekomendasi_pmt.append("Pertahankan pola asuh ASI Eksklusif / Makanan Pendamping ASI (MP-ASI) seimbang.")
        rekomendasi_pmt.append("Pastikan jadwal imunisasi dasar lengkap sesuai buku KIA.")

    if bb <= 0 and tb <= 0:
        kesimpulan = f"Balita {nama} ({usia_bulan} bulan): Belum ada data antropometri yang tercatat. Segera lakukan penimbangan dan pengukuran di Posyandu."
    else:
        kesimpulan = (
            f"Balita {nama} ({usia_bulan} bulan): Z-Score TB/U = {z_haz} SD ({status_stunting}), "
            f"Z-Score BB/U = {z_waz} SD ({status_bb}). "
            f"Tren laju pertumbuhan: {growth_trend}. Risiko proyeksi 60 hari: {proyeksi_risiko_60_hari}."
        )

    return {
        "engine": "Python AI Anthropometry Engine v1.0 (WHO MGRS)",
        "timestamp": datetime.now().isoformat(),
        "namaLengkap": nama,
        "usiaBulan": usia_bulan,
        "antropometri": {
            "beratBadan": bb,
            "tinggiBadan": tb,
            "medianIdealTB": ref["median_tb"],
            "medianIdealBB": ref["median_bb"],
            "zScoreHAZ": z_haz,
            "zScoreWAZ": z_waz,
        },
        "statusStunting": status_stunting,
        "isStunted": is_stunted,
        "statusBeratBadan": status_bb,
        "growthTrend": growth_trend,
        "proyeksiRisiko60Hari": proyeksi_risiko_60_hari,
        "rekomendasiPMT": rekomendasi_pmt,
        "kesimpulan": kesimpulan,
        "statusSuccess": True
    }

if __name__ == "__main__":
    try:
        raw_input = ""
        # 1. Cek argumen CLI
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
        # 2. Cek stdin jika ada pipe
        elif not sys.stdin.isatty():
            raw_input = sys.stdin.read()

        # 3. Fallback data uji coba jika dipanggil langsung tanpa argumen
        if not raw_input.strip():
            raw_input = json.dumps({
                "namaLengkap": "Muhammad Bilal",
                "tanggalLahir": "2024-05-10",
                "jenisKelamin": "L",
                "beratBadan": 11.2,
                "tinggiBadan": 83.5,
                "historyRecords": [
                    {"tanggal": "2026-09-10", "beratBadan": 11.0, "tinggiBadan": 82.0}
                ]
            })

        data = json.loads(raw_input)
        result = analisis_pertumbuhan(data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        error_res = {
            "engine": "Python AI Anthropometry Engine v1.0",
            "statusSuccess": False,
            "error": str(e)
        }
        print(json.dumps(error_res), file=sys.stderr)
        sys.exit(1)
