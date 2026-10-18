export interface ForecastPoint {
  date: string;
  predictedValue: number;
  lowerBound?: number;
  upperBound?: number;
  confidenceInterval?: number;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

export interface ForecastPoint {
  date: string;
  predictedValue: number;
  lowerBound?: number;
  upperBound?: number;
  confidenceInterval?: number;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

export interface ForecastResponse {
  metric: string;
  period: string;
  unit?: string;
  metricLabel?: string;
  category?: string;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  metadata?: {
    modelUsed?: string;
    meanAbsoluteError?: number;
    generatedAt?: string;
  };
}

export interface ForecastFilterParams {
  metric: 'budget' | 'depreciation' | 'refresh' | 'obsolescence' | 'energy' | string;
  period: '7d' | '30d' | '90d' | '180d' | '365d' | 'custom' | string;
  category?: string;
  productId?: number;
}
