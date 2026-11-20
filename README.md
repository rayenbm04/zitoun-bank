# Zitoun Bank

Plateforme web qui accompagne les agriculteurs oléicoles, du verger à la vente.

> **Version quasi finale.** Toutes les pages sont réalisées et enregistrent leurs données dans MySQL via l'API Express. Les dernières améliorations prévues sont listées dans [Prochaines étapes](#prochaines-étapes).

| Dossier | Contenu |
|---|---|
| `frontend/` | Application Angular : toutes les pages de l'application |
| `backend/` | API Node.js + Express : comptes, parcelles, récoltes, pressages, offres, ventes et tâches |
| `database/schema.sql` | Création de la base MySQL `zitoun_bank` (7 tables) et des offres du marché |

---

## 1. À installer (une seule fois)

| Logiciel | Version | Lien | Vérification dans un terminal |
|---|---|---|---|
| Git | récente | https://git-scm.com | `git --version` |
| Node.js (avec npm) | 20.19 ou plus (LTS conseillée) | https://nodejs.org | `node -v` et `npm -v` |
| Angular CLI | 21 | `npm install -g @angular/cli` | `ng version` |
| XAMPP (MySQL + phpMyAdmin) | récente | https://www.apachefriends.org | panneau de contrôle XAMPP |
| VS Code (conseillé) | récente | https://code.visualstudio.com | extension « Angular Language Service » |

Après une installation, fermer puis rouvrir VS Code pour que les commandes soient reconnues.

Conseil : placer le projet dans un chemin court, sans espaces ni apostrophes (exemple : `D:\PROJECTS\zitoun-bank`).

---

## 2. Récupérer le projet (une seule fois)

Le propriétaire du dépôt doit d'abord ajouter son binôme sur GitHub :
**Settings › Collaborators › Add people**, puis le binôme accepte l'invitation reçue par e-mail.

```
cd D:\PROJECTS
git clone https://github.com/rayenbm04/zitoun-bank.git
cd zitoun-bank
```

---

## 3. Créer la base de données (une seule fois)

1. Ouvrir le panneau **XAMPP** et cliquer sur **Start** pour **Apache** et **MySQL**.
2. Ouvrir http://localhost/phpmyadmin
3. Onglet **Importer** › choisir le fichier `database/schema.sql` › **Exécuter**.

La base `zitoun_bank` est créée avec ses tables : `users`, `parcelles`, `recoltes`, `pressages`, `offres`, `ventes` et `taches`.
Le fichier peut être réimporté sans risque après une mise à jour : les tables existantes et leurs données sont conservées, seules les nouvelles tables sont ajoutées.
Chaque membre du binôme a **sa propre base sur son PC** : un compte créé chez l'un n'existe pas chez l'autre.

---

## 4. Configurer et lancer le backend

Dans un terminal VS Code :

```
cd backend
npm install
copy .env.example .env
npm run dev
```

- `npm install` et `copy .env.example .env` ne sont à faire que la première fois.
- Ouvrir le fichier `backend/.env` et remplacer la valeur de `JWT_SECRET` par une longue chaîne au hasard.
- Avec XAMPP, MySQL utilise par défaut l'utilisateur `root` **sans mot de passe** : rien d'autre à changer.
- Le fichier `.env` n'est **jamais** envoyé sur GitHub : chacun garde le sien.

Vérification : http://localhost:3000/api/health doit afficher `{"api":"ok","database":"ok"}`.

Pour avoir tout de suite une exploitation remplie (parcelles, récoltes, pressages, ventes, tâches), lancer une fois dans un autre terminal :

```
cd backend
npm run seed
```

Puis se connecter avec **demo@zitounbank.tn** / **demo12345**. La commande peut être relancée : elle remet le compte de démonstration à zéro.

Laisser ce terminal ouvert.

---

## 5. Lancer le frontend

Dans un **deuxième** terminal VS Code :

```
cd frontend
npm install
npm start
```

(`npm install` la première fois, et à nouveau après cette mise à jour : les polices sont maintenant des paquets npm.)

Ouvrir http://localhost:4200 : la page d'accueil s'affiche. Se connecter avec le compte de démonstration, ou cliquer sur **Créer un compte** pour partir d'une exploitation vide.

---

## 6. Chaque séance de travail

1. XAMPP : **Start** sur MySQL (et Apache si besoin de phpMyAdmin).
2. Récupérer le travail du binôme : `git pull`
3. Si `package.json` a changé : refaire `npm install` dans le dossier concerné.
4. Terminal 1 : `cd backend` puis `npm run dev`
5. Terminal 2 : `cd frontend` puis `npm start`

Pour partager ses modifications :

```
git add .
git commit -m "Description courte du changement"
git pull
git push
```

Règles pour éviter les conflits :
- toujours faire `git pull` avant de commencer et avant `git push` ;
- se répartir les fichiers (par exemple, chacun ses pages dans `frontend/src/app/pages/`) ;
- faire des petits commits fréquents avec un message clair.

---

## 7. Problèmes fréquents

| Problème | Solution |
|---|---|
| `ng`, `node` ou `git` « n'est pas reconnu » | Installer le logiciel, puis fermer et rouvrir VS Code |
| `"database":"erreur"` sur /api/health | MySQL n'est pas démarré dans XAMPP, ou la base n'a pas été importée (étape 3) |
| MySQL ne démarre pas dans XAMPP (port 3306) | Un autre MySQL tourne déjà : l'arrêter, ou changer `DB_PORT` dans `backend/.env` |
| « Impossible de joindre le serveur » sur la page de connexion | Le backend n'est pas lancé (étape 4) |
| « Impossible de charger vos données » dans l'espace agriculteur | Le backend ou MySQL est arrêté, ou `schema.sql` n'a pas été réimporté après une mise à jour (étape 3) |
| La page Météo affiche « Météo indisponible » | Pas de connexion internet : les prévisions viennent du service en ligne Open-Meteo |
| `JWT_SECRET manquant` au lancement du backend | Le fichier `backend/.env` n'a pas été créé (étape 4) |
| Erreurs pendant `npm install` | Vérifier `node -v` (20.19 minimum), supprimer le dossier `node_modules` et relancer `npm install` |
| Le port 4200 est déjà utilisé | `npm start -- --port 4201` |

---

## Choix du framework

| Couche | Choix | Pourquoi |
|---|---|---|
| Frontend | **Angular 21** (composants autonomes, signaux) | Composants réutilisables, routage intégré (pages protégées par un garde), formulaires réactifs avec validation, structure imposée qui garde le code propre à deux |
| Backend | **Node.js + Express** | Même langage (JavaScript) que le frontend, léger, rapide à mettre en place pour une API REST |
| Base de données | **MySQL** (XAMPP) | Base relationnelle adaptée à des données liées (comptes, parcelles, récoltes, ventes) |
| Style | **CSS natif** avec variables (jetons de design) | La charte graphique (couleurs, typographies, rayons, ombres) est définie une seule fois dans `frontend/src/styles/tokens.css` ; mode sombre et arabe sans bibliothèque |
| Polices | **DM Sans, Playfair Display, Noto Kufi Arabic** via `@fontsource` | Hébergées avec l'application : rien n'est chargé depuis un service externe |

## Fonctionnalités développées

Le parcours principal est : **Accueil › Se connecter › Tableau de bord › Marché et prix › Vendre**. Les autres pages couvrent le suivi de la production, du verger jusqu'au stock d'huile.

| Page | Route | Ce qu'on peut faire | Données |
|---|---|---|---|
| Accueil | `/` | Présentation, fonctionnalités, étapes, à propos, formulaire de contact validé | Statique (envoi du formulaire simulé) |
| Authentification | `/connexion`, `/inscription` | Inscription avec validation en direct, connexion, affichage du mot de passe, erreurs sous les champs | **API + MySQL** |
| Mot de passe oublié | `/mot-de-passe-oublie` | Saisie de l'e-mail validée, message de confirmation | Envoi de l'e-mail simulé |
| Tableau de bord | `/tableau-de-bord` | 4 indicateurs, météo du jour, courbe des prix, alertes (tâches en retard, stock bas, meilleur prix, olives à presser), dernières ventes | **API + MySQL** |
| Calendrier | `/calendrier` | Calendrier mensuel des travaux, ajout de tâches par parcelle, liste des tâches à faire et en retard (signalées dans les alertes), repères saisonniers de l'olivier | **API + MySQL** |
| Météo | `/meteo` | Prévisions sur 7 jours par région, conseils pour la récolte et les traitements (gel, pluie, vent fort, chaleur), météo du jour sur le tableau de bord | **API externe** Open-Meteo |
| Verger | `/verger` | Liste des parcelles (superficie, variété, nombre d'oliviers, état), ajout, modification et suppression d'une parcelle | **API + MySQL** |
| Récoltes | `/recoltes` | Saisie d'une récolte, total de la saison, récolte par parcelle, historique filtrable | **API + MySQL** |
| Production d'huile | `/production` | Saisie d'un pressage au moulin, rendement calculé, historique, courbe d'évolution du rendement | **API + MySQL** |
| Stocks | `/stocks` | Stock d'huile par qualité, olives en attente du moulin, mouvements d'entrée et de sortie, oliviers par parcelle | **API + MySQL** |
| Marché et prix | `/marche` | Filtres région et qualité, tri, meilleure offre mise en avant, écart à la moyenne, bouton « Vendre » | **API + MySQL** |
| Ventes | `/ventes` | Formulaire pré-rempli depuis le marché, total calculé en direct, contrôle du stock, historique filtrable | **API + MySQL** |
| Simulateur de rentabilité | `/simulateur` | Estimation du bénéfice à partir de la récolte, du rendement, du prix du marché et des coûts ; prix minimum de vente et scénarios de prix | Calcul en direct |
| Profil et paramètres | `/profil` | Modifier ses informations, changer son mot de passe, choisir la langue et le mode sombre | **API + MySQL** |
| Charte graphique | `/charte` | Couleurs, typographie, boutons, champs, badges, alertes et icônes utilisés dans l'application | Statique |
| Page introuvable | toute autre adresse | Page 404 avec retour à l'accueil ou au tableau de bord | Statique |

La page Météo appelle l'API publique Open-Meteo (gratuite, sans clé) depuis le navigateur ; le jeton de connexion n'est envoyé qu'à notre propre API.

`DataService` (`frontend/src/app/core/data.service.ts`) charge toutes les listes de l'utilisateur connecté en parallèle dès la connexion, puis garde les données dans des signaux : les stocks, totaux et alertes se recalculent seuls après chaque ajout ou modification. Pendant le chargement, les pages affichent des squelettes ; si l'API ne répond pas, un message propose de réessayer. Seul l'historique des prix sur 6 mois (courbe du tableau de bord) reste une donnée fixe indicative.

### Fonctionnalités du backend (API Express + MySQL)

Le backend gère les comptes (`backend/src/routes/auth.js`) et toutes les données de l'exploitation (un fichier par table dans `backend/src/routes/`) :

| Fonctionnalité | Route | Fonctionnement |
|---|---|---|
| **Inscription** | `POST /api/auth/register` | Vérifie les champs (nom, prénom, e-mail valide, mot de passe de 8 caractères minimum), refuse un e-mail déjà utilisé (erreur 409), hache le mot de passe avec **bcrypt**, enregistre le compte dans la table `users`, puis renvoie un jeton de connexion **JWT** |
| **Connexion** | `POST /api/auth/login` | Retrouve le compte par son e-mail, compare le mot de passe saisi avec l'empreinte bcrypt, puis renvoie un jeton JWT valable 7 jours (erreur 401 si l'e-mail ou le mot de passe est incorrect) |
| **Modification du profil** | `PUT /api/auth/me` | Jeton requis. Vérifie les champs obligatoires et l'e-mail, refuse un e-mail déjà utilisé par un autre compte (erreur 409), puis met à jour la table `users` |
| **Changement de mot de passe** | `PUT /api/auth/password` | Jeton requis. Vérifie le mot de passe actuel avec bcrypt, exige 8 caractères minimum pour le nouveau, puis enregistre sa nouvelle empreinte bcrypt |
| **Parcelles** | `/api/parcelles` | Lister, ajouter, modifier, supprimer ; région, variété et état contrôlés |
| **Récoltes** | `/api/recoltes` | Lister et ajouter ; la parcelle doit appartenir à l'agriculteur |
| **Pressages** | `/api/pressages` | Lister et ajouter ; refusé si les olives demandées dépassent le stock (récolté − déjà pressé) |
| **Offres du marché** | `/api/offres` | Offres des acheteurs, communes à tous les agriculteurs |
| **Ventes** | `/api/ventes` | Lister et ajouter ; refusée si la quantité dépasse le stock d'huile de la qualité vendue |
| **Tâches** | `/api/taches` | Lister, ajouter, cocher comme faite, supprimer |

Chaque route vérifie les données reçues (et renvoie un message clair en cas d'erreur 400), filtre toujours sur l'utilisateur connecté (un agriculteur ne voit jamais les données d'un autre) et répond 404 si l'élément n'existe pas. Les contrôles de stock sont faits à la fois dans l'interface et sur le serveur.

Côté frontend, le jeton est gardé dans le navigateur et ajouté automatiquement à chaque requête par un intercepteur (`Authorization: Bearer …`). Les pages de l'espace agriculteur sont protégées par un garde de route : sans connexion, l'utilisateur est renvoyé vers `/connexion`.
Les mots de passe ne sont jamais stockés en clair et les requêtes SQL sont paramétrées (protection contre les injections SQL).

Qualité de l'interface :
- responsive : ordinateur (menu latéral), tablette 768 px (barre d'icônes), mobile 390 px (barre de navigation en bas, tableaux transformés en cartes) ;
- mode sombre et version arabe de droite à gauche (bouton FR / ع et lune dans la barre du haut) ;
- accessibilité : contrastes WCAG AA vérifiés, focus clavier visible, libellés sur tous les champs, badges et alertes avec texte + icône (jamais la couleur seule) ;
- compatibilité navigateurs : application testée sur Microsoft Edge et Opera, toutes les pages fonctionnent correctement ;
- animations légères : transition en fondu entre les pages (View Transitions d'Angular) et apparition douce des cartes, désactivées si le système demande de réduire les animations ;
- états de chargement et d'erreur : squelettes pendant le chargement, boutons désactivés pendant l'envoi, messages d'erreur de l'API affichés dans des notifications.

## Qualité du code et performances

| Outil | Commande (dans `frontend/`) | Rôle |
|---|---|---|
| **ESLint** (angular-eslint) | `npm run lint` | Règles TypeScript et Angular, plus l'accessibilité des templates ; le projet passe sans erreur |
| **Prettier** | `npm run format` | Mise en forme identique dans tous les fichiers (`.prettierrc`) ; `npm run format:check` vérifie sans modifier |

Optimisations :
- chargement à la demande (lazy loading) : chaque page est un fichier JavaScript séparé, téléchargé seulement quand on l'ouvre ;
- aucune image lourde : logo, illustrations et icônes sont des SVG dessinés dans le code ;
- polices hébergées avec l'application, aucun appel à un service externe au démarrage ;
- les prévisions météo sont gardées 30 minutes en mémoire pour éviter les appels répétés.

Score **Lighthouse** de la version de production (`ng build`), mesuré en mode mobile :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Accueil | 93 | 100 | 100 | 100 |
| Connexion | 94 | 100 | 100 | 100 |

## Répartition du travail

| Membre | Fonctionnalités |
|---|---|
| **BEN MIMOUN Rayen** | Initialisation du projet, charte graphique, authentification (backend et pages), accueil, verger, récoltes, production, stocks, profil, mot de passe oublié, page charte, météo, calendrier, simulateur, API des données, qualité du code, README |
| **BEN TAMARZIZT Mahdi** | Tableau de bord, marché et prix, ventes |

Chaque fonctionnalité a sa branche et sa Pull Request : l'historique est visible dans l'onglet **Pull requests** du dépôt.

## Méthode de travail

Une branche par fonctionnalité, fusionnée dans `main` quand elle est terminée :

```
git checkout main
git pull
git checkout -b feature/nom-de-la-fonctionnalite
git add .
git commit -m "Description courte"
git push -u origin feature/nom-de-la-fonctionnalite
```

Puis ouvrir une Pull Request sur GitHub vers `main`.

## Organisation du code

```
frontend/src/
  styles/          tokens.css (charte), base.css, components.css (boutons, champs, tableaux…)
  app/core/        services : authentification, données, météo, préférences (langue, thème), traductions
  app/layout/      shell (mise en page), sidebar (menu latéral), topbar (barre du haut)
  app/shared/ui/   composants réutilisables : icon, kpi-card, badge, alert, field, modal, toast,
                   empty-state, charts (courbe, histogramme), brand (logo, illustrations)
  app/pages/       une page par dossier (accueil, auth, dashboard, calendrier, meteo, verger, recoltes, production,
                   stocks, marche, ventes, simulateur, profil, charte, introuvable)
backend/src/       server.js, db.js, outils.js (validation), middleware/auth.js (jeton)
backend/src/routes auth, parcelles, recoltes, pressages, offres, ventes, taches
backend/scripts/   seed.js (compte de démonstration)
database/          schema.sql
```

## Routes de l'API

| Méthode | URL | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter (renvoie un jeton JWT) |
| GET | `/api/auth/me` | Utilisateur connecté (jeton requis) |
| PUT | `/api/auth/me` | Modifier ses informations (jeton requis, utilisée par la page Profil) |
| PUT | `/api/auth/password` | Changer son mot de passe (jeton requis, utilisée par la page Profil) |
| GET, POST | `/api/parcelles` | Lister / ajouter des parcelles |
| PUT, DELETE | `/api/parcelles/:id` | Modifier / supprimer une parcelle |
| GET, POST | `/api/recoltes` | Lister / ajouter des récoltes |
| GET, POST | `/api/pressages` | Lister / ajouter des pressages |
| GET | `/api/offres` | Offres des acheteurs |
| GET, POST | `/api/ventes` | Lister / ajouter des ventes |
| GET, POST | `/api/taches` | Lister / ajouter des tâches |
| PATCH, DELETE | `/api/taches/:id` | Cocher comme faite / supprimer une tâche |
| GET | `/api/health` | État de l'API et de la base |

Toutes les routes sauf `register`, `login` et `health` demandent le jeton (`Authorization: Bearer …`).

## Prochaines étapes

| Amélioration | À faire |
|---|---|
| Mot de passe oublié | Envoi réel d'un e-mail avec un lien de réinitialisation |
| Ventes | Changer le statut d'une vente (en attente, livrée, payée) depuis l'historique |
| Historique des prix | Table des prix mensuels alimentée par les offres, à la place des valeurs fixes |
| Déploiement | Mettre en ligne l'API, la base et le frontend pour une démonstration publique |
