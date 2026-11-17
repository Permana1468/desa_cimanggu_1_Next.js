#!/usr/bin/env python3
"""
Sistem Digitalisasi Desa Cimanggu I - Modul AI Kesra & Puskesos
Engine Scoring Kemiskinan Multidimensi & Audit Kelayakan Bansos/UHC (Standar Kemenko PMK & BPS)
Penulis: MUHAMAD ALDIANSYAH & Deepmind Agent
"""

import sys
import json
import math
from datetime import datetime

# Bobot Parameter Kemiskinan Berdasarkan Standar Multidimensional Poverty Index (MPI)
# Skala 0.0 - 1.0 (Total akumulasi bobot = 1.0)
WEIGHTS = {
    "penghasilan_per_kapita": 0.25,
    "kondisi_rumah_lantai": 0.12,
    "kondisi_rumah_dinding": 0.10,
    "kondisi_rumah_atap": 0.08,
    "sumber_penerangan": 0.06,
    "sumber_air_minum": 0.06,
    "fasilitas_sanitasi": 0.08,
    "frekuensi_makan": 0.07,
    "kemampuan_berobat": 0.08,
    "tanggungan_keluarga": 0.10
}

def normalize_text(val):
    if val is None:
        return ""
    return str(val).strip().upper()

def evaluate_poverty(data):
    """
    Menghitung Composite Poverty Index (CPI) 0 - 100
    0 - 30   : Kategori Mampu / Mandiri
    31 - 50  : Kategori Rentan Miskin (Desil 3)
    51 - 70  : Kategori Miskin (Desil 2)
    71 - 100 : Kategori Miskin Ekstrem (Desil 1)
    """
    nama = data.get("nama", "Warga")
    nik = str(data.get("nik", "-"))
    penghasilan = float(data.get("penghasilan", 0))
    tanggungan = max(1, int(data.get("jumlahTanggungan", 1)))
    per_kapita = penghasilan / tanggungan

    # 1. Skor Penghasilan per Kapita (Garis Kemiskinan Kab. Bogor ~ Rp 520.000 / kapita / bulan)
    # Garis Kemiskinan Ekstrem ~ Rp 350.000 / kapita / bulan
    if per_kapita <= 350000:
        score_income = 100.0
    elif per_kapita <= 520000:
        score_income = 75.0
    elif per_kapita <= 900000:
        score_income = 45.0
    elif per_kapita <= 150000:
        score_income = 20.0
    else:
        score_income = 0.0

    # 2. Skor Tanggungan Keluarga
    if tanggungan >= 5:
        score_tanggungan = 100.0
    elif tanggungan >= 3:
        score_tanggungan = 70.0
    elif tanggungan >= 2:
        score_tanggungan = 40.0
    else:
        score_tanggungan = 10.0

    # 3. 14 Parameter Fisik & Kesejahteraan
    # Param 1: Luas Lantai (< 8m2/orang = rentan)
    param1 = normalize_text(data.get("param1", ""))
    score_p1 = 90.0 if "KURANG" in param1 or "<" in param1 or "TANAH" in param1 else 20.0

    # Param 2: Jenis Lantai (Tanah/Bambu/Kayu murah)
    param2 = normalize_text(data.get("param2", ""))
    score_p2 = 100.0 if "TANAH" in param2 or "BAMBU" in param2 or "KAYU" in param2 else (40.0 if "SEMEN" in param2 else 0.0)

    # Param 3: Jenis Dinding (Bambu/Rumbia/Kayu lapuk/Tanpa plester)
    param3 = normalize_text(data.get("param3", ""))
    score_p3 = 100.0 if "BAMBU" in param3 or "RUMBIA" in param3 or "KAYU" in param3 else (35.0 if "SEMEN" in param3 or "BATAKO" in param3 else 0.0)

    # Param 4: Sanitasi / Jamban
    param4 = normalize_text(data.get("param4", ""))
    score_p4 = 100.0 if "TIDAK ADA" in param4 or "SUNGAI" in param4 or "BERSAMA" in param4 else 10.0

    # Param 5: Sumber Penerangan (Non-PLN / Menumpang)
    param5 = normalize_text(data.get("param5", ""))
    score_p5 = 100.0 if "NON" in param5 or "MENUMPANG" in param5 or "LILIN" in param5 else (50.0 if "450" in param5 else 10.0)

    # Param 6: Sumber Air Minum
    param6 = normalize_text(data.get("param6", ""))
    score_p6 = 85.0 if "SUNGAI" in param6 or "TADAH" in param6 or "SUMUR TAK TERLINDUNG" in param6 else 15.0

    # Param 7: Bahan Bakar Memasak
    param7 = normalize_text(data.get("param7", ""))
    score_p7 = 90.0 if "KAYU" in param7 or "MINYAK" in param7 else 20.0

    # Param 8: Konsumsi Daging / Protein per Minggu
    param8 = normalize_text(data.get("param8", ""))
    score_p8 = 90.0 if "TIDAK PERNAH" in param8 or "1 KALI" in param8 else 15.0

    # Param 9: Frekuensi Makan per Hari
    param9 = normalize_text(data.get("param9", ""))
    score_p9 = 100.0 if "1 KALI" in param9 else (60.0 if "2 KALI" in param9 else 10.0)

    # Param 10: Kemampuan Berobat ke Faskes
    param10 = normalize_text(data.get("param10", ""))
    score_p10 = 95.0 if "TIDAK MAMPU" in param10 or "PUSKESMAS GRATIS" in param10 else 10.0

    # Weighted Composite Calculation
    total_score = (
        score_income * WEIGHTS["penghasilan_per_kapita"] +
        score_tanggungan * WEIGHTS["tanggungan_keluarga"] +
        score_p2 * WEIGHTS["kondisi_rumah_lantai"] +
        score_p3 * WEIGHTS["kondisi_rumah_dinding"] +
        score_p4 * WEIGHTS["fasilitas_sanitasi"] +
        score_p5 * WEIGHTS["sumber_penerangan"] +
        score_p6 * WEIGHTS["sumber_air_minum"] +
        score_p9 * WEIGHTS["frekuensi_makan"] +
        score_p10 * WEIGHTS["kemampuan_berobat"] +
        score_p1 * 0.08
    )

    total_score = round(max(0.0, min(100.0, total_score)), 2)

    # Klasifikasi Desil Kemiskinan
    if total_score >= 70.0:
        desil = "DESIL_1_MISKIN_EKSTREM"
        label_desil = "Desil 1 (Miskin Ekstrem)"
        status_kelayakan = "LAYAK"
    elif total_score >= 50.0:
        desil = "DESIL_2_MISKIN"
        label_desil = "Desil 2 (Keluarga Miskin)"
        status_kelayakan = "LAYAK"
    elif total_score >= 32.0:
        desil = "DESIL_3_RENTAN"
        label_desil = "Desil 3 (Rentan Miskin)"
        status_kelayakan = "LAYAK_DENGAN_SYARAT"
    else:
        desil = "DESIL_4_MAMPU"
        label_desil = "Desil 4+ (Keluarga Mampu / Mandiri)"
        status_kelayakan = "TIDAK_LAYAK"

    # Deteksi Anomali Data (Fraud / Data Inconsistency)
    anomali = []
    if penghasilan > 2500000 and total_score >= 70.0:
        anomali.append("Penghasilan total keluarga di atas UMR batas bansos namun parameter fisik berstatus sangat miskin. Perlu verifikasi lapangan ulang.")
    if per_kapita < 200000 and total_score < 30.0:
        anomali.append("Penghasilan tercatat sangat minim tetapi parameter aset & hunian tergolong sangat mampu.")

    # Rekomendasi Program Intervensi Bantuan yang Tepat Sasaran
    rekomendasi = []
    if total_score >= 50.0 or score_p10 >= 70.0:
        rekomendasi.append("Jaminan Kesehatan UHC / BPJS PBI APBD (Prioritas)")
    if total_score >= 65.0:
        rekomendasi.append("Bantuan Langsung Tunai Dana Desa (BLT-DD)")
        rekomendasi.append("Bantuan Pangan Non Tunai (BPNT / Sembako)")
    if score_p2 >= 80.0 or score_p3 >= 80.0:
        rekomendasi.append("Usulan Program Bedah Rumah Tidak Layak Huni (RTLH)")
    if total_score >= 70.0 and tanggungan >= 3:
        rekomendasi.append("Program Keluarga Harapan (PKH)")
    if not rekomendasi:
        rekomendasi.append("Pemberdayaan Ekonomi UMKM Desa & Pelatihan Ketenagakerjaan")

    return {
        "engine": "Python AI Poverty & UHC Evaluation Engine v1.0",
        "timestamp": datetime.now().isoformat(),
        "nama": nama,
        "nik": nik,
        "penghasilanTotal": penghasilan,
        "penghasilanPerKapita": round(per_kapita, 2),
        "jumlahTanggungan": tanggungan,
        "compositePovertyScore": total_score,
        "desilCode": desil,
        "desilLabel": label_desil,
        "statusKelayakanUhc": status_kelayakan,
        "indikasiAnomali": len(anomali) > 0,
        "daftarAnomali": anomali,
        "rekomendasiIntervensi": rekomendasi,
        "kesimpulan": f"Warga {nama} memiliki Skor Indeks Kerentanan {total_score}/100 ({label_desil}). Status kelayakan bantuan: {status_kelayakan}.",
        "statusSuccess": True,
        "executionMode": "PYTHON_NATIVE"
    }

def main():
    try:
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
            data = json.loads(raw_input)
        else:
            data = json.load(sys.stdin)
        
        result = evaluate_poverty(data)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        err_res = {
            "engine": "Python AI Poverty & UHC Evaluation Engine v1.0",
            "statusSuccess": False,
            "error": str(e)
        }
        print(json.dumps(err_res))
        sys.exit(1)

if __name__ == "__main__":
    main()

