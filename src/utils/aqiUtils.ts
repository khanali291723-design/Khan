import { AqiCategory } from '../types';

export const OFFICIAL_AQI_CATEGORIES: AqiCategory[] = [
  {
    range: '0-50',
    min: 0,
    max: 50,
    color: '#248606',
    health_index: 'Good',
    health_advisory: 'Air quality is satisfactory and poses little or no health risk. Ideal conditions for all outdoor activities including sports and exercise. Natural ventilation is safe.',
    recommendation: 'Enjoy normal outdoor activities and sports. No mask or protection required.'
  },
  {
    range: '51-100',
    min: 51,
    max: 100,
    color: '#44E508',
    health_index: 'Satisfactory',
    health_advisory: 'Air quality is acceptable for most people. Unusually sensitive individuals may experience minor respiratory symptoms upon prolonged exposure.',
    recommendation: 'Proceed with outdoor activities. Sensitive individuals should monitor respiratory health.'
  },
  {
    range: '101-150',
    min: 101,
    max: 150,
    color: '#E9CF3C',
    health_index: 'Moderate',
    health_advisory: 'Members of sensitive groups may experience health effects. General public is less likely to be affected immediately.',
    recommendation: 'Sensitive individuals (asthma, children, elderly) should limit prolonged outdoor exertion.'
  },
  {
    range: '151-200',
    min: 151,
    max: 200,
    color: '#C98800',
    health_index: 'Unhealthy for Sensitive Groups',
    health_advisory: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    recommendation: 'Wear face masks outdoors. Sensitive individuals should stay indoors and keep windows closed.'
  },
  {
    range: '201-300',
    min: 201,
    max: 300,
    color: '#EA0A08',
    health_index: 'Unhealthy',
    health_advisory: 'Health alert: The risk of health effects is increased for everyone. Increased aggravation of heart or lung disease.',
    recommendation: 'Avoid prolonged outdoor exertion. Wear N95 masks when outside. Run indoor air purifiers.'
  },
  {
    range: '301-400',
    min: 301,
    max: 400,
    color: '#9008DC',
    health_index: 'Very Unhealthy',
    health_advisory: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
    recommendation: 'Avoid all outdoor physical activity. Keep children and elderly strictly indoors. Seal doors and windows.'
  },
  {
    range: '401+',
    min: 401,
    max: 9999,
    color: '#910003',
    health_index: 'Hazardous',
    health_advisory: 'Emergency health warning. Everyone is at severe risk of respiratory and cardiovascular impairment.',
    recommendation: 'Remain indoors with air filtration. Wear certified respirators if egress is mandatory.'
  }
];

export function getAqiCategory(aqi: number): AqiCategory {
  const rounded = Math.round(aqi || 0);
  for (const cat of OFFICIAL_AQI_CATEGORIES) {
    if (rounded >= cat.min && rounded <= cat.max) {
      return cat;
    }
  }
  return OFFICIAL_AQI_CATEGORIES[OFFICIAL_AQI_CATEGORIES.length - 1];
}

export function getAqiColor(aqi: number): string {
  return getAqiCategory(aqi).color;
}

export function getAqiBadgeClasses(aqi: number): { bg: string; text: string; border: string } {
  if (aqi <= 50) {
    return { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30' };
  }
  if (aqi <= 100) {
    return { bg: 'bg-lime-500/15', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-500/30' };
  }
  if (aqi <= 150) {
    return { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30' };
  }
  if (aqi <= 200) {
    return { bg: 'bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/30' };
  }
  if (aqi <= 300) {
    return { bg: 'bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30' };
  }
  if (aqi <= 400) {
    return { bg: 'bg-purple-500/15', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/30' };
  }
  return { bg: 'bg-red-950/40', text: 'text-red-400 dark:text-red-300', border: 'border-red-800' };
}

export function getPollutantSafeLimit(pollutant: string): { limit: number; unit: string } {
  switch (pollutant.toUpperCase()) {
    case 'PM25':
    case 'PM2.5':
      return { limit: 35, unit: 'µg/m³' };
    case 'PM10':
      return { limit: 150, unit: 'µg/m³' };
    case 'NO2':
      return { limit: 80, unit: 'µg/m³' };
    case 'SO2':
      return { limit: 120, unit: 'µg/m³' };
    case 'O3':
      return { limit: 130, unit: 'µg/m³' };
    case 'CO':
      return { limit: 5, unit: 'mg/m³' };
    default:
      return { limit: 100, unit: '' };
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recent';
  }
}
