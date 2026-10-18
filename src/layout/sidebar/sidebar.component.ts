import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'shrink-0'
  },
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen) {
      <div
        (click)="closeSidebar.emit()"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-35 lg:hidden transition-opacity"
      ></div>
    }

    <!-- Persistent Left Sidebar: Always in the same place on all pages -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 h-screen"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen"
    >
      <!-- Brand & Mobile Close -->
      <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <a routerLink="/dashboard" class="flex items-center gap-3 group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            IT
          </div>
          <div>
            <h1 class="font-bold text-sm text-white tracking-wide leading-tight">IT Hardware BI</h1>
            <p class="text-[10px] text-slate-400 font-mono leading-none">Asset Store &amp; Gateway</p>
          </div>
        </a>

        <button
          type="button"
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          aria-label="Fermer le menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Section -->
      <div class="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Analytique
          </div>
          <nav class="space-y-1">
            @for (item of primaryNavItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                [routerLinkActiveOptions]="{ exact: false }"
                (click)="onNavigate()"
                class="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
              >
                <div class="flex items-center gap-3">
                  <span [innerHTML]="item.icon" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></span>
                  <span>{{ item.label }}</span>
                </div>
                @if (item.badge) {
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-300"
                  >
                    {{ item.badge }}
                  </span>
                }
              </a>
            }
          </nav>
        </div>

        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Système & Paramètres
          </div>
          <nav class="space-y-1">
            @for (item of secondaryNavItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-500"
                [routerLinkActiveOptions]="{ exact: false }"
                (click)="onNavigate()"
                class="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
              >
                <div class="flex items-center gap-3">
                  <span [innerHTML]="item.icon" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></span>
                  <span>{{ item.label }}</span>
                </div>
              </a>
            }
          </nav>
        </div>
      </div>


    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  readonly primaryNavItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`
    },
    {
      path: '/products',
      label: 'Produits',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`
    },
    {
      path: '/users',
      label: 'Utilisateurs',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
    },
    {
      path: '/carts',
      label: 'Paniers',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
    },
    {
      path: '/statistics',
      label: 'Statistiques',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
    },
    {
      path: '/forecasts',
      label: 'Prévisions',
      badge: 'ML',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>`
    },
    {
      path: '/chatbot',
      label: 'Assistant IA',
      badge: 'LLM',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>`
    }
  ];

  readonly secondaryNavItems: NavItem[] = [
    {
      path: '/settings',
      label: 'Configuration',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
    }
  ];

  onNavigate(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.closeSidebar.emit();
    }
  }
}
