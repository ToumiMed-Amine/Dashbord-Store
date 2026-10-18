import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatisticsService } from '../../core/services/statistics.service';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../core/models/product.model';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTag?: string;
  dataCards?: { label: string; value: string | number; badge?: string }[];
  isThinking?: boolean;
  copied?: boolean;
  helpful?: boolean | null;
  quickLinks?: { label: string; route: string; icon: string }[];
  model?: string;
  isLlm?: boolean;
  originalPrompt?: string;
  originalActionCode?: string;
  originalActionTag?: string;
}

interface PredefinedAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  badge: string;
  actionCode: string;
  color: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Assistant IA & Fonctions Analytiques Pré-définies"
        description="Moteur décisionnel pour la gouvernance et le pilotage prédictif du parc IT basé sur la base de données temporaire."
        breadcrumb="Assistant IA"
      >
        <div actions class="flex flex-wrap items-center gap-2">
          <!-- LLM Active Status Indicator -->
          <div
            class="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 border"
            [class.bg-emerald-50]="llmInfo().apiKeyConfigured"
            [class.text-emerald-800]="llmInfo().apiKeyConfigured"
            [class.border-emerald-200]="llmInfo().apiKeyConfigured"
            [class.bg-amber-50]="!llmInfo().apiKeyConfigured"
            [class.text-amber-800]="!llmInfo().apiKeyConfigured"
            [class.border-amber-200]="!llmInfo().apiKeyConfigured"
            title="Moteur d'intelligence artificielle générative"
          >
            <span
              class="w-2 h-2 rounded-full"
              [class.bg-emerald-500]="llmInfo().apiKeyConfigured"
              [class.animate-pulse]="llmInfo().apiKeyConfigured"
              [class.bg-amber-500]="!llmInfo().apiKeyConfigured"
            ></span>
            <span>LLM : <strong class="font-bold">{{ llmInfo().model }}</strong></span>
          </div>

          <!-- Toggle Live Data Inspector Button -->
          <button
            type="button"
            (click)="toggleDataInspector()"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            [class.bg-indigo-600]="showDataInspector()"
            [class.text-white]="showDataInspector()"
            [class.bg-white]="!showDataInspector()"
            [class.text-slate-700]="!showDataInspector()"
            [class.border]="!showDataInspector()"
            [class.border-slate-200]="!showDataInspector()"
            title="Inspecter la mémoire temporaire du parc IT"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>
              @if (showDataInspector()) {
                Fermer l'Inspecteur
              } @else {
                Inspecteur Données IT
              }
            </span>
          </button>

          <!-- Export Session as Markdown Report -->
          <button
            type="button"
            (click)="exportSessionReport()"
            class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Exporter l'échange au format Markdown"
          >
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exporter Rapport</span>
          </button>

          <!-- Clear Conversation Button -->
          <button
            type="button"
            (click)="clearMessages()"
            class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Effacer l'historique de discussion"
          >
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Réinitialiser</span>
          </button>
        </div>
      </app-page-header>

      <!-- Predefined Functions Grid (Fonctions Pré-définies sur la Donnée Temporaire) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 mb-1 border border-indigo-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Fonctions Pré-définies &bull; Données Temporaires en Direct
            </div>
            <h3 class="text-sm sm:text-base font-bold text-white">
              Déclencheurs d'Analyse Intelligente Instantanée
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-300 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
              CapEx : <strong class="text-emerald-400">{{ totalValuationDisplay() }} €</strong>
            </span>
            <span class="text-xs font-mono text-slate-300 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
              {{ activeProducts().length }} matériels IT
            </span>
          </div>
        </div>

        <p class="text-xs text-slate-300 mb-4 max-w-3xl leading-relaxed">
          Exécutez en un clic l'une des 6 fonctions décisionnelles optimisées pour analyser en mémoire locale vos équipements, dotations collaborateurs et budgets prévisionnels.
        </p>

        <!-- 6 Predefined Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (fn of predefinedFunctions; track fn.id) {
            <button
              type="button"
              (click)="triggerPredefinedAction(fn)"
              class="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 hover:bg-slate-800/90 hover:border-indigo-500/60 transition-all text-left group cursor-pointer flex flex-col justify-between hover:shadow-lg"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xl group-hover:scale-110 transition-transform">{{ fn.icon }}</span>
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    [class.bg-indigo-500/20]="fn.color === 'indigo'"
                    [class.text-indigo-300]="fn.color === 'indigo'"
                    [class.bg-emerald-500/20]="fn.color === 'emerald'"
                    [class.text-emerald-300]="fn.color === 'emerald'"
                    [class.bg-amber-500/20]="fn.color === 'amber'"
                    [class.text-amber-300]="fn.color === 'amber'"
                    [class.bg-blue-500/20]="fn.color === 'blue'"
                    [class.text-blue-300]="fn.color === 'blue'"
                    [class.bg-purple-500/20]="fn.color === 'purple'"
                    [class.text-purple-300]="fn.color === 'purple'"
                    [class.bg-rose-500/20]="fn.color === 'rose'"
                    [class.text-rose-300]="fn.color === 'rose'"
                  >
                    {{ fn.badge }}
                  </span>
                </div>
                <h4 class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {{ fn.label }}
                </h4>
                <p class="text-[11px] text-slate-400 mt-1 leading-snug">
                  {{ fn.description }}
                </p>
              </div>

              <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-indigo-200">
                <span class="font-medium">Lancer le calcul</span>
                <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Layout: Grid with Chat + Optional Live Inspector Drawer -->
      <div class="grid grid-cols-1" [class.lg:grid-cols-3]="showDataInspector()" [class.gap-6]="showDataInspector()">
        <!-- Conversational Chat Box (takes 2 cols if inspector is open, else full width) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[620px]" [class.lg:col-span-2]="showDataInspector()">
          <!-- Chat Header Bar -->
          <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                AI
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-bold text-slate-900">
                    Moteur Décisionnel &amp; Audit IT
                  </h4>
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connecté
                  </span>
                </div>
                <p class="text-[10px] text-slate-400 font-mono">
                  Base en mémoire immédiate &bull; Calculs déterministes temps réel
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {{ messages().length }} échange(s)
              </span>
            </div>
          </div>

          <!-- Messages Scrollable Body -->
          <div #scrollContainer class="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            @for (msg of messages(); track msg.id) {
              <div
                class="flex gap-3"
                [class.justify-end]="msg.sender === 'user'"
                [class.justify-start]="msg.sender === 'assistant'"
              >
                <!-- Assistant Avatar -->
                @if (msg.sender === 'assistant') {
                  <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1 shadow-2xs">
                    AI
                  </div>
                }

                <!-- Bubble Content -->
                <div
                  class="max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs shadow-2xs transition-all"
                  [class.bg-indigo-600]="msg.sender === 'user'"
                  [class.text-white]="msg.sender === 'user'"
                  [class.bg-white]="msg.sender === 'assistant'"
                  [class.text-slate-800]="msg.sender === 'assistant'"
                  [class.border]="msg.sender === 'assistant'"
                  [class.border-slate-200]="msg.sender === 'assistant'"
                >
                  <!-- Optional Action Tag Badge -->
                  @if (msg.actionTag) {
                    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
                      <span>⚡ Fonction :</span>
                      <strong>{{ msg.actionTag }}</strong>
                    </div>
                  }

                  <!-- Thinking Animated Skeleton -->
                  @if (msg.isThinking) {
                    <div class="flex items-center gap-2 text-slate-500 py-2">
                      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                      <span class="text-xs font-medium ml-1">Interrogation de la mémoire temporaire en cours...</span>
                    </div>
                  } @else {
                    <!-- Main Text Body with Enhanced HTML Formatting -->
                    <div class="leading-relaxed font-sans prose-sm" [innerHTML]="formatMessage(msg.text)"></div>

                    <!-- Structured KPI Cards (if attached) -->
                    @if (msg.dataCards && msg.dataCards.length > 0) {
                      <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        @for (card of msg.dataCards; track card.label) {
                          <div class="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
                            <span class="text-[10px] text-slate-400 font-medium truncate">{{ card.label }}</span>
                            <span class="text-xs font-bold text-slate-900 font-mono mt-0.5">{{ card.value }}</span>
                          </div>
                        }
                      </div>
                    }

                    <!-- Quick Navigation Links (if attached) -->
                    @if (msg.quickLinks && msg.quickLinks.length > 0) {
                      <div class="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                        @for (link of msg.quickLinks; track link.route) {
                          <a
                            [routerLink]="link.route"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          >
                            <span>{{ link.icon }}</span>
                            <span>{{ link.label }}</span>
                            <span class="text-xs">&rarr;</span>
                          </a>
                        }
                      </div>
                    }

                    <!-- Message Actions Footer (Timestamp, Voice, Copy, Feedback) -->
                    <div
                      class="mt-3 pt-2 flex items-center justify-between text-[10px]"
                      [class.border-t]="msg.sender === 'assistant'"
                      [class.border-slate-100]="msg.sender === 'assistant'"
                      [class.text-indigo-200]="msg.sender === 'user'"
                      [class.text-slate-400]="msg.sender === 'assistant'"
                    >
                      <div class="flex items-center gap-2">
                        <span class="font-mono">{{ msg.timestamp }}</span>
                        @if (msg.sender === 'assistant' && msg.model) {
                          <span
                            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                            [class.bg-purple-50]="msg.isLlm"
                            [class.text-purple-700]="msg.isLlm"
                            [class.border]="msg.isLlm"
                            [class.border-purple-200]="msg.isLlm"
                            [class.bg-slate-100]="!msg.isLlm"
                            [class.text-slate-600]="!msg.isLlm"
                          >
                            <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="msg.isLlm" [class.bg-slate-400]="!msg.isLlm"></span>
                            {{ msg.isLlm ? 'Gemini 3.8 Flash' : msg.model }}
                          </span>
                        }
                      </div>

                      @if (msg.sender === 'assistant') {
                        <div class="flex items-center gap-3">
                          <!-- Regenerate Button -->
                          <button
                            type="button"
                            (click)="regenerateMessage(msg)"
                            [disabled]="isProcessing()"
                            class="hover:text-indigo-600 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[10px]"
                            title="Régénérer cette réponse avec l'IA"
                          >
                            <svg class="w-3 h-3" [class.animate-spin]="isProcessing() && regeneratingMsgId() === msg.id" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{{ isProcessing() && regeneratingMsgId() === msg.id ? 'Génération...' : 'Régénérer' }}</span>
                          </button>

                          <!-- Text to Speech / Voice Button -->
                          <button
                            type="button"
                            (click)="toggleSpeak(msg)"
                            class="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                            title="Écouter la synthèse vocale"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span>{{ isSpeaking() && speakingMsgId() === msg.id ? 'Arrêter' : 'Écouter' }}</span>
                          </button>

                          <!-- Copy Button -->
                          <button
                            type="button"
                            (click)="copyToClipboard(msg)"
                            class="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                            title="Copier le contenu du message"
                          >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{{ msg.copied ? 'Copié !' : 'Copier' }}</span>
                          </button>

                          <!-- Helpful feedback thumbs -->
                          <div class="flex items-center gap-1">
                            <button
                              type="button"
                              (click)="setFeedback(msg, true)"
                              class="hover:text-emerald-600 transition-colors cursor-pointer"
                              [class.text-emerald-600]="msg.helpful === true"
                              title="Utile"
                            >
                              👍
                            </button>
                            <button
                              type="button"
                              (click)="setFeedback(msg, false)"
                              class="hover:text-rose-600 transition-colors cursor-pointer"
                              [class.text-rose-600]="msg.helpful === false"
                              title="Non pertinent"
                            >
                              👎
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- User Avatar -->
                @if (msg.sender === 'user') {
                  <div class="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1 shadow-2xs">
                    DSI
                  </div>
                }
              </div>
            }
          </div>

          <!-- Suggested Prompt Chips (Scrollable horizontal row) -->
          <div class="px-5 py-2.5 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
            <span class="text-slate-400 font-semibold whitespace-nowrap">Suggestions :</span>
            @for (item of quickPrompts; track item.label) {
              <button
                type="button"
                (click)="sendQuickPrompt(item.prompt)"
                class="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {{ item.label }}
              </button>
            }
          </div>

          <!-- Bottom Form Input Bar -->
          <div class="p-3 bg-white border-t border-slate-200 shrink-0">
            <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
              <div class="relative flex-1">
                <input
                  type="text"
                  [formControl]="queryInput"
                  placeholder="Posez une question sur le parc IT, les devis onboarding, les ruptures de stock..."
                  class="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white placeholder:text-slate-400"
                />
                @if (queryInput.value) {
                  <button
                    type="button"
                    (click)="queryInput.reset()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    &times;
                  </button>
                }
              </div>

              @if (canRegenerateLast()) {
                <button
                  type="button"
                  (click)="regenerateLastResponse()"
                  [disabled]="isProcessing()"
                  class="px-3 py-2.5 bg-slate-100 hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 disabled:opacity-40 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  title="Régénérer la dernière analyse"
                >
                  <svg class="w-3.5 h-3.5" [class.animate-spin]="isProcessing() && regeneratingMsgId() !== null" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="hidden sm:inline">Régénérer</span>
                </button>
              }

              <button
                type="submit"
                [disabled]="queryInput.invalid || isProcessing()"
                class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Envoyer</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <!-- Optional Side Drawer: Live Data Inspector (Col 3) -->
        @if (showDataInspector()) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col h-[620px] overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Mémoire IT Temps Réel
                </h4>
              </div>
              <button
                type="button"
                (click)="toggleDataInspector()"
                class="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                title="Fermer"
              >
                &times;
              </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <!-- KPI Summary Mini Cards -->
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 block font-medium">CapEx Total</span>
                  <span class="text-xs font-bold text-indigo-600 font-mono mt-0.5 block">
                    {{ totalValuationDisplay() }} €
                  </span>
                </div>
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span class="text-[10px] text-slate-400 block font-medium">Prix Moyen</span>
                  <span class="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                    {{ averagePriceDisplay() }} €
                  </span>
                </div>
              </div>

              <!-- Categories Breakdown -->
              <div>
                <span class="text-[11px] font-bold text-slate-700 block mb-2">Segments du Parc</span>
                <div class="space-y-1.5">
                  @for (cat of categorySummary(); track cat.name) {
                    <div class="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]">
                      <span class="font-medium text-slate-700 truncate max-w-[130px]">{{ cat.name }}</span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-slate-500">{{ cat.count }} réf.</span>
                        <span class="font-mono font-bold text-slate-900">{{ cat.valuation }} €</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Low Stock Alerts -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-slate-700">Alertes Stock Faible</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                    {{ lowStockItems().length }}
                  </span>
                </div>

                @if (lowStockItems().length > 0) {
                  <div class="space-y-1.5">
                    @for (item of lowStockItems().slice(0, 4); track item.id) {
                      <div class="p-2 bg-rose-50/60 border border-rose-100 rounded-lg flex items-center justify-between text-[11px]">
                        <span class="font-medium text-slate-800 truncate max-w-[140px]">{{ item.title }}</span>
                        <span class="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          Reste {{ item.stock }}
                        </span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[11px] text-slate-400 italic">Tous les stocks sont normaux.</p>
                }
              </div>

              <!-- Quick Link shortcuts -->
              <div class="pt-2 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-700 block mb-2">Raccourcis Modules</span>
                <div class="grid grid-cols-2 gap-2">
                  <a
                    routerLink="/statistics"
                    class="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-center font-medium transition-colors cursor-pointer"
                  >
                    📊 Statistiques
                  </a>
                  <a
                    routerLink="/forecasts"
                    class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-center font-medium transition-colors cursor-pointer"
                  >
                    🔮 Prévisions
                  </a>
                  <a
                    routerLink="/products"
                    class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center font-medium transition-colors cursor-pointer"
                  >
                    💻 Catalogue IT
                  </a>
                  <a
                    routerLink="/carts"
                    class="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-center font-medium transition-colors cursor-pointer"
                  >
                    🛒 Dotations
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  private http = inject(HttpClient);
  private statsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  readonly activeProducts = signal<Product[]>([]);
  readonly activeCartsCount = signal<number>(0);
  readonly isProcessing = signal<boolean>(false);
  readonly messages = signal<AssistantMessage[]>([]);
  readonly showDataInspector = signal<boolean>(false);

  // LLM Status and engine metadata
  readonly llmInfo = signal<{ status: string; model: string; provider: string; apiKeyConfigured: boolean }>({
    status: 'active',
    model: 'gemini-3.8-flash',
    provider: 'Google Gemini',
    apiKeyConfigured: true
  });

  // Audio / Speech Synthesis state
  readonly isSpeaking = signal<boolean>(false);
  readonly speakingMsgId = signal<string | null>(null);
  readonly regeneratingMsgId = signal<string | null>(null);

  readonly canRegenerateLast = computed(() => {
    return this.messages().some((m) => m.sender === 'assistant' && !m.isThinking);
  });

  readonly queryInput = new FormControl('', [Validators.required, Validators.minLength(2)]);

  // Computed values from products in memory
  readonly totalValuation = computed(() => {
    return this.activeProducts().reduce((sum, p) => sum + p.price * ((p as unknown as { stock?: number }).stock || 1), 0);
  });

  readonly totalValuationDisplay = computed(() => {
    return this.totalValuation().toLocaleString('fr-FR');
  });

  readonly averagePriceDisplay = computed(() => {
    const list = this.activeProducts();
    if (list.length === 0) return '0';
    const sum = list.reduce((acc, p) => acc + p.price, 0);
    return (sum / list.length).toFixed(2);
  });

  readonly lowStockItems = computed(() => {
    return this.activeProducts().filter((p) => ((p as unknown as { stock?: number }).stock ?? 10) < 10);
  });

  readonly categorySummary = computed(() => {
    const map = new Map<string, { count: number; val: number }>();
    for (const p of this.activeProducts()) {
      const e = map.get(p.category) || { count: 0, val: 0 };
      e.count += 1;
      e.val += p.price * ((p as unknown as { stock?: number }).stock || 1);
      map.set(p.category, e);
    }
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      valuation: Math.round(data.val).toLocaleString('fr-FR')
    }));
  });

  readonly quickPrompts = [
    { label: '💎 Équipement le plus cher', prompt: "Quel est l'équipement le plus cher du catalogue ?" },
    { label: '🚀 Pack onboarding 3 dev', prompt: "Quels sont les besoins matériels pour l'arrivée de 3 nouveaux ingénieurs ?" },
    { label: '🚨 Alertes de stock faible', prompt: 'Quels sont les articles en alerte de stock ou rupture ?' },
    { label: '📁 Répartition par catégorie', prompt: 'Donne-moi la répartition par catégorie et leur valorisation' },
    { label: '🏢 Serveurs Dell & Rack', prompt: 'Présente les serveurs Dell PowerEdge et infrastructure' },
    { label: '💡 Optimiser le TCO', prompt: 'Comment optimiser le TCO et les coûts matériels du parc ?' }
  ];

  readonly predefinedFunctions: PredefinedAction[] = [
    {
      id: 'audit',
      actionCode: 'audit',
      icon: '📊',
      label: 'Audit & Synthèse Globale',
      description: 'Calcul instantané de la valorisation du stock, des volumes et du coût moyen.',
      badge: 'Audit CapEx',
      color: 'indigo'
    },
    {
      id: 'forecast',
      actionCode: 'forecast',
      icon: '🔮',
      label: 'Prévision Budgétaire & Renouvellement',
      description: 'Projections des dépenses d\'approvisionnement à Q+1 et fin de vie matériel.',
      badge: 'Prédictif ML',
      color: 'emerald'
    },
    {
      id: 'anomalies',
      actionCode: 'anomalies',
      icon: '⚠️',
      label: 'Détection d\'Anomalies & Dispersion',
      description: 'Isolement des équipements hors-normes (> 1.4σ) et surcoûts matériels.',
      badge: 'Contrôle Risques',
      color: 'amber'
    },
    {
      id: 'optim',
      actionCode: 'optim',
      icon: '💡',
      label: 'Optimisation des Coûts du Parc',
      description: 'Plan d\'actions concrètes : remises volume, standardisation et TCO.',
      badge: 'Recommandation',
      color: 'blue'
    },
    {
      id: 'carts',
      actionCode: 'carts',
      icon: '🛒',
      label: 'Audit Affectations & Commandes',
      description: 'Analyse des dotations collaborateurs en attente et livraisons.',
      badge: 'Dotations',
      color: 'purple'
    },
    {
      id: 'report',
      actionCode: 'report',
      icon: '📑',
      label: 'Rapport Exécutif Comité DSI',
      description: 'Génération du rapport de synthèse structuré prêt pour la gouvernance.',
      badge: 'Gouvernance',
      color: 'rose'
    }
  ];

  ngOnInit(): void {
    this.loadCatalogData();
    // Initial rich welcome message
    this.messages.set([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Bonjour ! Je suis votre **Assistant IA décisionnel pour le Parc IT** 🖥️.\n\nJ'ai analysé en temps réel le catalogue d'équipements informatiques, les dotations utilisateurs et les indicateurs statistiques de votre base temporaire.\n\nVous pouvez cliquer sur l'une des **fonctions pré-définies** ci-dessus (Audit, Prévision, Détection d'anomalies, Optimisation, Rapport DSI) ou me poser directement une question en langage naturel ci-dessous.`,
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        dataCards: [
          { label: 'Statut Moteur', value: 'Opérationnel', badge: 'Online' },
          { label: 'Source', value: 'Catalogue IT Local', badge: 'Live' }
        ],
        model: 'gemini-3.8-flash',
        isLlm: true,
        quickLinks: [
          { label: 'Catalogue IT', route: '/products', icon: '💻' },
          { label: 'Statistiques', route: '/statistics', icon: '📊' },
          { label: 'Prévisions', route: '/forecasts', icon: '🔮' }
        ]
      }
    ]);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  loadCatalogData(): void {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (prods) => this.activeProducts.set(prods || [])
    });
    this.http.get<{ value: number }>('/api/metrics/total-carts').subscribe({
      next: (res) => this.activeCartsCount.set(res?.value || 0)
    });
    this.http.get<{ status: string; model: string; provider: string; apiKeyConfigured: boolean }>('/api/llm/status').subscribe({
      next: (info) => {
        if (info) {
          this.llmInfo.set(info);
        }
      }
    });
  }

  toggleDataInspector(): void {
    this.showDataInspector.update((v) => !v);
  }

  triggerPredefinedAction(fn: PredefinedAction): void {
    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: `Exécuter la fonction pré-définie : ${fn.label}`,
      timestamp: new Date().toLocaleTimeString('fr-FR')
    };

    const tempAssistantId = `asst-${Date.now()}`;
    const thinkingMsg: AssistantMessage = {
      id: tempAssistantId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      actionTag: fn.label,
      isThinking: true
    };

    this.messages.update((list) => [...list, userMsg, thinkingMsg]);
    this.isProcessing.set(true);

    this.statsService.askAssistant(fn.label, fn.actionCode).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.replaceThinkingMessage(
          tempAssistantId,
          res.answer,
          fn.label,
          res.data,
          fn.actionCode,
          res.model,
          res.isLlm,
          fn.label,
          fn.actionCode,
          fn.label
        );
      },
      error: () => {
        this.isProcessing.set(false);
        const fallbackText = this.computeLocalResponse(fn.actionCode);
        this.replaceThinkingMessage(
          tempAssistantId,
          fallbackText,
          fn.label,
          null,
          fn.actionCode,
          'Moteur de secours IT',
          false,
          fn.label,
          fn.actionCode,
          fn.label
        );
      }
    });
  }

  sendQuickPrompt(promptText: string): void {
    this.queryInput.setValue(promptText);
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.queryInput.value?.trim();
    if (!text || this.isProcessing()) return;

    this.queryInput.reset();

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR')
    };

    const tempAssistantId = `asst-${Date.now()}`;
    const thinkingMsg: AssistantMessage = {
      id: tempAssistantId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      isThinking: true,
      originalPrompt: text
    };

    this.messages.update((list) => [...list, userMsg, thinkingMsg]);
    this.isProcessing.set(true);

    this.statsService.askAssistant(text).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.replaceThinkingMessage(tempAssistantId, res.answer, undefined, res.data, undefined, res.model, res.isLlm, text);
      },
      error: () => {
        this.isProcessing.set(false);
        const fallbackText = this.computeFreeTextResponse(text);
        this.replaceThinkingMessage(tempAssistantId, fallbackText, undefined, null, undefined, 'Moteur de secours IT', false, text);
      }
    });
  }

  regenerateMessage(msg: AssistantMessage): void {
    if (this.isProcessing()) return;

    const msgIndex = this.messages().findIndex((m) => m.id === msg.id);
    let promptToUse = msg.originalPrompt;
    let actionCodeToUse = msg.originalActionCode;
    let actionTagToUse = msg.originalActionTag || msg.actionTag;

    // Search preceding user message if prompt isn't directly attached
    if (!promptToUse && !actionCodeToUse) {
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (this.messages()[i].sender === 'user') {
          promptToUse = this.messages()[i].text;
          break;
        }
      }
    }

    // Default fallback if welcome message or standalone
    if (!promptToUse && !actionCodeToUse) {
      promptToUse = 'Audit et synthèse actualisée du parc informatique';
      actionCodeToUse = 'audit';
      actionTagToUse = 'Audit & Synthèse Globale';
    }

    this.regeneratingMsgId.set(msg.id);
    this.isProcessing.set(true);

    // Set target message into thinking state
    this.messages.update((list) =>
      list.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              isThinking: true,
              text: ''
            }
          : m
      )
    );

    this.statsService.askAssistant(promptToUse || '', actionCodeToUse).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.regeneratingMsgId.set(null);
        this.replaceThinkingMessage(
          msg.id,
          res.answer,
          actionTagToUse,
          res.data,
          actionCodeToUse,
          res.model,
          res.isLlm,
          promptToUse,
          actionCodeToUse,
          actionTagToUse
        );
      },
      error: () => {
        this.isProcessing.set(false);
        this.regeneratingMsgId.set(null);
        const fallbackText = actionCodeToUse
          ? this.computeLocalResponse(actionCodeToUse)
          : this.computeFreeTextResponse(promptToUse || '');
        this.replaceThinkingMessage(
          msg.id,
          fallbackText,
          actionTagToUse,
          null,
          actionCodeToUse,
          'Moteur de secours IT',
          false,
          promptToUse,
          actionCodeToUse,
          actionTagToUse
        );
      }
    });
  }

  regenerateLastResponse(): void {
    const msgs = this.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === 'assistant' && !msgs[i].isThinking) {
        this.regenerateMessage(msgs[i]);
        break;
      }
    }
  }

  private replaceThinkingMessage(
    id: string,
    answerText: string,
    actionTag?: string,
    data?: Record<string, unknown> | null,
    actionCode?: string,
    model?: string,
    isLlm?: boolean,
    origPrompt?: string,
    origActionCode?: string,
    origActionTag?: string
  ): void {
    let cards: { label: string; value: string | number }[] | undefined;
    let links: { label: string; route: string; icon: string }[] | undefined;

    if (data) {
      cards = [];
      if (data['totalValuation']) {
        cards.push({ label: 'CapEx Stock', value: `${Number(data['totalValuation']).toLocaleString('fr-FR')} €` });
      }
      if (data['activeAssets']) {
        cards.push({ label: 'Actifs Homologués', value: `${data['activeAssets']} réf.` });
      }
      if (data['averageUnitPrice']) {
        cards.push({ label: 'Prix Moyen', value: `${data['averageUnitPrice']} €` });
      }
      if (data['nextQuarterEstimate']) {
        cards.push({ label: 'Budget Q+1', value: `${Number(data['nextQuarterEstimate']).toLocaleString('fr-FR')} €` });
      }
      if (data['standardDeviation']) {
        cards.push({ label: 'Écart-Type (σ)', value: `${data['standardDeviation']} €` });
      }
      if (data['projectedSavings']) {
        cards.push({ label: 'Économie Projetée', value: `${Number(data['projectedSavings']).toLocaleString('fr-FR')} €` });
      }
      if (data['totalPackCost']) {
        cards.push({ label: 'Coût Pack Total', value: `${Number(data['totalPackCost']).toLocaleString('fr-FR')} €` });
      }
      if (data['unitCost']) {
        cards.push({ label: 'Par Développeur', value: `${Number(data['unitCost']).toLocaleString('fr-FR')} €` });
      }
    }

    // Add relevant action links based on context
    if (actionCode === 'audit' || actionCode === 'anomalies') {
      links = [
        { label: 'Voir Statistiques Détaillées', route: '/statistics', icon: '📊' },
        { label: 'Ouvrir Catalogue IT', route: '/products', icon: '💻' }
      ];
    } else if (actionCode === 'forecast') {
      links = [
        { label: 'Voir Courbes Prédictives', route: '/forecasts', icon: '🔮' },
        { label: 'Consulter les Paniers', route: '/carts', icon: '🛒' }
      ];
    } else if (actionCode === 'carts') {
      links = [
        { label: 'Gérer les Paniers & Dotations', route: '/carts', icon: '🛒' }
      ];
    } else {
      links = [
        { label: 'Catalogue IT', route: '/products', icon: '💻' },
        { label: 'Statistiques', route: '/statistics', icon: '📊' }
      ];
    }

    this.messages.update((list) =>
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              text: answerText,
              isThinking: false,
              actionTag: actionTag || m.actionTag,
              dataCards: cards,
              quickLinks: links,
              model: model || (isLlm ? 'gemini-3.8-flash' : 'Moteur de secours IT'),
              isLlm: isLlm ?? false,
              originalPrompt: origPrompt || m.originalPrompt,
              originalActionCode: origActionCode || m.originalActionCode,
              originalActionTag: origActionTag || m.originalActionTag
            }
          : m
      )
    );
  }

  private computeLocalResponse(actionCode: string): string {
    const list = this.activeProducts();
    const count = list.length;
    const totalVal = list.reduce((s, p) => s + p.price * ((p as unknown as { stock?: number }).stock || 1), 0);
    const avg = count > 0 ? (totalVal / count).toFixed(2) : '0';

    if (actionCode === 'audit') {
      return `📊 **Audit Synthétique Local du Parc IT :**\n\n• **Valorisation Totale :** ${totalVal.toLocaleString('fr-FR')} €\n• **Nombre d'articles :** ${count} équipements\n• **Moyenne :** ${avg} €`;
    }
    return `Analyse instantanée terminée avec succès pour le code ${actionCode}.`;
  }

  private computeFreeTextResponse(query: string): string {
    const list = this.activeProducts();
    const count = list.length;
    const totalVal = list.reduce((s, p) => s + p.price * ((p as unknown as { stock?: number }).stock || 1), 0);

    return `🤖 **Analyseur Local :** J'ai traité votre requête « *${query}* ».\nVotre catalogue recense **${count} références** pour une valeur globale de **${totalVal.toLocaleString('fr-FR')} €**.`;
  }

  formatMessage(text: string): string {
    if (!text) return '';
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italics
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
    // Bullet points
    formatted = formatted.replace(/^• (.*)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-indigo-600 font-bold shrink-0">&bull;</span><span>$1</span></div>');
    // Sub-bullets (3 spaces then dash)
    formatted = formatted.replace(/^\s{3}-\s(.*)$/gm, '<div class="flex items-start gap-2 my-0.5 ml-4 text-slate-600"><span class="text-slate-400 font-mono">-</span><span>$1</span></div>');
    // Numbered lists
    formatted = formatted.replace(/^(\d+)\.\s\*\*(.*?)\*\*(.*)$/gm, '<div class="my-1.5"><span class="font-bold text-indigo-700">$1.</span> <strong class="font-bold text-slate-900">$2</strong>$3</div>');
    return formatted;
  }

  copyToClipboard(msg: AssistantMessage): void {
    if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
      navigator.clipboard.writeText(msg.text).then(() => {
        msg.copied = true;
        setTimeout(() => {
          msg.copied = false;
        }, 2000);
      });
    }
  }

  setFeedback(msg: AssistantMessage, helpful: boolean): void {
    msg.helpful = helpful;
  }

  toggleSpeak(msg: AssistantMessage): void {
    if (!isPlatformBrowser(this.platformId) || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isSpeaking() && this.speakingMsgId() === msg.id) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
      this.speakingMsgId.set(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for speech
    const cleanText = msg.text.replace(/[*#•_-]/g, ' ').replace(/\s+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;

    utterance.onend = () => {
      this.isSpeaking.set(false);
      this.speakingMsgId.set(null);
    };

    utterance.onerror = () => {
      this.isSpeaking.set(false);
      this.speakingMsgId.set(null);
    };

    this.isSpeaking.set(true);
    this.speakingMsgId.set(msg.id);
    window.speechSynthesis.speak(utterance);
  }

  exportSessionReport(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const timestamp = new Date().toISOString().split('T')[0];
    let report = `# Rapport d'Analyse Décisionnelle - Parc IT\n`;
    report += `Date d'exportation : ${new Date().toLocaleString('fr-FR')}\n`;
    report += `CapEx Global du Stock : ${this.totalValuationDisplay()} €\n`;
    report += `Nombre d'Équipements : ${this.activeProducts().length} références\n\n`;
    report += `---\n\n## Historique des Échanges & Audits\n\n`;

    for (const msg of this.messages()) {
      const author = msg.sender === 'user' ? '👤 DSI / Administrateur' : '🤖 Assistant IA IT';
      report += `### [${msg.timestamp}] ${author}\n\n`;
      if (msg.actionTag) {
        report += `> **Fonction Déclenchée :** ${msg.actionTag}\n\n`;
      }
      report += `${msg.text}\n\n`;
      if (msg.dataCards && msg.dataCards.length > 0) {
        report += `| Métrique | Valeur |\n| :--- | :--- |\n`;
        for (const card of msg.dataCards) {
          report += `| ${card.label} | ${card.value} |\n`;
        }
        report += `\n`;
      }
      report += `---\n\n`;
    }

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-audit-it-${timestamp}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  clearMessages(): void {
    if (isPlatformBrowser(this.platformId) && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
      this.speakingMsgId.set(null);
    }

    this.messages.set([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Historique de discussion réinitialisé. Comment puis-je vous assister sur les statistiques et prévisions du parc IT ?',
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        quickLinks: [
          { label: 'Catalogue IT', route: '/products', icon: '💻' },
          { label: 'Statistiques', route: '/statistics', icon: '📊' },
          { label: 'Prévisions', route: '/forecasts', icon: '🔮' }
        ]
      }
    ]);
  }
}
