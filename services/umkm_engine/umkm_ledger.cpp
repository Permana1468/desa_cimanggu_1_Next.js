/**
 * Sistem Digitalisasi Desa Cimanggu I - Modul High-Performance Native C++
 * UMKM E-Commerce Precision Pricing, Fee & Anti-Tamper Integrity Engine
 * Aritmetika Integer 64-bit (Bebas Floating-Point Error) + FNV-1a Security Digest
 */

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>
#include <cstdint>
#include <algorithm>
#include <cctype>

struct OrderLine {
    long long unitPrice;
    long long quantity;
};

static std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

static long long extractInt64(const std::string& json, const std::string& key, long long defVal = 0) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return defVal;
    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    std::string numStr;
    while (pos < json.length() && (std::isdigit(static_cast<unsigned char>(json[pos])) || json[pos] == '-')) {
        numStr.push_back(json[pos]);
        pos++;
    }
    if (numStr.empty() || numStr == "-") return defVal;
    try {
        return std::stoll(numStr);
    } catch (...) {
        return defVal;
    }
}

static std::string extractString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos += search.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    if (pos < json.length() && json[pos] == '"') {
        pos++;
        size_t end = json.find('"', pos);
        if (end != std::string::npos) {
            return json.substr(pos, end - pos);
        }
    }
    return "";
}

static std::vector<OrderLine> extractItems(const std::string& json) {
    std::vector<OrderLine> lines;
    size_t itemsPos = json.find("\"items\"");
    if (itemsPos == std::string::npos) return lines;
    size_t arrStart = json.find('[', itemsPos);
    size_t arrEnd = json.find(']', arrStart);
    if (arrStart == std::string::npos || arrEnd == std::string::npos) return lines;

    std::string arrContent = json.substr(arrStart + 1, arrEnd - arrStart - 1);
    size_t cur = 0;
    while (cur < arrContent.length()) {
        size_t objStart = arrContent.find('{', cur);
        if (objStart == std::string::npos) break;
        size_t objEnd = arrContent.find('}', objStart);
        if (objEnd == std::string::npos) break;
        std::string obj = arrContent.substr(objStart, objEnd - objStart + 1);

        OrderLine line;
        line.unitPrice = std::max(0LL, extractInt64(obj, "unitPrice", 0));
        line.quantity = std::max(0LL, extractInt64(obj, "quantity", 0));
        if (line.quantity > 0) {
            lines.push_back(line);
        }
        cur = objEnd + 1;
    }
    return lines;
}

// 64-bit FNV-1a integrity digest salted with invoice/method/grandTotal
static std::string computeIntegrityHash(const std::string& payload) {
    const uint64_t FNV_OFFSET = 14695981039346656037ULL;
    const uint64_t FNV_PRIME = 1099511628211ULL;
    uint64_t h1 = FNV_OFFSET;
    uint64_t h2 = FNV_OFFSET ^ 0x9e3779b97f4a7c15ULL;

    for (unsigned char c : payload) {
        h1 ^= c;
        h1 *= FNV_PRIME;
        h2 = (h2 * FNV_PRIME) ^ (static_cast<uint64_t>(c) + 0x517cc1b727220a95ULL);
    }

    std::ostringstream oss;
    oss << std::hex << std::uppercase << std::setfill('0')
        << std::setw(16) << h1 << std::setw(16) << h2;
    return oss.str();
}

int main(int argc, char* argv[]) {
    std::string inputJson;
    if (argc > 1) {
        inputJson = argv[1];
    } else {
        std::ostringstream ss;
        ss << std::cin.rdbuf();
        inputJson = ss.str();
    }

    inputJson = trim(inputJson);
    if (inputJson.empty()) {
        std::cerr << "Empty payload" << std::endl;
        return 1;
    }

    std::string paymentMethod = extractString(inputJson, "paymentMethod");
    std::string shippingMethod = extractString(inputJson, "shippingMethod");
    std::string invoiceSeed = extractString(inputJson, "invoiceSeed");
    long long voucherDiscount = std::max(0LL, extractInt64(inputJson, "discount", 0));

    std::vector<OrderLine> items = extractItems(inputJson);
    long long subtotal = 0;
    long long totalQty = 0;
    for (const auto& item : items) {
        subtotal += (item.unitPrice * item.quantity);
        totalQty += item.quantity;
    }

    // Shipping calculation (Integer Rupiah exact):
    // - PICKUP / BUMDES: Rp 0
    // - KURIR_DESA: Gratis ongkir untuk belanja >= Rp 100.000, selain itu Rp 5.000
    long long shippingFee = 0;
    if (shippingMethod == "KURIR_DESA" && subtotal > 0 && subtotal < 100000) {
        shippingFee = 5000;
    }

    // Discount capped at subtotal
    long long appliedDiscount = std::min(subtotal, voucherDiscount);
    long long netGoods = subtotal - appliedDiscount;

    // Payment channel fee calculation (Integer Rupiah exact):
    // - QRIS: 0.7% rounded up to nearest Rp 100 (capped min 0) -> (base * 7) / 1000
    // - BANK_VA: Rp 4.000 flat
    // - COD / TUNAI_BUMDES: Rp 0
    long long adminFee = 0;
    long long taxableBase = netGoods + shippingFee;
    if (paymentMethod == "QRIS" && taxableBase > 0) {
        adminFee = (taxableBase * 7 + 999) / 1000;
    } else if (paymentMethod == "BANK_VA" && taxableBase > 0) {
        adminFee = 4000;
    }

    long long grandTotal = netGoods + shippingFee + adminFee;

    // Platform/BUMDes ecosystem fee (1% for analytics transparency, borne cleanly)
    long long bumdesContribution = (netGoods * 1) / 100;
    long long sellerNet = std::max(0LL, netGoods - bumdesContribution);

    std::ostringstream signPayload;
    signPayload << invoiceSeed << "|" << paymentMethod << "|" << shippingMethod
                << "|" << subtotal << "|" << shippingFee << "|" << adminFee
                << "|" << appliedDiscount << "|" << grandTotal;
    std::string integrityHash = computeIntegrityHash(signPayload.str());

    std::cout << "{"
              << "\"totalQty\":" << totalQty << ","
              << "\"subtotal\":" << subtotal << ","
              << "\"discount\":" << appliedDiscount << ","
              << "\"shippingFee\":" << shippingFee << ","
              << "\"adminFee\":" << adminFee << ","
              << "\"grandTotal\":" << grandTotal << ","
              << "\"bumdesContribution\":" << bumdesContribution << ","
              << "\"sellerNet\":" << sellerNet << ","
              << "\"integrityHash\":\"" << integrityHash << "\""
              << "}" << std::endl;

    return 0;
}

