import React from 'react';
import { 
  AlertTriangle, 
  Wind, 
  CheckCircle2, 
  Radio, 
  Layers
} from 'lucide-react';
import { AqiStation } from '../types';
import { getAqiCategory, getAqiColor, OFFICIAL_AQI_CATEGORIES } from '../utils/aqiUtils';

interface StatsBarProps {
  stations: AqiStation[];
  onFilterByCategory?: (categoryRange: string) => void;
  selectedCategoryFilter?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stations,
  onFilterByCategory,
  selectedCategoryFilter
}) => {
  if (!stations || stations.length === 0) return null;

  // Calculate metrics
  const validAqiStations = stations.filter(s => typeof s.aqi === 'number' && !isNaN(s.aqi) && s.aqi > 0);
  const totalAqi = validAqiStations.reduce((sum, s) => sum + s.aqi, 0);
  const avgAqi = validAqiStations.length > 0 ? Math.round(totalAqi / validAqiStations.length) : 0;
  const avgCategory = getAqiCategory(avgAqi);

  // Highest and lowest stations
  const sorted = [...validAqiStations].sort((a, b) => b.aqi - a.aqi);
  const highestStation = sorted[0];
  const lowestStation = sorted[sorted.length - 1];

  // Category counts
  const categoryCounts = OFFICIAL_AQI_CATEGORIES.map(cat => {
    const count = validAqiStations.filter(s => s.aqi >= cat.min && s.aqi <= cat.max).length;
    return {
      ...cat,
      count,
      pct: validAqiStations.length > 0 ? ((count / validAqiStations.length) * 100).toFixed(0) : '0'
    };
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 text-white">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Average Provincial AQI */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                Punjab Avg AQI
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black" style={{ color: avgCategory.color }}>
                  {avgAqi}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${avgCategory.color}25`, color: avgCategory.color }}>
                  {avgCategory.health_index}
                </span>
              </div>
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" 
              style={{ backgroundColor: `${avgCategory.color}20`, border: `2px solid ${avgCategory.color}` }}
            >
              EPA
            </div>
          </div>

          {/* Highest / Hotspot Station */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Highest Hotspot
            </span>
            {highestStation ? (
              <div className="mt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-rose-400">
                    {highestStation.aqi}
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate max-w-[130px]" title={highestStation.station_name}>
                    {highestStation.district || highestStation.city || 'Punjab'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={highestStation.station_name}>
                  {highestStation.station_name}
                </p>
              </div>
            ) : (
              <span className="text-xs text-slate-400 mt-1 block">N/A</span>
            )}
          </div>

          {/* Cleanest / Lowest Station */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Cleanest Station
            </span>
            {lowestStation ? (
              <div className="mt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    {lowestStation.aqi}
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate max-w-[130px]" title={lowestStation.station_name}>
                    {lowestStation.district || lowestStation.city || 'Punjab'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={lowestStation.station_name}>
                  {lowestStation.station_name}
                </p>
              </div>
            ) : (
              <span className="text-xs text-slate-400 mt-1 block">N/A</span>
            )}
          </div>

          {/* Active EPA Monitoring Network */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Active EPA Sensors
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400">
                  {stations.length}
                </span>
                <span className="text-xs text-slate-400">Online Stations</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Category Distribution Bar */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span>Provincial Air Quality Tiers</span>
              {selectedCategoryFilter && (
                <button
                  onClick={() => onFilterByCategory?.('all')}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  (Reset filter: {selectedCategoryFilter})
                </button>
              )}
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Click any tier to filter stations on map & directory
            </span>
          </div>

          {/* Stacked bar segments */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
            {categoryCounts.map(cat => (
              <div
                key={cat.range}
                style={{
                  width: `${cat.pct}%`,
                  backgroundColor: cat.color
                }}
                className="h-full transition-all duration-300 hover:opacity-80 cursor-pointer relative group"
                title={`${cat.health_index} (${cat.range}): ${cat.count} stations (${cat.pct}%)`}
                onClick={() => onFilterByCategory?.(cat.range)}
              />
            ))}
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-2 text-[11px]">
            {categoryCounts.map(cat => (
              <button
                key={cat.range}
                onClick={() => onFilterByCategory?.(cat.range)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  selectedCategoryFilter === cat.range
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 font-bold'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.health_index}</span>
                <span className="font-semibold px-1 rounded bg-black/30 text-white text-[10px]">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
