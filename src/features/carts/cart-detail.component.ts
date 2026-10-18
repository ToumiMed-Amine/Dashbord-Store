import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-cart-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Détails du Panier"
        [description]="'Composition et produits du panier #' + cartId"
        breadcrumb="Paniers / Détail"
      >
        <div actions>
          <a
            routerLink="/carts"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            &larr; Retour aux paniers
          </a>
        </div>
      </app-page-header>

      <div class="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p class="text-sm font-semibold text-slate-900">Composition détaillée du panier #{{ cartId }}</p>
        <p class="text-xs text-slate-500 mt-1">
          Route dynamique <code>/carts/:id</code> pour afficher les articles, prix et quantités calculés.
        </p>
      </div>
    </div>
  `
})
export class CartDetailComponent {
  private route = inject(ActivatedRoute);
  cartId = this.route.snapshot.paramMap.get('id') || '1';
}
