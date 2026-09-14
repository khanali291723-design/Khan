import React from 'react';
import { 
  Activity, 
  RefreshCw, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  BarChart3, 
  Map as MapIcon, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { AqiStation } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'stations' | 'trends' | 'standards';
  setActiveTab: (tab: 'map' | 'stations' | 'trends' | 'standards') => void;
  stations: AqiStation[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  districts: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
  dataSource: string;
  onFlyToDistrict: (districtName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedDistrict,
  setSelectedDistrict,
  districts,
  isRefreshing,
  onRefresh,
  lastUpdated,
  dataSource,
  onFlyToDistrict
}) => {
  const quickCities = ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sargodha'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Banner with EPA Punjab branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                PUNJAB <span className="text-emerald-400 font-extrabold">AQI</span> WEB GIS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE EPA FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Environment Protection Agency Punjab • aqi.punjab.gov.pk</span>
            </p>
          </div>
        </div>

        {/* Sync Status & Action */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-slate-400">
              Source: <span className="text-slate-200 font-medium capitalize">{dataSource || 'Official Portal'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {lastUpdated ? `Sync: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Connected'}
            </span>
          </div>

          <button
            id="btn-refresh-live-data"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all text-xs font-medium cursor-pointer disabled:opacity-50"
            title="Refresh live data from aqi.punjab.gov.pk"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'standards'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">AQI Scale</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              id="tab-gis-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive GIS Map</span>
            </button>

            <button
              id="tab-station-directory"
              onClick={() => setActiveTab('stations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'stations'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Stations List</span>
            </button>

            <button
              id="tab-trends-analytics"
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>48h Trends</span>
            </button>
          </div>

          {/* District Quick Zoom Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Zoom:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => onFlyToDistrict('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedDistrict === 'all'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Punjab
              </button>
              {quickCities.map((city) => (
                <button
                  key={city}
                  onClick={() => onFlyToDistrict(city)}
                  className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDistrict.toLowerCase() === city.toLowerCase()
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
