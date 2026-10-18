import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricValue, AdvancedStatistics, DashboardKPIs } from '../models/statistics.model';
import { ForecastResponse } from '../models/forecast.model';
import { ChatResponse } from '../models/chat.model';
import {
  MOCK_ADVANCED_STATS,
  MOCK_KPIS,
  MOCK_PRODUCTS,
  MOCK_USERS,
  MOCK_CARTS,
  generateMockForecast
} from '../data/mock-data';

export const TEMPORARY_ADVANCED_STATS: AdvancedStatistics = MOCK_ADVANCED_STATS;
export const TEMPORARY_KPIS: DashboardKPIs = MOCK_KPIS;

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);

  // Signaux principaux initialisés avec des données temporaires riches pour affichage immédiat
  readonly totalProducts = signal<number>(MOCK_PRODUCTS.length);
  readonly totalUsers = signal<number>(MOCK_USERS.length);
  readonly totalCarts = signal<number>(MOCK_CARTS.length);
  readonly averagePrice = signal<number>(MOCK_KPIS.averagePrice);

  // Statistiques détaillées (valeur du stock, dispersion, panier moyen, catégories)
  readonly advancedStats = signal<AdvancedStatistics | null>(MOCK_ADVANCED_STATS);
  readonly kpis = signal<DashboardKPIs | null>(MOCK_KPIS);
  readonly isLoading = signal<boolean>(false);

  /**
   * Récupère Total Produits depuis l'API
   * GET /api/metrics/total-products -> { "value": ... }
   */
  getTotalProducts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-products').pipe(
      catchError(() => of({ value: this.totalProducts() || MOCK_PRODUCTS.length })),
      tap((res) => this.totalProducts.set(res?.value ?? MOCK_PRODUCTS.length))
    );
  }

  /**
   * Récupère Total Utilisateurs depuis l'API
   * GET /api/metrics/total-users -> { "value": ... }
   */
  getTotalUsers(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-users').pipe(
      catchError(() => of({ value: this.totalUsers() || MOCK_USERS.length })),
      tap((res) => this.totalUsers.set(res?.value ?? MOCK_USERS.length))
    );
  }

  /**
   * Récupère Total Paniers depuis l'API
   * GET /api/metrics/total-carts -> { "value": ... }
   */
  getTotalCarts(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/total-carts').pipe(
      catchError(() => of({ value: this.totalCarts() || MOCK_CARTS.length })),
      tap((res) => this.totalCarts.set(res?.value ?? MOCK_CARTS.length))
    );
  }

  /**
   * Récupère Prix Moyen depuis l'API
   * GET /api/metrics/average-price -> { "value": ... }
   */
  getAveragePrice(): Observable<MetricValue> {
    return this.http.get<MetricValue>('/api/metrics/average-price').pipe(
      catchError(() => of({ value: this.averagePrice() || MOCK_KPIS.averagePrice })),
      tap((res) => this.averagePrice.set(res?.value ?? MOCK_KPIS.averagePrice))
    );
  }

  /**
   * Récupère les statistiques détaillées (panier moyen, valeur globale, dispersion, catégories)
   */
  getAdvancedStats(): Observable<AdvancedStatistics> {
    return this.http.get<AdvancedStatistics>('/api/statistics/advanced').pipe(
      catchError(() => of(MOCK_ADVANCED_STATS)),
      tap((stats) => this.advancedStats.set(stats))
    );
  }

  /**
   * Récupère les KPIs globaux
   */
  getKPIs(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>('/api/statistics/kpis').pipe(
      catchError(() => of(MOCK_KPIS)),
      tap((data) => this.kpis.set(data))
    );
  }

  /**
   * Récupère les prévisions modélisées
   */
  getForecasts(period = '30d', metric = 'budget', growthRate = 0.15): Observable<ForecastResponse> {
    const params = new HttpParams()
      .set('period', period)
      .set('metric', metric)
      .set('growthRate', growthRate.toString());

    return this.http.get<ForecastResponse>('/api/forecasts', { params }).pipe(
      catchError(() => of(generateMockForecast(period, metric, growthRate)))
    );
  }

  /**
   * Envoie une requête à l'assistant IA / fonctions pré-définies
   */
  askAssistant(message: string, action?: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>('/api/chat', { message, action }).pipe(
      catchError(() =>
        of({
          answer: `🤖 **Analyseur IT Intelligence (Mode Sécurisé / Hors-Ligne) :**\n\nLe parc compte actuellement **${this.totalProducts()} équipements** pour un coût moyen de **${this.averagePrice()} €** et une valeur d'inventaire globale de **${(this.advancedStats()?.totalInventoryValue ?? MOCK_ADVANCED_STATS.totalInventoryValue).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**.\n\nLes dotations collaborateur (${this.totalCarts()} commandes suivies pour ${this.totalUsers()} collaborateurs) sont opérationnelles.`,
          data: {
            offlineMode: true,
            assets: this.totalProducts(),
            users: this.totalUsers(),
            carts: this.totalCarts()
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
    this.totalProducts.set(MOCK_PRODUCTS.length);
    this.totalUsers.set(MOCK_USERS.length);
    this.totalCarts.set(MOCK_CARTS.length);
    this.averagePrice.set(MOCK_KPIS.averagePrice);
    this.advancedStats.set(MOCK_ADVANCED_STATS);
    this.kpis.set(MOCK_KPIS);
  }
}
