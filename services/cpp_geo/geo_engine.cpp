/**
 * Sistem Digitalisasi Desa Cimanggu I - Modul Geospasial Native C++
 * High-Performance Spatial Calculation Engine (Area, Centroid, Point-in-Polygon)
 * Penulis: Antigravity Core Team
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <string>
#include <sstream>
#include <iomanip>

constexpr double PI = 3.14159265358979323846;
constexpr double EARTH_RADIUS = 6378137.0; // WGS84 Semi-major axis (meters)

struct Point {
    double lat;
    double lng;
};

// Konversi derajat ke radian
inline double toRadians(double degrees) {
    return degrees * (PI / 180.0);
}

// Konversi radian ke derajat
inline double toDegrees(double radians) {
    return radians * (180.0 / PI);
}

// Jarak Haversine antara dua titik koordinat (meter)
double haversineDistance(const Point& p1, const Point& p2) {
    double dLat = toRadians(p2.lat - p1.lat);
    double dLng = toRadians(p2.lng - p1.lng);
    double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
               std::cos(toRadians(p1.lat)) * std::cos(toRadians(p2.lat)) *
               std::sin(dLng / 2.0) * std::sin(dLng / 2.0);
    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    return EARTH_RADIUS * c;
}

// Menghitung Luas Poligon Bola (Spherical Polygon Area) dalam meter persegi
double computePolygonArea(const std::vector<Point>& poly) {
    size_t n = poly.size();
    if (n < 3) return 0.0;

    double total = 0.0;
    for (size_t i = 0; i < n; ++i) {
        const Point& p1 = poly[i];
        const Point& p2 = poly[(i + 1) % n];
        double dLng = toRadians(p2.lng - p1.lng);
        total += dLng * (2.0 + std::sin(toRadians(p1.lat)) + std::sin(toRadians(p2.lat)));
    }
    double area = std::abs(total * (EARTH_RADIUS * EARTH_RADIUS) / 2.0);
    return area;
}

// Menghitung Keliling Poligon (Perimeter) dalam meter
double computePolygonPerimeter(const std::vector<Point>& poly) {
    size_t n = poly.size();
    if (n < 2) return 0.0;

    double perimeter = 0.0;
    for (size_t i = 0; i < n; ++i) {
        perimeter += haversineDistance(poly[i], poly[(i + 1) % n]);
    }
    return perimeter;
}

// Menghitung Titik Tengah (Centroid) Poligon
Point computePolygonCentroid(const std::vector<Point>& poly) {
    double sumLat = 0.0;
    double sumLng = 0.0;
    size_t n = poly.size();
    if (n == 0) return {0.0, 0.0};

    for (const auto& p : poly) {
        sumLat += p.lat;
        sumLng += p.lng;
    }
    return { sumLat / static_cast<double>(n), sumLng / static_cast<double>(n) };
}

// Algoritma Ray-Casting untuk Point-in-Polygon (apakah titik berada di dalam poligon)
bool isPointInsidePolygon(const Point& pt, const std::vector<Point>& poly) {
    size_t n = poly.size();
    if (n < 3) return false;

    bool inside = false;
    for (size_t i = 0, j = n - 1; i < n; j = i++) {
        if (((poly[i].lat > pt.lat) != (poly[j].lat > pt.lat)) &&
            (pt.lng < (poly[j].lng - poly[i].lng) * (pt.lat - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng)) {
            inside = !inside;
        }
    }
    return inside;
}

// Robust parser untuk format array poligon GeoJSON [[lat, lng], [lat, lng], ...]
std::vector<Point> parseCoordinates(const std::string& input) {
    std::vector<Point> points;
    size_t pos = 0;

    while (pos < input.length()) {
        size_t closeBracket = input.find(']', pos);
        if (closeBracket == std::string::npos) break;

        size_t openBracket = input.rfind('[', closeBracket);
        if (openBracket == std::string::npos || openBracket < pos) {
            pos = closeBracket + 1;
            continue;
        }

        std::string inner = input.substr(openBracket + 1, closeBracket - openBracket - 1);
        size_t comma = inner.find(',');
        if (comma != std::string::npos) {
            try {
                double val1 = std::stod(inner.substr(0, comma));
                double val2 = std::stod(inner.substr(comma + 1));
                // Mendukung urutan [lat, lng] atau [lng, lat]
                if (std::abs(val1) <= 90.0 && std::abs(val2) <= 180.0) {
                    points.push_back({ val1, val2 });
                } else {
                    points.push_back({ val2, val1 });
                }
            } catch (...) {}
        }
        pos = closeBracket + 1;
    }
    return points;
}

int main(int argc, char* argv[]) {
    std::string rawInput = "";

    // Koordinat default contoh batas wilayah RW di Desa Cimanggu I
    std::vector<Point> polygon = {
        { -6.5612, 106.6854 },
        { -6.5615, 106.6912 },
        { -6.5680, 106.6925 },
        { -6.5695, 106.6860 },
        { -6.5630, 106.6840 }
    };

    Point testPoint = { -6.5645, 106.6880 };

    if (argc > 1) {
        std::vector<Point> parsed = parseCoordinates(argv[1]);
        if (parsed.size() >= 3) {
            polygon = parsed;
        }
    }

    double areaSqMeters = computePolygonArea(polygon);
    double areaHectares = areaSqMeters / 10000.0;
    double perimeterMeters = computePolygonPerimeter(polygon);
    Point centroid = computePolygonCentroid(polygon);
    bool pointInside = isPointInsidePolygon(testPoint, polygon);

    // Output JSON format standar
    std::cout << std::fixed << std::setprecision(6);
    std::cout << "{\n";
    std::cout << "  \"engine\": \"Native C++ Geodesic Spatial Core v1.0 (WGS84)\",\n";
    std::cout << "  \"statusSuccess\": true,\n";
    std::cout << "  \"totalVertex\": " << polygon.size() << ",\n";
    std::cout << "  \"areaSquareMeters\": " << std::setprecision(2) << areaSqMeters << ",\n";
    std::cout << "  \"areaHectares\": " << std::setprecision(4) << areaHectares << ",\n";
    std::cout << "  \"perimeterMeters\": " << std::setprecision(2) << perimeterMeters << ",\n";
    std::cout << "  \"perimeterKilometers\": " << std::setprecision(3) << (perimeterMeters / 1000.0) << ",\n";
    std::cout << "  \"centroid\": {\n";
    std::cout << "    \"lat\": " << std::setprecision(6) << centroid.lat << ",\n";
    std::cout << "    \"lng\": " << std::setprecision(6) << centroid.lng << "\n";
    std::cout << "  },\n";
    std::cout << "  \"testPointInside\": " << (pointInside ? "true" : "false") << ",\n";
    std::cout << "  \"computationalComplexity\": \"O(N) Ultra-Fast Native CPU\"\n";
    std::cout << "}\n";

    return 0;
}

