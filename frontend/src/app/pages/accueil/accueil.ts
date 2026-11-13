import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/ui/icon';
import { Field } from '../../shared/ui/field';
import { Alert } from '../../shared/ui/alert';
import { Logo, OliveTree } from '../../shared/ui/brand';

@Component({
  selector: 'app-accueil',
  imports: [RouterLink, ReactiveFormsModule, Icon, Field, Alert, Logo, OliveTree],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
  host: { '(document:keydown.escape)': 'menu.set(false)' },
})
export class Accueil {
  readonly auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly annee = new Date().getFullYear();
  readonly menu = signal(false);
  readonly envoi = signal(false);
  readonly envoye = signal(false);

  readonly sections = [
    { id: 'fonctionnalites', nom: 'Fonctionnalités' },
    { id: 'etapes', nom: 'Comment ça marche' },
    { id: 'a-propos', nom: 'À propos' },
    { id: 'contact', nom: 'Contact' },
  ];

  readonly fonctionnalites = [
    { icone: 'arbre', titre: 'Verger', texte: 'Vos parcelles, leurs oliviers Chemlali ou Chetoui, et leur état en un coup d’œil.' },
    { icone: 'panier', titre: 'Récoltes', texte: 'Chaque cueillette notée par parcelle, avec le total de la saison.' },
    { icone: 'goutte', titre: 'Production', texte: 'Les passages au moulin et le rendement de vos olives, calculé pour vous.' },
    { icone: 'caisse', titre: 'Stocks', texte: 'Olives et huile mises à jour toutes seules, avec une alerte quand le stock baisse.' },
    { icone: 'etiquette', titre: 'Marché', texte: 'Les offres des acheteurs comparées, la meilleure mise en avant.' },
    { icone: 'billet', titre: 'Ventes', texte: 'Une vente en un clic depuis l’offre, et l’historique de vos revenus.' },
  ];

  readonly etapes = [
    { titre: 'Créez votre compte', texte: 'Gratuit, en une minute, avec votre région.' },
    { titre: 'Décrivez votre verger', texte: 'Ajoutez vos parcelles, puis vos récoltes et vos pressages.' },
    { titre: 'Vendez au meilleur prix', texte: 'Comparez les offres du jour et vendez en un clic.' },
  ];

  readonly contact = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  erreur(champ: 'nom' | 'email' | 'message'): string | null {
    const c = this.contact.controls[champ];
    if (!c.touched || c.valid) return null;
    return {
      nom: 'Indiquez votre nom.',
      email: 'Adresse e-mail invalide (exemple : nom@domaine.tn).',
      message: 'Votre message doit faire au moins 10 caractères.',
    }[champ];
  }

  envoyer(): void {
    if (this.contact.invalid) {
      this.contact.markAllAsTouched();
      return;
    }
    this.envoi.set(true);
    setTimeout(() => {
      this.envoi.set(false);
      this.envoye.set(true);
      this.contact.reset();
    }, 700);
  }
}
