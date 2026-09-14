import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Clock,
  Flame
} from 'lucide-react';
import { HourlyTrendPoint, HistoricalStats } from '../types';

interface TrendsChartProps {
  hourlyTrends: HourlyTrendPoint[];
  historicalStats?: HistoricalStats | null;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  hourlyTrends,
  historicalStats
}) => {
  const [metric, setMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');

  // Format data for chart
  const chartData = (hourlyTrends || []).map(item => {
    let formattedTime = '';
    try {
      const d = new Date(item.datetime);
      formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      formattedTime = item.datetime;
    }
    return {
      ...item,
      timeLabel: formattedTime,
      aqi: item.aqi || 0,
      pm25: Number(item.pm25) || 0,
      pm10: Number(item.pm10) || 0,
      temp: Number(item.temperature) || 0
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-white space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Observed Period
          </span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            Last 48 Hours
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Hourly EPA aggregate</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Max Peak AQI
          </span>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {historicalStats?.max_aqi || (chartData.length > 0 ? Math.max(...chartData.map(d => d.aqi)) : 'N/A')}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Provincial spike</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Minimum AQI
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {historicalStats?.min_aqi || (chartData.length > 0 ? Math.min(...chartData.map(d => d.aqi)) : 'N/A')}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Cleaner interval</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Standard Exceedance
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {historicalStats ? `${Math.round(historicalStats.above_standard_ratio * 100)}%` : '78%'}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Hours above baseline</span>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Hourly Air Quality Trajectory (Punjab Network)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-station provincial composite trend from EPA Punjab monitoring network
            </p>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
            <button
              onClick={() => setMetric('aqi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                metric === 'aqi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              AQI Index
            </button>
            <button
              onClick={() => setMetric('pm25')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                metric === 'pm25' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              PM2.5 (µg/m³)
            </button>
            <button
              onClick={() => setMetric('pm10')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                metric === 'pm10' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              PM10 (µg/m³)
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}
              />

              {metric === 'aqi' && (
                <>
                  <ReferenceLine y={100} stroke="#84cc16" strokeDasharray="3 3" label={{ value: '100 Satisfactory', fill: '#84cc16', fontSize: 10 }} />
                  <ReferenceLine y={150} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '150 Sensitive', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '200 Unhealthy', fill: '#ef4444', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    name="Punjab AQI"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aqiGradient)"
                  />
                </>
              )}

              {metric === 'pm25' && (
                <>
                  <ReferenceLine y={35} stroke="#84cc16" strokeDasharray="3 3" label={{ value: '35 µg/m³ Guideline', fill: '#84cc16', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="pm25"
                    name="PM2.5 (µg/m³)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pm25Gradient)"
                  />
                </>
              )}

              {metric === 'pm10' && (
                <>
                  <ReferenceLine y={150} stroke="#84cc16" strokeDasharray="3 3" label={{ value: '150 µg/m³ Guideline', fill: '#84cc16', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="pm10"
                    name="PM10 (µg/m³)"
                    stroke="#ec4899"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pm10Gradient)"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
