#!/usr/bin/env python3
"""
Sistem Digitalisasi Desa Cimanggu I - Modul Posyandu & Demografi Balita
Engine Presisi Perhitungan Usia Balita, Pengelompokan Wilayah Posyandu Mawar I - VII,
dan Sinkronisasi Rekapitulasi Data Warga Kependudukan (Maksimal 5 Tahun / 60 Bulan)

Penulis: Antigravity AI Engine
"""

import sys
import json
from datetime import datetime, date
from typing import Dict, List, Any, Optional

POSYANDU_CONFIG = [
    {"id": "mawar1", "code": "MAWAR_1", "name": "Posyandu Mawar I", "unitCode": "Posyandu Unit 001", "rws": ["001"], "rtDesc": "RW 001"},
    {"id": "mawar2", "code": "MAWAR_2", "name": "Posyandu Mawar II", "unitCode": "Posyandu Unit 002", "rws": ["002"], "rtDesc": "RW 002"},
    {"id": "mawar3", "code": "MAWAR_3", "name": "Posyandu Mawar III", "unitCode": "Posyandu Unit 003", "rws": ["003"], "rtDesc": "RW 003"},
    {"id": "mawar4", "code": "MAWAR_4", "name": "Posyandu Mawar IV", "unitCode": "Posyandu Unit 004", "rws": ["004", "009"], "rtDesc": "RW 004 & RW 009"},
    {"id": "mawar5", "code": "MAWAR_5", "name": "Posyandu Mawar V", "unitCode": "Posyandu Unit 005", "rws": ["005"], "rtDesc": "RW 005"},
    {"id": "mawar6", "code": "MAWAR_6", "name": "Posyandu Mawar VI", "unitCode": "Posyandu Unit 006", "rws": ["006", "007"], "rtDesc": "RW 006 & RW 007"},
    {"id": "mawar7", "code": "MAWAR_7", "name": "Posyandu Mawar VII", "unitCode": "Posyandu Unit 007", "rws": ["008"], "rtDesc": "RW 008"}
]

def clean_rw(val: Any) -> str:
    s = str(val or "").strip()
    digits = "".join(c for c in s if c.isdigit())
    if not digits:
        return "001"
    return digits.zfill(3)

def resolve_posyandu_for_rw(rw: str) -> Dict[str, Any]:
    norm_rw = clean_rw(rw)
    for p in POSYANDU_CONFIG:
        for r in p["rws"]:
            if clean_rw(r) == norm_rw:
                return p
    return POSYANDU_CONFIG[0]

def parse_date(d_val: Any) -> Optional[date]:
    if not d_val:
        return None
    s = str(d_val).strip()
    if not s:
        return None
    try:
        if "T" in s:
            return datetime.fromisoformat(s.replace("Z", "+00:00")).date()
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except Exception:
        return None

def calculate_precise_age(birth_date: date, ref_date: date) -> Dict[str, Any]:
    """
    Hitung usia presisi dalam total bulan, tahun, bulan sisa, dan hari.
    """
    if birth_date > ref_date:
        return {"totalMonths": 0, "years": 0, "remainingMonths": 0, "days": 0, "label": "0 Bulan (Baru Lahir)"}

    years = ref_date.year - birth_date.year
    months = ref_date.month - birth_date.month
    days = ref_date.day - birth_date.day

    if days < 0:
        months -= 1
        # Ambil jumlah hari di bulan sebelumnya
        prev_month = ref_date.month - 1 or 12
        prev_year = ref_date.year if ref_date.month > 1 else ref_date.year - 1
        days_in_prev = (date(prev_year, prev_month + 1, 1) - date(prev_year, prev_month, 1)).days if prev_month < 12 else 31
        days += days_in_prev

    if months < 0:
        years -= 1
        months += 12

    total_months = years * 12 + months
    
    if total_months < 12:
        if days > 0:
            label = f"{total_months} Bulan {days} Hari"
        else:
            label = f"{total_months} Bulan"
    else:
        if months > 0:
            label = f"{years} Tahun {months} Bulan"
        else:
            label = f"{years} Tahun"

    return {
        "totalMonths": total_months,
        "years": years,
        "remainingMonths": months,
        "days": days,
        "label": label
    }

def get_age_bracket(total_months: int) -> Dict[str, str]:
    if total_months < 6:
        return {"code": "0-5_BLN", "label": "0 - 5 Bulan (ASI Eksklusif)", "badge": "bg-emerald-50 text-emerald-700 border-emerald-200"}
    elif total_months < 12:
        return {"code": "6-11_BLN", "label": "6 - 11 Bulan (MP-ASI Awal)", "badge": "bg-sky-50 text-sky-700 border-sky-200"}
    elif total_months < 24:
        return {"code": "12-23_BLN", "label": "12 - 23 Bulan (Baduta 1-2 Thn)", "badge": "bg-indigo-50 text-indigo-700 border-indigo-200"}
    elif total_months < 36:
        return {"code": "24-35_BLN", "label": "24 - 35 Bulan (Balita 2-3 Thn)", "badge": "bg-amber-50 text-amber-700 border-amber-200"}
    elif total_months < 60:
        return {"code": "36-59_BLN", "label": "36 - 59 Bulan (Pra-Sekolah 3-5 Thn)", "badge": "bg-purple-50 text-purple-700 border-purple-200"}
    else:
        return {"code": "60_BLN", "label": "60 Bulan (Lulus Balita Posyandu)", "badge": "bg-slate-50 text-slate-700 border-slate-200"}

def process_demografi_balita(payload: Dict[str, Any]) -> Dict[str, Any]:
    citizens = payload.get("citizens", [])
    posyandu_records = payload.get("posyanduBalita", [])
    filter_posyandu = payload.get("filterPosyandu", "ALL")
    ref_date = parse_date(payload.get("referenceDate")) or date.today()

    # Index existing posyandu balita by NIK and by (clean_name + rt + rw)
    posyandu_by_nik = {}
    posyandu_by_name = {}
    for pb in posyandu_records:
        nik = str(pb.get("nik") or "").strip()
        if nik and nik != "-" and len(nik) >= 10:
            posyandu_by_nik[nik] = pb
        c_name = "".join(c for c in str(pb.get("namaLengkap") or "").upper() if c.isalnum())
        c_rt = clean_rw(pb.get("rt") or "001")
        c_rw = clean_rw(pb.get("rw") or "001")
        posyandu_by_name[f"{c_name}_{c_rt}_{c_rw}"] = pb

    matched_posyandu_ids = set()
    balita_list = []

    # 1. Evaluasi seluruh warga di DataKependudukan
    for c in citizens:
        status_kependudukan = str(c.get("statusKependudukan") or "AKTIF").upper()
        if status_kependudukan in ["MENINGGAL", "PINDAH_KELUAR"]:
            continue

        b_date = parse_date(c.get("tanggalLahir"))
        if not b_date:
            continue

        age_info = calculate_precise_age(b_date, ref_date)
        # Sesuai aturan: balita maksimal 5 tahun (<= 60 bulan)
        if age_info["totalMonths"] > 60:
            continue

        rw_val = clean_rw(c.get("rw") or "001")
        rt_val = clean_rw(c.get("rt") or "001")
        posyandu_unit = resolve_posyandu_for_rw(rw_val)

        # Cek apakah terdaftar di PosyanduBalita
        nik_clean = str(c.get("nik") or "").strip()
        c_name = "".join(ch for ch in str(c.get("namaLengkap") or "").upper() if ch.isalnum())
        
        pb_match = None
        if nik_clean and nik_clean in posyandu_by_nik:
            pb_match = posyandu_by_nik[nik_clean]
        elif f"{c_name}_{rt_val}_{rw_val}" in posyandu_by_name:
            pb_match = posyandu_by_name[f"{c_name}_{rt_val}_{rw_val}"]

        is_registered = pb_match is not None
        if pb_match:
            matched_posyandu_ids.add(pb_match.get("id"))

        bracket = get_age_bracket(age_info["totalMonths"])
        gender_raw = str(c.get("jenisKelamin") or "L").upper()
        gender = "L" if gender_raw in ["L", "LAKI_LAKI", "PRIA", "LAKI-LAKI"] else "P"

        nama_ortu = c.get("namaIbu") or c.get("namaAyah") or "-"

        item = {
            "id": pb_match.get("id") if pb_match else f"warga-{c.get('id')}",
            "wargaId": c.get("id"),
            "nik": nik_clean,
            "noKK": str(c.get("noKK") or "").strip(),
            "namaLengkap": str(c.get("namaLengkap") or "").strip().upper(),
            "tempatLahir": c.get("tempatLahir") or "Bogor",
            "tanggalLahir": b_date.isoformat(),
            "usiaBulan": age_info["totalMonths"],
            "usiaLabel": age_info["label"],
            "usiaDetail": age_info,
            "kelompokUmur": bracket,
            "jenisKelamin": gender,
            "namaOrangTua": nama_ortu,
            "rt": rt_val,
            "rw": rw_val,
            "dusun": c.get("dusun") or "Dusun I",
            "alamat": c.get("alamat") or "Desa Cimanggu I",
            "posyanduId": posyandu_unit["id"],
            "posyanduCode": posyandu_unit["code"],
            "posyanduName": posyandu_unit["name"],
            "posyanduUnitCode": posyandu_unit["unitCode"],
            "isRegisteredInPosyandu": is_registered,
            "posyanduBalitaId": pb_match.get("id") if pb_match else None,
            "statusStunting": bool(pb_match.get("statusStunting")) if pb_match else False,
            "inKependudukan": True,
            "needsRegistration": not is_registered,
            "statusFisikKK": "TERDAFTAR_KK"
        }
        balita_list.append(item)

    # 2. Periksa apakah ada balita di tabel PosyanduBalita yang belum ada di DataKependudukan (belum masuk KK)
    for pb in posyandu_records:
        if pb.get("id") not in matched_posyandu_ids:
            b_date = parse_date(pb.get("tanggalLahir")) or date.today()
            age_info = calculate_precise_age(b_date, ref_date)
            bracket = get_age_bracket(age_info["totalMonths"])
            rw_val = clean_rw(pb.get("rw") or "001")
            rt_val = clean_rw(pb.get("rt") or "001")
            posyandu_unit = resolve_posyandu_for_rw(rw_val)
            gender_raw = str(pb.get("jenisKelamin") or "L").upper()
            gender = "L" if gender_raw in ["L", "LAKI_LAKI", "PRIA", "LAKI-LAKI"] else "P"

            item = {
                "id": pb.get("id"),
                "wargaId": None,
                "nik": str(pb.get("nik") or "").strip(),
                "noKK": "BELUM_MASUK_KK",
                "namaLengkap": str(pb.get("namaLengkap") or "").strip().upper(),
                "tempatLahir": "Bogor",
                "tanggalLahir": b_date.isoformat(),
                "usiaBulan": age_info["totalMonths"],
                "usiaLabel": age_info["label"],
                "usiaDetail": age_info,
                "kelompokUmur": bracket,
                "jenisKelamin": gender,
                "namaOrangTua": pb.get("namaOrangTua") or "-",
                "rt": rt_val,
                "rw": rw_val,
                "dusun": "-",
                "alamat": f"RT {rt_val} / RW {rw_val}",
                "posyanduId": posyandu_unit["id"],
                "posyanduCode": posyandu_unit["code"],
                "posyanduName": pb.get("posyanduName") or posyandu_unit["name"],
                "posyanduUnitCode": posyandu_unit["unitCode"],
                "isRegisteredInPosyandu": True,
                "posyanduBalitaId": pb.get("id"),
                "statusStunting": bool(pb.get("statusStunting")),
                "inKependudukan": False,
                "needsRegistration": False,
                "statusFisikKK": "BELUM_MASUK_KK_FISIK_TERCATAT"
            }
            balita_list.append(item)

    # 3. Urutkan daftar balita tersusun rapi berdasarkan umur (termuda ke tertua)
    # Jika usia bulan sama, urutkan berdasarkan tanggal lahir descending
    balita_list.sort(key=lambda x: (x["usiaBulan"], x["tanggalLahir"]))

    # 4. Agregasi Statistik & Breakdown
    rekap_umur = {
        "0-5_BLN": {"label": "0 - 5 Bulan (ASI Eksklusif)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0},
        "6-11_BLN": {"label": "6 - 11 Bulan (MP-ASI Awal)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0},
        "12-23_BLN": {"label": "12 - 23 Bulan (Baduta 1-2 Thn)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0},
        "24-35_BLN": {"label": "24 - 35 Bulan (Balita 2-3 Thn)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0},
        "36-59_BLN": {"label": "36 - 59 Bulan (Pra-Sekolah 3-5 Thn)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0},
        "60_BLN": {"label": "60 Bulan (Lulus Posyandu)", "total": 0, "L": 0, "P": 0, "registered": 0, "unregistered": 0}
    }

    rekap_mawar = {
        p["id"]: {
            "id": p["id"],
            "name": p["name"],
            "unitCode": p["unitCode"],
            "rws": p["rws"],
            "rtDesc": p["rtDesc"],
            "totalBalita": 0,
            "registered": 0,
            "unregistered": 0,
            "stuntingCount": 0,
            "belumMasukKK": 0,
            "L": 0,
            "P": 0
        }
        for p in POSYANDU_CONFIG
    }

    total_kependudukan = 0
    total_registered = 0
    total_unregistered = 0
    total_belum_masuk_kk = 0
    total_stunting = 0

    for b in balita_list:
        code = b["kelompokUmur"]["code"]
        if code in rekap_umur:
            rekap_umur[code]["total"] += 1
            if b["jenisKelamin"] == "L":
                rekap_umur[code]["L"] += 1
            else:
                rekap_umur[code]["P"] += 1
            if b["isRegisteredInPosyandu"]:
                rekap_umur[code]["registered"] += 1
            else:
                rekap_umur[code]["unregistered"] += 1

        p_id = b["posyanduId"]
        if p_id in rekap_mawar:
            rekap_mawar[p_id]["totalBalita"] += 1
            if b["jenisKelamin"] == "L":
                rekap_mawar[p_id]["L"] += 1
            else:
                rekap_mawar[p_id]["P"] += 1
            if b["isRegisteredInPosyandu"]:
                rekap_mawar[p_id]["registered"] += 1
            else:
                rekap_mawar[p_id]["unregistered"] += 1
            if b["statusStunting"]:
                rekap_mawar[p_id]["stuntingCount"] += 1
            if not b["inKependudukan"]:
                rekap_mawar[p_id]["belumMasukKK"] += 1

        if b["inKependudukan"]:
            total_kependudukan += 1
        if b["isRegisteredInPosyandu"]:
            total_registered += 1
        else:
            total_unregistered += 1
        if not b["inKependudukan"]:
            total_belum_masuk_kk += 1
        if b["statusStunting"]:
            total_stunting += 1

    # Filter balita jika parameter filterPosyandu bukan ALL
    filtered_list = balita_list
    if filter_posyandu and filter_posyandu != "ALL":
        norm_filter = str(filter_posyandu).lower().replace(" ", "").replace("_", "")
        filtered_list = [
            b for b in balita_list
            if b["posyanduId"].lower() == norm_filter or
               b["posyanduCode"].lower().replace("_", "") == norm_filter or
               b["posyanduName"].lower().replace(" ", "") == norm_filter or
               b["posyanduUnitCode"].lower().replace(" ", "") == norm_filter or
               filter_posyandu in b["rw"]
        ]

    return {
        "engine": "Python Balita Demografi & Posyandu Sync Engine v2.0",
        "referenceDate": ref_date.isoformat(),
        "summary": {
            "totalBalita": len(balita_list),
            "totalBalitaKependudukan": total_kependudukan,
            "totalTerdaftarPosyandu": total_registered,
            "totalBelumTerdaftarPosyandu": total_unregistered,
            "totalBelumMasukKK": total_belum_masuk_kk,
            "totalStunting": total_stunting,
            "persentaseCakupan": round((total_registered / len(balita_list) * 100), 1) if balita_list else 0.0
        },
        "rekapKelompokUmur": [
            {"code": k, **v} for k, v in rekap_umur.items()
        ],
        "rekapPosyanduMawar": list(rekap_mawar.values()),
        "balita": filtered_list,
        "totalFiltered": len(filtered_list)
    }

def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"error": "Empty stdin input", "summary": {}}))
            sys.exit(1)
        payload = json.loads(raw)
        result = process_demografi_balita(payload)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e), "summary": {}}))
        sys.exit(1)

if __name__ == "__main__":
    main()

