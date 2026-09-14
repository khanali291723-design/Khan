import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Compass, 
  Wind, 
  Maximize2, 
  RotateCcw, 
  Flame, 
  Eye, 
  MapPin, 
  Sliders,
  Check
} from 'lucide-react';
import { AqiStation, BasemapType, PollutantMetric } from '../types';
import { getAqiColor, getAqiCategory } from '../utils/aqiUtils';

interface AqiMapProps {
  stations: AqiStation[];
  selectedStation: AqiStation | null;
  onSelectStation: (station: AqiStation) => void;
  selectedDistrict: string;
  categoryFilter?: string;
  boundaryGeoJson?: any;
}

// Tile Layer URLs
const BASEMAP_TILES: Record<BasemapType, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  }
};

export const AqiMap: React.FC<AqiMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  selectedDistrict,
  categoryFilter,
  boundaryGeoJson
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const windLayerRef = useRef<L.LayerGroup | null>(null);

  // Map settings state
  const [basemap, setBasemap] = useState<BasemapType>('dark');
  const [activeMetric, setActiveMetric] = useState<PollutantMetric>('aqi');
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showWindVectors, setShowWindVectors] = useState<boolean>(false);
  const [showBasemapMenu, setShowBasemapMenu] = useState<boolean>(false);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center coordinates for Punjab, Pakistan
    const punjabCenter: [number, number] = [31.5204, 73.5];
    const map = L.map(mapContainerRef.current, {
      center: punjabCenter,
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false
    });

    // Custom Zoom control placed in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const initialTile = BASEMAP_TILES[basemap];
    const tileLayer = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: initialTile.maxZoom
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    boundaryLayerRef.current = L.geoJSON(null, {
      style: {
        color: '#10b981',
        weight: 2,
        opacity: 0.85,
        fillColor: '#059669',
        fillOpacity: 0.05,
        dashArray: '4, 6'
      }
    }).addTo(map);

    heatmapLayerRef.current = L.layerGroup().addTo(map);
    windLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = BASEMAP_TILES[basemap];
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [basemap]);

  // Update Punjab Boundary GeoJSON Layer
  useEffect(() => {
    if (!boundaryLayerRef.current || !mapInstanceRef.current) return;
    boundaryLayerRef.current.clearLayers();

    if (showBoundary && boundaryGeoJson) {
      boundaryLayerRef.current.addData(boundaryGeoJson);
    }
  }, [boundaryGeoJson, showBoundary]);

  // Filter stations based on district and category
  const filteredStations = stations.filter(station => {
    // District filter
    if (selectedDistrict && selectedDistrict !== 'all') {
      const matchDistrict = station.district?.toLowerCase().includes(selectedDistrict.toLowerCase());
      const matchCity = station.city?.toLowerCase().includes(selectedDistrict.toLowerCase());
      if (!matchDistrict && !matchCity) return false;
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      const cat = getAqiCategory(station.aqi);
      if (cat.range !== categoryFilter) return false;
    }

    // Valid coordinates
    const lat = Number(station.latitude);
    const lng = Number(station.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  // Render Station Markers & Heatmap & Wind Vectors
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (heatmapLayerRef.current) heatmapLayerRef.current.clearLayers();
    if (windLayerRef.current) windLayerRef.current.clearLayers();

    filteredStations.forEach(station => {
      const lat = Number(station.latitude);
      const lng = Number(station.longitude);
      const aqiVal = station.aqi || 0;
      const aqiColor = getAqiColor(aqiVal);
      const category = getAqiCategory(aqiVal);

      // Determine metric value to display
      let metricDisplay = `${aqiVal}`;
      let metricUnit = 'AQI';
      if (activeMetric === 'pm25') {
        metricDisplay = `${Math.round(Number(station.pm25) || 0)}`;
        metricUnit = 'µg';
      } else if (activeMetric === 'pm10') {
        metricDisplay = `${Math.round(Number(station.pm10) || 0)}`;
        metricUnit = 'µg';
      } else if (activeMetric === 'o3') {
        metricDisplay = `${Math.round(Number(station.o3) || 0)}`;
        metricUnit = 'ppb';
      } else if (activeMetric === 'no2') {
        metricDisplay = `${Math.round(Number(station.no2) || 0)}`;
        metricUnit = 'ppb';
      } else if (activeMetric === 'so2') {
        metricDisplay = `${Math.round(Number(station.so2) || 0)}`;
        metricUnit = 'ppb';
      } else if (activeMetric === 'temperature') {
        metricDisplay = `${Math.round(Number(station.temperature) || 0)}°`;
        metricUnit = 'C';
      }

      const isSelected = selectedStation?.station_name === station.station_name;
      const isSevere = aqiVal > 200;

      // Custom DivIcon HTML
      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          ${isSevere ? `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-60" style="background-color: ${aqiColor};"></div>` : ''}
          ${isSelected ? `<div class="absolute -inset-2 rounded-full ring-2 ring-white ring-offset-2 ring-offset-slate-900"></div>` : ''}
          <div 
            class="flex items-center justify-center font-bold text-white shadow-xl rounded-full border-2 border-white/90 text-xs px-2 py-0.5 whitespace-nowrap min-w-[34px] text-center"
            style="background-color: ${aqiColor}; box-shadow: 0 4px 14px ${aqiColor}66;"
          >
            <span>${metricDisplay}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'aqi-gis-marker',
        iconSize: [36, 24],
        iconAnchor: [18, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Rich Leaflet Tooltip on hover
      const tooltipContent = `
        <div style="font-family: sans-serif; min-width: 170px; padding: 4px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; line-height: 1.2;">${station.station_name}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${station.district || station.city || 'Punjab'}</div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; border-radius: 6px; background-color: ${aqiColor}22; border: 1px solid ${aqiColor}55;">
            <span style="font-size: 11px; font-weight: 600; color: #1e293b;">AQI:</span>
            <span style="font-size: 14px; font-weight: 800; color: ${aqiColor};">${aqiVal}</span>
          </div>

          <div style="margin-top: 5px; font-size: 11px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div>PM2.5: <b>${station.pm25 || 'N/A'}</b></div>
            <div>PM10: <b>${station.pm10 || 'N/A'}</b></div>
            <div>Temp: <b>${station.temperature || 'N/A'}°C</b></div>
            <div>Major: <b>${station.major_pollutant || 'N/A'}</b></div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -12],
        opacity: 0.96,
        className: 'aqi-gis-tooltip shadow-xl rounded-xl border border-slate-200'
      });

      marker.on('click', () => {
        onSelectStation(station);
      });

      marker.addTo(markersLayerRef.current!);

      // GIS Dispersion / Heatmap Circles Layer
      if (showHeatmap && heatmapLayerRef.current) {
        const radiusMeters = Math.min(16000, Math.max(7000, aqiVal * 50));
        const circle = L.circle([lat, lng], {
          radius: radiusMeters,
          color: aqiColor,
          weight: 0,
          fillColor: aqiColor,
          fillOpacity: 0.15,
          interactive: false
        });
        circle.addTo(heatmapLayerRef.current);
      }

      // Wind Vector Arrow Layer
      if (showWindVectors && windLayerRef.current && station.wind_speed && station.wind_direction) {
        const windDeg = Number(station.wind_direction) || 0;
        const windSpd = Number(station.wind_speed) || 0;
        const windIconHtml = `
          <div style="transform: rotate(${windDeg}deg); transform-origin: center; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
        `;
        const windIcon = L.divIcon({
          html: windIconHtml,
          className: 'wind-arrow-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const windMarker = L.marker([lat, lng], { icon: windIcon, interactive: false });
        windMarker.addTo(windLayerRef.current);
      }
    });

  }, [filteredStations, activeMetric, showHeatmap, showWindVectors, selectedStation]);

  // Center/Fly to station when selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    const lat = Number(selectedStation.latitude);
    const lng = Number(selectedStation.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 12, { duration: 1.2 });
    }
  }, [selectedStation]);

  // Fit bounds when district filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || filteredStations.length === 0) return;

    if (selectedDistrict && selectedDistrict !== 'all') {
      const bounds = L.latLngBounds(
        filteredStations.map(s => [Number(s.latitude), Number(s.longitude)])
      );
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
      }
    }
  }, [selectedDistrict]);

  // Reset to full Punjab View
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([31.5204, 73.5], 7, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950 overflow-hidden flex flex-col">
      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Floating Top-Left GIS Metric Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-1.5 border border-slate-700/80 shadow-2xl flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Layer:
          </span>
          {(['aqi', 'pm25', 'pm10', 'temperature', 'so2', 'no2'] as PollutantMetric[]).map(metric => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeMetric === metric
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {metric === 'pm25' ? 'PM 2.5' : metric === 'pm10' ? 'PM 10' : metric}
            </button>
          ))}
        </div>

        {/* Filter Indicator Badge if active */}
        {(selectedDistrict !== 'all' || (categoryFilter && categoryFilter !== 'all')) && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-lg px-3 py-1.5 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Showing: {selectedDistrict !== 'all' ? selectedDistrict : 'All Districts'}</span>
            {categoryFilter && categoryFilter !== 'all' && <span>• Tier: {categoryFilter}</span>}
            <span className="text-slate-400 font-mono">({filteredStations.length} stations)</span>
          </div>
        )}
      </div>

      {/* Floating Top-Right Controls: Basemap, Layers, Center */}
      <div className="absolute top-4 right-14 z-20 flex items-center gap-2">
        {/* Basemap Switcher Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBasemapMenu(!showBasemapMenu);
              setShowLayersMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 hover:bg-slate-800 text-xs font-medium shadow-xl cursor-pointer"
            title="Change Basemap"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline capitalize">{basemap} Map</span>
          </button>

          {showBasemapMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select GIS Basemap
              </div>
              {(['dark', 'light', 'osm', 'satellite'] as BasemapType[]).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setBasemap(type);
                    setShowBasemapMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize text-left cursor-pointer ${
                    basemap === type ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{type === 'osm' ? 'OpenStreetMap' : `${type} GIS`}</span>
                  {basemap === type && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GIS Layers Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayersMenu(!showLayersMenu);
              setShowBasemapMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 hover:bg-slate-800 text-xs font-medium shadow-xl cursor-pointer"
            title="GIS Spatial Layers"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">GIS Layers</span>
          </button>

          {showLayersMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-30 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                GIS Overlays
              </div>
              
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Air Dispersion Heatmap
                </span>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={e => setShowHeatmap(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  Wind Vector Arrows
                </span>
                <input
                  type="checkbox"
                  checked={showWindVectors}
                  onChange={e => setShowWindVectors(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Punjab Provincial Boundary
                </span>
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={e => setShowBoundary(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Reset Punjab Zoom */}
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 hover:bg-slate-800 text-xs shadow-xl cursor-pointer"
          title="Reset View to Full Punjab Province"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>

      {/* Floating Bottom GIS Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:block">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 border border-slate-800 shadow-2xl max-w-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Punjab EPA AQI Legend</span>
            <span>Scale (0 - 500+)</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold">
            <div className="p-1 rounded bg-[#248606] text-white">0-50<br/><span className="text-[9px] font-normal">Good</span></div>
            <div className="p-1 rounded bg-[#44E508] text-slate-900">51-100<br/><span className="text-[9px] font-normal">Sat.</span></div>
            <div className="p-1 rounded bg-[#E9CF3C] text-slate-900">101-150<br/><span className="text-[9px] font-normal">Mod.</span></div>
            <div className="p-1 rounded bg-[#C98800] text-white">151-200<br/><span className="text-[9px] font-normal">Sens.</span></div>
            <div className="p-1 rounded bg-[#EA0A08] text-white">201-300<br/><span className="text-[9px] font-normal">Unh.</span></div>
            <div className="p-1 rounded bg-[#9008DC] text-white">301-400<br/><span className="text-[9px] font-normal">V.Unh.</span></div>
            <div className="p-1 rounded bg-[#910003] text-white">401+<br/><span className="text-[9px] font-normal">Haz.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
