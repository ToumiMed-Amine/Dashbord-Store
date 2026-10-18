import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Configuration & Architecture Système"
        description="Paramètres de connectivité à l'API Gateway et vue d'ensemble du pipeline de données."
        breadcrumb="Paramètres"
      ></app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gateway Configuration Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Configuration de la Passerelle API
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">URL Passerelle (API Gateway)</span>
              <span class="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{{ env.apiUrl }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">Environnement</span>
              <span class="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {{ env.production ? 'Production' : 'Développement' }}
              </span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500">Version de l'Application</span>
              <span class="font-mono text-slate-600">{{ env.version }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-slate-500">Framework Frontend</span>
              <span class="font-semibold text-indigo-600">Angular v22 (Standalone)</span>
            </div>
          </div>
        </div>

        <!-- Security & Architecture Compliance Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Conformité des Règles d'Architecture
          </h3>
          <div class="space-y-2.5 text-xs text-slate-600">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span><strong>Point d'entrée unique :</strong> Toutes les requêtes transitent exclusivement par <code>/api</code>.</span>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span><strong>Aucun secret dans le client :</strong> Clés Gemini, mots de passe SQL et identifiants Kafka gérés côté backend.</span>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span><strong>Isolement Kafka &amp; SQL Server :</strong> Aucun appel direct du frontend vers les microservices internes.</span>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span><strong>Confidentialité utilisateur :</strong> Le champ <code>password</code> est strictement banni de l'affichage.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  env = environment;
}
