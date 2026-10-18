import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userFriendlyMessage = 'Une erreur inattendue est survenue.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        userFriendlyMessage = `Erreur réseau : ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        switch (error.status) {
          case 400:
            userFriendlyMessage = 'Requête invalide (Bad Request). Veuillez vérifier vos paramètres.';
            break;
          case 401:
            userFriendlyMessage = 'Non autorisé (Unauthorized). Accès restreint.';
            break;
          case 403:
            userFriendlyMessage = 'Accès interdit (Forbidden). Permissions insuffisantes.';
            break;
          case 404:
            userFriendlyMessage = 'Ressource introuvable (Not Found).';
            break;
          case 500:
          case 502:
          case 503:
            userFriendlyMessage = 'Erreur du serveur (Server Error). Le service API est temporairement indisponible.';
            break;
          default:
            userFriendlyMessage = `Erreur de communication avec l'API Gateway (Code: ${error.status || 'Inconnu'}).`;
        }
      }

      console.error('[API Gateway Error]:', {
        status: error.status,
        url: req.url,
        message: userFriendlyMessage
      });

      return throwError(() => new Error(userFriendlyMessage));
    })
  );
};
