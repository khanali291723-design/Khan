import React, { useEffect, useState, useMemo } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  StatsBar 
} from './components/StatsBar';
import { 
  AqiMap 
} from './components/AqiMap';
import { 
  StationList 
} from './components/StationList';
import { 
  TrendsChart 
} from './components/TrendsChart';
import { 
  AqiScaleModal 
} from './components/AqiScaleModal';
import { 
  StationDetailModal 
} from './components/StationDetailModal';
import { AqiStation, HourlyTrendPoint, HistoricalStats } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<AqiStation[]>([]);
  const [hourlyTrends, setHourlyTrends] = useState<HourlyTrendPoint[]>([]);
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats | null>(null);
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'map' | 'stations' | 'trends' | 'standards'>('map');
  const [selectedStation, setSelectedStation] = useState<AqiStation | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('Official Portal');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch live Punjab stations from our backend API
  const fetchLiveStations = async (force: boolean = false) => {
    try {
      if (force) setIsRefreshing(true);
      const url = force ? '/api/punjab-aqi/live?force=true' : '/api/punjab-aqi/live';
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setStations(json.data);
        setLastUpdated(json.timestamp || new Date().toISOString());
        setDataSource(json.source || 'Live Feed');
        setErrorMsg(null);
      }
    } catch (err: any) {
      console.error('Error fetching Punjab AQI data:', err);
      setErrorMsg('Failed to sync live data. Retrying...');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch historical trends and stats
  const fetchHistoricalData = async () => {
    try {
      const res = await fetch('/api/punjab-aqi/historical');
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.hourly_trends) {
          setHourlyTrends(json.data.hourly_trends);
        }
        if (json.data.stats) {
          setHistoricalStats(json.data.stats);
        }
      }
    } catch (err) {
      console.warn('Error fetching historical trends:', err);
    }
  };

  // Fetch Punjab Province Boundary GeoJSON
  const fetchBoundary = async () => {
    try {
      const res = await fetch('/api/punjab-aqi/boundary');
      if (res.ok) {
        const geo = await res.json();
        setBoundaryGeoJson(geo);
      }
    } catch (err) {
      console.warn('Error fetching boundary GeoJSON:', err);
    }
  };

  // Initial Load & Polling Interval (every 90 seconds)
  useEffect(() => {
    fetchLiveStations();
    fetchHistoricalData();
    fetchBoundary();

    const interval = setInterval(() => {
      fetchLiveStations(false);
    }, 90000);

    return () => clearInterval(interval);
  }, []);

  // Compute unique districts
  const districts = useMemo(() => {
    const dSet = new Set<string>();
    stations.forEach(s => {
      if (s.district) dSet.add(s.district);
      if (s.city) dSet.add(s.city);
    });
    return Array.from(dSet).sort();
  }, [stations]);

  // Handle Quick Fly-to District from Navbar
  const handleFlyToDistrict = (district: string) => {
    setSelectedDistrict(district);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  // Handle Category Filter Click
  const handleFilterByCategory = (range: string) => {
    setCategoryFilter(prev => (prev === range ? 'all' : range));
    if (activeTab === 'standards') {
      setActiveTab('map');
    }
  };

  // Locate station on map
  const handleLocateOnMap = (station: AqiStation) => {
    setSelectedStation(station);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stations={stations}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        districts={districts}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchLiveStations(true)}
        lastUpdated={lastUpdated}
        dataSource={dataSource}
        onFlyToDistrict={handleFlyToDistrict}
      />

      {/* Alert banner if error occurred */}
      {errorMsg && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg} (Using resilient sensor cache)</span>
            <button
              onClick={() => fetchLiveStations(true)}
              className="ml-auto underline font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Provincial Overview Statistics Bar */}
      <StatsBar
        stations={stations}
        onFilterByCategory={handleFilterByCategory}
        selectedCategoryFilter={categoryFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Connecting to Punjab EPA Air Quality Network</h3>
              <p className="text-xs text-slate-400 mt-1">Retrieving 56+ live monitoring station telemetries from aqi.punjab.gov.pk...</p>
            </div>
          </div>
        ) : (
          <>
            {/* View 1: Interactive GIS Map */}
            {activeTab === 'map' && (
              <div className="w-full flex-1 min-h-[580px] relative">
                <AqiMap
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={setSelectedStation}
                  selectedDistrict={selectedDistrict}
                  categoryFilter={categoryFilter}
                  boundaryGeoJson={boundaryGeoJson}
                />
              </div>
            )}

            {/* View 2: Station Directory List */}
            {activeTab === 'stations' && (
              <div className="w-full flex-1">
                <StationList
                  stations={stations}
                  onSelectStation={setSelectedStation}
                  onLocateOnMap={handleLocateOnMap}
                />
              </div>
            )}

            {/* View 3: 48-Hour Historical Trends */}
            {activeTab === 'trends' && (
              <div className="w-full flex-1">
                <TrendsChart
                  hourlyTrends={hourlyTrends}
                  historicalStats={historicalStats}
                />
              </div>
            )}

            {/* View 4: Official EPA AQI Standards & Guidelines */}
            {activeTab === 'standards' && (
              <div className="w-full flex-1">
                <AqiScaleModal
                  onSelectRange={handleFilterByCategory}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Station Details Inspection Modal */}
      {selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onFocusMap={() => handleLocateOnMap(selectedStation)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 px-4 sm:px-6 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Punjab Web GIS Air Quality Monitoring System • Data source: Environment Protection Agency (EPA) Punjab</span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://aqi.punjab.gov.pk" 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              aqi.punjab.gov.pk
            </a>
            <span>•</span>
            <span>Toll-free Helpline: <b>1373</b></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
