import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        @if (breadcrumb) {
          <div class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Plateforme</span>
            <span>&rsaquo;</span>
            <span class="text-indigo-600 font-semibold">{{ breadcrumb }}</span>
          </div>
        }
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{{ title }}</h1>
        @if (description) {
          <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {{ description }}
          </p>
        }
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <ng-content select="[actions]"></ng-content>

        @if (showRefresh) {
          <button
            type="button"
            (click)="refresh.emit()"
            [disabled]="isRefreshing"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
            title="Actualiser les données"
          >
            <svg
              class="w-3.5 h-3.5 text-slate-500"
              [class.animate-spin]="isRefreshing"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ isRefreshing ? 'Chargement...' : 'Actualiser' }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description?: string;
  @Input() breadcrumb?: string;
  @Input() showRefresh = false;
  @Input() isRefreshing = false;
  @Output() refresh = new EventEmitter<void>();
}
