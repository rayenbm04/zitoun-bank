import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

const t = (titre: string) => `${titre} – Zitoun Bank`;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Zitoun Bank : du verger à la vente',
    loadComponent: () => import('./pages/accueil/accueil').then((m) => m.Accueil),
  },
  {
    path: 'charte',
    title: t('Charte graphique'),
    loadComponent: () => import('./pages/charte/charte').then((m) => m.Charte),
  },
  {
    path: 'connexion',
    title: t('Connexion'),
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login').then((m) => m.Login),
  },
  {
    path: 'inscription',
    title: t('Inscription'),
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register').then((m) => m.Register),
  },
  {
    path: 'mot-de-passe-oublie',
    title: t('Mot de passe oublié'),
    loadComponent: () => import('./pages/auth/forgot').then((m) => m.Forgot),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: 'tableau-de-bord',
        title: t('Tableau de bord'),
        data: { titre: 'nav.dashboard' },
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'calendrier',
        title: t('Calendrier'),
        data: { titre: 'nav.calendrier' },
        loadComponent: () => import('./pages/calendrier/calendrier').then((m) => m.Calendrier),
      },
      {
        path: 'meteo',
        title: t('Météo'),
        data: { titre: 'nav.meteo' },
        loadComponent: () => import('./pages/meteo/meteo').then((m) => m.Meteo),
      },
      {
        path: 'verger',
        title: t('Verger'),
        data: { titre: 'nav.verger' },
        loadComponent: () => import('./pages/verger/verger').then((m) => m.Verger),
      },
      {
        path: 'recoltes',
        title: t('Récoltes'),
        data: { titre: 'nav.recoltes' },
        loadComponent: () => import('./pages/recoltes/recoltes').then((m) => m.Recoltes),
      },
      {
        path: 'production',
        title: t('Production d’huile'),
        data: { titre: 'nav.production' },
        loadComponent: () => import('./pages/production/production').then((m) => m.Production),
      },
      {
        path: 'stocks',
        title: t('Stocks'),
        data: { titre: 'nav.stocks' },
        loadComponent: () => import('./pages/stocks/stocks').then((m) => m.Stocks),
      },
      {
        path: 'marche',
        title: t('Marché et prix'),
        data: { titre: 'nav.marche' },
        loadComponent: () => import('./pages/marche/marche').then((m) => m.Marche),
      },
      {
        path: 'ventes',
        title: t('Ventes'),
        data: { titre: 'nav.ventes' },
        loadComponent: () => import('./pages/ventes/ventes').then((m) => m.Ventes),
      },
      {
        path: 'simulateur',
        title: t('Simulateur de rentabilité'),
        data: { titre: 'nav.simulateur' },
        loadComponent: () => import('./pages/simulateur/simulateur').then((m) => m.Simulateur),
      },
      {
        path: 'profil',
        title: t('Profil et paramètres'),
        data: { titre: 'nav.profil' },
        loadComponent: () => import('./pages/profil/profil').then((m) => m.Profil),
      },
    ],
  },
  {
    path: '**',
    title: t('Page introuvable'),
    loadComponent: () => import('./pages/introuvable/introuvable').then((m) => m.Introuvable),
  },
];
