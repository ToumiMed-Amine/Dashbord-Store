import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { Product } from '../../core/models/product.model';

interface ApiResponseLog {
  endpoint: string;
  method: string;
  status: number;
  data: unknown;
  timestamp: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Catalogue &amp; Équipements IT"
        description="Gestion complète du parc d'équipements informatiques, serveurs, laptops développeurs et périphériques réseau."
        breadcrumb="Équipements IT"
        [showRefresh]="true"
        [isRefreshing]="isLoading()"
        (refresh)="loadProducts()"
      >
        <div actions class="flex items-center gap-2">
          <!-- Button Ouvrir Popup Ajouter Produit -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajouter un Équipement IT</span>
          </button>
        </div>
      </app-page-header>

      <!-- API Response Console Banner -->
      @if (lastApiCall()) {
        <div class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 shadow-2xs">
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
          <pre class="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">{{ lastApiCall()?.data | json }}</pre>
        </div>
      }

      <!-- Tableau des Produits et Actions CRUD -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Liste des Produits du Catalogue
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Cliquez sur les boutons pour ouvrir les fenêtres modales (Popups) d'édition ou de confirmation de suppression.
            </p>
          </div>
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {{ products().length }} produit(s)
          </span>
        </div>

        @if (isLoading() && products().length === 0) {
          <div class="py-12 text-center text-xs text-slate-400">
            Chargement des produits depuis /api/products...
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4 w-12">ID</th>
                  <th class="py-3 px-4">Titre</th>
                  <th class="py-3 px-4">Catégorie</th>
                  <th class="py-3 px-4 text-right">Prix</th>
                  <th class="py-3 px-4 text-center">Actions API</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-3 px-4 font-mono font-semibold text-slate-500">
                      #{{ product.id }}
                    </td>
                    <td class="py-3 px-4 font-medium text-slate-900 max-w-xs truncate" [title]="product.title">
                      {{ product.title }}
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {{ product.price | currency:'USD':'symbol':'1.2-2' }}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="inline-flex items-center gap-1.5">
                        <!-- Bouton Modifier (Ouvre Popup Modifier) -->
                        <button
                          type="button"
                          (click)="openEditModal(product)"
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
                          (click)="openDeleteModal(product)"
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
                    <td colspan="5" class="py-8 text-center text-slate-400">
                      Aucun produit disponible.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- ================================================================= -->
      <!-- 1. POPUP AJOUTER / MODIFIER PRODUIT                              -->
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
                  [class.bg-indigo-600]="modalMode() === 'create'"
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
                      Ajouter un Nouveau Produit
                    } @else {
                      Modifier le Produit #{{ selectedProduct()?.id }}
                    }
                  </h3>
                  <p class="text-[11px] text-slate-500 font-mono">
                    @if (modalMode() === 'create') {
                      POST /api/products
                    } @else {
                      PUT /api/products/{{ selectedProduct()?.id }}
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
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-6 space-y-4">
              <!-- Titre -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Titre du Produit *</label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="ex: Chaussures de Course Trail Pro"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                />
              </div>

              <!-- Prix & Catégorie (2 colonnes) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Prix ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    formControlName="price"
                    placeholder="29.99"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Catégorie IT *</label>
                  <select
                    formControlName="category"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                  >
                    <option value="Laptops &amp; Postes Dev">Laptops &amp; Postes Dev</option>
                    <option value="Serveurs &amp; Cloud">Serveurs &amp; Cloud</option>
                    <option value="Réseau &amp; Cybersécurité">Réseau &amp; Cybersécurité</option>
                    <option value="Stockage &amp; Composants">Stockage &amp; Composants</option>
                    <option value="Moniteurs &amp; Périphériques">Moniteurs &amp; Périphériques</option>
                  </select>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  formControlName="description"
                  placeholder="Description détaillée du produit..."
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                ></textarea>
              </div>

              <!-- Aperçu des données qui vont être envoyées -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div class="text-[11px] font-semibold text-slate-600 mb-1">Données qui vont être envoyées à l'API :</div>
                <div class="text-[11px] font-mono text-slate-700">
                  <span>Titre :</span> <span class="font-semibold">{{ productForm.value.title || '(vide)' }}</span> &bull;
                  <span>Prix :</span> <span class="font-semibold">&#36;{{ productForm.value.price || '0' }}</span> &bull;
                  <span>Catégorie :</span> <span class="font-semibold">{{ productForm.value.category }}</span>
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
                  [disabled]="productForm.invalid || isSubmitting()"
                  class="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  [class.bg-indigo-600]="modalMode() === 'create'"
                  [class.hover:bg-indigo-700]="modalMode() === 'create'"
                  [class.bg-blue-600]="modalMode() === 'edit'"
                  [class.hover:bg-blue-700]="modalMode() === 'edit'"
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
                Êtes-vous sûr de vouloir supprimer définitivement ce produit du catalogue ?
              </p>

              <!-- Détail du produit ciblé -->
              @if (selectedProduct(); as p) {
                <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Identifiant :</span>
                    <span class="font-mono font-bold text-slate-900">#{{ p.id }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Titre :</span>
                    <span class="font-semibold text-slate-900 max-w-[200px] truncate" [title]="p.title">{{ p.title }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Catégorie :</span>
                    <span class="text-slate-700">{{ p.category }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Prix unitaire :</span>
                    <span class="font-mono font-bold text-slate-900">{{ p.price | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
              }

              <div class="mt-3 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 font-medium">
                Cette action appellera l'API <strong>DELETE /api/products/{{ selectedProduct()?.id }}</strong>.
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
export class ProductsComponent implements OnInit {
  private http = inject(HttpClient);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly lastApiCall = signal<ApiResponseLog | null>(null);

  // Modals state
  readonly showFormModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly selectedProduct = signal<Product | null>(null);

  readonly productForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(2)]),
    price: new FormControl<number>(1490.00, [Validators.required, Validators.min(0.01)]),
    category: new FormControl("Laptops & Postes Dev", [Validators.required]),
    description: new FormControl('')
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.http.get<Product[]>('/api/products').subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // --- OUVERTURE MODAL AJOUTER ---
  openAddModal(): void {
    this.modalMode.set('create');
    this.selectedProduct.set(null);
    this.productForm.reset({
      title: '',
      price: 1490.00,
      category: "Laptops & Postes Dev",
      description: ''
    });
    this.showFormModal.set(true);
  }

  // --- OUVERTURE MODAL MODIFIER ---
  openEditModal(product: Product): void {
    this.modalMode.set('edit');
    this.selectedProduct.set(product);
    this.productForm.reset({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description || ''
    });
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  // --- OUVERTURE MODAL SUPPRIMER ---
  openDeleteModal(product: Product): void {
    this.selectedProduct.set(product);
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
  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.productForm.value;
    const payload = {
      title: formVal.title || '',
      price: Number(formVal.price) || 0,
      category: formVal.category || "men's clothing",
      description: formVal.description || ''
    };

    if (this.modalMode() === 'create') {
      // POST /api/products
      this.http.post<Record<string, unknown>>('/api/products', payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: '/api/products',
            method: 'POST',
            status: 201,
            data: res,
            timestamp: new Date().toLocaleTimeString()
          });
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: '/api/products',
            method: 'POST',
            status: err.status || 500,
            data: err.error || err.message,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
    } else {
      // PUT /api/products/:id
      const id = this.selectedProduct()?.id;
      if (!id) return;

      this.http.put<Record<string, unknown>>(`/api/products/${id}`, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: `/api/products/${id}`,
            method: 'PUT',
            status: 200,
            data: res,
            timestamp: new Date().toLocaleTimeString()
          });
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.lastApiCall.set({
            endpoint: `/api/products/${id}`,
            method: 'PUT',
            status: err.status || 500,
            data: err.error || err.message,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
    }
  }

  // --- CONFIRMATION SUPPRESSION (DELETE /api/products/:id) ---
  confirmDelete(): void {
    const id = this.selectedProduct()?.id;
    if (!id) return;

    this.isSubmitting.set(true);
    this.http.delete<Record<string, unknown>>(`/api/products/${id}`).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.lastApiCall.set({
          endpoint: `/api/products/${id}`,
          method: 'DELETE',
          status: 200,
          data: res,
          timestamp: new Date().toLocaleTimeString()
        });
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.lastApiCall.set({
          endpoint: `/api/products/${id}`,
          method: 'DELETE',
          status: err.status || 500,
          data: err.error || err.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
  }
}
