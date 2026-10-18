import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, computed, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatisticsService } from '../../core/services/statistics.service';
import { ForecastResponse } from '../../core/models/forecast.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-forecasts',
  imports: [CommonModule, RouterModule, PageHeaderComponent, CurrencyPipe, PercentPipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Prévisions & Modélisation Prédictive IT"
        description="Projection prospective des dépenses matérielles, dépréciation d'actifs, risques d'obsolescence et cycles de renouvellement sur 7 à 365 jours."
        breadcrumb="Prévisions"
        [showRefresh]="true"
        [isRefreshing]="isLoading()"
        (refresh)="loadForecastData()"
      >
        <div actions class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Moteur Prédictif ML v2.5 Actif
          </span>
        </div>
      </app-page-header>

      <!-- Forecast Projection Parameters Banner -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <!-- Metric Tabs -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Métrique Prédictive
              </label>
              <span class="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                {{ metricTitle() }}
              </span>
            </div>

            <div class="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                (click)="setMetric('budget')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                [class.bg-white]="selectedMetric() === 'budget'"
                [class.text-indigo-700]="selectedMetric() === 'budget'"
                [class.shadow-2xs]="selectedMetric() === 'budget'"
                [class.text-slate-600]="selectedMetric() !== 'budget'"
              >
                <span>📦</span>
                <span>Budget Achats &amp; CapEx</span>
              </button>

              <button
                type="button"
                (click)="setMetric('depreciation')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                [class.bg-white]="selectedMetric() === 'depreciation'"
                [class.text-indigo-700]="selectedMetric() === 'depreciation'"
                [class.shadow-2xs]="selectedMetric() === 'depreciation'"
                [class.text-slate-600]="selectedMetric() !== 'depreciation'"
              >
                <span>📉</span>
                <span>Dépréciation &amp; Amortissement</span>
              </button>

              <button
                type="button"
                (click)="setMetric('refresh')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                [class.bg-white]="selectedMetric() === 'refresh'"
                [class.text-indigo-700]="selectedMetric() === 'refresh'"
                [class.shadow-2xs]="selectedMetric() === 'refresh'"
                [class.text-slate-600]="selectedMetric() !== 'refresh'"
              >
                <span>🔄</span>
                <span>Renouvellement (36m+)</span>
              </button>

              <button
                type="button"
                (click)="setMetric('obsolescence')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                [class.bg-white]="selectedMetric() === 'obsolescence'"
                [class.text-indigo-700]="selectedMetric() === 'obsolescence'"
                [class.shadow-2xs]="selectedMetric() === 'obsolescence'"
                [class.text-slate-600]="selectedMetric() !== 'obsolescence'"
              >
                <span>⚠️</span>
                <span>Risque Obsolescence</span>
              </button>

              <button
                type="button"
                (click)="setMetric('energy')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                [class.bg-white]="selectedMetric() === 'energy'"
                [class.text-indigo-700]="selectedMetric() === 'energy'"
                [class.shadow-2xs]="selectedMetric() === 'energy'"
                [class.text-slate-600]="selectedMetric() !== 'energy'"
              >
                <span>⚡</span>
                <span>Dépense Énergétique</span>
              </button>
            </div>
          </div>

          <!-- Period Buttons -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Horizon Temporel
              </label>
              <span class="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {{ periodLabel() }}
              </span>
            </div>

            <div class="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                (click)="setPeriod('7d')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                [class.bg-white]="selectedPeriod() === '7d'"
                [class.text-indigo-700]="selectedPeriod() === '7d'"
                [class.shadow-2xs]="selectedPeriod() === '7d'"
                [class.text-slate-600]="selectedPeriod() !== '7d'"
              >
                7 Jours
              </button>
              <button
                type="button"
                (click)="setPeriod('30d')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                [class.bg-white]="selectedPeriod() === '30d'"
                [class.text-indigo-700]="selectedPeriod() === '30d'"
                [class.shadow-2xs]="selectedPeriod() === '30d'"
                [class.text-slate-600]="selectedPeriod() !== '30d'"
              >
                30 Jours
              </button>
              <button
                type="button"
                (click)="setPeriod('90d')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                [class.bg-white]="selectedPeriod() === '90d'"
                [class.text-indigo-700]="selectedPeriod() === '90d'"
                [class.shadow-2xs]="selectedPeriod() === '90d'"
                [class.text-slate-600]="selectedPeriod() !== '90d'"
              >
                90 Jours (Q)
              </button>
              <button
                type="button"
                (click)="setPeriod('180d')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                [class.bg-white]="selectedPeriod() === '180d'"
                [class.text-indigo-700]="selectedPeriod() === '180d'"
                [class.shadow-2xs]="selectedPeriod() === '180d'"
                [class.text-slate-600]="selectedPeriod() !== '180d'"
              >
                180 Jours (S)
              </button>
              <button
                type="button"
                (click)="setPeriod('365d')"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                [class.bg-white]="selectedPeriod() === '365d'"
                [class.text-indigo-700]="selectedPeriod() === '365d'"
                [class.shadow-2xs]="selectedPeriod() === '365d'"
                [class.text-slate-600]="selectedPeriod() !== '365d'"
              >
                365 Jours (1 An)
              </button>
            </div>
          </div>
        </div>

        <!-- Simulator Sliders (What-If Analysis) -->
        <div class="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-slate-700 font-semibold">Croissance Équipe Ingénierie :</span>
              <span class="font-mono font-bold text-indigo-600">+{{ growthRatePercent() }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              [value]="growthRatePercent()"
              (input)="onGrowthChange($event)"
              class="w-full accent-indigo-600 cursor-pointer"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Impacte les dotations onboarding (+{{ Math.round(growthRatePercent() * 0.4) }} ingénieurs)</span>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-slate-700 font-semibold">Cycle Renouvellement Laptops :</span>
              <span class="font-mono font-bold text-emerald-600">{{ hardwareCycleMonths() }} mois</span>
            </div>
            <input
              type="range"
              min="24"
              max="48"
              step="6"
              [value]="hardwareCycleMonths()"
              (input)="onCycleChange($event)"
              class="w-full accent-emerald-600 cursor-pointer"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Standard d'entreprise (24 à 48 mois)</span>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-slate-700 font-semibold">Inflation Matérielle IT :</span>
              <span class="font-mono font-bold text-amber-600">+{{ inflationRate() }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              [value]="inflationRate()"
              (input)="onInflationChange($event)"
              class="w-full accent-amber-600 cursor-pointer"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Composants mémoire &amp; semi-conducteurs</span>
          </div>
        </div>
      </div>

      <!-- Forecast Summary Highlight KPI Banner -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Projection à Échéance</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {{ formatVal(finalForecastValue()) }}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Valeur attendue à la fin de la période ({{ selectedPeriod() }})
          </p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Intervalle de Confiance (95%)</span>
          <div class="mt-2 text-xs font-mono space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Borne Haute :</span>
              <span class="font-bold text-rose-600">{{ formatVal(finalUpperBound()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Borne Basse :</span>
              <span class="font-bold text-emerald-600">{{ formatVal(finalLowerBound()) }}</span>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Marge d'erreur prédictive estimée à &plusmn; {{ formatVal(forecastSpread()) }}
          </p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Tendance / Dérive Estimée</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span
              class="text-2xl sm:text-3xl font-extrabold font-mono"
              [class.text-emerald-600]="trendPercentage() >= 0"
              [class.text-amber-600]="trendPercentage() < 0"
            >
              {{ trendPercentage() >= 0 ? '+' : '' }}{{ trendPercentage() }}%
            </span>
            <span class="text-xs text-slate-400">vs point de départ</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Modèle : {{ forecastData()?.metadata?.modelUsed || 'ARIMA Multi-Séries IT v2.5' }}
          </p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Précision du Modèle (MAE)</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">
              {{ forecastData()?.metadata?.meanAbsoluteError || 3.8 }}%
            </span>
            <span class="text-xs text-slate-400">erreur abs. moyenne</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Fiabilité de convergence : <strong class="text-emerald-600 font-semibold">Élevée (95%)</strong>
          </p>
        </div>
      </div>

      <!-- Main Predictive Chart -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 class="text-sm font-bold text-slate-900">
                Courbe Historique &amp; Modélisation : {{ metricTitle() }}
              </h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Historique réel (ligne pleine) &bull; Projection prédictive (pointillés) &bull; Halo de confiance 95% ({{ periodLabel() }}).
            </p>
          </div>

          <div class="flex items-center gap-4 text-xs font-medium">
            <span class="flex items-center gap-1.5 text-slate-700">
              <span class="w-3.5 h-0.5 bg-slate-700 inline-block"></span>
              Historique
            </span>
            <span class="flex items-center gap-1.5 text-indigo-600">
              <span class="w-3.5 h-0.5 bg-indigo-600 border-t border-dashed inline-block"></span>
              Prévision
            </span>
            <span class="flex items-center gap-1.5 text-indigo-400">
              <span class="w-3 h-2 bg-indigo-100 border border-indigo-300 inline-block rounded-xs"></span>
              Intervalle 95%
            </span>
          </div>
        </div>

        <div class="relative w-full h-[320px]">
          <canvas #forecastCanvas class="w-full h-full"></canvas>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1 font-mono">
          <span>Simulation en temps réel actualisée selon les curseurs de croissance et d'inflation</span>
          <span>Généré : {{ forecastData()?.metadata?.generatedAt || 'À l\'instant' }}</span>
        </div>
      </div>

      <!-- Prescriptive AI Insights & Strategic Action Plans (Dynamic per Metric) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (insight of prescriptiveInsights(); track insight.title) {
          <div
            class="p-5 rounded-2xl border shadow-2xs transition-all"
            [class.bg-gradient-to-br]="true"
            [class.from-indigo-50]="insight.color === 'indigo'"
            [class.to-white]="true"
            [class.border-indigo-100]="insight.color === 'indigo'"
            [class.from-emerald-50]="insight.color === 'emerald'"
            [class.border-emerald-100]="insight.color === 'emerald'"
            [class.from-amber-50]="insight.color === 'amber'"
            [class.border-amber-100]="insight.color === 'amber'"
            [class.from-rose-50]="insight.color === 'rose'"
            [class.border-rose-100]="insight.color === 'rose'"
          >
            <div
              class="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs mb-3 shadow-2xs"
              [class.bg-indigo-600]="insight.color === 'indigo'"
              [class.bg-emerald-600]="insight.color === 'emerald'"
              [class.bg-amber-600]="insight.color === 'amber'"
              [class.bg-rose-600]="insight.color === 'rose'"
            >
              @if (insight.color === 'indigo') { 📦 }
              @if (insight.color === 'emerald') { 💡 }
              @if (insight.color === 'amber') { ⚠️ }
              @if (insight.color === 'rose') { 🚨 }
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">
              {{ insight.title }}
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              {{ insight.desc }}
            </p>
          </div>
        }
      </div>

      <!-- Forecast Data Points Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Jalons Prédictifs Échantillonnés (Horizon {{ periodLabel() }})
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Valeurs projetées pour la métrique « {{ metricTitle() }} »
            </p>
          </div>
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {{ forecastData()?.forecast?.length || 0 }} points de projection
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Date Projetée</th>
                <th class="py-3 px-4 text-right">Valeur Estimée</th>
                <th class="py-3 px-4 text-right">Borne Inférieure (95%)</th>
                <th class="py-3 px-4 text-right">Borne Supérieure (95%)</th>
                <th class="py-3 px-4 text-center">Indice de Confiance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (point of forecastData()?.forecast; track point.date) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 font-mono font-semibold text-slate-900">
                    {{ point.date }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                    {{ formatVal(point.predictedValue) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-emerald-600">
                    {{ formatVal(point.lowerBound || 0) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-rose-600">
                    {{ formatVal(point.upperBound || 0) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      &plusmn; {{ point.confidenceInterval || 95 }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ForecastsComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly Math = Math;
  private statsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('forecastCanvas') forecastCanvas?: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  readonly isLoading = signal<boolean>(false);
  readonly selectedPeriod = signal<'7d' | '30d' | '90d' | '180d' | '365d'>('30d');
  readonly selectedMetric = signal<'budget' | 'depreciation' | 'refresh' | 'obsolescence' | 'energy'>('budget');
  readonly growthRatePercent = signal<number>(15);
  readonly hardwareCycleMonths = signal<number>(36);
  readonly inflationRate = signal<number>(4);

  readonly forecastData = signal<ForecastResponse | null>(null);

  readonly currentUnit = computed(() => {
    return this.forecastData()?.unit || (this.selectedMetric() === 'obsolescence' ? 'équipements' : '€');
  });

  readonly metricTitle = computed(() => {
    const m = this.selectedMetric();
    if (m === 'depreciation') return 'Dépréciation & Amortissement Cumulé';
    if (m === 'refresh') return 'Renouvellement & Fin de Cycle (36m+)';
    if (m === 'obsolescence') return 'Risque d\'Obsolescence & Fin de Support Constructeur';
    if (m === 'energy') return 'Dépense Énergétique & Consommation Datacenter';
    return 'Budget Achats & Investissement CapEx';
  });

  readonly periodLabel = computed(() => {
    const p = this.selectedPeriod();
    if (p === '7d') return '7 Jours (Hebdo)';
    if (p === '30d') return '30 Jours (Mensuel)';
    if (p === '90d') return '90 Jours (Trimestre Q)';
    if (p === '180d') return '180 Jours (Semestre S)';
    if (p === '365d') return '365 Jours (1 An Annuel)';
    return p;
  });

  readonly finalForecastValue = computed(() => {
    const points = this.forecastData()?.forecast;
    if (!points || !points.length) return 0;
    return points[points.length - 1].predictedValue;
  });

  readonly finalUpperBound = computed(() => {
    const points = this.forecastData()?.forecast;
    if (!points || !points.length) return 0;
    return points[points.length - 1].upperBound || 0;
  });

  readonly finalLowerBound = computed(() => {
    const points = this.forecastData()?.forecast;
    if (!points || !points.length) return 0;
    return points[points.length - 1].lowerBound || 0;
  });

  readonly forecastSpread = computed(() => {
    return Math.abs(this.finalUpperBound() - this.finalForecastValue());
  });

  readonly trendPercentage = computed(() => {
    const hist = this.forecastData()?.historical;
    const finalVal = this.finalForecastValue();
    if (!hist || !hist.length || finalVal === 0) return 0;
    const startVal = hist[hist.length - 1].value;
    if (startVal === 0) return 0;
    return Number((((finalVal - startVal) / startVal) * 100).toFixed(1));
  });

  readonly prescriptiveInsights = computed(() => {
    const m = this.selectedMetric();
    const p = this.selectedPeriod();
    const growth = this.growthRatePercent();
    const cycle = this.hardwareCycleMonths();
    const inflation = this.inflationRate();
    const finalVal = this.finalForecastValue();

    if (m === 'depreciation') {
      return [
        {
          title: 'Trajectoire d\'Amortissement Dégressif',
          desc: `La valeur nette comptable du parc décline vers ${this.formatVal(finalVal)} à échéance ${p}. Un plancher de récupération d'environ 20% est estimé pour la revente ou le reconditionnement.`,
          color: 'indigo'
        },
        {
          title: 'Optimisation Fiscale & Dotations',
          desc: `L'allongement de l'amortissement sur ${cycle} mois lisse le bilan comptable et dégage environ ${this.formatVal(finalVal * 0.12)} d'économies annuelles sur les dotations comptables.`,
          color: 'emerald'
        },
        {
          title: 'Sortie d\'Actifs Obsolètes',
          desc: `Pensez à déclasser comptablement les équipements arrivant en fin de vie pour éviter les taxes résiduelles et assainir l'inventaire matériel.`,
          color: 'amber'
        }
      ];
    }

    if (m === 'refresh') {
      return [
        {
          title: `Vague de Remplacement (Cycle ${cycle} Mois)`,
          desc: `Sur l'horizon ${p}, un volume de renouvellement estimé à ${this.formatVal(finalVal)} est préconisé pour maintenir la performance des équipes de dev.`,
          color: 'indigo'
        },
        {
          title: 'Gain de Productivité & Maintenance',
          desc: `Remplacer les postes anciens réduit de 38% les tickets d'assistance Helpdesk et prévient les pannes imprévues sur les composants critiques (batteries, SSD).`,
          color: 'emerald'
        },
        {
          title: 'Négociation Reprise Constructeur (Trade-In)',
          desc: `Engagez un programme de reprise constructeur pour récupérer jusqu'à 15% de la valeur des anciens PC portables Dell & MacBook récents.`,
          color: 'amber'
        }
      ];
    }

    if (m === 'obsolescence') {
      return [
        {
          title: 'Exposition aux Failles Matérielles (CVE)',
          desc: `Environ ${this.formatVal(finalVal)} risquent de sortir du support officiel à échéance ${p}. Risque accru sur les micrologiciels et BIOS sans correctifs.`,
          color: 'rose'
        },
        {
          title: 'Plan de Migration Préventif',
          desc: `Priorisez le remplacement des switchs réseau de cœur et serveurs de base de données avant l'expiration des contrats de garantie SLA 24/7.`,
          color: 'indigo'
        },
        {
          title: 'Extension de Garantie Constructeur',
          desc: `Pour les équipements critiques non remplaçables immédiatement, souscrivez une extension de garantie tierce maintenance (TPM) pour sécuriser l'exploitation.`,
          color: 'amber'
        }
      ];
    }

    if (m === 'energy') {
      return [
        {
          title: 'Dépense Électrique Projetée',
          desc: `Facture énergétique estimée à ${this.formatVal(finalVal)} sur ${p}. Les serveurs et commutateurs représentent 68% de l'empreinte totale.`,
          color: 'indigo'
        },
        {
          title: 'Politique Éco-Mode & Veille Centralisée',
          desc: `L'application d'un script d'extinction nocturne des écrans et postes de travail permet d'économiser jusqu'à ${this.formatVal(finalVal * 0.22)}.`,
          color: 'emerald'
        },
        {
          title: 'Densification & Virtualisation',
          desc: `Le passage de serveurs physiques sous-utilisés vers des instances conteneurisées réduira la facture de climatisation et PUE de la baie serveur.`,
          color: 'amber'
        }
      ];
    }

    // Default: budget
    return [
      {
        title: 'Fenêtre d\'Achat Optimale',
        desc: `Avec +${growth}% de croissance et +${inflation}% d'inflation, anticipez les commandes d'onboarding à J+15 pour verrouiller les tarifs fournisseurs.`,
        color: 'indigo'
      },
      {
        title: 'Maîtrise du CapEx & Remises sur Volume',
        desc: `Un regroupement trimestriel des commandes permet de négocier 8% à 12% de remise auprès des grossistes certifiés (Dell, Apple, Lenovo).`,
        color: 'emerald'
      },
      {
        title: 'Sécurisation de la Chaîne Logistique',
        desc: `Surveillez les délais constructeurs sur les stations IA et switchs PoE qui dépassent couramment 4 semaines de délai de livraison.`,
        color: 'amber'
      }
    ];
  });

  ngOnInit(): void {
    this.loadForecastData();
  }

  ngAfterViewInit(): void {
    if (this.forecastData()) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  setMetric(metric: 'budget' | 'depreciation' | 'refresh' | 'obsolescence' | 'energy'): void {
    this.selectedMetric.set(metric);
    this.loadForecastData();
  }

  setPeriod(period: '7d' | '30d' | '90d' | '180d' | '365d'): void {
    this.selectedPeriod.set(period);
    this.loadForecastData();
  }

  formatVal(val: number): string {
    const unit = this.currentUnit();
    if (unit === '€') {
      return `${Math.round(val).toLocaleString('fr-FR')} €`;
    }
    return `${Math.round(val)} ${unit}`;
  }

  onGrowthChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.growthRatePercent.set(val);
    this.loadForecastData();
  }

  onCycleChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.hardwareCycleMonths.set(val);
    this.loadForecastData();
  }

  onInflationChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.inflationRate.set(val);
    this.loadForecastData();
  }

  loadForecastData(): void {
    this.isLoading.set(true);
    const growth = (this.growthRatePercent() + this.inflationRate()) / 100;

    this.statsService.getForecasts(this.selectedPeriod(), this.selectedMetric(), growth).subscribe({
      next: (data) => {
        this.forecastData.set(data);
        this.isLoading.set(false);
        setTimeout(() => this.renderChart(), 80);
      },
      error: () => this.isLoading.set(false)
    });
  }

  renderChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.forecastCanvas?.nativeElement) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = undefined;
    }

    const data = this.forecastData();
    if (!data) return;

    const histLabels = data.historical.map((h) => h.date);
    const forecastLabels = data.forecast.map((f) => f.date);
    const allLabels = [...histLabels, ...forecastLabels];

    // Historical dataset: filled for histLabels, null for forecastLabels
    const histValues: (number | null)[] = [
      ...data.historical.map((h) => h.value),
      ...data.forecast.map(() => null)
    ];

    // Bridge connecting point
    const lastHistVal = data.historical.length ? data.historical[data.historical.length - 1].value : null;

    // Forecast dataset: null for all hist points except the last bridge point
    const forecastValues: (number | null)[] = [
      ...data.historical.slice(0, -1).map(() => null),
      lastHistVal,
      ...data.forecast.map((f) => f.predictedValue)
    ];

    const upperBounds: (number | null)[] = [
      ...data.historical.slice(0, -1).map(() => null),
      lastHistVal,
      ...data.forecast.map((f) => f.upperBound || f.predictedValue * 1.1)
    ];

    const lowerBounds: (number | null)[] = [
      ...data.historical.slice(0, -1).map(() => null),
      lastHistVal,
      ...data.forecast.map((f) => f.lowerBound || f.predictedValue * 0.9)
    ];

    const ctx = this.forecastCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const unitStr = this.currentUnit();
    const metricTitleStr = this.metricTitle();

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          // Upper bound (transparent fill down to lower bound)
          {
            label: 'Borne Supérieure (95%)',
            data: upperBounds,
            borderColor: 'rgba(99, 102, 241, 0.25)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            pointRadius: 0,
            borderWidth: 1,
            fill: '+1' // fills down to lower bound
          },
          // Lower bound
          {
            label: 'Borne Inférieure (95%)',
            data: lowerBounds,
            borderColor: 'rgba(99, 102, 241, 0.25)',
            pointRadius: 0,
            borderWidth: 1,
            fill: false
          },
          // Historical Series (solid slate)
          {
            label: 'Historique Constaté',
            data: histValues,
            borderColor: '#334155',
            backgroundColor: '#334155',
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3
          },
          // Forecast Series (dashed indigo)
          {
            label: 'Projection Prédictive ML',
            data: forecastValues,
            borderColor: '#6366f1',
            backgroundColor: '#6366f1',
            borderWidth: 2.5,
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#6366f1',
            tension: 0.35
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
              font: { family: 'Plus Jakarta Sans', size: 11 },
              filter: (item) => !item.text.includes('Borne') // hide bound labels from legend for cleanliness
            }
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                if (c.raw === null || c.raw === undefined) return '';
                const num = Number(c.raw);
                const formatted = unitStr === '€'
                  ? `${Math.round(num).toLocaleString('fr-FR')} €`
                  : `${Math.round(num)} ${unitStr}`;
                return ` ${c.dataset.label} : ${formatted}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (v) => {
                const num = Number(v);
                return unitStr === '€' ? `${Math.round(num).toLocaleString('fr-FR')} €` : `${Math.round(num)} ${unitStr}`;
              },
              font: { family: 'Plus Jakarta Sans', size: 11 }
            },
            grid: { color: '#f1f5f9' },
            title: { display: true, text: `${metricTitleStr} (${unitStr})`, font: { size: 11 } }
          }
        }
      }
    });
  }
}
