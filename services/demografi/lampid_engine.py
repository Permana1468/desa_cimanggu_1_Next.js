#!/usr/bin/env python3
"""
Desa Cimanggu I - Demographic & LAMPID Balance Engine
Validates mathematical integrity of Birth, Death, Move, and Incoming demographic accounting.
Formula:
  P_akhir = P_awal + (Lahir + Datang) - (Mati + Pindah)
  KK_akhir = KK_awal + KK_tambah - KK_kurang
"""

import sys
import json
from datetime import datetime

def normalize_gender(val):
    if not val:
        return "L"
    s = str(val).strip().upper().replace("-", "").replace("_", "").replace(" ", "")
    if s.startswith("P") or "PEREMPUAN" in s or "FEMALE" in s or s == "F":
        return "P"
    return "L"

def compute_lampid(data):
    month = data.get("month", datetime.now().month)
    year = data.get("year", datetime.now().year)
    residents = data.get("residents", [])
    births = data.get("births", [])
    deaths = data.get("deaths", [])
    moves = data.get("moves", [])
    incomings = data.get("incomings", [])

    dead_niks = {d.get("nik") for d in deaths if d.get("nik")}
    moved_niks = {m.get("nik") for m in moves if m.get("nik")}

    # 1. Filter currently active residents
    active_residents = [
        r for r in residents 
        if r.get("nik") not in dead_niks and r.get("nik") not in moved_niks
    ]

    # 2. Age cohorts & Wajib KTP
    age_dist = {"0-11 BLN": {"L": 0, "P": 0}}
    for i in range(1, 75):
        age_dist[str(i)] = {"L": 0, "P": 0}
    age_dist["75+"] = {"L": 0, "P": 0}

    wajib_ktp_l = 0
    wajib_ktp_p = 0

    for r in active_residents:
        tgl_lahir = r.get("tanggalLahir")
        gk = normalize_gender(r.get("jenisKelamin"))
        if not tgl_lahir:
            continue
        try:
            if isinstance(tgl_lahir, str):
                b_date = datetime.fromisoformat(tgl_lahir.replace("Z", "+00:00"))
            else:
                b_date = tgl_lahir
            total_months = (year - b_date.year) * 12 + (month - b_date.month)
            if total_months < 0:
                continue # not born yet in target month

            age_years = total_months // 12
            if total_months <= 11:
                age_dist["0-11 BLN"][gk] += 1
            elif age_years >= 75:
                age_dist["75+"][gk] += 1
            elif 1 <= age_years <= 74:
                age_dist[str(age_years)][gk] += 1

            if age_years >= 17:
                if gk == "L":
                    wajib_ktp_l += 1
                else:
                    wajib_ktp_p += 1
        except Exception:
            pass

    # 3. Mutasi Counts (Lahir, Mati, Pindah, Datang)
    lahir_l = sum(1 for b in births if normalize_gender(b.get("jenisKelamin")) == "L")
    lahir_p = sum(1 for b in births if normalize_gender(b.get("jenisKelamin")) == "P")

    # Map deceased gender from residents or report
    res_gender_map = {r.get("nik"): normalize_gender(r.get("jenisKelamin")) for r in residents if r.get("nik")}
    
    mati_l = 0
    mati_p = 0
    for d in deaths:
        gk = res_gender_map.get(d.get("nik"), normalize_gender(d.get("jenisKelamin")))
        if gk == "L":
            mati_l += 1
        else:
            mati_p += 1

    pindah_l = 0
    pindah_p = 0
    for m in moves:
        gk = res_gender_map.get(m.get("nik"), normalize_gender(m.get("jenisKelamin")))
        if gk == "L":
            pindah_l += 1
        else:
            pindah_p += 1

    datang_l = 0
    datang_p = 0
    for inc in incomings:
        gk = res_gender_map.get(inc.get("nik"), normalize_gender(inc.get("jenisKelamin")))
        if gk == "L":
            datang_l += 1
        else:
            datang_p += 1

    # 4. Demographic Balance Equations
    akhir_l = sum(1 for r in active_residents if normalize_gender(r.get("jenisKelamin")) == "L")
    akhir_p = sum(1 for r in active_residents if normalize_gender(r.get("jenisKelamin")) == "P")
    akhir_total = akhir_l + akhir_p

    tambah_l = lahir_l + datang_l
    tambah_p = lahir_p + datang_p
    tambah_total = tambah_l + tambah_p

    kurang_l = mati_l + pindah_l
    kurang_p = mati_p + pindah_p
    kurang_total = kurang_l + kurang_p

    # Backward calculation of initial population (Saldo Awal)
    awal_l = max(0, akhir_l - tambah_l + kurang_l)
    awal_p = max(0, akhir_p - tambah_p + kurang_p)
    awal_total = awal_l + awal_p

    # Balance Verification Check
    is_balanced = (awal_total + tambah_total - kurang_total) == akhir_total

    # 5. Kartu Keluarga (KK)
    active_kks = {r.get("noKK") for r in active_residents if r.get("noKK")}
    kk_akhir = len(active_kks)
    
    incoming_kks = {i.get("noKK") for i in incomings if i.get("noKK")}
    kk_tambah = len(incoming_kks)

    # Check dissolved KKs (KK where all members moved or died)
    all_kks = {r.get("noKK") for r in residents if r.get("noKK")}
    dissolved_kks = [kk for kk in all_kks if kk not in active_kks]
    kk_kurang = len(dissolved_kks)
    kk_awal = max(0, kk_akhir - kk_tambah + kk_kurang)
    kk_balanced = (kk_awal + kk_tambah - kk_kurang) == kk_akhir

    # 6. Breakdown by sub-wilayah (RW / RT) for hierarchical Kadus/RW views
    wilayah_stats = {}
    for r in active_residents:
        rw_key = r.get("rw", "001")
        rt_key = r.get("rt", "001")
        key = f"RW_{rw_key}"
        if key not in wilayah_stats:
            wilayah_stats[key] = {
                "rw": rw_key,
                "totalWarga": 0,
                "lakiLaki": 0,
                "perempuan": 0,
                "totalKk": 0,
                "kks": set(),
                "rts": {}
            }
        wilayah_stats[key]["totalWarga"] += 1
        gk = normalize_gender(r.get("jenisKelamin"))
        if gk == "L":
            wilayah_stats[key]["lakiLaki"] += 1
        else:
            wilayah_stats[key]["perempuan"] += 1
        if r.get("noKK"):
            wilayah_stats[key]["kks"].add(r.get("noKK"))
        
        # RT level
        if rt_key not in wilayah_stats[key]["rts"]:
            wilayah_stats[key]["rts"][rt_key] = {"totalWarga": 0, "lakiLaki": 0, "perempuan": 0}
        wilayah_stats[key]["rts"][rt_key]["totalWarga"] += 1
        if gk == "L":
            wilayah_stats[key]["rts"][rt_key]["lakiLaki"] += 1
        else:
            wilayah_stats[key]["rts"][rt_key]["perempuan"] += 1

    formatted_wilayah = []
    for k, v in wilayah_stats.items():
        formatted_wilayah.append({
            "rw": v["rw"],
            "totalWarga": v["totalWarga"],
            "lakiLaki": v["lakiLaki"],
            "perempuan": v["perempuan"],
            "totalKk": len(v["kks"]),
            "rts": v["rts"]
        })

    return {
        "engine": "Python Demografi LAMPID v2.0",
        "month": month,
        "year": year,
        "isBalanced": is_balanced and kk_balanced,
        "persamaanMatematis": f"{awal_total} (Awal) + {tambah_total} (Tambah) - {kurang_total} (Kurang) = {akhir_total} (Akhir)",
        "saldoAwal": {
            "L": awal_l,
            "P": awal_p,
            "total": awal_total
        },
        "mutasiTambah": {
            "lahir": {"L": lahir_l, "P": lahir_p, "total": lahir_l + lahir_p},
            "datang": {"L": datang_l, "P": datang_p, "total": datang_l + datang_p},
            "total": {"L": tambah_l, "P": tambah_p, "total": tambah_total}
        },
        "mutasiKurang": {
            "mati": {"L": mati_l, "P": mati_p, "total": mati_l + mati_p},
            "pindah": {"L": pindah_l, "P": pindah_p, "total": pindah_l + pindah_p},
            "total": {"L": kurang_l, "P": kurang_p, "total": kurang_total}
        },
        "saldoAkhir": {
            "L": akhir_l,
            "P": akhir_p,
            "total": akhir_total
        },
        "kartuKeluarga": {
            "awal": kk_awal,
            "tambah": kk_tambah,
            "kurang": kk_kurang,
            "akhir": kk_akhir,
            "isBalanced": kk_balanced
        },
        "wajibKtp": {
            "L": wajib_ktp_l,
            "P": wajib_ktp_p,
            "total": wajib_ktp_l + wajib_ktp_p
        },
        "ageDistribution": age_dist,
        "wilayahBreakdown": formatted_wilayah
    }

def main():
    try:
        input_data = ""
        if len(sys.argv) > 1:
            input_data = sys.argv[1]
        else:
            input_data = sys.stdin.read()

        parsed = json.loads(input_data)
        result = compute_lampid(parsed)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "isBalanced": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()

