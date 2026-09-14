import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for live AQI data
let cachedLiveStations: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache

// Helper to load fallback stations
function getFallbackStations() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "punjab_stations_fallback.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading fallback stations:", err);
  }
  return [];
}

// Helper to load historical data
function getHistoricalData() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "punjab_historical.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading historical data:", err);
  }
  return null;
}

// Helper to load Punjab boundary GeoJSON
function getPunjabBoundary() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "punjab_boundary.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading Punjab boundary:", err);
  }
  return null;
}

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Live Punjab AQI Stations
app.get("/api/punjab-aqi/live", async (req, res) => {
  const forceRefresh = req.query.force === "true";
  const now = Date.now();

  if (!forceRefresh && cachedLiveStations && now - lastFetchTime < CACHE_TTL_MS) {
    return res.json({
      success: true,
      source: "cache",
      timestamp: new Date(lastFetchTime).toISOString(),
      count: cachedLiveStations.length,
      data: cachedLiveStations
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const upstreamRes = await fetch("https://aqi.punjab.gov.pk/api/all-stations-latest", {
      headers: {
        "Referer": "https://aqi.punjab.gov.pk/",
        "Origin": "https://aqi.punjab.gov.pk",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (upstreamRes.ok) {
      const json: any = await upstreamRes.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        cachedLiveStations = json.data;
        lastFetchTime = now;
        return res.json({
          success: true,
          source: "live",
          timestamp: new Date().toISOString(),
          count: cachedLiveStations.length,
          data: cachedLiveStations
        });
      }
    }
  } catch (fetchErr) {
    console.warn("Upstream live fetch warning:", fetchErr);
  }

  // Fallback if upstream is down or failed
  if (cachedLiveStations) {
    return res.json({
      success: true,
      source: "cached_fallback",
      timestamp: new Date(lastFetchTime).toISOString(),
      count: cachedLiveStations.length,
      data: cachedLiveStations
    });
  }

  const fallback = getFallbackStations();
  return res.json({
    success: true,
    source: "static_fallback",
    timestamp: new Date().toISOString(),
    count: fallback.length,
    data: fallback
  });
});

// API: Historical trends & EPA guidelines
app.get("/api/punjab-aqi/historical", (req, res) => {
  const data = getHistoricalData();
  if (data) {
    res.json({ success: true, data });
  } else {
    res.status(500).json({ success: false, message: "Historical data not available" });
  }
});

// API: Punjab Province Boundary GeoJSON
app.get("/api/punjab-aqi/boundary", (req, res) => {
  const boundary = getPunjabBoundary();
  if (boundary) {
    res.json(boundary);
  } else {
    res.status(404).json({ success: false, message: "Boundary not found" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Punjab AQI GIS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
