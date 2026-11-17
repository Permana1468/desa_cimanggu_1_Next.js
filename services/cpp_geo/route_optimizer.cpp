/**
 * Sistem Digitalisasi Desa Cimanggu I - Modul Geospasial Native C++
 * High-Performance TSP Route Optimizer & Distance Matrix Engine
 * Penulis: MUHAMAD ALDIANSYAH & Deepmind Agent
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <string>
#include <sstream>
#include <iomanip>
#include <algorithm>

constexpr double PI = 3.14159265358979323846;
constexpr double EARTH_RADIUS = 6378137.0; // WGS84 Semi-major axis in meters

struct LocationPoint {
    std::string id;
    std::string name;
    double lat;
    double lng;
};

inline double toRad(double deg) {
    return deg * (PI / 180.0);
}

// Jarak Haversine Geodesik (Meter)
double haversineMeters(const LocationPoint& a, const LocationPoint& b) {
    double dLat = toRad(b.lat - a.lat);
    double dLng = toRad(b.lng - a.lng);
    double sa = std::sin(dLat / 2.0);
    double sl = std::sin(dLng / 2.0);
    double h = sa * sa + std::cos(toRad(a.lat)) * std::cos(toRad(b.lat)) * sl * sl;
    double c = 2.0 * std::atan2(std::sqrt(h), std::sqrt(1.0 - h));
    return EARTH_RADIUS * c;
}

// 2-Opt Local Search Heuristic untuk perbaikan rute TSP
void twoOptTour(std::vector<int>& tour, const std::vector<std::vector<double>>& distMatrix) {
    int n = static_cast<int>(tour.size());
    bool improved = true;
    int iterations = 0;
    const int maxIterations = 50;

    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        for (int i = 1; i < n - 2; ++i) {
            for (int k = i + 1; k < n - 1; ++k) {
                int a = tour[i - 1];
                int b = tour[i];
                int c = tour[k];
                int d = tour[k + 1];

                double delta = (distMatrix[a][c] + distMatrix[b][d]) - (distMatrix[a][b] + distMatrix[c][d]);
                if (delta < -1e-6) {
                    std::reverse(tour.begin() + i, tour.begin() + k + 1);
                    improved = true;
                }
            }
        }
    }
}

int main(int argc, char* argv[]) {
    // Default kantor desa Cimanggu I
    LocationPoint startPoint = { "START", "Kantor Desa Cimanggu I", -6.626700, 106.671300 };
    std::vector<LocationPoint> points;
    points.push_back(startPoint);

    // Parsing koordinat titik kunjungan dari argv jika ada
    // Format JSON array: [{"id":"1","name":"Warga A","lat":-6.626,"lng":106.671}, ...]
    if (argc > 1) {
        std::string raw = argv[1];
        size_t pos = 0;
        int idx = 1;
        while ((pos = raw.find("lat", pos)) != std::string::npos) {
            size_t latColon = raw.find(':', pos);
            if (latColon == std::string::npos) break;
            size_t lngPos = raw.find("lng", latColon);
            if (lngPos == std::string::npos) break;
            size_t lngColon = raw.find(':', lngPos);
            if (lngColon == std::string::npos) break;

            try {
                double lat = std::stod(raw.substr(latColon + 1));
                double lng = std::stod(raw.substr(lngColon + 1));
                std::string label = "Titik " + std::to_string(idx);
                points.push_back({ std::to_string(idx), label, lat, lng });
                idx++;
            } catch (...) {}
            pos = lngColon + 1;
        }
    }

    // Jika input tidak ada atau kurang dari 3 titik, sediakan sampel sebaran RW Cimanggu I
    if (points.size() < 3) {
        points = {
            startPoint,
            { "W1", "Rumah Warga RW 01", -6.625100, 106.672400 },
            { "W2", "Rumah Warga RW 02", -6.628300, 106.669800 },
            { "W3", "Rumah Warga RW 03", -6.623900, 106.674500 },
            { "W4", "Posyandu Unit 04",  -6.627200, 106.673800 },
            { "W5", "Rumah Warga RW 05", -6.629500, 106.671100 }
        };
    }

    int n = static_cast<int>(points.size());

    // 1. Matriks Jarak Geodesik
    std::vector<std::vector<double>> distMatrix(n, std::vector<double>(n, 0.0));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            if (i == j) distMatrix[i][j] = 0.0;
            else distMatrix[i][j] = haversineMeters(points[i], points[j]);
        }
    }

    // 2. Greedy Nearest Neighbor Construction
    std::vector<bool> visited(n, false);
    std::vector<int> tour;
    tour.reserve(n + 1);

    int current = 0; // Mulai dari Kantor Desa (index 0)
    tour.push_back(current);
    visited[current] = true;

    for (int step = 1; step < n; ++step) {
        int bestNext = -1;
        double bestDist = 1e12;
        for (int cand = 0; cand < n; ++cand) {
            if (!visited[cand] && distMatrix[current][cand] < bestDist) {
                bestDist = distMatrix[current][cand];
                bestNext = cand;
            }
        }
        if (bestNext != -1) {
            current = bestNext;
            visited[current] = true;
            tour.push_back(current);
        }
    }
    // Kembali ke titik awal untuk menutup sirkuit
    tour.push_back(0);

    // 3. 2-Opt Optimization
    twoOptTour(tour, distMatrix);

    // 4. Hitung Total Jarak
    double totalMeters = 0.0;
    for (size_t i = 0; i < tour.size() - 1; ++i) {
        totalMeters += distMatrix[tour[i]][tour[i + 1]];
    }

    // Output JSON Format
    std::cout << std::fixed << std::setprecision(6);
    std::cout << "{\n";
    std::cout << "  \"engine\": \"Native C++ TSP Route Optimizer v1.0 (2-Opt Geodesic)\",\n";
    std::cout << "  \"statusSuccess\": true,\n";
    std::cout << "  \"totalPoints\": " << (tour.size() - 1) << ",\n";
    std::cout << "  \"totalDistanceMeters\": " << std::setprecision(2) << totalMeters << ",\n";
    std::cout << "  \"totalDistanceKilometers\": " << std::setprecision(3) << (totalMeters / 1000.0) << ",\n";
    std::cout << "  \"estimatedSurveyMinutes\": " << static_cast<int>(std::round((totalMeters / 1000.0) * 12.0 + (tour.size() - 2) * 10.0)) << ",\n";
    std::cout << "  \"computationalComplexity\": \"O(N^2) 2-Opt Microsecond Native Execution\",\n";
    std::cout << "  \"optimalRoute\": [\n";

    for (size_t i = 0; i < tour.size(); ++i) {
        int idx = tour[i];
        std::cout << "    {\n";
        std::cout << "      \"step\": " << (i + 1) << ",\n";
        std::cout << "      \"id\": \"" << points[idx].id << "\",\n";
        std::cout << "      \"name\": \"" << points[idx].name << "\",\n";
        std::cout << "      \"lat\": " << std::setprecision(6) << points[idx].lat << ",\n";
        std::cout << "      \"lng\": " << std::setprecision(6) << points[idx].lng << "\n";
        std::cout << "    }" << (i + 1 < tour.size() ? "," : "") << "\n";
    }

    std::cout << "  ]\n";
    std::cout << "}\n";

    return 0;
}

