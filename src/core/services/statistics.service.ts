import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricValue, AdvancedStatistics, DashboardKPIs } from '../models/statistics.model';
import { ForecastResponse } from '../models/forecast.model';
import { ChatResponse } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);

  // Signaux principaux
  readonly totalProducts = signal<number>(0);
  readonly totalUsers = signal<number>(0);
  readonly totalCarts = signal<number>(0);
  readonly averagePrice = signal<number>(0);

  // Statistiques détaillées (valeur du stock, dispersion, panier moyen, catégories)
  readonly advancedStats = signal<AdvancedStatistics | null>(null);
  readonly kpis = signal<DashboardKPIs | null>(null);
  readonly isLoading = signal<boolean>(false);

  /**
   * Récupère Total Produits depuis l'API
   * GET /api/metrics/total-products -> { "value": ... }
   */
  getTotalProducts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-products').pipe(
      catchError(() => of({ value: 0 })),
      tap((res) => this.totalProducts.set(res?.value ?? 0))
    );
  }

  /**
   * Récupère Total Utilisateurs depuis l'API
   * GET /api/metrics/total-users -> { "value": ... }
   */
  getTotalUsers(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-users').pipe(
      catchError(() => of({ value: 0 })),
      tap((res) => this.totalUsers.set(res?.value ?? 0))
    );
  }

  /**
   * Récupère Total Paniers depuis l'API
   * GET /api/metrics/total-carts -> { "value": ... }
   */
  getTotalCarts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-carts').pipe(
      catchError(() => of({ value: 0 })),
      tap((res) => this.totalCarts.set(res?.value ?? 0))
    );
  }

  /**
   * Récupère Prix Moyen depuis l'API
   * GET /api/metrics/average-price -> { "value": ... }
   */
  getAveragePrice(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/average-price').pipe(
      catchError(() => of({ value: 0 })),
      tap((res) => this.averagePrice.set(res?.value ?? 0))
    );
  }

  /**
   * Récupère les statistiques détaillées (panier moyen, valeur globale, dispersion, catégories)
   */
  getAdvancedStats(): Observable<AdvancedStatistics> {
    return this.http.get<AdvancedStatistics>('/api/statistics/advanced').pipe(
      catchError(() =>
        of({
          totalInventoryValue: 0,
          averageCartValue: 0,
          averageItemsPerCart: 0,
          medianPrice: 0,
          stdDevPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          categories: []
        })
      ),
      tap((stats) => this.advancedStats.set(stats))
    );
  }

  /**
   * Récupère les KPIs globaux
   */
  getKPIs(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>('/api/statistics/kpis').pipe(
      catchError(() =>
        of({
          totalProducts: 0,
          totalUsers: 0,
          totalCarts: 0,
          totalCategories: 5,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalInventoryValue: 0
        })
      ),
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
   * Réinitialise toutes les mesures à 0
   */
  resetToZero(): void {
    this.totalProducts.set(0);
    this.totalUsers.set(0);
    this.totalCarts.set(0);
    this.averagePrice.set(0);
    this.advancedStats.set(null);
    this.kpis.set(null);
  }
}
