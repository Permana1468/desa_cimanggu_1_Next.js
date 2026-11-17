/**
 * SENTRY WAF & PACKET DEFENSE ENGINE (C++ Native)
 * 
 * Sistem Pemindai Ancaman & Penjaga Firewall Siber Desa Cimanggu I.
 * Berjalan pada level kecepatan mikrodetik untuk memblokade serangan luar
 * (SQLi, XSS, Path Traversal, Bot Harvester, Brute Force).
 */

#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <chrono>
#include <cctype>
#include <sstream>

using namespace std;
using namespace std::chrono;

// Struktur Hasil Analisis Keamanan
struct WafResult {
    string status;             // "ALLOWED", "BLOCKED", "WARNING"
    int threatScore;           // 0 - 100
    string threatLevel;        // "CLEAN", "SUSPICIOUS", "HIGH", "CRITICAL"
    string attackVector;       // Kategori ancaman
    vector<string> matchedSigs;// Daftar tanda tangan ancaman yang cocok
    long long executionTimeUs; // Durasi eksekusi dalam mikrodetik
    string targetNode;         // Node teknologi yang diincar
    string action;             // Rekomendasi tindakan
};

// Helper: Ubah string ke lowercase
string toLower(const string& str) {
    string result = str;
    transform(result.begin(), result.end(), result.begin(), [](unsigned char c) {
        return tolower(c);
    });
    return result;
}

// Helper: Escape JSON String
string escapeJson(const string& str) {
    ostringstream oss;
    for (char c : str) {
        if (c == '"') oss << "\\\"";
        else if (c == '\\') oss << "\\\\";
        else if (c == '\b') oss << "\\b";
        else if (c == '\f') oss << "\\f";
        else if (c == '\n') oss << "\\n";
        else if (c == '\r') oss << "\\r";
        else if (c == '\t') oss << "\\t";
        else oss << c;
    }
    return oss.str();
}

// Analisis Pola Muatan (Pattern Scanner)
WafResult analyzePayload(const string& ip, const string& path, const string& payload, const string& userAgent) {
    auto startTime = high_resolution_clock::now();

    WafResult res;
    res.threatScore = 0;
    res.status = "ALLOWED";
    res.threatLevel = "CLEAN";
    res.attackVector = "CLEAN";
    res.action = "ALLOW";
    res.targetNode = "Edge Gateway (Next.js)";

    string lowPayload = toLower(payload);
    string lowPath = toLower(path);
    string lowUA = toLower(userAgent);

    // Tentukan simpul teknologi yang ditarget
    if (lowPath.find("api/auth") != string::npos || lowPath.find("login") != string::npos) {
        res.targetNode = "Auth & Session Vault";
    } else if (lowPath.find("data") != string::npos || lowPath.find("warga") != string::npos) {
        res.targetNode = "PostgreSQL Database Core";
    } else if (lowPath.find("gis") != string::npos || lowPath.find("map") != string::npos) {
        res.targetNode = "C++ Geodesic Spatial Core";
    } else if (lowPath.find("posyandu") != string::npos) {
        res.targetNode = "Python Posyandu AI Engine";
    } else if (lowPath.find("apbdes") != string::npos || lowPath.find("rab") != string::npos) {
        res.targetNode = "C++ AHSP RAB Engine";
    }

    // 1. Deteksi SQL Injection (SQLi)
    vector<pair<string, int>> sqlSignatures = {
        {"' or 1=1", 40},
        {"' or '1'='1", 45},
        {"union select", 50},
        {"union all select", 55},
        {"drop table", 55},
        {"drop database", 60},
        {"information_schema", 40},
        {"sleep(", 45},
        {"benchmark(", 45},
        {"select * from", 35},
        {"exec(", 35},
        {"--", 20},
        {";--", 30},
        {"/*", 20}
    };

    for (const auto& sig : sqlSignatures) {
        if (lowPayload.find(sig.first) != string::npos || lowPath.find(sig.first) != string::npos) {
            res.threatScore += sig.second;
            res.matchedSigs.push_back("SQL_INJECTION_PATTERN: " + sig.first);
            res.attackVector = "SQL_INJECTION";
        }
    }

    // 2. Deteksi Cross-Site Scripting (XSS)
    vector<pair<string, int>> xssSignatures = {
        {"<script", 50},
        {"javascript:", 45},
        {"onerror=", 40},
        {"onload=", 40},
        {"eval(", 35},
        {"document.cookie", 45},
        {"<iframe", 40},
        {"alert(", 30},
        {"window.location", 35}
    };

    for (const auto& sig : xssSignatures) {
        if (lowPayload.find(sig.first) != string::npos) {
            res.threatScore += sig.second;
            res.matchedSigs.push_back("XSS_INJECTION_PATTERN: " + sig.first);
            if (res.attackVector == "CLEAN") res.attackVector = "XSS_ATTACK";
        }
    }

    // 3. Deteksi Path Traversal & File Inclusion
    vector<pair<string, int>> traversalSignatures = {
        {"../", 35},
        {"..\\", 35},
        {"/etc/passwd", 50},
        {"c:\\windows", 50},
        {"proc/self/environ", 50},
        {"boot.ini", 45}
    };

    for (const auto& sig : traversalSignatures) {
        if (lowPayload.find(sig.first) != string::npos || lowPath.find(sig.first) != string::npos) {
            res.threatScore += sig.second;
            res.matchedSigs.push_back("PATH_TRAVERSAL: " + sig.first);
            res.attackVector = "PATH_TRAVERSAL_EXPLOIT";
        }
    }

    // 4. Deteksi Pemindai Otomatis & Bad User Agents
    vector<pair<string, int>> botUASignatures = {
        {"sqlmap", 75},
        {"nikto", 70},
        {"gobuster", 60},
        {"nmap", 65},
        {"dirbuster", 60},
        {"acunetix", 80},
        {"masscan", 70}
    };

    for (const auto& sig : botUASignatures) {
        if (lowUA.find(sig.first) != string::npos) {
            res.threatScore += sig.second;
            res.matchedSigs.push_back("MALICIOUS_SCANNER_UA: " + sig.first);
            if (res.attackVector == "CLEAN") res.attackVector = "AUTOMATED_SCANNER";
        }
    }

    // Batasi threat score maksimal 100
    if (res.threatScore > 100) res.threatScore = 100;

    // Evaluasi Status Akhir
    if (res.threatScore >= 65) {
        res.status = "BLOCKED";
        res.threatLevel = "CRITICAL";
        res.action = "DROP_CONNECTION_AND_BLACKLIST_IP";
    } else if (res.threatScore >= 35) {
        res.status = "WARNING";
        res.threatLevel = "HIGH";
        res.action = "FLAG_FOR_AUDIT_LOG";
    } else if (res.threatScore > 0) {
        res.status = "ALLOWED";
        res.threatLevel = "SUSPICIOUS";
        res.action = "LOG_ACTIVITY";
    } else {
        res.status = "ALLOWED";
        res.threatLevel = "CLEAN";
        res.action = "ALLOW";
    }

    auto endTime = high_resolution_clock::now();
    res.executionTimeUs = duration_cast<microseconds>(endTime - startTime).count();

    return res;
}

int main(int argc, char* argv[]) {
    // Mode parsing argumen CLI:
    // sentry_waf <ip> <path> <payload> <userAgent>
    string ip = (argc > 1) ? argv[1] : "127.0.0.1";
    string path = (argc > 2) ? argv[2] : "/";
    string payload = (argc > 3) ? argv[3] : "";
    string userAgent = (argc > 4) ? argv[4] : "Standard Client";

    WafResult res = analyzePayload(ip, path, payload, userAgent);

    // Cetak JSON ke stdout
    cout << "{"
         << "\"engine\":\"C++ Sentry WAF v2.0\","
         << "\"ip\":\"" << escapeJson(ip) << "\","
         << "\"path\":\"" << escapeJson(path) << "\","
         << "\"targetNode\":\"" << escapeJson(res.targetNode) << "\","
         << "\"status\":\"" << res.status << "\","
         << "\"threatScore\":" << res.threatScore << ","
         << "\"threatLevel\":\"" << res.threatLevel << "\","
         << "\"attackVector\":\"" << res.attackVector << "\","
         << "\"action\":\"" << res.action << "\","
         << "\"executionTimeMicroseconds\":" << res.executionTimeUs << ","
         << "\"matchedSignatures\":[";
    for (size_t i = 0; i < res.matchedSigs.size(); ++i) {
        cout << "\"" << escapeJson(res.matchedSigs[i]) << "\"";
        if (i + 1 < res.matchedSigs.size()) cout << ",";
    }
    cout << "]"
         << "}" << endl;

    return 0;
}
