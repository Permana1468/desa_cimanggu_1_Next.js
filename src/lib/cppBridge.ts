import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoSpatialResult {
  engine: string;
  statusSuccess: boolean;
  totalVertex: number;
  areaSquareMeters: number;
  areaHectares: number;
  perimeterMeters: number;
  perimeterKilometers: number;
  centroid: GeoPoint;
  testPointInside?: boolean;
  computationalComplexity: string;
  executionMode?: "CPP_NATIVE" | "TYPESCRIPT_FALLBACK";
}

/**
 * Pure TypeScript fallback calculation for Geodesic Spatial metrics
 * (Guarantees zero downtime even if C++ binary is missing or non-executable)
 */
function getTsGeoFallback(points: GeoPoint[], testPoint?: GeoPoint): GeoSpatialResult {
  const EARTH_RADIUS = 6378137.0;
  const toRad = (deg: number) => (deg * Math.PI) / 180.0;

  const n = points.length;
  if (n < 3) {
    return {
      engine: "TypeScript Geodesic Fallback",
      statusSuccess: false,
      totalVertex: n,
      areaSquareMeters: 0,
      areaHectares: 0,
      perimeterMeters: 0,
      perimeterKilometers: 0,
      centroid: { lat: 0, lng: 0 },
      testPointInside: false,
      computationalComplexity: "O(N) Fallback",
      executionMode: "TYPESCRIPT_FALLBACK",
    };
  }

  // Centroid
  let sumLat = 0;
  let sumLng = 0;
  for (const p of points) {
    sumLat += p.lat;
    sumLng += p.lng;
  }
  const centroid: GeoPoint = {
    lat: Number((sumLat / n).toFixed(6)),
    lng: Number((sumLng / n).toFixed(6)),
  };

  // Perimeter (Haversine)
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += EARTH_RADIUS * c;
  }

  // Spherical Area (Shoelace on sphere)
  let areaTotal = 0;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const dLng = toRad(p2.lng - p1.lng);
    areaTotal += dLng * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  const areaSqM = Math.abs((areaTotal * EARTH_RADIUS * EARTH_RADIUS) / 2.0);

  // Ray casting test point inside
  let inside = false;
  if (testPoint) {
    for (let i = 0, j = n - 1; i < n; j = i++) {
      if (
        points[i].lat > testPoint.lat !== points[j].lat > testPoint.lat &&
        testPoint.lng <
          ((points[j].lng - points[i].lng) * (testPoint.lat - points[i].lat)) /
            (points[j].lat - points[i].lat) +
            points[i].lng
      ) {
        inside = !inside;
      }
    }
  }

  return {
    engine: "TypeScript Geodesic Fallback",
    statusSuccess: true,
    totalVertex: n,
    areaSquareMeters: Number(areaSqM.toFixed(2)),
    areaHectares: Number((areaSqM / 10000.0).toFixed(4)),
    perimeterMeters: Number(perimeter.toFixed(2)),
    perimeterKilometers: Number((perimeter / 1000.0).toFixed(3)),
    centroid,
    testPointInside: inside,
    computationalComplexity: "O(N) TypeScript Safe Mode",
    executionMode: "TYPESCRIPT_FALLBACK",
  };
}

/**
 * Execute Native C++ Geodesic Spatial Core with Safe TypeScript Fallback
 */
export async function executeCppGeoEngine(
  inputCoords: Array<GeoPoint | [number, number]>,
  testPoint?: GeoPoint
): Promise<GeoSpatialResult> {
  // Normalize points
  const normalizedPoints: GeoPoint[] = inputCoords.map((c) => {
    if (Array.isArray(c)) {
      // detect if lat/lng or lng/lat
      if (Math.abs(c[0]) <= 90 && Math.abs(c[1]) <= 180) {
        return { lat: c[0], lng: c[1] };
      }
      return { lat: c[1], lng: c[0] };
    }
    return c;
  });

  const binPath = path.join(process.cwd(), "services", "cpp_geo", "bin", "geo_engine");

  // Check if binary exists and is executable
  if (!fs.existsSync(binPath)) {
    return getTsGeoFallback(normalizedPoints, testPoint);
  }

  return new Promise((resolve) => {
    try {
      const coordString = JSON.stringify(
        normalizedPoints.map((p) => [p.lat, p.lng])
      );

      const cppProcess = spawn(binPath, [coordString], {
        timeout: 3000,
      });

      let stdoutData = "";
      let stderrData = "";

      cppProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      cppProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      cppProcess.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData);
            resolve({
              ...parsed,
              executionMode: "CPP_NATIVE",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse C++ geo_engine output:", err);
          }
        } else {
          console.warn("C++ geo_engine exited with error:", stderrData);
        }
        resolve(getTsGeoFallback(normalizedPoints, testPoint));
      });

      cppProcess.on("error", (err) => {
        console.warn("C++ geo_engine spawn error:", err.message);
        resolve(getTsGeoFallback(normalizedPoints, testPoint));
      });
    } catch (e) {
      console.warn("Exception during C++ geo_engine dispatch:", e);
      resolve(getTsGeoFallback(normalizedPoints, testPoint));
    }
  });
}

