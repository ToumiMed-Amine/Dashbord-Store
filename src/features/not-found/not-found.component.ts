import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center text-2xl font-bold mb-4 font-mono">
        404
      </div>
      <h1 class="text-xl font-bold text-slate-900 mb-2">Page introuvable</h1>
      <p class="text-xs text-slate-500 max-w-sm mb-6">
        La ressource demandée n'existe pas ou n'est plus accessible sur la plateforme analytique.
      </p>
      <a
        routerLink="/dashboard"
        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Retour au Tableau de Bord
      </a>
    </div>
  `
})
export class NotFoundComponent {}
