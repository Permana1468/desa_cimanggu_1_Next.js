/**
 * Sistem Digitalisasi Desa Cimanggu I - Modul High-Performance Native C++
 * Ultra-Fast Census Search, Fuzzy Matching, & Demographic Pyramid Aggregator
 * Penulis: MUHAMAD ALDIANSYAH & Deepmind Agent
 */

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <cmath>
#include <chrono>
#include <iomanip>

struct CitizenRecord {
    std::string id;
    std::string nik;
    std::string nama;
    std::string jenisKelamin; // L / P
    int usia;
    std::string rt;
    std::string rw;
    std::string pekerjaan;
};

// Hitung Levenshtein Distance antara 2 string untuk toleransi typo
int levenshteinDistance(const std::string& s1, const std::string& s2) {
    int m = static_cast<int>(s1.length());
    int n = static_cast<int>(s2.length());
    if (m == 0) return n;
    if (n == 0) return m;

    std::vector<int> prev(n + 1);
    std::vector<int> curr(n + 1);

    for (int j = 0; j <= n; ++j) prev[j] = j;

    for (int i = 1; i <= m; ++i) {
        curr[0] = i;
        char c1 = std::tolower(static_cast<unsigned char>(s1[i - 1]));
        for (int j = 1; j <= n; ++j) {
            char c2 = std::tolower(static_cast<unsigned char>(s2[j - 1]));
            int cost = (c1 == c2) ? 0 : 1;
            curr[j] = std::min({ curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost });
        }
        prev = curr;
    }
    return curr[n];
}

std::string toLowerString(const std::string& s) {
    std::string res = s;
    std::transform(res.begin(), res.end(), res.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return res;
}

int main(int argc, char* argv[]) {
    auto startTime = std::chrono::high_resolution_clock::now();

    std::string query = "";
    if (argc > 1) {
        query = toLowerString(argv[1]);
    }

    // Default basis data kependudukan sampel skala besar
    std::vector<CitizenRecord> citizens;
    
    // Inisialisasi pool data kependudukan
    const std::vector<std::string> namaDepan = {
        "Ahmad", "Muhammad", "Siti", "Nur", "Budi", "Asep", "Iis", "Dewi", "Rudi", "Eko",
        "Dedi", "Agus", "Hendra", "Rina", "Fitri", "Saepudin", "Ujang", "Cecep", "Wawan", "Yanti"
    };
    const std::vector<std::string> namaBelakang = {
        "Hidayat", "Kusuma", "Pratama", "Saputra", "Wahyudi", "Nugraha", "Santoso", "Wijaya",
        "Setiawan", "Permana", "Gunawan", "Kurniawan", "Suryana", "Mulyadi", "Iskandar"
    };

    // Simulasi 1.000 data warga berkecepatan mikrodetik
    citizens.reserve(1000);
    for (size_t i = 0; i < 1000; ++i) {
        std::string n1 = namaDepan[i % namaDepan.size()];
        std::string n2 = namaBelakang[(i * 3) % namaBelakang.size()];
        std::string full = n1 + " " + n2;
        std::string nik = "3201" + std::to_string(100000000000ULL + i);
        std::string jk = (i % 2 == 0) ? "L" : "P";
        int usia = 1 + (i * 7) % 85;
        std::string rt = std::to_string(1 + (i % 5));
        std::string rw = std::to_string(1 + (i % 9));
        citizens.push_back({ std::to_string(i + 1), nik, full, jk, usia, rt, rw, "WIRASWASTA" });
    }

    // 1. Demographic Pyramid Aggregation (0-4, 5-14, 15-24, 25-54, 55-64, 65+)
    int balitaCount = 0;      // 0 - 4
    int anakCount = 0;        // 5 - 14
    int pemudaCount = 0;      // 15 - 24
    int produktifCount = 0;   // 25 - 54
    int praLansiaCount = 0;   // 55 - 64
    int lansiaCount = 0;      // 65+
    int totalLaki = 0;
    int totalPerempuan = 0;

    for (const auto& c : citizens) {
        if (c.jenisKelamin == "L") totalLaki++;
        else totalPerempuan++;

        if (c.usia <= 4) balitaCount++;
        else if (c.usia <= 14) anakCount++;
        else if (c.usia <= 24) pemudaCount++;
        else if (c.usia <= 54) produktifCount++;
        else if (c.usia <= 64) praLansiaCount++;
        else lansiaCount++;
    }

    int usiaProduktif = pemudaCount + produktifCount;
    int usiaNonProduktif = balitaCount + anakCount + praLansiaCount + lansiaCount;
    double dependencyRatio = (usiaProduktif > 0) ? (static_cast<double>(usiaNonProduktif) / usiaProduktif) * 100.0 : 0.0;

    // 2. Fuzzy Matching & Search
    std::vector<std::pair<int, const CitizenRecord*>> matches;

    if (!query.empty()) {
        for (const auto& c : citizens) {
            std::string lowerNama = toLowerString(c.nama);
            if (lowerNama.find(query) != std::string::npos || c.nik.find(query) != std::string::npos) {
                matches.push_back({ 0, &c }); // Exact match
            } else if (query.length() >= 4) {
                // Fuzzy check
                int dist = levenshteinDistance(lowerNama.substr(0, std::min(lowerNama.length(), query.length())), query);
                if (dist <= 2) {
                    matches.push_back({ dist, &c });
                }
            }
            if (matches.size() >= 15) break;
        }
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    double execMicroseconds = std::chrono::duration<double, std::micro>(endTime - startTime).count();

    // Output JSON Format
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "{\n";
    std::cout << "  \"engine\": \"Native C++ Census & Demographics Core v1.0\",\n";
    std::cout << "  \"statusSuccess\": true,\n";
    std::cout << "  \"executionTimeMicroseconds\": " << execMicroseconds << ",\n";
    std::cout << "  \"executionTimeMilliseconds\": " << (execMicroseconds / 1000.0) << ",\n";
    std::cout << "  \"totalProcessedRecords\": " << citizens.size() << ",\n";
    std::cout << "  \"demographics\": {\n";
    std::cout << "    \"totalLaki\": " << totalLaki << ",\n";
    std::cout << "    \"totalPerempuan\": " << totalPerempuan << ",\n";
    std::cout << "    \"sexRatio\": " << (totalPerempuan > 0 ? (static_cast<double>(totalLaki) / totalPerempuan) * 100.0 : 100.0) << ",\n";
    std::cout << "    \"dependencyRatio\": " << dependencyRatio << ",\n";
    std::cout << "    \"piramidaUsia\": {\n";
    std::cout << "      \"balita_0_4\": " << balitaCount << ",\n";
    std::cout << "      \"anak_5_14\": " << anakCount << ",\n";
    std::cout << "      \"pemuda_15_24\": " << pemudaCount << ",\n";
    std::cout << "      \"produktif_25_54\": " << produktifCount << ",\n";
    std::cout << "      \"praLansia_55_64\": " << praLansiaCount << ",\n";
    std::cout << "      \"lansia_65_plus\": " << lansiaCount << "\n";
    std::cout << "    }\n";
    std::cout << "  },\n";
    std::cout << "  \"searchResults\": [\n";

    for (size_t i = 0; i < matches.size(); ++i) {
        const auto* rec = matches[i].second;
        std::cout << "    {\n";
        std::cout << "      \"nik\": \"" << rec->nik << "\",\n";
        std::cout << "      \"nama\": \"" << rec->nama << "\",\n";
        std::cout << "      \"jenisKelamin\": \"" << rec->jenisKelamin << "\",\n";
        std::cout << "      \"usia\": " << rec->usia << ",\n";
        std::cout << "      \"rt\": \"" << rec->rt << "\",\n";
        std::cout << "      \"rw\": \"" << rec->rw << "\",\n";
        std::cout << "      \"fuzzyScore\": " << matches[i].first << "\n";
        std::cout << "    }" << (i + 1 < matches.size() ? "," : "") << "\n";
    }

    std::cout << "  ]\n";
    std::cout << "}\n";

    return 0;
}

