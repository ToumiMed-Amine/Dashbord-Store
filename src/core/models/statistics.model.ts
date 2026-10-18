export interface MetricValue {
  value: number;
}

export interface DashboardKPIs {
  totalProducts: number;
  totalUsers: number;
  totalCarts: number;
  totalCategories: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalInventoryValue?: number;
  productGrowthRate?: number;
}

export interface CategoryStatistic {
  category: string;
  productCount: number;
  percentage: number;
  averagePrice: number;
  totalValue: number;
  totalStockValuation?: number;
}

export interface PriceDistributionBucket {
  range: string;
  count: number;
  percentage: number;
  min: number;
  max: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  averagePrice: number;
  totalVolume: number;
}

export interface AdvancedStatistics {
  totalInventoryValue: number;
  catalogBasePriceSum?: number;
  averageCartValue: number;
  averageItemsPerCart: number;
  medianPrice: number;
  stdDevPrice: number;
  minPrice: number;
  maxPrice: number;
  categories: CategoryStatistic[];
}
