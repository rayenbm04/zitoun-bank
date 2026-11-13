import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

const t = (titre: string) => `${titre} – Zitoun Bank`;

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Zitoun Bank : du verger à la vente', loadComponent: () => import('./pages/accueil/accueil').then(m => m.Accueil) },
  { path: 'connexion', title: t('Connexion'), canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login').then(m => m.Login) },
  { path: 'inscription', title: t('Inscription'), canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register').then(m => m.Register) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    children: [
      { path: 'tableau-de-bord', title: t('Tableau de bord'), data: { titre: 'nav.dashboard' }, loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'marche', title: t('Marché et prix'), data: { titre: 'nav.marche' }, loadComponent: () => import('./pages/marche/marche').then(m => m.Marche) },
      { path: 'ventes', title: t('Ventes'), data: { titre: 'nav.ventes' }, loadComponent: () => import('./pages/ventes/ventes').then(m => m.Ventes) },
    ],
  },
  { path: '**', redirectTo: '' },
];
