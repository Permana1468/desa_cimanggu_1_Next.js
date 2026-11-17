#!/usr/bin/env python3
"""
Sistem Digitalisasi Desa Cimanggu I - Modul AI Perencanaan & LPM
Engine Penilaian & Perangkingan Usulan Musrenbang (MCDM TOPSIS & SAW)
Penulis: MUHAMAD ALDIANSYAH & Deepmind Agent
"""

import sys
import json
import math
from datetime import datetime

# Bobot Standar Kriteria Perencanaan Desa (Total = 1.0)
CRITERIA_WEIGHTS = {
    "urgensiBencana": 0.30,       # C1: Urgensi keselamatan / kebencanaan (Skala 1-10) [Benefit]
    "penerimaManfaat": 0.25,      # C2: Estimasi jumlah jiwa penerima manfaat [Benefit]
    "efisiensiBiaya": 0.20,       # C3: Efisiensi biaya per jiwa (Anggaran / Jiwa) [Cost]
    "keselarasanRpjm": 0.15,      # C4: Keselarasan RPJMDes & SDGs Desa (Skala 1-10) [Benefit]
    "kerentananWilayah": 0.10     # C5: Indeks kemiskinan / kerentanan RW (Skala 1-10) [Benefit]
}

def calculate_topsis(proposals):
    """
    Melakukan perangkingan usulan kegiatan Musrenbang menggunakan metode TOPSIS
    (Technique for Order Preference by Similarity to Ideal Solution).
    """
    if not proposals:
        return []

    n = len(proposals)
    if n == 1:
        p = proposals[0]
        return [{
            "id": p.get("id", "prop-1"),
            "kegiatanPrioritas": p.get("kegiatanPrioritas", "Kegiatan Usulan"),
            "lokasiRw": p.get("lokasiRw", "001"),
            "lokasiRt": p.get("lokasiRt", "001"),
            "anggaran": p.get("anggaran", 0),
            "scoreTopsis": 1.000,
            "rank": 1,
            "rekomendasiStatus": "Prioritas Utama (Didanai APBDes)",
            "alasan": "Usulan tunggal dengan skor kelayakan penuh."
        }]

    # 1. Ekstraksi Matrix Keputusan X
    # [urgensi, manfaat, biayaPerJiwa, keselarasan, kerentanan]
    matrix = []
    for p in proposals:
        urgensi = float(p.get("urgensiBencana", 5.0))
        manfaat = max(1.0, float(p.get("penerimaManfaat", 100.0)))
        anggaran = max(100000.0, float(p.get("anggaran", 10000000.0)))
        biayaPerJiwa = anggaran / manfaat
        keselarasan = float(p.get("keselarasanRpjm", 5.0))
        kerentanan = float(p.get("kerentananWilayah", 5.0))
        matrix.append([urgensi, manfaat, biayaPerJiwa, keselarasan, kerentanan])

    num_criteria = 5

    # 2. Normalisasi Matriks R (Vektor Euclidean)
    divisors = [0.0] * num_criteria
    for j in range(num_criteria):
        sum_sq = sum(matrix[i][j] ** 2 for i in range(n))
        divisors[j] = math.sqrt(sum_sq) if sum_sq > 0 else 1.0

    # 3. Matriks Terbobot V
    weights = [
        CRITERIA_WEIGHTS["urgensiBencana"],
        CRITERIA_WEIGHTS["penerimaManfaat"],
        CRITERIA_WEIGHTS["efisiensiBiaya"],
        CRITERIA_WEIGHTS["keselarasanRpjm"],
        CRITERIA_WEIGHTS["kerentananWilayah"]
    ]

    v_matrix = []
    for i in range(n):
        row = []
        for j in range(num_criteria):
            norm_val = matrix[i][j] / divisors[j]
            row.append(norm_val * weights[j])
        v_matrix.append(row)

    # 4. Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-)
    # C0, C1, C3, C4 adalah Benefit (Maksimal terbaik)
    # C2 (biayaPerJiwa) adalah Cost (Minimal terbaik)
    a_plus = [0.0] * num_criteria
    a_minus = [0.0] * num_criteria

    for j in range(num_criteria):
        col_vals = [v_matrix[i][j] for i in range(n)]
        if j == 2: # Cost criteria
            a_plus[j] = min(col_vals)
            a_minus[j] = max(col_vals)
        else: # Benefit criteria
            a_plus[j] = max(col_vals)
            a_minus[j] = min(col_vals)

    # 5. Jarak Euclidean ke Solusi Ideal Positif (D+) dan Negatif (D-)
    results = []
    for i in range(n):
        d_plus = math.sqrt(sum((v_matrix[i][j] - a_plus[j]) ** 2 for j in range(num_criteria)))
        d_minus = math.sqrt(sum((v_matrix[i][j] - a_minus[j]) ** 2 for j in range(num_criteria)))

        # Nilai Preferensi / Kedekatan Relatif C_i
        total_d = d_plus + d_minus
        ci = (d_minus / total_d) if total_d > 0 else 0.5
        ci = round(ci, 4)

        p = proposals[i]
        
        # Rekomendasi Alokasi Anggaran
        if ci >= 0.65:
            rek = "Prioritas 1 (Direkomendasikan Masuk APBDes Murni)"
            catatan = "Kelayakan sangat tinggi, mendesak bagi warga dan berdampak luas."
        elif ci >= 0.45:
            rek = "Prioritas 2 (Diusulkan ke Musrenbangcam / Bankeu Kab/Prov)"
            catatan = "Kelayakan baik, diusulkan melalui pendanaan supra-desa atau RKPDes lanjutan."
        else:
            rek = "Prioritas 3 (Swadaya / Partisipasi Gotong Royong RW)"
            catatan = "Diarahkan melalui skema stimulan swadaya masyarakat atau mitra CSR."

        results.append({
            "id": p.get("id", f"prop-{i+1}"),
            "kegiatanPrioritas": p.get("kegiatanPrioritas", "Kegiatan Usulan"),
            "lokasiRw": p.get("lokasiRw", "-"),
            "lokasiRt": p.get("lokasiRt", "-"),
            "lokasiDetail": p.get("lokasiDetail", "-"),
            "volume": p.get("volume", "-"),
            "satuan": p.get("satuan", "-"),
            "anggaran": float(p.get("anggaran", 0.0)),
            "penerimaManfaat": int(p.get("penerimaManfaat", 100)),
            "scoreTopsis": ci,
            "rekomendasiStatus": rek,
            "catatanKelayakan": catatan,
            "metrics": {
                "dPlus": round(d_plus, 4),
                "dMinus": round(d_minus, 4),
                "urgensi": matrix[i][0],
                "biayaPerJiwa": round(matrix[i][2], 0)
            }
        })

    # 6. Sorting berdasarkan scoreTopsis descending (Peringkat 1 tertinggi)
    results.sort(key=lambda x: x["scoreTopsis"], reverse=True)
    for rank_idx, item in enumerate(results, start=1):
        item["rank"] = rank_idx

    return results

def main():
    try:
        input_data = "{}"
        if len(sys.argv) > 1:
            input_data = sys.argv[1]
        else:
            input_data = sys.stdin.read()

        parsed = json.loads(input_data)
        proposals = parsed.get("proposals", [])

        # Default sample proposals if empty
        if not proposals:
            proposals = [
                {
                    "id": "rw-04-tpt",
                    "kegiatanPrioritas": "Pembangunan TPT Longsor Kp. Ciaruteun",
                    "lokasiRw": "004", "lokasiRt": "002",
                    "anggaran": 45000000, "penerimaManfaat": 320,
                    "urgensiBencana": 9.5, "keselarasanRpjm": 9.0, "kerentananWilayah": 8.0
                },
                {
                    "id": "rw-01-beton",
                    "kegiatanPrioritas": "Betonisasi Jalan Lingkungan RW 01",
                    "lokasiRw": "001", "lokasiRt": "003",
                    "anggaran": 65000000, "penerimaManfaat": 450,
                    "urgensiBencana": 6.5, "keselarasanRpjm": 8.5, "kerentananWilayah": 6.0
                },
                {
                    "id": "rw-06-drainase",
                    "kegiatanPrioritas": "Pembersihan & Pemasangan Saluran U-Ditch",
                    "lokasiRw": "006", "lokasiRt": "001",
                    "anggaran": 30000000, "penerimaManfaat": 280,
                    "urgensiBencana": 8.0, "keselarasanRpjm": 8.0, "kerentananWilayah": 7.0
                }
            ]

        ranked_results = calculate_topsis(proposals)

        output = {
            "engine": "Python AI Musrenbang Prioritizer Core v1.0 (MCDM-TOPSIS)",
            "statusSuccess": True,
            "timestamp": datetime.now().isoformat(),
            "totalProposals": len(ranked_results),
            "kriteriaBobot": CRITERIA_WEIGHTS,
            "rankedProposals": ranked_results
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))

    except Exception as e:
        error_output = {
            "engine": "Python AI Musrenbang Prioritizer Core v1.0 (MCDM-TOPSIS)",
            "statusSuccess": False,
            "error": str(e),
            "rankedProposals": []
        }
        print(json.dumps(error_output, ensure_ascii=False))

if __name__ == "__main__":
    main()

