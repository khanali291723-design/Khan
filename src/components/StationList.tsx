import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  ExternalLink,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AqiStation } from '../types';
import { getAqiCategory, getAqiColor, OFFICIAL_AQI_CATEGORIES } from '../utils/aqiUtils';

interface StationListProps {
  stations: AqiStation[];
  onSelectStation: (station: AqiStation) => void;
  onLocateOnMap: (station: AqiStation) => void;
}

type SortField = 'aqi' | 'pm25' | 'pm10' | 'temperature' | 'name';

export const StationList: React.FC<StationListProps> = ({
  stations,
  onSelectStation,
  onLocateOnMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortField>('aqi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      if (s.district) set.add(s.district);
      if (s.city) set.add(s.city);
    });
    return Array.from(set).sort();
  }, [stations]);

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    return stations
      .filter(station => {
        // Search filter
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          station.station_name.toLowerCase().includes(term) ||
          (station.district && station.district.toLowerCase().includes(term)) ||
          (station.city && station.city.toLowerCase().includes(term));
        if (!matchesSearch) return false;

        // District filter
        if (districtFilter !== 'all') {
          const matchDist = station.district?.toLowerCase() === districtFilter.toLowerCase() ||
                            station.city?.toLowerCase() === districtFilter.toLowerCase();
          if (!matchDist) return false;
        }

        // Category filter
        if (categoryFilter !== 'all') {
          const cat = getAqiCategory(station.aqi);
          if (cat.range !== categoryFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === 'aqi') {
          valA = a.aqi || 0;
          valB = b.aqi || 0;
        } else if (sortBy === 'pm25') {
          valA = Number(a.pm25) || 0;
          valB = Number(b.pm25) || 0;
        } else if (sortBy === 'pm10') {
          valA = Number(a.pm10) || 0;
          valB = Number(b.pm10) || 0;
        } else if (sortBy === 'temperature') {
          valA = Number(a.temperature) || 0;
          valB = Number(b.temperature) || 0;
        } else if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? a.station_name.localeCompare(b.station_name)
            : b.station_name.localeCompare(a.station_name);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [stations, searchTerm, districtFilter, categoryFilter, sortBy, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-white space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, district, or city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* District & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Districts ({stations.length})</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Sort Buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => toggleSort('aqi')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  sortBy === 'aqi' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                AQI {sortBy === 'aqi' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('pm25')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  sortBy === 'pm25' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                PM2.5 {sortBy === 'pm25' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('name')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  sortBy === 'name' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium pr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Tier:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Tiers
          </button>
          {OFFICIAL_AQI_CATEGORIES.map(cat => (
            <button
              key={cat.range}
              onClick={() => setCategoryFilter(cat.range)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.range
                  ? 'ring-2 ring-white font-bold'
                  : 'opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
            >
              {cat.health_index} ({cat.range})
            </button>
          ))}
        </div>
      </div>

      {/* Stations Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="text-white font-bold">{filteredStations.length}</span> of {stations.length} official Punjab monitoring stations
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map(station => {
          const aqiVal = station.aqi || 0;
          const aqiColor = getAqiColor(aqiVal);
          const category = getAqiCategory(aqiVal);

          return (
            <div
              key={station.station_name}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-200 hover:shadow-2xl flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: District & Station Name */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {station.district || station.city || 'Punjab'}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5 line-clamp-1">
                      {station.station_name}
                    </h3>
                  </div>

                  {/* AQI Pill */}
                  <div
                    className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl font-black text-white shadow-md min-w-[56px] text-center"
                    style={{ backgroundColor: aqiColor }}
                  >
                    <span className="text-lg leading-none">{aqiVal}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">AQI</span>
                  </div>
                </div>

                {/* Health Status Category */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${aqiColor}20`, color: aqiColor }}
                  >
                    {category.health_index}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Dominant: <b className="text-slate-200 uppercase">{station.major_pollutant || 'PM2.5'}</b>
                  </span>
                </div>

                {/* Micro Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-800/60 rounded-lg p-1.5">
                    <span className="text-[10px] text-slate-400 block">PM2.5</span>
                    <span className="text-xs font-bold text-white">{station.pm25 ?? 'N/A'}</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-1.5">
                    <span className="text-[10px] text-slate-400 block">PM10</span>
                    <span className="text-xs font-bold text-white">{station.pm10 ?? 'N/A'}</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-1.5">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="text-xs font-bold text-white">{station.temperature ? `${station.temperature}°C` : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-1.5">
                    <span className="text-[10px] text-slate-400 block">Wind</span>
                    <span className="text-xs font-bold text-white">{station.wind_speed ? `${station.wind_speed} m/s` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectStation(station)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Inspect Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onLocateOnMap(station)}
                  className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                  title="Locate on Web GIS Map"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No stations match your filters</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or reset your district / category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDistrictFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
