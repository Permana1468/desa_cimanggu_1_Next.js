#!/usr/bin/env python3
"""
PYTHON CYBER FRAUD & ANOMALY SENTINEL (AI Sentinel Brain)
Sistem Kecerdasan Buatan Pemantau Integritas & Anti-Kecurangan Pengguna Desa Cimanggu I.

Mendeteksi:
1. Pelanggaran batas wewenang wilayah (RT/RW/Dusun IDOR).
2. Upaya manipulasi nominal anggaran APBDes & kuota Bansos.
3. Pengajuan data ganda / bot spam submission.
4. Ekskalasi hak akses (Privilege Escalation).
"""

import sys
import json
import time

def analyze_user_behavior(data):
    user_id = data.get("userId", "UNKNOWN")
    user_name = data.get("userName", "Pengguna")
    role = data.get("role", "WARGA").upper()
    action = data.get("action", "").upper()
    target_resource = data.get("targetResource", "")
    metadata = data.get("metadata", {})

    violations = []
    severity = "CLEAN"
    is_fraudulent = False
    suggested_penalty = "NONE"

    # 1. ATURAN: Ekskalasi Hak Akses (Privilege Escalation)
    master_restricted = ["CONFIG_MASTER", "DELETE_DATABASE", "PURGE_ALL_LOGS", "EDIT_SUPERADMIN", "SYSTEM_SHUTDOWN"]
    if role not in ["ADMIN_MASTER", "SUPER_ADMIN"] and any(res in action for res in master_restricted):
        is_fraudulent = True
        severity = "CRITICAL"
        violations.append({
            "code": "PRIVILEGE_ESCALATION",
            "rule": "Peraturan Sistem Pasal 4: Akses Ilegal Konfigurasi Inti Master",
            "detail": f"Akun dengan hak akses '{role}' mencoba menjalankan aksi terlarang: {action}"
        })
        suggested_penalty = "LOCK_ACCOUNT"

    # 2. ATURAN: Manipulasi Batas Wilayah (IDOR RT / RW)
    user_rt = str(metadata.get("userRt", "")).strip()
    target_rt = str(metadata.get("targetRt", "")).strip()
    if role == "RT" and user_rt and target_rt and user_rt != target_rt:
        is_fraudulent = True
        severity = "HIGH"
        violations.append({
            "code": "TERRITORY_IDOR_BREACH",
            "rule": "Perdes Integritas Wilayah: Larangan Mengubah Data di Luar RT Terdaftar",
            "detail": f"Ketua RT {user_rt} mencoba memodifikasi entitas warga milik RT {target_rt}"
        })
        suggested_penalty = "WARN_USER"

    # 3. ATURAN: Tampering Anggaran & Keuangan (APBDes / BUMDes)
    nominal = metadata.get("nominal", 0)
    if ("KEUANGAN" in action or "APBDES" in action or "RAB" in action):
        if role in ["WARGA", "OPERATOR_DESA", "PETUGAS_SENSUS"]:
            is_fraudulent = True
            severity = "CRITICAL"
            violations.append({
                "code": "FINANCIAL_DATA_TAMPERING",
                "rule": "UU Desa & Permendagri 20/2018: Otoritas Pengelolaan APBDes Khusus Kaur Keuangan & Kades",
                "detail": f"Akun {role} terdeteksi berupaya merekayasa mutasi/alokasi anggaran APBDes"
            })
            suggested_penalty = "SUSPEND_SESSION"
        elif nominal and float(nominal) > 100000000 and not metadata.get("isKadesVerified"):
            # Perubahan > 100 Juta tanpa verifikasi pimpinan
            is_fraudulent = True
            severity = "HIGH"
            violations.append({
                "code": "LARGE_FUND_UNVERIFIED",
                "rule": "Protokol Verifikasi APBDes: Transaksi > Rp100.000.000 Wajib Otorisasi Kades",
                "detail": f"Alokasi dana sebesar Rp{float(nominal):,.0f} diajukan tanpa token otentikasi pimpinan"
            })
            suggested_penalty = "WARN_USER"

    # 4. ATURAN: Spamming / Bot Automation Submissions
    request_frequency = metadata.get("requestFrequencyPerMin", 1)
    if request_frequency > 30:
        is_fraudulent = True
        severity = "HIGH"
        violations.append({
            "code": "BOT_SPAM_SUBMISSION",
            "rule": "Ketertiban Sistem Siber: Larangan Menggunakan Skrip/Bot Pengisi Data Otomatis",
            "detail": f"Terdeteksi frekuensi input data abnormal: {request_frequency} request/menit"
        })
        suggested_penalty = "RATE_LIMIT_SESSION"

    # 5. ATURAN: Duplikasi Bansos NIK
    if "BANSOS" in action and metadata.get("isNikDuplicate"):
        is_fraudulent = True
        severity = "MEDIUM"
        violations.append({
            "code": "BANSOS_DUPLICATION",
            "rule": "Pedoman Penyaluran Bansos: Satu NIK Hanya Berhak 1 Kuota Program",
            "detail": f"NIK {metadata.get('nik', '-')} didaftarkan berulang untuk bantuan yang sama"
        })
        suggested_penalty = "WARN_USER"

    # Formulasi Pesan Peringatan
    if is_fraudulent:
        primary_violation = violations[0]
        user_warning_message = (
            f"PERINGATAN SISTEM KEAMANAN SIBER: "
            f"Tindakan Anda ({action}) terdeteksi melanggar '{primary_violation['rule']}'. "
            f"Detail: {primary_violation['detail']}. "
            f"Aktivitas ini telah dicatat oleh Sentry Brain dan diteruskan ke Dashboard Admin Master."
        )
        master_alert_message = (
            f"INSIDEN KECURANGAN TERDETEKSI: Akun '{user_name}' ({role}) "
            f"melakukan pelanggaran '{primary_violation['code']}'. Tindakan: {action} pada {target_resource}."
        )
    else:
        user_warning_message = ""
        master_alert_message = "Aktivitas Normal & Sesuai Prosedur"

    return {
        "engine": "Python AI Fraud Sentinel v2.0",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "userId": user_id,
        "userName": user_name,
        "userRole": role,
        "isFraudulent": is_fraudulent,
        "severity": severity,
        "violations": violations,
        "suggestedPenalty": suggested_penalty,
        "userWarningMessage": user_warning_message,
        "masterAlertMessage": master_alert_message,
        "statusSuccess": True
    }

if __name__ == "__main__":
    try:
        raw_input = "{}"
        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
        elif not sys.stdin.isatty():
            raw_input = sys.stdin.read()
        
        data = json.loads(raw_input)
        result = analyze_user_behavior(data)
        print(json.dumps(result, indent=2))
    except Exception as e:
        error_res = {
            "engine": "Python AI Fraud Sentinel v2.0",
            "statusSuccess": False,
            "error": str(e),
            "isFraudulent": False,
            "severity": "UNKNOWN"
        }
        print(json.dumps(error_res))
