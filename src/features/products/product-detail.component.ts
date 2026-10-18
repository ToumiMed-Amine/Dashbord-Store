import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Détails du Produit"
        [description]="'Consultation détaillée et historique du produit ID: #' + productId"
        breadcrumb="Produits / Détail"
      >
        <div actions>
          <a
            routerLink="/products"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            &larr; Retour aux produits
          </a>
        </div>
      </app-page-header>

      <div class="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p class="text-sm font-semibold text-slate-900">Fiche détaillée du produit #{{ productId }}</p>
        <p class="text-xs text-slate-500 mt-1">
          Route dynamique <code>/products/:id</code> configurée pour la Phase 3.
        </p>
      </div>
    </div>
  `
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  productId = this.route.snapshot.paramMap.get('id') || '1';
}
