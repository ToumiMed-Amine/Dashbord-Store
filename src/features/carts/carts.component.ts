import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { Cart } from '../../core/models/cart.model';

interface ApiResponseLog {
  endpoint: string;
  method: string;
  status: number;
  data: unknown;
  timestamp: string;
}

@Component({
  selector: 'app-carts',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Gestion &amp; API Paniers"
        description="Gestion des paniers et commandes : ajout, modification et suppression avec fenêtres de confirmation (Popups)."
        breadcrumb="Paniers"
        [showRefresh]="true"
        [isRefreshing]="isLoading()"
        (refresh)="loadCarts()"
      >
        <div actions class="flex items-center gap-2">
          <!-- Button Ouvrir Popup Ajouter Panier -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajouter un Panier</span>
          </button>
        </div>
      </app-page-header>

      <!-- API Response Console Banner -->
      @if (lastApiCall()) {
        <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/70 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[11px] font-bold font-mono text-white"
                [class.bg-emerald-600]="lastApiCall()?.method === 'POST'"
                [class.bg-blue-600]="lastApiCall()?.method === 'PUT'"
                [class.bg-rose-600]="lastApiCall()?.method === 'DELETE'"
                [class.bg-slate-700]="lastApiCall()?.method === 'GET'"
              >
                {{ lastApiCall()?.method }}
              </span>
              <span class="font-mono text-xs font-semibold text-slate-800">
                {{ lastApiCall()?.endpoint }}
              </span>
            </div>
            <span class="text-[11px] text-slate-500 font-mono">
              Status {{ lastApiCall()?.status }} &bull; {{ lastApiCall()?.timestamp }}
            </span>
          </div>
          <pre class="bg-slate-900 text-amber-300 p-3 rounded-lg text-xs font-mono overflow-x-auto">{{ lastApiCall()?.data | json }}</pre>
        </div>
      }

      <!-- Tableau des Paniers et Actions CRUD -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Paniers et Commandes Actives
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Cliquez sur les boutons pour ouvrir les fenêtres modales (Popups) d'édition ou de confirmation de suppression.
            </p>
          </div>
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {{ carts().length }} panier(s)
          </span>
        </div>

        @if (isLoading() && carts().length === 0) {
          <div class="py-12 text-center text-xs text-slate-400">
            Chargement des paniers depuis /api/carts...
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4 w-12">ID</th>
                  <th class="py-3 px-4">Utilisateur (userId)</th>
                  <th class="py-3 px-4">Date de Création</th>
                  <th class="py-3 px-4">Nombre d'Articles</th>
                  <th class="py-3 px-4">Détail des Produits</th>
                  <th class="py-3 px-4 text-center">Actions API</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (cart of carts(); track cart.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-3 px-4 font-mono font-semibold text-slate-500">
                      #{{ cart.id }}
                    </td>
                    <td class="py-3 px-4 font-medium text-slate-900">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px]">
                        Utilisateur #{{ cart.userId }}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono text-slate-600">
                      {{ cart.date || 'N/A' }}
                    </td>
                    <td class="py-3 px-4 font-semibold text-slate-900 font-mono">
                      {{ getCartItemsCount(cart) }} unité(s)
                    </td>
                    <td class="py-3 px-4 text-slate-500 text-[11px] font-mono">
                      @for (p of cart.products; track p.productId) {
                        <span class="inline-block bg-slate-100 px-1.5 py-0.5 rounded mr-1 mb-1">
                          prod #{{ p.productId }} (x{{ p.quantity }})
                        </span>
                      }
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="inline-flex items-center gap-1.5">
                        <!-- Bouton Modifier (Ouvre Popup Modifier) -->
                        <button
                          type="button"
                          (click)="openEditModal(cart)"
                          class="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Modifier</span>
                        </button>

                        <!-- Bouton Supprimer (Ouvre Popup Confirmation) -->
                        <button
                          type="button"
                          (click)="openDeleteModal(cart)"
                          class="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-8 text-center text-slate-400">
                      Aucun panier disponible.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- ================================================================= -->
      <!-- 1. POPUP AJOUTER / MODIFIER PANIER                               -->
      <!-- ================================================================= -->
      @if (showFormModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          (click)="onBackdropClick($event)"
        >
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-2">
                <span
                  class="p-1.5 rounded-lg text-white"
                  [class.bg-amber-600]="modalMode() === 'create'"
                  [class.bg-blue-600]="modalMode() === 'edit'"
                >
                  @if (modalMode() === 'create') {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                </span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">
                    @if (modalMode() === 'create') {
                      Ajouter un Nouveau Panier
                    } @else {
                      Modifier le Panier #{{ selectedCart()?.id }}
                    }
                  </h3>
                  <p class="text-[11px] text-slate-500 font-mono">
                    @if (modalMode() === 'create') {
                      POST /api/carts
                    } @else {
                      PUT /api/carts/{{ selectedCart()?.id }}
                    }
                  </p>
                </div>
              </div>

              <!-- Close button -->
              <button
                type="button"
                (click)="closeFormModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Form -->
            <form [formGroup]="cartForm" (ngSubmit)="saveCart()" class="p-6 space-y-4">
              <!-- UserId & Date (2 colonnes) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ID Utilisateur *</label>
                  <input
                    type="number"
                    min="1"
                    formControlName="userId"
                    placeholder="ex: 3"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Date du Panier *</label>
                  <input
                    type="date"
                    formControlName="date"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-mono bg-white"
                  />
                </div>
              </div>

              <!-- Composition des articles du panier -->
              <div class="space-y-3 pt-2">
                <div class="text-xs font-semibold text-slate-800 border-b border-slate-200 pb-1">
                  Articles dans la commande
                </div>

                <!-- Ligne Produit 1 -->
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Produit #1 (ID)</label>
                    <input
                      type="number"
                      min="1"
                      formControlName="prodId1"
                      class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      formControlName="prodQty1"
                      class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <!-- Ligne Produit 2 -->
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Produit #2 (ID)</label>
                    <input
                      type="number"
                      min="1"
                      formControlName="prodId2"
                      class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      formControlName="prodQty2"
                      class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <!-- Aperçu des données qui vont être envoyées -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div class="text-[11px] font-semibold text-slate-600 mb-1">Données qui vont être envoyées à l'API :</div>
                <div class="text-[11px] font-mono text-slate-700">
                  <span>Utilisateur :</span> <span class="font-semibold">#{{ cartForm.value.userId }}</span> &bull;
                  <span>Date :</span> <span class="font-semibold">{{ cartForm.value.date }}</span> &bull;
                  <span>Articles :</span>
                  <span class="font-semibold">
                    prod #{{ cartForm.value.prodId1 }} (x{{ cartForm.value.prodQty1 }}),
                    prod #{{ cartForm.value.prodId2 }} (x{{ cartForm.value.prodQty2 }})
                  </span>
                </div>
              </div>

              <!-- Modal Footer / Actions -->
              <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  (click)="closeFormModal()"
                  class="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="cartForm.invalid || isSubmitting()"
                  class="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>En cours...</span>
                  } @else {
                    @if (modalMode() === 'create') {
                      <span>Confirmer l'Ajout (POST)</span>
                    } @else {
                      <span>Enregistrer les Modifications (PUT)</span>
                    }
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- 2. POPUP CONFIRMATION DE SUPPRESSION                              -->
      <!-- ================================================================= -->
      @if (showDeleteModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          (click)="onBackdropClick($event)"
        >
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <!-- Header avec icône avertissement -->
            <div class="p-6 text-center">
              <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 class="text-base font-bold text-slate-900">
                Confirmer la Suppression
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer définitivement cette commande / panier ?
              </p>

              <!-- Détail du panier ciblé -->
              @if (selectedCart(); as c) {
                <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Panier (#ID) :</span>
                    <span class="font-mono font-bold text-slate-900">#{{ c.id }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Client associé :</span>
                    <span class="font-mono font-semibold text-slate-900">Utilisateur #{{ c.userId }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Date d'enregistrement :</span>
                    <span class="font-mono text-slate-700">{{ c.date || 'N/A' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Total d'articles :</span>
                    <span class="font-mono font-bold text-slate-900">{{ getCartItemsCount(c) }} unité(s)</span>
                  </div>
                </div>
              }

              <div class="mt-3 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 font-medium">
                Cette action appellera l'API <strong>DELETE /api/carts/{{ selectedCart()?.id }}</strong>.
              </div>
            </div>

            <!-- Boutons d'actions -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="closeDeleteModal()"
                class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                (click)="confirmDelete()"
                [disabled]="isSubmitting()"
                class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Suppression...</span>
                } @else {
                  <span>Oui, Confirmer la Suppression</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartsComponent implements OnInit {
  private http = inject(HttpClient);

  readonly carts = signal<Cart[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly lastApiCall = signal<ApiResponseLog | null>(null);

  // Modals state
  readonly showFormModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly selectedCart = signal<Cart | null>(null);

  readonly cartForm = new FormGroup({
    userId: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    date: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]),
    prodId1: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    prodQty1: new FormControl<number>(2, [Validators.required, Validators.min(1)]),
    prodId2: new FormControl<number>(2, [Validators.required, Validators.min(1)]),
    prodQty2: new FormControl<number>(1, [Validators.required, Validators.min(1)])
  });

  ngOnInit(): void {
    this.loadCarts();
  }

  loadCarts(): void {
    this.isLoading.set(true);
    this.http.get<Cart[]>('/api/carts').subscribe({
      next: (data) => {
        this.carts.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getCartItemsCount(cart: Cart): number {
    return cart.products?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  }

  // --- OUVERTURE MODAL AJOUTER ---
  openAddModal(): void {
    this.modalMode.set('create');
    this.selectedCart.set(null);
    this.cartForm.reset({
      userId: 1,
      date: new Date().toISOString().split('T')[0],
      prodId1: 1,
      prodQty1: 2,
      prodId2: 3,
      prodQty2: 1
    });
    this.showFormModal.set(true);
  }

  // --- OUVERTURE MODAL MODIFIER ---
  openEditModal(cart: Cart): void {
    this.modalMode.set('edit');
    this.selectedCart.set(cart);
    const p1 = cart.products?.[0];
    const p2 = cart.products?.[1];

    this.cartForm.reset({
      userId: cart.userId,
      date: cart.date || new Date().toISOString().split('T')[0],
      prodId1: p1?.productId || 1,
      prodQty1: p1?.quantity || 1,
      prodId2: p2?.productId || 2,
      prodQty2: p2?.quantity || 1
    });
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  // --- OUVERTURE MODAL SUPPRIMER ---
  openDeleteModal(cart: Cart): void {
    this.selectedCart.set(cart);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('backdrop-blur-xs')) {
      this.closeFormModal();
      this.closeDeleteModal();
    }
  }

  // --- CONFIRMATION ENVOI AJOUT / MODIFICATION (POST / PUT) ---
  saveCart(): void {
    if (this.cartForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.cartForm.value;
    const payload = {
      userId: Number(formVal.userId) || 1,
      date: formVal.date || new Date().toISOString().split('T')[0],
      products: [
        { productId: Number(formVal.prodId1) || 1, quantity: Number(formVal.prodQty1) || 1 },
        { productId: Number(formVal.prodId2) || 2, quantity: Number(formVal.prodQty2) || 1 }
      ]
    };

    if (this.modalMode() === 'create') {
      // POST /api/carts
      this.http.post<Record<string, unknown>>('/api/carts', payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: '/api/carts',
            method: 'POST',
            status: 201,
            data: res,
            timestamp: new Date().toLocaleTimeString()
          });
          this.closeFormModal();
          this.loadCarts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: '/api/carts',
            method: 'POST',
            status: err.status || 500,
            data: err.error || err.message,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
    } else {
      // PUT /api/carts/:id
      const id = this.selectedCart()?.id;
      if (!id) return;

      this.http.put<Record<string, unknown>>(`/api/carts/${id}`, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: `/api/carts/${id}`,
            method: 'PUT',
            status: 200,
            data: res,
            timestamp: new Date().toLocaleTimeString()
          });
          this.closeFormModal();
          this.loadCarts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: `/api/carts/${id}`,
            method: 'PUT',
            status: err.status || 500,
            data: err.error || err.message,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
    }
  }

  // --- CONFIRMATION SUPPRESSION (DELETE /api/carts/:id) ---
  confirmDelete(): void {
    const id = this.selectedCart()?.id;
    if (!id) return;

    this.isSubmitting.set(true);
    this.http.delete<Record<string, unknown>>(`/api/carts/${id}`).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.lastApiCall.set({
          endpoint: `/api/carts/${id}`,
          method: 'DELETE',
          status: 200,
          data: res,
          timestamp: new Date().toLocaleTimeString()
        });
        this.closeDeleteModal();
        this.loadCarts();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.lastApiCall.set({
          endpoint: `/api/carts/${id}`,
          method: 'DELETE',
          status: err.status || 500,
          data: err.error || err.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
  }
}
