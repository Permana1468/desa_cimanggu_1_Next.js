import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface SurveyPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteOptimizationResult {
  engine: string;
  statusSuccess: boolean;
  totalPoints: number;
  totalDistanceMeters: number;
  totalDistanceKilometers: number;
  estimatedSurveyMinutes: number;
  computationalComplexity: string;
  optimalRoute: Array<{
    step: number;
    id: string;
    name: string;
    lat: number;
    lng: number;
  }>;
  executionMode?: "CPP_NATIVE" | "TYPESCRIPT_FALLBACK";
}

/**
 * Pure TypeScript fallback calculation for TSP Nearest Neighbor
 * (Guarantees zero-downtime if C++ binary is missing or running on serverless)
 */
function getTsRouteFallback(
  points: SurveyPoint[],
  startPoint?: SurveyPoint
): RouteOptimizationResult {
  const EARTH_RADIUS = 6378137.0;
  const toRad = (deg: number) => (deg * Math.PI) / 180.0;

  const haversine = (p1: SurveyPoint, p2: SurveyPoint) => {
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const start: SurveyPoint = startPoint || {
    id: "START",
    name: "Kantor Desa Cimanggu I",
    lat: -6.6267,
    lng: 106.6713,
  };

  const allPoints: SurveyPoint[] = [start, ...points.filter((p) => p.id !== start.id)];
  const n = allPoints.length;

  if (n <= 2) {
    return {
      engine: "TypeScript Route Fallback",
      statusSuccess: true,
      totalPoints: n,
      totalDistanceMeters: 0,
      totalDistanceKilometers: 0,
      estimatedSurveyMinutes: 15,
      computationalComplexity: "O(1) Fallback",
      optimalRoute: allPoints.map((p, idx) => ({ step: idx + 1, ...p })),
      executionMode: "TYPESCRIPT_FALLBACK",
    };
  }

  // Nearest Neighbor tour
  const visited = new Array(n).fill(false);
  const tour: number[] = [0];
  visited[0] = true;

  let current = 0;
  for (let step = 1; step < n; step++) {
    let nextIdx = -1;
    let minDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const d = haversine(allPoints[current], allPoints[j]);
        if (d < minDist) {
          minDist = d;
          nextIdx = j;
        }
      }
    }
    if (nextIdx !== -1) {
      visited[nextIdx] = true;
      tour.push(nextIdx);
      current = nextIdx;
    }
  }
  // Return to start
  tour.push(0);

  let totalMeters = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    totalMeters += haversine(allPoints[tour[i]], allPoints[tour[i + 1]]);
  }

  const optimalRoute = tour.map((idx, step) => ({
    step: step + 1,
    id: allPoints[idx].id,
    name: allPoints[idx].name,
    lat: allPoints[idx].lat,
    lng: allPoints[idx].lng,
  }));

  return {
    engine: "TypeScript Route Fallback",
    statusSuccess: true,
    totalPoints: tour.length - 1,
    totalDistanceMeters: Math.round(totalMeters * 100) / 100,
    totalDistanceKilometers: Math.round((totalMeters / 1000) * 1000) / 1000,
    estimatedSurveyMinutes: Math.round((totalMeters / 1000) * 12 + (tour.length - 2) * 10),
    computationalComplexity: "O(N^2) TypeScript Fallback",
    optimalRoute,
    executionMode: "TYPESCRIPT_FALLBACK",
  };
}

/**
 * Execute Native C++ Route Optimizer Engine with Safe TypeScript Fallback
 */
export async function executeCppRouteOptimizer(
  points: SurveyPoint[],
  startPoint?: SurveyPoint
): Promise<RouteOptimizationResult> {
  const binPath = path.join(process.cwd(), "services", "cpp_geo", "bin", "route_optimizer");

  if (!fs.existsSync(binPath)) {
    return getTsRouteFallback(points, startPoint);
  }

  return new Promise((resolve) => {
    try {
      const payloadString = JSON.stringify(points);
      const cppProcess = spawn(binPath, [payloadString], {
        timeout: 4000,
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
            const parsed = JSON.parse(stdoutData.trim());
            resolve({
              ...parsed,
              executionMode: "CPP_NATIVE",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse C++ route output, using fallback:", err);
          }
        }
        resolve(getTsRouteFallback(points, startPoint));
      });

      cppProcess.on("error", (err) => {
        console.warn("C++ route spawn error, using fallback:", err.message);
        resolve(getTsRouteFallback(points, startPoint));
      });
    } catch (e) {
      console.warn("Exception during C++ route dispatch:", e);
      resolve(getTsRouteFallback(points, startPoint));
    }
  });
}

