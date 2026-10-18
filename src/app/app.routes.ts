import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () =>
      import('../features/products/products.component').then((m) => m.ProductsComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('../features/products/product-detail.component').then((m) => m.ProductDetailComponent)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('../features/users/users.component').then((m) => m.UsersComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('../features/users/users.component').then((m) => m.UsersComponent)
  },
  {
    path: 'carts',
    loadComponent: () =>
      import('../features/carts/carts.component').then((m) => m.CartsComponent)
  },
  {
    path: 'carts/:id',
    loadComponent: () =>
      import('../features/carts/cart-detail.component').then((m) => m.CartDetailComponent)
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('../features/statistics/statistics.component').then((m) => m.StatisticsComponent)
  },
  {
    path: 'forecasts',
    loadComponent: () =>
      import('../features/forecasts/forecasts.component').then((m) => m.ForecastsComponent)
  },
  {
    path: 'chatbot',
    loadComponent: () =>
      import('../features/chatbot/chatbot.component').then((m) => m.ChatbotComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('../features/settings/settings.component').then((m) => m.SettingsComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('../features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
