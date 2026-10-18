import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricValue, AdvancedStatistics, DashboardKPIs } from '../models/statistics.model';
import { ForecastResponse } from '../models/forecast.model';
import { ChatResponse } from '../models/chat.model';

// Données temporaires pré-chargées pour affichage immédiat et mode secours
export const TEMPORARY_ADVANCED_STATS: AdvancedStatistics = {
  totalInventoryValue: 148920.00,
  catalogBasePriceSum: 43489.00,
  averageCartValue: 4890.50,
  averageItemsPerCart: 3.5,
  medianPrice: 1450.00,
  stdDevPrice: 915.20,
  minPrice: 35.00,
  maxPrice: 7490.00,
  categories: [
    {
      category: 'Laptops & Postes Dev',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 2722.13,
      totalValue: 10888.50,
      totalStockValuation: 39420.00
    },
    {
      category: 'Serveurs & Cloud',
      productCount: 3,
      percentage: 15.0,
      averagePrice: 5446.67,
      totalValue: 16340.00,
      totalStockValuation: 62450.00
    },
    {
      category: 'Réseau & Cybersécurité',
      productCount: 5,
      percentage: 25.0,
      averagePrice: 1240.00,
      totalValue: 6200.00,
      totalStockValuation: 19800.00
    },
    {
      category: 'Stockage & Sauvegarde',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 1120.00,
      totalValue: 4480.00,
      totalStockValuation: 15300.00
    },
    {
      category: 'Écrans & Périphériques Pro',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 595.00,
      totalValue: 2380.00,
      totalStockValuation: 11950.00
    }
  ]
};

export const TEMPORARY_KPIS: DashboardKPIs = {
  totalProducts: 20,
  totalUsers: 6,
  totalCarts: 6,
  totalCategories: 5,
  averagePrice: 2174.45,
  minPrice: 35.00,
  maxPrice: 7490.00,
  totalInventoryValue: 148920.00,
  productGrowthRate: 15.2
};

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);

  // Signaux principaux initialisés avec des données temporaires riches pour affichage immédiat
  readonly totalProducts = signal<number>(20);
  readonly totalUsers = signal<number>(6);
  readonly totalCarts = signal<number>(6);
  readonly averagePrice = signal<number>(2174.45);

  // Statistiques détaillées (valeur du stock, dispersion, panier moyen, catégories)
  readonly advancedStats = signal<AdvancedStatistics | null>(TEMPORARY_ADVANCED_STATS);
  readonly kpis = signal<DashboardKPIs | null>(TEMPORARY_KPIS);
  readonly isLoading = signal<boolean>(false);

  /**
   * Récupère Total Produits depuis l'API
   * GET /api/metrics/total-products -> { "value": ... }
   */
  getTotalProducts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-products').pipe(
      catchError(() => of({ value: this.totalProducts() || 20 })),
      tap((res) => this.totalProducts.set(res?.value ?? 20))
    );
  }

  /**
   * Récupère Total Utilisateurs depuis l'API
   * GET /api/metrics/total-users -> { "value": ... }
   */
  getTotalUsers(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-users').pipe(
      catchError(() => of({ value: this.totalUsers() || 6 })),
      tap((res) => this.totalUsers.set(res?.value ?? 6))
    );
  }

  /**
   * Récupère Total Paniers depuis l'API
   * GET /api/metrics/total-carts -> { "value": ... }
   */
  getTotalCarts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-carts').pipe(
      catchError(() => of({ value: this.totalCarts() || 6 })),
      tap((res) => this.totalCarts.set(res?.value ?? 6))
    );
  }

  /**
   * Récupère Prix Moyen depuis l'API
   * GET /api/metrics/average-price -> { "value": ... }
   */
  getAveragePrice(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/average-price').pipe(
      catchError(() => of({ value: this.averagePrice() || 2174.45 })),
      tap((res) => this.averagePrice.set(res?.value ?? 2174.45))
    );
  }

  /**
   * Récupère les statistiques détaillées (panier moyen, valeur globale, dispersion, catégories)
   */
  getAdvancedStats(): Observable<AdvancedStatistics> {
    return this.http.get<AdvancedStatistics>('/api/statistics/advanced').pipe(
      catchError(() => of(TEMPORARY_ADVANCED_STATS)),
      tap((stats) => this.advancedStats.set(stats))
    );
  }

  /**
   * Récupère les KPIs globaux
   */
  getKPIs(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>('/api/statistics/kpis').pipe(
      catchError(() => of(TEMPORARY_KPIS)),
      tap((data) => this.kpis.set(data))
    );
  }

  /**
   * Récupère les prévisions modélisées
   */
  getForecasts(period = '30d', metric = 'budget', growthRate = 0.10): Observable<ForecastResponse> {
    const params = new HttpParams()
      .set('period', period)
      .set('metric', metric)
      .set('growthRate', growthRate.toString());

    return this.http.get<ForecastResponse>('/api/forecasts', { params }).pipe(
      catchError(() =>
        of({
          metric,
          period,
          historical: [],
          forecast: [],
          metadata: {
            modelUsed: 'Fallback Local Estimator',
            meanAbsoluteError: 5.0,
            generatedAt: new Date().toISOString()
          }
        })
      )
    );
  }

  /**
   * Envoie une requête à l'assistant IA / fonctions pré-définies
   */
  askAssistant(message: string, action?: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>('/api/chat', { message, action }).pipe(
      catchError(() =>
        of({
          answer: `🤖 **Analyseur IT Intelligence (Mode Secours Local) :**\n\nImpossible de joindre le service distant, mais votre parc compte actuellement **${this.totalProducts()} équipements** pour un coût moyen de **${this.averagePrice()} €** et une valeur d'inventaire globale de **${(this.advancedStats()?.totalInventoryValue ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**.\n\nLes dotations collaborateur sont suivies et disponibles dans le module Paniers.`,
          data: {
            offlineMode: true,
            assets: this.totalProducts()
          }
        })
      )
    );
  }

  /**
   * Charge toutes les mesures simultanément
   */
  loadAll(): Observable<{
    products: MetricValue;
    users: MetricValue;
    carts: MetricValue;
    avgPrice: MetricValue;
    advanced: AdvancedStatistics;
  }> {
    this.isLoading.set(true);
    return forkJoin({
      products: this.getTotalProducts(),
      users: this.getTotalUsers(),
      carts: this.getTotalCarts(),
      avgPrice: this.getAveragePrice(),
      advanced: this.getAdvancedStats()
    }).pipe(
      tap({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      })
    );
  }

  /**
   * Réinitialise aux données temporaires par défaut
   */
  resetToTemporaryData(): void {
    this.totalProducts.set(20);
    this.totalUsers.set(6);
    this.totalCarts.set(6);
    this.averagePrice.set(2174.45);
    this.advancedStats.set(TEMPORARY_ADVANCED_STATS);
    this.kpis.set(TEMPORARY_KPIS);
  }
}
