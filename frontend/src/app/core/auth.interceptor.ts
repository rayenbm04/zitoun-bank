import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

/** Ajoute le jeton JWT aux requêtes vers l’API et déconnecte l’utilisateur si le jeton a expiré (401). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Le jeton n’est envoyé qu’à notre API, jamais à un service extérieur comme Open-Meteo.
  if (!req.url.startsWith(API_URL)) return next(req);

  const auth = inject(AuthService);
  const token = auth.token;
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token) auth.logout();
      return throwError(() => err);
    }),
  );
};
