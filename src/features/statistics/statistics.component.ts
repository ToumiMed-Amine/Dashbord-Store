import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, computed, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatisticsService } from '../../core/services/statistics.service';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../core/models/product.model';
import { MOCK_PRODUCTS, MOCK_USERS, MOCK_CARTS, MOCK_ADVANCED_STATS } from '../../core/data/mock-data';
import Chart from 'chart.js/auto';

interface CategoryMetric {
  name: string;
  count: number;
  totalValue: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  stdDev: number;
  percentage: number;
}

@Component({
  selector: 'app-statistics',
  imports: [CommonModule, RouterModule, PageHeaderComponent, CurrencyPipe, PercentPipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Analyse Statistique & Décisionnelle du Parc IT"
        description="Mesures de tendance centrale, dispersion (moyenne, médiane, écart-type) et répartition financière du catalogue d'équipements."
        breadcrumb="Statistiques"
        [showRefresh]="true"
        [isRefreshing]="isLoading()"
        (refresh)="loadAllData()"
      >
        <div actions class="flex items-center gap-2">
          <!-- Bouton Export CSV / JSON -->
          <button
            type="button"
            (click)="exportData('json')"
            class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Exporter les statistiques au format JSON"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            (click)="exportData('csv')"
            class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Exporter le rapport d'inventaire CSV"
          >
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </app-page-header>

      <!-- Alert Toast on Export -->
      @if (exportToast()) {
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ exportToast() }}</span>
          </div>
          <button (click)="exportToast.set(null)" class="text-emerald-600 hover:text-emerald-800 font-bold ml-4">✕</button>
        </div>
      }

      <!-- Main Statistical Indicators Header Banner -->
      <div class="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md border border-slate-800">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 mb-2 border border-indigo-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Statistiques Inférentielles &amp; Descriptives
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ totalInventoryValuation() | currency:'EUR':'symbol':'1.0-0' }}
            </h2>
            <p class="text-xs text-slate-300 mt-1 max-w-xl">
              Valorisation financière globale du stock d'équipements IT (CapEx). Calculé sur <strong>{{ products().length }} références</strong> et <strong>{{ totalStockUnits() }} unités physiques</strong>.
            </p>
          </div>

          <!-- Secondary Statistical Indicators -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-6 text-xs">
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span class="text-slate-400 block text-[11px]">Moyenne (&mu;)</span>
              <span class="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                {{ meanPrice() | currency:'EUR':'symbol':'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400">Coût unitaire moyen</span>
            </div>

            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span class="text-slate-400 block text-[11px]">Médiane</span>
              <span class="text-base font-bold text-indigo-300 font-mono mt-0.5 block">
                {{ medianPrice() | currency:'EUR':'symbol':'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400">50% au-dessous</span>
            </div>

            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span class="text-slate-400 block text-[11px]">Écart-Type (&sigma;)</span>
              <span class="text-base font-bold text-amber-300 font-mono mt-0.5 block">
                &plusmn; {{ stdDevPrice() | currency:'EUR':'symbol':'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400">Dispersion des coûts</span>
            </div>

            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span class="text-slate-400 block text-[11px]">Coeff. Variation</span>
              <span class="text-base font-bold text-cyan-300 font-mono mt-0.5 block">
                {{ coefficientOfVariation() | percent:'1.1-1' }}
              </span>
              <span class="text-[10px] text-slate-400">Hétérogénéité</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Min & Max Range -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Étendue des Coûts</span>
            <span class="text-indigo-600 font-mono text-[11px]">Min &rarr; Max</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <div>
              <span class="text-[10px] text-slate-400 block font-mono">Minimum</span>
              <span class="text-lg font-bold text-slate-900 font-mono">{{ minPrice() | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block font-mono">Maximum</span>
              <span class="text-lg font-bold text-slate-900 font-mono">{{ maxPrice() | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
          </div>
          <div class="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Étendue totale :</span>
            <span class="font-mono font-semibold text-slate-700">{{ (maxPrice() - minPrice()) | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Interquartile Range (IQR) -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Interquartile (IQR)</span>
            <span class="text-emerald-600 font-mono text-[11px]">Q1 &rarr; Q3</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <div>
              <span class="text-[10px] text-slate-400 block font-mono">Q1 (25%)</span>
              <span class="text-lg font-bold text-slate-900 font-mono">{{ q1Price() | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block font-mono">Q3 (75%)</span>
              <span class="text-lg font-bold text-slate-900 font-mono">{{ q3Price() | currency:'EUR':'symbol':'1.0-0' }}</span>
            </div>
          </div>
          <div class="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Écart IQR (Cœur 50%) :</span>
            <span class="font-mono font-semibold text-emerald-600">{{ (q3Price() - q1Price()) | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Dotations & Commandes (Carts) -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Dotations IT / Paniers</span>
            <span class="text-blue-600 font-mono text-[11px]">/api/carts</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold text-slate-900 font-mono">{{ cartsCount() }}</span>
            <span class="text-xs text-slate-500">commandes actives</span>
          </div>
          <div class="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Panier moyen estimé :</span>
            <span class="font-mono font-semibold text-blue-700">{{ avgCartValue() | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Collaborateurs équipés (Users) -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Collaborateurs Clés</span>
            <span class="text-amber-600 font-mono text-[11px]">/api/users</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold text-slate-900 font-mono">{{ usersCount() }}</span>
            <span class="text-xs text-slate-500">ingénieurs &amp; leads</span>
          </div>
          <div class="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
            <span>Ratio Équipement/Ingénieur :</span>
            <span class="font-mono font-semibold text-amber-700">{{ equipmentRatio() }} arts/pers</span>
          </div>
        </div>
      </div>


      <!-- Charts Section: Distribution Histogram & Category Valuation -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Chart 1: Histogramme de Distribution des Prix (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Histogramme de Fréquence
                </div>
                <h3 class="text-sm font-bold text-slate-900 mt-0.5">
                  Distribution des Équipements par Tranche de Prix
                </h3>
              </div>
              <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                5 Classes de Coûts
              </span>
            </div>

            <p class="text-xs text-slate-500 mb-3">
              Histogramme de distribution montrant la concentration du matériel par tranche budgétaire (accessoires, postes légers, stations de travail, serveurs d'entreprise).
            </p>

            <div class="relative w-full h-[260px]">
              <canvas #histogramCanvas class="w-full h-full"></canvas>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-5 gap-1 text-[11px] text-center">
            @for (bucket of priceBuckets(); track bucket.range) {
              <div class="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span class="text-slate-400 block font-mono text-[10px] truncate" [title]="bucket.range">{{ bucket.range }}</span>
                <span class="font-bold text-slate-900 font-mono">{{ bucket.count }} art.</span>
              </div>
            }
          </div>
        </div>

        <!-- Chart 2: Répartition Financière par Catégorie (5 cols) -->
        <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Part de Capitalisation
                </div>
                <h3 class="text-sm font-bold text-slate-900 mt-0.5">
                  Valorisation par Catégorie IT
                </h3>
              </div>
              <span class="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                CapEx Total
              </span>
            </div>

            <p class="text-xs text-slate-500 mb-3">
              Part de la valeur totale du parc matériel immobilisé dans chaque catégorie.
            </p>

            <div class="relative w-full h-[260px] flex items-center justify-center">
              <canvas #categoryDonutCanvas class="w-full h-full max-h-[260px]"></canvas>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            @for (cat of categoryMetrics(); track cat.name) {
              <div class="flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" [style.background-color]="getCategoryColor(cat.name)"></span>
                  <span class="text-slate-700 truncate font-medium">{{ cat.name }}</span>
                </div>
                <div class="flex items-center gap-2 font-mono">
                  <span class="font-semibold text-slate-900">{{ cat.totalValue | currency:'EUR':'symbol':'1.0-0' }}</span>
                  <span class="text-slate-400">({{ cat.percentage | percent:'1.0-0' }})</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Detailed Category Statistical Matrix Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Matrice Statistique Complète par Catégorie IT
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Agrégations détaillées : Effectif, Valorisation totale, Prix moyen, Écart-type (&sigma;), Minima et Maxima.
            </p>
          </div>
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {{ filteredCategories().length }} catégorie(s)
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Catégorie IT</th>
                <th class="py-3 px-4 text-center">Effectif (Réf.)</th>
                <th class="py-3 px-4 text-right">Valeur Stock (CapEx)</th>
                <th class="py-3 px-4 text-right">Prix Moyen (&mu;)</th>
                <th class="py-3 px-4 text-right">Écart-Type (&sigma;)</th>
                <th class="py-3 px-4 text-right">Min &rarr; Max</th>
                <th class="py-3 px-4 text-center">Part Globale</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (cat of filteredCategories(); track cat.name) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" [style.background-color]="getCategoryColor(cat.name)"></span>
                    <span>{{ cat.name }}</span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                    {{ cat.count }} art.
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                    {{ cat.totalValue | currency:'EUR':'symbol':'1.0-0' }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-900">
                    {{ cat.avgPrice | currency:'EUR':'symbol':'1.2-2' }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-500">
                    &plusmn; {{ cat.stdDev | currency:'EUR':'symbol':'1.2-2' }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-600 text-[11px]">
                    {{ cat.minPrice | currency:'EUR':'symbol':'1.0-0' }} &rarr; {{ cat.maxPrice | currency:'EUR':'symbol':'1.0-0' }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {{ cat.percentage | percent:'1.1-1' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Statistical Interpretation Guide / Decision Support Card -->
      <div class="bg-slate-900 text-slate-300 rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div class="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Guide d'Aide à la Décision &amp; Interprétation Statistique</span>
        </div>
        <h4 class="text-base font-bold text-white mb-2">
          Comprendre la Dispersion des Coûts du Catalogue IT
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed mt-3">
          <div class="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <h5 class="font-semibold text-white mb-1">Moyenne vs Médiane</h5>
            <p>
              La moyenne ({{ meanPrice() | currency:'EUR':'symbol':'1.0-0' }}) est supérieure à la médiane ({{ medianPrice() | currency:'EUR':'symbol':'1.0-0' }}), ce qui traduit une <strong>asymétrie positive à droite</strong> induite par des équipements à forte valeur ajoutée (Serveurs Rack et Workstations IA).
            </p>
          </div>
          <div class="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <h5 class="font-semibold text-white mb-1">Écart-Type (&sigma; = {{ stdDevPrice() | currency:'EUR':'symbol':'1.0-0' }})</h5>
            <p>
              L'écart-type élevé illustre l'étendue naturelle du catalogue IT, qui va des consommables de sécurité (YubiKey à 75€) aux infrastructures critiques de serveurs d'entreprise (Dell R760 à plus de 7 000€).
            </p>
          </div>
          <div class="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <h5 class="font-semibold text-white mb-1">Arbitrage Budgétaire</h5>
            <p>
              Le cœur 50% du catalogue se situe entre {{ q1Price() | currency:'EUR':'symbol':'1.0-0' }} et {{ q3Price() | currency:'EUR':'symbol':'1.0-0' }}. C'est la zone idéale pour négocier des accords-cadres d'achats groupés sur les postes de travail développeurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private statsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('histogramCanvas') histogramCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryDonutCanvas') categoryDonutCanvas?: ElementRef<HTMLCanvasElement>;

  private histogramInstance?: Chart;
  private donutInstance?: Chart;

  readonly isLoading = signal<boolean>(false);
  readonly products = signal<Product[]>([...MOCK_PRODUCTS]);
  readonly cartsCount = signal<number>(MOCK_CARTS.length);
  readonly usersCount = signal<number>(MOCK_USERS.length);
  readonly avgCartValue = signal<number>(MOCK_ADVANCED_STATS.averageCartValue);
  readonly exportToast = signal<string | null>(null);

  // Filters
  readonly selectedCategoryFilter = signal<string>('ALL');
  readonly minPriceFilter = signal<number>(0);

  // Computations
  readonly sortedPrices = computed(() => {
    return this.products().map((p) => p.price).sort((a, b) => a - b);
  });

  readonly totalInventoryValuation = computed(() => {
    return this.products().reduce((sum, p) => sum + p.price * ((p as unknown as { stock?: number }).stock || 1), 0);
  });

  readonly totalStockUnits = computed(() => {
    return this.products().reduce((sum, p) => sum + ((p as unknown as { stock?: number }).stock || 1), 0);
  });

  readonly meanPrice = computed(() => {
    const list = this.products();
    if (!list.length) return 0;
    const sum = list.reduce((acc, p) => acc + p.price, 0);
    return Number((sum / list.length).toFixed(2));
  });

  readonly medianPrice = computed(() => {
    const prices = this.sortedPrices();
    if (!prices.length) return 0;
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 !== 0 ? prices[mid] : Number(((prices[mid - 1] + prices[mid]) / 2).toFixed(2));
  });

  readonly stdDevPrice = computed(() => {
    const prices = this.sortedPrices();
    const mean = this.meanPrice();
    if (!prices.length) return 0;
    const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / prices.length;
    return Number(Math.sqrt(variance).toFixed(2));
  });

  readonly coefficientOfVariation = computed(() => {
    const mean = this.meanPrice();
    if (mean === 0) return 0;
    return Number((this.stdDevPrice() / mean).toFixed(3));
  });

  readonly minPrice = computed(() => {
    const prices = this.sortedPrices();
    return prices.length ? prices[0] : 0;
  });

  readonly maxPrice = computed(() => {
    const prices = this.sortedPrices();
    return prices.length ? prices[prices.length - 1] : 0;
  });

  readonly q1Price = computed(() => {
    const prices = this.sortedPrices();
    if (!prices.length) return 0;
    const q1Index = Math.floor(prices.length * 0.25);
    return prices[q1Index];
  });

  readonly q3Price = computed(() => {
    const prices = this.sortedPrices();
    if (!prices.length) return 0;
    const q3Index = Math.floor(prices.length * 0.75);
    return prices[q3Index];
  });

  readonly equipmentRatio = computed(() => {
    const uCount = this.usersCount();
    if (!uCount) return '0';
    return (this.totalStockUnits() / uCount).toFixed(1);
  });

  readonly categoryMetrics = computed<CategoryMetric[]>(() => {
    const list = this.products();
    const map = new Map<string, Product[]>();
    for (const p of list) {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    }

    const totalVal = this.totalInventoryValuation() || 1;
    const result: CategoryMetric[] = [];

    map.forEach((items, catName) => {
      const count = items.length;
      const prices = items.map((i) => i.price).sort((a, b) => a - b);
      const totalValue = items.reduce((sum, i) => sum + i.price * ((i as unknown as { stock?: number }).stock || 1), 0);
      const avgPrice = Number((prices.reduce((s, p) => s + p, 0) / count).toFixed(2));
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      const variance = prices.reduce((acc, cur) => acc + Math.pow(cur - avgPrice, 2), 0) / count;
      const stdDev = Number(Math.sqrt(variance).toFixed(2));

      result.push({
        name: catName,
        count,
        totalValue,
        avgPrice,
        minPrice,
        maxPrice,
        stdDev,
        percentage: totalValue / totalVal
      });
    });

    return result.sort((a, b) => b.totalValue - a.totalValue);
  });

  readonly filteredCategories = computed(() => {
    const cat = this.selectedCategoryFilter();
    const minP = this.minPriceFilter();
    let res = this.categoryMetrics();
    if (cat !== 'ALL') {
      res = res.filter((c) => c.name === cat);
    }
    if (minP > 0) {
      res = res.filter((c) => c.maxPrice >= minP);
    }
    return res;
  });

  readonly priceBuckets = computed(() => {
    const prices = this.sortedPrices();
    const total = prices.length || 1;
    const buckets = [
      { range: '< 200 €', min: 0, max: 200, count: 0 },
      { range: '200 € - 600 €', min: 200, max: 600, count: 0 },
      { range: '600 € - 1 500 €', min: 600, max: 1500, count: 0 },
      { range: '1 500 € - 3 000 €', min: 1500, max: 3000, count: 0 },
      { range: '> 3 000 €', min: 3000, max: 999999, count: 0 }
    ];

    for (const p of prices) {
      for (const b of buckets) {
        if (p >= b.min && (b.max === 999999 ? true : p < b.max)) {
          b.count += 1;
          break;
        }
      }
    }

    return buckets.map((b) => ({
      ...b,
      percentage: Number(((b.count / total) * 100).toFixed(1))
    }));
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    if (this.products().length > 0) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  onMinPriceChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.minPriceFilter.set(val);
  }

  loadAllData(): void {
    this.isLoading.set(true);

    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products.set(products && products.length ? products : [...MOCK_PRODUCTS]);
        this.isLoading.set(false);
        setTimeout(() => this.renderCharts(), 80);
      },
      error: () => {
        if (!this.products().length) {
          this.products.set([...MOCK_PRODUCTS]);
        }
        this.isLoading.set(false);
        setTimeout(() => this.renderCharts(), 80);
      }
    });

    this.http.get<{ value: number }>('/api/metrics/total-carts').subscribe({
      next: (res) => this.cartsCount.set(res?.value || MOCK_CARTS.length),
      error: () => this.cartsCount.set(MOCK_CARTS.length)
    });

    this.http.get<{ value: number }>('/api/metrics/total-users').subscribe({
      next: (res) => this.usersCount.set(res?.value || MOCK_USERS.length),
      error: () => this.usersCount.set(MOCK_USERS.length)
    });

    this.http.get<{ averageCartValue: number }>('/api/statistics/advanced').subscribe({
      next: (res) => this.avgCartValue.set(res?.averageCartValue || MOCK_ADVANCED_STATS.averageCartValue),
      error: () => this.avgCartValue.set(MOCK_ADVANCED_STATS.averageCartValue)
    });
  }

  private destroyCharts(): void {
    if (this.histogramInstance) {
      this.histogramInstance.destroy();
      this.histogramInstance = undefined;
    }
    if (this.donutInstance) {
      this.donutInstance.destroy();
      this.donutInstance = undefined;
    }
  }

  renderCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const buckets = this.priceBuckets();
    const categories = this.categoryMetrics();

    // 1. Histogram of Price Buckets
    if (this.histogramCanvas?.nativeElement) {
      if (this.histogramInstance) {
        this.histogramInstance.destroy();
      }
      const ctx = this.histogramCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.histogramInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: buckets.map((b) => b.range),
            datasets: [
              {
                label: 'Nombre d\'équipements',
                data: buckets.map((b) => b.count),
                backgroundColor: [
                  'rgba(99, 102, 241, 0.85)',
                  'rgba(59, 130, 246, 0.85)',
                  'rgba(16, 185, 129, 0.85)',
                  'rgba(245, 158, 11, 0.85)',
                  'rgba(236, 72, 153, 0.85)'
                ],
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: '#ffffff'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (c) => ` ${c.raw} références (${buckets[c.dataIndex].percentage}%)`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
              },
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } },
                grid: { color: '#f1f5f9' },
                title: { display: true, text: 'Effectif (articles)', font: { size: 11 } }
              }
            }
          }
        });
      }
    }

    // 2. Category Valuation Donut Chart
    if (this.categoryDonutCanvas?.nativeElement) {
      if (this.donutInstance) {
        this.donutInstance.destroy();
      }
      const ctx = this.categoryDonutCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.donutInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: categories.map((c) => c.name),
            datasets: [
              {
                data: categories.map((c) => c.totalValue),
                backgroundColor: categories.map((c) => this.getCategoryColor(c.name)),
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
                labels: { boxWidth: 10, padding: 8, font: { family: 'Plus Jakarta Sans', size: 10 } }
              },
              tooltip: {
                callbacks: {
                  label: (c) => ` ${c.label} : ${Number(c.raw).toLocaleString('fr-FR')} €`
                }
              }
            },
            cutout: '65%'
          }
        });
      }
    }
  }

  getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      'Laptops & Postes Dev': '#3b82f6',
      'Serveurs & Cloud': '#6366f1',
      'Réseau & Cybersécurité': '#10b981',
      'Stockage & Composants': '#f59e0b',
      'Moniteurs & Périphériques': '#ec4899'
    };
    return map[category] || '#8b5cf6';
  }

  exportData(format: 'json' | 'csv'): void {
    const summary = {
      generatedAt: new Date().toISOString(),
      totalValuation: this.totalInventoryValuation(),
      totalProducts: this.products().length,
      meanPrice: this.meanPrice(),
      medianPrice: this.medianPrice(),
      stdDev: this.stdDevPrice(),
      categories: this.categoryMetrics()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `it-inventory-statistics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportToast.set('Rapport statistique JSON téléchargé avec succès.');
    } else {
      let csv = 'Catégorie,Nombre Références,Valeur Stock,Prix Moyen,Écart-Type,Min,Max\n';
      for (const c of this.categoryMetrics()) {
        csv += `"${c.name}",${c.count},${c.totalValue},${c.avgPrice},${c.stdDev},${c.minPrice},${c.maxPrice}\n`;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `it-inventory-matrix-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportToast.set('Fichier CSV exporté avec succès.');
    }

    setTimeout(() => this.exportToast.set(null), 4000);
  }
}
