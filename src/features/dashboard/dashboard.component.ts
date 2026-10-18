import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatisticsService } from '../../core/services/statistics.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, PageHeaderComponent, CurrencyPipe, PercentPipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Tableau de Bord Décisionnel"
        description="Mesures directes depuis la base SQL Server et statistiques analytiques du catalogue."
        breadcrumb="Dashboard"
        [showRefresh]="true"
        [isRefreshing]="isRefreshing()"
        (refresh)="onRefresh()"
      >
        <div actions class="flex items-center gap-2">

          <!-- Load from DB button -->
          <button
            type="button"
            (click)="onRefresh()"
            [disabled]="isRefreshing()"
            class="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="isRefreshing()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Récupérer de la base</span>
          </button>
        </div>
      </app-page-header>

      <!-- 4 Core Metrics Cards -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Mesures Fondamentales
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 1. TOTAL PRODUITS -->
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div>
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span class="text-slate-700">Total Produits</span>
                <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-900">
                  {{ totalProducts() }}
                </span>
                <span class="text-xs font-medium text-slate-400 font-mono">articles</span>
              </div>
            </div>

            <div class="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="text-slate-500">Articles au catalogue</span>
              <span class="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Inventaire</span>
            </div>
          </div>

          <!-- 2. TOTAL UTILISATEURS -->
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span class="text-slate-700">Total Utilisateurs</span>
                <div class="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-900">
                  {{ totalUsers() }}
                </span>
                <span class="text-xs font-medium text-slate-400 font-mono">comptes</span>
              </div>
            </div>

            <div class="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="text-slate-500">Comptes utilisateurs</span>
              <span class="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded text-[10px]">Actifs</span>
            </div>
          </div>

          <!-- 3. TOTAL PANIERS -->
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
            <div>
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span class="text-slate-700">Total Paniers</span>
                <div class="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-900">
                  {{ totalCarts() }}
                </span>
                <span class="text-xs font-medium text-slate-400 font-mono">paniers</span>
              </div>
            </div>

            <div class="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="text-slate-500">Paniers enregistrés</span>
              <span class="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded text-[10px]">Commandes</span>
            </div>
          </div>

          <!-- 4. PRIX MOYEN -->
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div>
              <div class="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span class="text-slate-700">Prix Moyen</span>
                <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-900">
                  {{ averagePrice() | currency:'USD':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>

            <div class="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="text-slate-500">Prix unitaire moyen</span>
              <span class="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Moyenne</span>
            </div>
          </div>
        </div>
      </div>

      <!-- INDICATEURS STATISTIQUES & ANALYSE FINANCIÈRE (Demande Utilisateur: 1- Valeur du Stock Global, 2- Pie Chart, 3- Multi Series Charts) -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Indicateurs Statistiques &amp; Analyse Financière
            </div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900">
              Analyses Financières et Répartition du Catalogue
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Évaluation en direct de la valeur d'inventaire, distribution catégorielle et analyse multi-axes.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              GET /api/statistics/advanced
            </span>
          </div>
        </div>

        <!-- 1. VALEUR DU STOCK GLOBAL (Mise en valeur demandée) -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-700">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <span class="p-1 bg-emerald-500/20 rounded border border-emerald-500/30">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span>1 &bull; Valeur du Stock Global</span>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                  {{ (advancedStats()?.totalInventoryValue ?? 0) | currency:'USD':'symbol':'1.2-2' }}
                </span>
                <span class="text-xs font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Actif Circulant
                </span>
              </div>
              <p class="text-xs text-slate-300 mt-2 max-w-xl">
                Capitalisation totale de l'ensemble des articles du catalogue. Donnée agrégée depuis la base de données SQL.
              </p>
            </div>

            <!-- Mini stats grid inside Stock Global -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-6">
              <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div class="text-[11px] text-slate-400 font-medium">Articles en Stock</div>
                <div class="text-lg font-bold text-white font-mono mt-0.5">
                  {{ totalProducts() }}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">références uniques</div>
              </div>

              <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div class="text-[11px] text-slate-400 font-medium">Prix Moyen Unitaire</div>
                <div class="text-lg font-bold text-emerald-300 font-mono mt-0.5">
                  {{ averagePrice() | currency:'USD':'symbol':'1.2-2' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">par article</div>
              </div>

              <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
                <div class="text-[11px] text-slate-400 font-medium">Prix Médian</div>
                <div class="text-lg font-bold text-indigo-300 font-mono mt-0.5">
                  {{ (advancedStats()?.medianPrice ?? 0) | currency:'USD':'symbol':'1.2-2' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">&plusmn; {{ (advancedStats()?.stdDevPrice ?? 0) | currency:'USD':'symbol':'1.2-2' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHARTS SECTION: 2- Pie Chart & 3- Multi Series Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 2. PIE CHART: Nombre de chaque catégorie (5 cols on large screens) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    2 &bull; Pie Chart Catégories
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 mt-0.5">
                    Nombre de Produits par Catégorie
                  </h4>
                </div>
                <span class="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  nbr par catégorie
                </span>
              </div>

              <p class="text-xs text-slate-500 mb-3">
                Répartition volumétrique du catalogue par segment marchand.
              </p>

              <!-- Canvas Container for Pie Chart -->
              <div class="relative w-full h-[250px] flex items-center justify-center">
                @if (categoryStats().length > 0) {
                  <canvas #pieChartCanvas class="w-full h-full max-h-[250px]"></canvas>
                } @else {
                  <div class="text-center text-xs text-slate-400 py-10">
                    <p>Aucune donnée graphique disponible.</p>
                    <p class="mt-1 text-[11px] text-slate-300">Cliquez sur « Récupérer de la base » pour charger le catalogue.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Legend summary list -->
            @if (categoryStats().length > 0) {
              <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                @for (cat of categoryStats(); track cat.category) {
                  <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" [style.background-color]="getCategoryColor(cat.category)"></span>
                      <span class="text-slate-700 truncate font-medium">{{ getCategoryLabel(cat.category) }}</span>
                    </div>
                    <span class="font-bold text-slate-900 font-mono ml-2">{{ cat.productCount }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- 3. MULTI SERIES CHARTS: Nombre de produits selon la catégorie + Avg Prix par catégorie (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div>
                  <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    3 &bull; Multi Series Charts
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 mt-0.5">
                    Volume de Produits &amp; Prix Moyen par Catégorie
                  </h4>
                </div>

                <div class="flex items-center gap-3 text-xs">
                  <span class="flex items-center gap-1 text-slate-600 font-medium">
                    <span class="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
                    Série 1 : Nbr Produits
                  </span>
                  <span class="flex items-center gap-1 text-slate-600 font-medium">
                    <span class="w-3 h-1 rounded bg-emerald-500 inline-block"></span>
                    Série 2 : Prix Moyen ($)
                  </span>
                </div>
              </div>

              <p class="text-xs text-slate-500 mb-3">
                Graphique multi-séries superposant le nombre de références (barres, échelle de gauche) et le prix moyen unitaire (ligne, échelle de droite en dollars).
              </p>

              <!-- Canvas Container for Multi Series Chart -->
              <div class="relative w-full h-[270px]">
                @if (categoryStats().length > 0) {
                  <canvas #multiSeriesCanvas class="w-full h-full min-h-[270px]"></canvas>
                } @else {
                  <div class="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 py-10">
                    <p>Aucune donnée multi-séries disponible.</p>
                    <p class="mt-1 text-[11px] text-slate-300">Cliquez sur « Récupérer de la base » pour charger le catalogue.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Detail foot note -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1">
              <span>Axe Y Gauche: Volume (produits) &bull; Axe Y Droit: Valeur financière ($)</span>
              <span class="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">chart.js multi-axis</span>
            </div>
          </div>
        </div>

        <!-- Détail complémentaire par segment -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h4 class="text-sm font-bold text-slate-900">
                Tableau Synthétique des Catégories
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Volumes, parts de catalogue et valorisation totale par département.
              </p>
            </div>
            <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {{ categoryStats().length }} segments analysés
            </span>
          </div>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (cat of categoryStats(); track cat.category) {
              <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-slate-800 truncate" [title]="cat.category">
                      {{ getCategoryLabel(cat.category) }}
                    </span>
                    <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {{ cat.percentage }}%
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      class="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      [style.width.%]="cat.percentage"
                    ></div>
                  </div>

                  <div class="space-y-1 text-xs">
                    <div class="flex items-center justify-between text-slate-500">
                      <span>Articles :</span>
                      <span class="font-semibold text-slate-800">{{ cat.productCount }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-500">
                      <span>Prix moyen :</span>
                      <span class="font-semibold text-slate-800">{{ cat.averagePrice | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Valeur totale :</span>
                  <span class="font-semibold text-slate-700">{{ cat.totalValue | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            } @empty {
              <div class="col-span-full py-6 text-center text-xs text-slate-400">
                Aucune statistique de catégorie chargée pour le moment.
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private statsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('pieChartCanvas') pieChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('multiSeriesCanvas') multiSeriesCanvas?: ElementRef<HTMLCanvasElement>;

  private pieChartInstance?: Chart;
  private multiSeriesChartInstance?: Chart;

  readonly isRefreshing = signal(false);

  // Les signaux démarrent par défaut à 0
  readonly totalProducts = this.statsService.totalProducts;
  readonly totalUsers = this.statsService.totalUsers;
  readonly totalCarts = this.statsService.totalCarts;
  readonly averagePrice = this.statsService.averagePrice;
  readonly advancedStats = this.statsService.advancedStats;

  get categoryStats() {
    return () => this.advancedStats()?.categories || [];
  }

  ngOnInit(): void {
    // Les mesures commencent à 0 par défaut si aucune valeur n'est récupérée de la base
    this.loadMetrics();
  }

  ngAfterViewInit(): void {
    if (this.advancedStats()?.categories?.length) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadMetrics(): void {
    this.isRefreshing.set(true);

    // Charge les 4 méthodes demandées:
    // getTotalProducts(), getTotalUsers(), getTotalCarts(), getAveragePrice()
    this.statsService.loadAll().subscribe({
      next: () => {
        this.isRefreshing.set(false);
        setTimeout(() => this.renderCharts(), 60);
      },
      error: () => this.isRefreshing.set(false)
    });
  }

  onRefresh(): void {
    this.loadMetrics();
  }

  private destroyCharts(): void {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
      this.pieChartInstance = undefined;
    }
    if (this.multiSeriesChartInstance) {
      this.multiSeriesChartInstance.destroy();
      this.multiSeriesChartInstance = undefined;
    }
  }

  renderCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const categories = this.advancedStats()?.categories || [];
    if (!categories.length) {
      this.destroyCharts();
      return;
    }

    const labels = categories.map((c) => this.getCategoryLabel(c.category));
    const counts = categories.map((c) => c.productCount);
    const avgPrices = categories.map((c) => c.averagePrice);

    // 1. RENDER PIE CHART (2- une pie chart permet de voir le nbr de chaque category)
    if (this.pieChartCanvas?.nativeElement) {
      if (this.pieChartInstance) {
        this.pieChartInstance.destroy();
      }
      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.pieChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                label: 'Nombre de produits',
                data: counts,
                backgroundColor: categories.map((c) => this.getCategoryColor(c.category)),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 12,
                  font: { family: 'Plus Jakarta Sans', size: 11 }
                }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label} : ${ctx.raw} article(s)`
                }
              }
            },
            cutout: '62%'
          }
        });
      }
    }

    // 2. RENDER MULTI SERIES CHARTS (3- Multi Series Charts le nbr de product selon le categorie et le avg prix par categorie)
    if (this.multiSeriesCanvas?.nativeElement) {
      if (this.multiSeriesChartInstance) {
        this.multiSeriesChartInstance.destroy();
      }
      const ctx = this.multiSeriesCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.multiSeriesChartInstance = new Chart(ctx, {
          data: {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'Série 1 : Nombre de produits (articles)',
                data: counts,
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderColor: '#6366f1',
                borderWidth: 1.5,
                borderRadius: 6,
                yAxisID: 'yCount',
                order: 2
              },
              {
                type: 'line',
                label: 'Série 2 : Prix Moyen ($)',
                data: avgPrices,
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5,
                tension: 0.35,
                yAxisID: 'yPrice',
                order: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: { family: 'Plus Jakarta Sans', size: 11 }
                }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    if (ctx.datasetIndex === 0) {
                      return ` 📦 Nombre de produits: ${ctx.raw} articles`;
                    }
                    return ` 💲 Prix moyen: $${Number(ctx.raw).toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  font: { family: 'Plus Jakarta Sans', size: 11 }
                }
              },
              yCount: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Nombre de produits',
                  color: '#6366f1',
                  font: { size: 11, weight: 'bold' }
                },
                ticks: {
                  stepSize: 1,
                  font: { family: 'Plus Jakarta Sans', size: 11 }
                },
                grid: {
                  color: '#f1f5f9'
                }
              },
              yPrice: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Prix Moyen ($)',
                  color: '#10b981',
                  font: { size: 11, weight: 'bold' }
                },
                ticks: {
                  callback: (value) => `$${value}`,
                  font: { family: 'Plus Jakarta Sans', size: 11 }
                },
                grid: {
                  drawOnChartArea: false
                }
              }
            }
          }
        });
      }
    }
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      'Laptops & Postes Dev': '#3b82f6',
      'Serveurs & Cloud': '#6366f1',
      'Réseau & Cybersécurité': '#10b981',
      'Stockage & Composants': '#f59e0b',
      'Moniteurs & Périphériques': '#ec4899',
      'electronics': '#6366f1',
      'jewelery': '#f59e0b',
      "men's clothing": '#3b82f6',
      "women's clothing": '#ec4899'
    };
    return colors[cat] || colors[cat.toLowerCase()] || '#8b5cf6';
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      'electronics': 'Électronique',
      'jewelery': 'Bijouterie',
      "men's clothing": 'Mode Homme',
      "women's clothing": 'Mode Femme'
    };
    return labels[cat.toLowerCase()] || cat;
  }
}
