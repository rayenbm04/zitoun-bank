import { Routes } from '@angular/router';
import { guestGuard } from './core/auth.guard';

const t = (titre: string) => `${titre} – Zitoun Bank`;

export const routes: Routes = [
  { path: 'connexion', title: t('Connexion'), canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login').then(m => m.Login) },
  { path: 'inscription', title: t('Inscription'), canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register').then(m => m.Register) },
  { path: '**', redirectTo: 'connexion' },
];