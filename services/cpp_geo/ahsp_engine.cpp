/**
 * Sistem Digitalisasi Desa Cimanggu I - Modul High-Performance Native C++
 * Ultra-Fast AHSP (Analisis Harga Satuan Pekerjaan) & Construction RAB Engine
 * Standar Permen PUPR / SNI 2026
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
#include <map>

// Simple string escaping for JSON
std::string escapeJson(const std::string& s) {
    std::ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else o << c;
    }
    return o.str();
}

struct KomponenItem {
    std::string kategori; // UPAH, BAHAN, ALAT
    std::string uraian;
    std::string satuan;
    double koefisien;
    double hargaSatuan;
};

struct PekerjaanItem {
    std::string kode;
    std::string uraian;
    double volume;
    std::string satuan;
    double overheadPercent;
    std::vector<KomponenItem> komponen;
};

// Extremely simple and fast JSON value extractor
std::string extractString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    if (pos < json.length() && json[pos] == '"') {
        pos++;
        size_t end = json.find('"', pos);
        if (end != std::string::npos) return json.substr(pos, end - pos);
    }
    return "";
}

double extractDouble(const std::string& json, const std::string& key, double defaultVal = 0.0) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return defaultVal;
    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    size_t end = pos;
    while (end < json.length() && (isdigit(json[end]) || json[end] == '.' || json[end] == '-' || json[end] == '+')) {
        end++;
    }
    if (end > pos) {
        try {
            return std::stod(json.substr(pos, end - pos));
        } catch (...) {}
    }
    return defaultVal;
}

int main(int argc, char* argv[]) {
    auto startTime = std::chrono::high_resolution_clock::now();

    std::string inputJson = "{}";
    if (argc > 1) {
        inputJson = argv[1];
    } else {
        std::string line;
        std::stringstream buffer;
        while (std::getline(std::cin, line)) {
            buffer << line;
        }
        if (!buffer.str().empty()) {
            inputJson = buffer.str();
        }
    }

    std::string namaProyek = extractString(inputJson, "proyekNama");
    if (namaProyek.empty()) namaProyek = "Proyek Infrastruktur Desa Cimanggu I";

    // Parse array "items"
    std::vector<PekerjaanItem> items;
    size_t itemsPos = inputJson.find("\"items\":");
    if (itemsPos != std::string::npos) {
        size_t startArray = inputJson.find('[', itemsPos);
        if (startArray != std::string::npos) {
            int depth = 0;
            size_t itemStart = 0;
            for (size_t i = startArray; i < inputJson.length(); i++) {
                if (inputJson[i] == '{') {
                    if (depth == 1) itemStart = i;
                    depth++;
                } else if (inputJson[i] == '}') {
                    depth--;
                    if (depth == 1 && itemStart != 0) {
                        std::string itemChunk = inputJson.substr(itemStart, i - itemStart + 1);
                        PekerjaanItem p;
                        p.kode = extractString(itemChunk, "kode");
                        p.uraian = extractString(itemChunk, "uraian");
                        p.satuan = extractString(itemChunk, "satuan");
                        p.volume = extractDouble(itemChunk, "volume", 1.0);
                        p.overheadPercent = extractDouble(itemChunk, "overheadPercent", 10.0);

                        // Parse komponen
                        size_t kompPos = itemChunk.find("\"komponen\":");
                        if (kompPos != std::string::npos) {
                            size_t startKomp = itemChunk.find('[', kompPos);
                            if (startKomp != std::string::npos) {
                                int kDepth = 0;
                                size_t kStart = 0;
                                for (size_t k = startKomp; k < itemChunk.length(); k++) {
                                    if (itemChunk[k] == '{') {
                                        if (kDepth == 1) kStart = k;
                                        kDepth++;
                                    } else if (itemChunk[k] == '}') {
                                        kDepth--;
                                        if (kDepth == 1 && kStart != 0) {
                                            std::string kChunk = itemChunk.substr(kStart, k - kStart + 1);
                                            KomponenItem ki;
                                            ki.kategori = extractString(kChunk, "kategori");
                                            ki.uraian = extractString(kChunk, "uraian");
                                            ki.satuan = extractString(kChunk, "satuan");
                                            ki.koefisien = extractDouble(kChunk, "koefisien", 0.0);
                                            ki.hargaSatuan = extractDouble(kChunk, "hargaSatuan", 0.0);
                                            p.komponen.push_back(ki);
                                        }
                                    } else if (itemChunk[k] == ']' && kDepth == 1) {
                                        break;
                                    }
                                }
                            }
                        }
                        items.push_back(p);
                    }
                } else if (inputJson[i] == ']' && depth == 0) {
                    break;
                }
            }
        }
    }

    // Default template item if empty
    if (items.empty()) {
        PekerjaanItem p1;
        p1.kode = "AHSP-PUPR-01";
        p1.uraian = "Pekerjaan Pasangan Batu Belah 1:4 (TPT / Drainase)";
        p1.volume = 150.0;
        p1.satuan = "m3";
        p1.overheadPercent = 10.0;
        p1.komponen.push_back({"UPAH", "Pekerja", "OH", 1.500, 100000});
        p1.komponen.push_back({"UPAH", "Tukang Batu", "OH", 0.750, 125000});
        p1.komponen.push_back({"UPAH", "Kepala Tukang", "OH", 0.075, 140000});
        p1.komponen.push_back({"UPAH", "Mandor", "OH", 0.075, 150000});
        p1.komponen.push_back({"BAHAN", "Batu Belah 15/20 cm", "m3", 1.200, 240000});
        p1.komponen.push_back({"BAHAN", "Semen Portland (50kg)", "zak", 3.260, 68000});
        p1.komponen.push_back({"BAHAN", "Pasir Pasang", "m3", 0.520, 280000});
        p1.komponen.push_back({"ALAT", "Sewa Molen Beton (Concrete Mixer)", "hari", 0.050, 250000});
        items.push_back(p1);
    }

    // High Precision Calculation Core
    double grandTotalUpah = 0.0;
    double grandTotalBahan = 0.0;
    double grandTotalAlat = 0.0;
    double grandTotalLangsung = 0.0;
    double grandTotalOverhead = 0.0;
    double grandTotalFisik = 0.0;

    // Logistics map: {uraian + "|" + satuan: totalKebutuhan}
    std::map<std::string, double> materialAggregates;

    std::ostringstream itemsOut;
    itemsOut << std::fixed << std::setprecision(2);
    itemsOut << "[";

    for (size_t i = 0; i < items.size(); ++i) {
        const auto& it = items[i];
        double subUpah = 0.0;
        double subBahan = 0.0;
        double subAlat = 0.0;

        for (const auto& k : it.komponen) {
            double costPerUnit = k.koefisien * k.hargaSatuan;
            double totalKebutuhan = k.koefisien * it.volume;

            if (k.kategori == "UPAH") {
                subUpah += costPerUnit;
            } else if (k.kategori == "BAHAN") {
                subBahan += costPerUnit;
                std::string key = k.uraian + " (" + k.satuan + ")";
                materialAggregates[key] += totalKebutuhan;
            } else if (k.kategori == "ALAT") {
                subAlat += costPerUnit;
                std::string key = k.uraian + " (" + k.satuan + ")";
                materialAggregates[key] += totalKebutuhan;
            }
        }

        double biayaLangsungSatuan = subUpah + subBahan + subAlat;
        double overheadSatuan = biayaLangsungSatuan * (it.overheadPercent / 100.0);
        double hargaSatuanPekerjaan = biayaLangsungSatuan + overheadSatuan;
        double totalBiayaItem = hargaSatuanPekerjaan * it.volume;

        grandTotalUpah += (subUpah * it.volume);
        grandTotalBahan += (subBahan * it.volume);
        grandTotalAlat += (subAlat * it.volume);
        grandTotalLangsung += (biayaLangsungSatuan * it.volume);
        grandTotalOverhead += (overheadSatuan * it.volume);
        grandTotalFisik += totalBiayaItem;

        if (i > 0) itemsOut << ",";
        itemsOut << "{"
                 << "\"kode\":\"" << escapeJson(it.kode) << "\","
                 << "\"uraian\":\"" << escapeJson(it.uraian) << "\","
                 << "\"volume\":" << it.volume << ","
                 << "\"satuan\":\"" << escapeJson(it.satuan) << "\","
                 << "\"subtotalUpahPerUnit\":" << subUpah << ","
                 << "\"subtotalBahanPerUnit\":" << subBahan << ","
                 << "\"subtotalAlatPerUnit\":" << subAlat << ","
                 << "\"biayaLangsungSatuan\":" << biayaLangsungSatuan << ","
                 << "\"overheadPercent\":" << it.overheadPercent << ","
                 << "\"overheadSatuan\":" << overheadSatuan << ","
                 << "\"hargaSatuanPekerjaan\":" << hargaSatuanPekerjaan << ","
                 << "\"totalBiayaItem\":" << totalBiayaItem
                 << "}";
    }
    itemsOut << "]";

    // Tax calculation according to standard APBDes physical procurement
    double pajakPpn11 = grandTotalFisik * 0.11;
    double pajakPph22 = grandTotalBahan * 0.015; // PPh Pasal 22 untuk material galian C / bahan
    double grandTotalRAB = grandTotalFisik; // Belanja modal fisik desa

    // Logistics Output
    std::ostringstream logOut;
    logOut << "[";
    bool firstLog = true;
    for (const auto& pair : materialAggregates) {
        if (!firstLog) logOut << ",";
        firstLog = false;
        logOut << "{"
               << "\"material\":\"" << escapeJson(pair.first) << "\","
               << "\"totalKebutuhanVolume\":" << std::round(pair.second * 100.0) / 100.0
               << "}";
    }
    logOut << "]";

    auto endTime = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endTime - startTime).count();

    // Output JSON
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "{\n"
              << "  \"engine\": \"Native C++ AHSP & RAB Construction Core v1.0 (PUPR-SNI)\",\n"
              << "  \"statusSuccess\": true,\n"
              << "  \"proyekNama\": \"" << escapeJson(namaProyek) << "\",\n"
              << "  \"totalItemPekerjaan\": " << items.size() << ",\n"
              << "  \"itemsCalculated\": " << itemsOut.str() << ",\n"
              << "  \"ringkasanBiaya\": {\n"
              << "    \"grandTotalUpah\": " << grandTotalUpah << ",\n"
              << "    \"grandTotalBahan\": " << grandTotalBahan << ",\n"
              << "    \"grandTotalAlat\": " << grandTotalAlat << ",\n"
              << "    \"biayaLangsungTotal\": " << grandTotalLangsung << ",\n"
              << "    \"overheadKeuntunganTotal\": " << grandTotalOverhead << ",\n"
              << "    \"totalFisikPekerjaan\": " << grandTotalFisik << ",\n"
              << "    \"estimasiPpn11\": " << pajakPpn11 << ",\n"
              << "    \"estimasiPph22\": " << pajakPph22 << ",\n"
              << "    \"grandTotalRAB\": " << grandTotalRAB << "\n"
              << "  },\n"
              << "  \"kebutuhanLogistikMaterial\": " << logOut.str() << ",\n"
              << "  \"executionTimeMicros\": " << execTimeUs << ",\n"
              << "  \"computationalComplexity\": \"O(N*M) Ultra-Fast Native CPU\"\n"
              << "}\n";

    return 0;
}
