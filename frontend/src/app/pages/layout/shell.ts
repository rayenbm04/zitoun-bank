import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PrefsService } from '../../core/prefs.service';

/** Mise en page de l'application connectée : menu latéral + contenu */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly auth = inject(AuthService);
  readonly prefs = inject(PrefsService);

  readonly liens = [
    { path: '/tableau-de-bord', cle: 'dashboard' },
    { path: '/verger', cle: 'verger' },
    { path: '/recoltes', cle: 'recoltes' },
    { path: '/production', cle: 'production' },
    { path: '/stocks', cle: 'stocks' },
    { path: '/marche', cle: 'marche' },
    { path: '/ventes', cle: 'ventes' },
    { path: '/profil', cle: 'profil' },
  ];
}
