import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import {
  MOCK_PRODUCTS,
  MOCK_USERS,
  MOCK_CARTS,
  MOCK_ADVANCED_STATS,
  MOCK_KPIS,
  generateMockForecast,
  ExtendedProduct,
  ExtendedUser,
  ExtendedCart
} from '../data/mock-data';

// Copies en mémoire pour supporter les actions CRUD même sans serveur backend (ex: hébergement statique Vercel)
const inMemoryProducts: ExtendedProduct[] = [...MOCK_PRODUCTS];
const inMemoryUsers: ExtendedUser[] = [...MOCK_USERS];
const inMemoryCarts: ExtendedCart[] = [...MOCK_CARTS];

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const url = req.url;
      const method = req.method;

      // Si l'erreur est sur un endpoint /api/ (typiquement 404 sur hébergement statique Vercel),
      // nous basculons automatiquement et de manière transparente sur les données temporaires intégrées.
      if (url.startsWith('/api') || url.includes('/api/')) {
        const fullUrl = new URL(url, 'http://localhost');
        const pathname = fullUrl.pathname;

        // 1. PRODUCTS
        if (pathname === '/api/products') {
          if (method === 'GET') {
            return of(new HttpResponse({ status: 200, body: [...inMemoryProducts] }));
          }
          if (method === 'POST') {
            const body = req.body as Record<string, unknown>;
            const newId = inMemoryProducts.length > 0 ? Math.max(...inMemoryProducts.map((p) => p.id)) + 1 : 1;
            const newProd: ExtendedProduct = {
              id: newId,
              title: (body['title'] as string) || 'Nouvel Équipement IT',
              price: Number(body['price']) || 1200,
              description: (body['description'] as string) || 'Équipement informatique d\'entreprise.',
              category: (body['category'] as string) || 'Laptops & Postes Dev',
              brand: (body['brand'] as string) || 'Générique Pro',
              stock: Number(body['stock']) || 10,
              warrantyMonths: 36,
              image: (body['image'] as string) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
            };
            inMemoryProducts.unshift(newProd);
            return of(new HttpResponse({ status: 201, body: newProd }));
          }
        }

        const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
        if (productMatch) {
          const id = parseInt(productMatch[1], 10);
          if (method === 'GET') {
            const item = inMemoryProducts.find((p) => p.id === id) || inMemoryProducts[0];
            return of(new HttpResponse({ status: 200, body: item }));
          }
          if (method === 'PUT') {
            const idx = inMemoryProducts.findIndex((p) => p.id === id);
            if (idx !== -1) {
              inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...(req.body as object) };
              return of(new HttpResponse({ status: 200, body: inMemoryProducts[idx] }));
            }
          }
          if (method === 'DELETE') {
            const idx = inMemoryProducts.findIndex((p) => p.id === id);
            if (idx !== -1) {
              inMemoryProducts.splice(idx, 1);
            }
            return of(new HttpResponse({ status: 200, body: { success: true } }));
          }
        }

        // 2. USERS
        if (pathname === '/api/users') {
          if (method === 'GET') {
            return of(new HttpResponse({ status: 200, body: [...inMemoryUsers] }));
          }
          if (method === 'POST') {
            const body = req.body as Record<string, unknown>;
            const newId = inMemoryUsers.length > 0 ? Math.max(...inMemoryUsers.map((u) => u.id)) + 1 : 1;
            const newUser: ExtendedUser = {
              id: newId,
              username: (body['username'] as string) || 'nouveau.collaborateur',
              email: (body['email'] as string) || 'collaborateur@enterprise-it.net',
              name: {
                firstname: (body['firstname'] as string) || 'Prénom',
                lastname: (body['lastname'] as string) || 'Nom'
              },
              role: (body['role'] as string) || 'Collaborateur IT',
              department: (body['department'] as string) || 'Ingénierie',
              phone: (body['phone'] as string) || '06-00-00-00-00',
              address: { city: 'Paris', street: 'Siège IT', zipcode: '75001' }
            };
            inMemoryUsers.unshift(newUser);
            return of(new HttpResponse({ status: 201, body: newUser }));
          }
        }

        const userMatch = pathname.match(/^\/api\/users\/(\d+)$/);
        if (userMatch) {
          const id = parseInt(userMatch[1], 10);
          if (method === 'GET') {
            const item = inMemoryUsers.find((u) => u.id === id) || inMemoryUsers[0];
            return of(new HttpResponse({ status: 200, body: item }));
          }
          if (method === 'PUT') {
            const idx = inMemoryUsers.findIndex((u) => u.id === id);
            if (idx !== -1) {
              inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...(req.body as object) };
              return of(new HttpResponse({ status: 200, body: inMemoryUsers[idx] }));
            }
          }
          if (method === 'DELETE') {
            const idx = inMemoryUsers.findIndex((u) => u.id === id);
            if (idx !== -1) {
              inMemoryUsers.splice(idx, 1);
            }
            return of(new HttpResponse({ status: 200, body: { success: true } }));
          }
        }

        // 3. CARTS
        if (pathname === '/api/carts') {
          if (method === 'GET') {
            return of(new HttpResponse({ status: 200, body: [...inMemoryCarts] }));
          }
          if (method === 'POST') {
            const body = req.body as Record<string, unknown>;
            const newId = inMemoryCarts.length > 0 ? Math.max(...inMemoryCarts.map((c) => c.id)) + 1 : 1;
            const newCart: ExtendedCart = {
              id: newId,
              userId: Number(body['userId']) || 1,
              date: (body['date'] as string) || new Date().toISOString().split('T')[0],
              status: 'En attente',
              notes: (body['notes'] as string) || 'Dotation IT enregistrée',
              products: (body['products'] as { productId: number; quantity: number }[]) || [
                { productId: 1, quantity: 1 }
              ]
            };
            inMemoryCarts.unshift(newCart);
            return of(new HttpResponse({ status: 201, body: newCart }));
          }
        }

        const cartMatch = pathname.match(/^\/api\/carts\/(\d+)$/);
        if (cartMatch) {
          const id = parseInt(cartMatch[1], 10);
          if (method === 'GET') {
            const item = inMemoryCarts.find((c) => c.id === id) || inMemoryCarts[0];
            return of(new HttpResponse({ status: 200, body: item }));
          }
          if (method === 'PUT') {
            const idx = inMemoryCarts.findIndex((c) => c.id === id);
            if (idx !== -1) {
              inMemoryCarts[idx] = { ...inMemoryCarts[idx], ...(req.body as object) };
              return of(new HttpResponse({ status: 200, body: inMemoryCarts[idx] }));
            }
          }
          if (method === 'DELETE') {
            const idx = inMemoryCarts.findIndex((c) => c.id === id);
            if (idx !== -1) {
              inMemoryCarts.splice(idx, 1);
            }
            return of(new HttpResponse({ status: 200, body: { success: true } }));
          }
        }

        // 4. METRICS CORE
        if (pathname === '/api/metrics/total-products' || pathname === '/api/statistics/total-products') {
          return of(new HttpResponse({ status: 200, body: { value: inMemoryProducts.length } }));
        }

        if (pathname === '/api/metrics/total-users' || pathname === '/api/statistics/total-users') {
          return of(new HttpResponse({ status: 200, body: { value: inMemoryUsers.length } }));
        }

        if (pathname === '/api/metrics/total-carts' || pathname === '/api/statistics/total-carts') {
          return of(new HttpResponse({ status: 200, body: { value: inMemoryCarts.length } }));
        }

        if (pathname === '/api/metrics/average-price' || pathname === '/api/statistics/average-price') {
          const prices = inMemoryProducts.map((p) => p.price);
          const avg = prices.length ? Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)) : 2185.92;
          return of(new HttpResponse({ status: 200, body: { value: avg } }));
        }

        // 5. ADVANCED & KPIS
        if (pathname === '/api/statistics/advanced') {
          return of(new HttpResponse({ status: 200, body: MOCK_ADVANCED_STATS }));
        }

        if (pathname === '/api/statistics/kpis' || pathname === '/api/metrics/kpis') {
          return of(new HttpResponse({ status: 200, body: MOCK_KPIS }));
        }

        if (pathname === '/api/statistics/categories') {
          return of(new HttpResponse({ status: 200, body: MOCK_ADVANCED_STATS.categories }));
        }

        // 6. FORECASTS
        if (pathname === '/api/forecasts' || pathname === '/api/forecasts/predict') {
          const period = fullUrl.searchParams.get('period') || '30d';
          const metric = fullUrl.searchParams.get('metric') || 'budget';
          const growthRate = parseFloat(fullUrl.searchParams.get('growthRate') || '0.15');
          const forecastResponse = generateMockForecast(period, metric, growthRate);
          return of(new HttpResponse({ status: 200, body: forecastResponse }));
        }

        // 7. CHATBOT ASSISTANT
        if (pathname === '/api/chat') {
          const msg = (req.body as Record<string, string>)?.['message'] || '';
          return of(
            new HttpResponse({
              status: 200,
              body: {
                answer: `🤖 **Analyseur IT Intelligence :**\n\nVotre parc comprend actuellement **${inMemoryProducts.length} équipements informatiques** répartis sur 5 catégories stratégiques.\n\n- **Valeur totale de l'inventaire :** ${MOCK_ADVANCED_STATS.totalInventoryValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n- **Collaborateurs enregistrés :** ${inMemoryUsers.length}\n- **Dotations / Commandes en cours :** ${inMemoryCarts.length}\n\n*Requête traitée :* "${msg}"`,
                data: {
                  totalProducts: inMemoryProducts.length,
                  totalUsers: inMemoryUsers.length,
                  totalCarts: inMemoryCarts.length
                }
              }
            })
          );
        }

        if (pathname === '/api/llm/status') {
          return of(
            new HttpResponse({
              status: 200,
              body: {
                status: 'active',
                model: 'Moteur IA Hybride Cloud & Local',
                provider: 'Google Gemini & Analytics Engine',
                apiKeyConfigured: false,
                catalogItemsLoaded: inMemoryProducts.length,
                timestamp: new Date().toISOString()
              }
            })
          );
        }
      }

      // Si ce n'est pas une URL /api/, propager l'erreur
      throw error;
    })
  );
};
