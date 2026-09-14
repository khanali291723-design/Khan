import React from 'react';
import { 
  X, 
  MapPin, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar,
  Crosshair
} from 'lucide-react';
import { AqiStation } from '../types';
import { getAqiCategory, getAqiColor, getPollutantSafeLimit } from '../utils/aqiUtils';

interface StationDetailModalProps {
  station: AqiStation | null;
  onClose: () => void;
  onFocusMap?: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onFocusMap
}) => {
  if (!station) return null;

  const aqiVal = station.aqi || 0;
  const aqiColor = getAqiColor(aqiVal);
  const category = getAqiCategory(aqiVal);

  const pollutants = [
    { key: 'PM2.5', label: 'PM2.5 (Fine Particles)', value: station.pm25, unit: 'µg/m³', benchmark: 35 },
    { key: 'PM10', label: 'PM10 (Inhalable Particles)', value: station.pm10, unit: 'µg/m³', benchmark: 150 },
    { key: 'SO2', label: 'SO2 (Sulfur Dioxide)', value: station.so2, unit: 'ppb', benchmark: 120 },
    { key: 'NO2', label: 'NO2 (Nitrogen Dioxide)', value: station.no2, unit: 'ppb', benchmark: 80 },
    { key: 'O3', label: 'O3 (Ground Ozone)', value: station.o3, unit: 'ppb', benchmark: 130 },
    { key: 'CO', label: 'CO (Carbon Monoxide)', value: station.co, unit: 'ppm', benchmark: 9 },
  ];

  const windDeg = Number(station.wind_direction) || 0;
  const windSpd = Number(station.wind_speed) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EPA STATION #{station.station_id || 'AQMS'}
              </span>
              <span className="text-xs text-slate-400">
                {station.city || station.district} District
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {station.station_name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coordinates: {Number(station.latitude).toFixed(4)}° N, {Number(station.longitude).toFixed(4)}° E</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main AQI Banner & Gauge */}
          <div 
            className="rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
            style={{ 
              backgroundColor: `${aqiColor}12`,
              borderColor: `${aqiColor}40`
            }}
          >
            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div 
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 border-white/20"
                style={{ backgroundColor: aqiColor }}
              >
                <span className="text-3xl tracking-tighter leading-none">{aqiVal}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-90">AQI</span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Air Quality Status
                </span>
                <h3 className="text-xl font-bold" style={{ color: aqiColor }}>
                  {category.health_index}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dominant Pollutant: <span className="font-bold text-white uppercase">{station.major_pollutant || 'PM2.5'}</span>
                </p>
              </div>
            </div>

            {/* Quick Map Locate Action */}
            {onFocusMap && (
              <button
                onClick={() => {
                  onFocusMap();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>Locate on Map</span>
              </button>
            )}
          </div>

          {/* Microclimate Weather Strip */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Microclimate & Ambient Conditions
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Temperature */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Temperature</span>
                  <div className="text-base font-bold text-white">
                    {station.temperature ? `${station.temperature}°C` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Humidity</span>
                  <div className="text-base font-bold text-white">
                    {station.humidity ? `${station.humidity}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Wind Speed & Direction */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold transition-transform"
                  style={{ transform: `rotate(${windDeg}deg)` }}
                >
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Wind</span>
                  <div className="text-base font-bold text-white">
                    {station.wind_speed ? `${station.wind_speed} m/s` : 'Calm'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Pollutants Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Criteria Air Pollutants Concentration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pollutants.map(pol => {
                const valNum = Number(pol.value) || 0;
                const pct = Math.min(100, Math.round((valNum / pol.benchmark) * 100));
                const isExceeded = valNum > pol.benchmark;

                return (
                  <div key={pol.key} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">{pol.label}</span>
                      <span className="font-mono font-bold text-white">
                        {pol.value ?? 'N/A'} <span className="text-[10px] text-slate-400">{pol.unit}</span>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden mt-1.5">
                      <div 
                        className={`h-full rounded-full ${isExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Threshold: {pol.benchmark} {pol.unit}</span>
                      <span className={isExceeded ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                        {isExceeded ? 'Above Standard' : 'Acceptable'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official EPA Health Advisory & Recommendations */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Official EPA Punjab Health Advisory
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {category.health_advisory}
            </p>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Citizen Safety Recommendations
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {category.recommendation}
              </p>
            </div>
          </div>

          {/* 3-Day Forecast if available */}
          {station.weather_forecast && station.weather_forecast.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                3-Day Weather Outlook
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {station.weather_forecast.map((fc, idx) => (
                  <div key={idx} className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 text-center">
                    <div className="text-xs font-bold text-slate-200">{fc.day_name}</div>
                    <div className="text-[11px] text-slate-400">{fc.date}</div>
                    <div className="text-sm font-bold text-white mt-1">
                      {fc.max_temp}° / <span className="text-slate-400 font-normal">{fc.min_temp}°</span>
                    </div>
                    <div className="text-[11px] text-slate-300 capitalize mt-0.5">
                      {fc.weather_condition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Source: Environment Protection Agency (EPA) Punjab</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
