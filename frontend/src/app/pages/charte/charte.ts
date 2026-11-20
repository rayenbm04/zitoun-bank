import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrefsService } from '../../core/prefs.service';
import { Icon, ICONES_METIER, ICONES_TRAIT } from '../../shared/ui/icon';
import { Badge } from '../../shared/ui/badge';
import { Alert } from '../../shared/ui/alert';
import { KpiCard } from '../../shared/ui/kpi-card';
import { EmptyState } from '../../shared/ui/empty-state';
import { Modal } from '../../shared/ui/modal';
import { Field } from '../../shared/ui/field';
import { ToastService } from '../../shared/ui/toast';
import { Logo } from '../../shared/ui/brand';

@Component({
  selector: 'app-charte',
  imports: [RouterLink, Icon, Badge, Alert, KpiCard, EmptyState, Modal, Field, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charte.html',
  styleUrl: './charte.css',
})
export class Charte {
  readonly prefs = inject(PrefsService);
  private readonly toast = inject(ToastService);
  readonly modal = signal(false);

  readonly sommaire = [
    ['couleurs', 'Couleurs'],
    ['typo', 'Typographie'],
    ['espaces', 'Espaces, rayons, ombres'],
    ['boutons', 'Boutons'],
    ['champs', 'Champs'],
    ['badges', 'Badges'],
    ['cartes', 'Cartes et indicateurs'],
    ['tableau', 'Tableau'],
    ['alertes', 'Alertes'],
    ['icones', 'Icônes'],
    ['etats', 'États'],
  ];

  readonly couleurs = [
    {
      nom: 'Olive foncé',
      hex: '#2F3A17',
      role: 'Titres, menu, bandeaux',
      texte: '#F6F1E4',
      contraste: '10,7:1 sur crème',
    },
    {
      nom: 'Olive',
      hex: '#3F4A1E',
      role: 'Boutons secondaires pleins',
      texte: '#F6F1E4',
      contraste: '8,4:1 sur crème',
    },
    {
      nom: 'Feuille',
      hex: '#7C8B4F',
      role: 'Icônes, accents',
      texte: '#FDFBF5',
      contraste: '3,3:1 (non textuel)',
    },
    {
      nom: 'Sauge',
      hex: '#9AAB89',
      role: 'Éléments secondaires',
      texte: '#2F3A17',
      contraste: 'décoratif',
    },
    {
      nom: 'Sauge clair',
      hex: '#E9EDDF',
      role: 'Fonds doux, alertes d’information',
      texte: '#3F4A1E',
      contraste: '8,0:1 texte olive',
    },
    {
      nom: 'Or',
      hex: '#C9A227',
      role: 'Action principale, page active, chiffres clés',
      texte: '#2F3A17',
      contraste: '5,0:1 texte olive',
    },
    { nom: 'Crème', hex: '#F6F1E4', role: 'Fond des pages', texte: '#2F3A17', contraste: 'fond' },
    {
      nom: 'Carte',
      hex: '#FDFBF5',
      role: 'Surfaces, cartes',
      texte: '#2F3A17',
      contraste: 'surface',
    },
  ];
  readonly neutres = [
    { nom: 'Texte', hex: '#4E523F', role: 'Corps de texte (7,2:1)' },
    { nom: 'Texte secondaire', hex: '#5E624E', role: 'Aides, libellés (6,1:1)' },
    { nom: 'Or texte', hex: '#7A5D0B', role: 'Prix et chiffres en or sur fond clair (6,0:1)' },
    { nom: 'Bordure', hex: '#E3DCC8', role: 'Séparateurs, cartes' },
    { nom: 'Bordure forte', hex: '#D8CFB4', role: 'Champs de formulaire' },
  ];

  readonly typo = [
    {
      nom: 'Titre d’écran',
      css: 'font-family: var(--font-display); font-size: 2.25rem; font-weight: 700',
      ex: 'Marché et prix',
      spec: 'Playfair Display 36 / 700',
    },
    {
      nom: 'Titre de section',
      css: 'font-family: var(--font-display); font-size: 1.375rem; font-weight: 700',
      ex: 'Offres des acheteurs',
      spec: 'Playfair Display 22 / 700',
    },
    {
      nom: 'Titre de carte',
      css: 'font-size: 1.125rem; font-weight: 700',
      ex: 'Nouvelle vente',
      spec: 'DM Sans 18 / 700',
    },
    {
      nom: 'Corps',
      css: 'font-size: 1rem',
      ex: 'Chaque vente validée baisse aussitôt le stock d’huile.',
      spec: 'DM Sans 16 / 400, interligne 1,55',
    },
    {
      nom: 'Libellé',
      css: 'font-size: 0.8125rem; font-weight: 600',
      ex: 'Quantité',
      spec: 'DM Sans 13 / 600',
    },
    {
      nom: 'Chiffre clé',
      css: 'font-size: 2rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.02em',
      ex: '1 127,50 TND',
      spec: 'DM Sans 32 / 700, chiffres tabulaires',
    },
  ];

  readonly espaces = [4, 8, 12, 16, 24, 32, 48, 64];
  readonly rayons = [
    ['8 px', 'Badges carrés', 8],
    ['12 px', 'Champs, boutons', 12],
    ['20 px', 'Cartes', 20],
    ['28 px', 'Grands blocs', 28],
    ['999 px', 'Badges, puces', 999],
  ] as const;
  readonly ombres = [
    ['Niveau 1', 'Cartes au repos', 'var(--shadow-1)'],
    ['Niveau 2', 'Cartes en avant', 'var(--shadow-2)'],
    ['Niveau 3', 'Fenêtres, menus', 'var(--shadow-3)'],
  ] as const;

  readonly metier = ICONES_METIER;
  readonly trait = ICONES_TRAIT;

  toastDemo(): void {
    this.toast.afficher(
      'Vente enregistrée',
      '250 L à Monastir Oils, 3 400,00 TND. Le stock d’huile est à jour.',
    );
  }
}
