import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HeartHandshake, 
  PhoneCall, 
  ExternalLink,
  CheckCircle2,
  Info
} from 'lucide-react';
import { OFFICIAL_AQI_CATEGORIES } from '../utils/aqiUtils';

interface AqiScaleModalProps {
  onSelectRange?: (range: string) => void;
}

export const AqiScaleModal: React.FC<AqiScaleModalProps> = ({ onSelectRange }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-white space-y-8">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Government Standard
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Punjab EPA Air Quality Index (AQI) Guidelines
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The Environment Protection & Climate Change Department (EP&CCD) Punjab monitors ambient air pollution across 56+ state-of-the-art automatic stations. Use this index to understand exposure risks and take preventive measures.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>EPA Punjab Helpline: <b>1373</b></span>
            </div>
            <a 
              href="https://aqi.punjab.gov.pk" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              <span>Official Portal (aqi.punjab.gov.pk)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 7 Official AQI Tiers Table & Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-400" />
          The 7 Air Quality Health Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_AQI_CATEGORIES.map(cat => (
            <div
              key={cat.range}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1.5"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      {cat.health_index}
                    </span>
                    <h4 className="text-xl font-black text-white">
                      AQI Range: <span style={{ color: cat.color }}>{cat.range}</span>
                    </h4>
                  </div>

                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                    style={{ backgroundColor: cat.color, color: '#fff' }}
                  >
                    Tier
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Health Advisory:
                    </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed whitespace-pre-line">
                      {cat.health_advisory}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                      Citizen Action:
                    </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed whitespace-pre-line">
                      {cat.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {onSelectRange && (
                <button
                  onClick={() => onSelectRange(cat.range)}
                  className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Filter stations in this range</span>
                  <span>→</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Air Pollutants Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Primary Pollutants Monitored by Punjab EPA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <h4 className="font-bold text-emerald-400 text-sm">PM2.5 (Fine Particulates)</h4>
            <p className="text-slate-300 mt-1">Particles &lt; 2.5 micrometers that penetrate deep into lungs and bloodstream. Primary driver of smog in Punjab winter.</p>
            <div className="mt-2 text-slate-400">Safe Guideline: <b>35 µg/m³</b></div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <h4 className="font-bold text-sky-400 text-sm">PM10 (Coarse Particulates)</h4>
            <p className="text-slate-300 mt-1">Dust, pollen, and combustion residue causing upper respiratory irritation, coughing, and reduced lung function.</p>
            <div className="mt-2 text-slate-400">Safe Guideline: <b>150 µg/m³</b></div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
            <h4 className="font-bold text-amber-400 text-sm">SO2 & NO2 (Gases)</h4>
            <p className="text-slate-300 mt-1">Combustion byproducts from vehicular traffic, brick kilns, and industrial furnaces triggering bronchospasms.</p>
            <div className="mt-2 text-slate-400">Safe Guideline: <b>80–120 ppb</b></div>
          </div>
        </div>
      </div>
    </div>
  );
};
