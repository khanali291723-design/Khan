export interface WeatherForecastItem {
  date: string;
  day_name: string;
  min_temp: string;
  max_temp: string;
  uv_index: string;
  weather_condition: string;
  weather_icon?: string;
}

export interface AqiStation {
  station_id?: number;
  station_name: string;
  district: string;
  city?: string;
  latitude: string | number;
  longitude: string | number;
  aqi: number;
  current_aqi?: number;
  pm25: string | number;
  pm10: string | number;
  no2: string | number;
  so2: string | number;
  o3: string | number;
  co: string | number;
  major_pollutant: string;
  temperature: string | number;
  humidity: string | number;
  wind_speed: string | number;
  wind_direction: string | number;
  timestamp?: string;
  date_time?: string;
  weather_forecast?: WeatherForecastItem[];
}

export type PollutantMetric = 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co' | 'temperature';

export type BasemapType = 'dark' | 'light' | 'osm' | 'satellite';

export interface AqiCategory {
  range: string;
  min: number;
  max: number;
  color: string;
  health_index: string;
  health_advisory: string;
  recommendation: string;
}

export interface HistoricalStats {
  current_aqi: number;
  current_date?: string;
  max_aqi: number;
  max_date?: string;
  min_aqi: number;
  min_date?: string;
  above_standard_count: number;
  total_hours: number;
  above_standard_ratio: number;
}

export interface HourlyTrendPoint {
  datetime: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  station_count?: number;
}
