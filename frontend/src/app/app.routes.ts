import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'connexion', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login').then(m => m.Login) },
  { path: 'inscription', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register').then(m => m.Register) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/layout/shell').then(m => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      { path: 'tableau-de-bord', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'verger', loadComponent: () => import('./pages/verger/verger').then(m => m.Verger) },
      { path: 'recoltes', loadComponent: () => import('./pages/recoltes/recoltes').then(m => m.Recoltes) },
      { path: 'production', loadComponent: () => import('./pages/production/production').then(m => m.ProductionPage) },
      { path: 'stocks', loadComponent: () => import('./pages/stocks/stocks').then(m => m.Stocks) },
      { path: 'marche', loadComponent: () => import('./pages/marche/marche').then(m => m.Marche) },
      { path: 'ventes', loadComponent: () => import('./pages/ventes/ventes').then(m => m.Ventes) },
      { path: 'profil', loadComponent: () => import('./pages/profil/profil').then(m => m.Profil) },
    ],
  },
  { path: '**', redirectTo: '' },
];
