import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Pages de l’espace agriculteur : sans connexion, redirection vers /connexion. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/connexion']);
};

/** Pages de connexion et d’inscription : un utilisateur déjà connecté va au tableau de bord. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).createUrlTree(['/tableau-de-bord']) : true;
};
