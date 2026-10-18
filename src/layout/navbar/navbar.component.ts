import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block sticky top-0 z-30 w-full'
  },
  template: `
    <header class="h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <!-- Left: Mobile toggle & Brand Title -->
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shrink-0"
          aria-label="Basculer le menu de navigation"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a routerLink="/dashboard" class="flex items-center gap-2.5 group shrink-0">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-indigo-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <span class="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block leading-none">IT Hardware BI</span>
            <span class="text-sm font-bold text-slate-900 leading-tight">Asset Store &amp; Gateway</span>
          </div>
        </a>
      </div>


      <!-- Right: Quick actions & User profile -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Quick AI Assistant Button -->
        <a
          routerLink="/chatbot"
          routerLinkActive="ring-2 ring-indigo-500 bg-indigo-100 text-indigo-800"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          title="Assistant IA SQL Server"
        >
          <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Assistant IA</span>
        </a>

        <!-- Notifications Bell -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleNotifications()"
            class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
          </button>

          <!-- Notification Dropdown -->
          @if (showNotifications()) {
            <div
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-800 uppercase tracking-wider">Événements Système</span>
                <span class="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">En direct</span>
              </div>
              <div class="divide-y divide-slate-100 text-xs">
                <div class="p-3 hover:bg-slate-50 transition-colors">
                  <p class="font-medium text-slate-800">Pipeline Ingestion Kafka actif</p>
                  <p class="text-slate-500 text-[11px] mt-0.5">Flux Fake Store API synchronisé vers SQL Server.</p>
                  <span class="text-[10px] text-slate-400 mt-1 block">Il y a 5 min</span>
                </div>
                <div class="p-3 hover:bg-slate-50 transition-colors">
                  <p class="font-medium text-slate-800">Modèle Prévisionnel mis à jour</p>
                  <p class="text-slate-500 text-[11px] mt-0.5">Calcul des tendances sur 30 jours disponible.</p>
                  <span class="text-[10px] text-slate-400 mt-1 block">Il y a 1 heure</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
            DA
          </div>
          <div class="hidden xl:block text-left">
            <span class="text-xs font-semibold text-slate-900 block leading-tight">Data Analyst</span>
            <span class="text-[11px] text-slate-500 block leading-tight font-mono">PFE BI</span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  showNotifications = signal(false);

  toggleNotifications(): void {
    this.showNotifications.update((v) => !v);
  }
}
