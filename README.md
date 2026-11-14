# Zitoun Bank

Plateforme web qui accompagne les agriculteurs oléicoles, du verger à la vente.

| Dossier | Contenu |
|---|---|
| `frontend/` | Application Angular : toutes les pages, avec des données de démonstration |
| `backend/` | API Node.js + Express : inscription et connexion |
| `database/schema.sql` | Création de la base MySQL `zitoun_bank` |

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

La base `zitoun_bank` et la table `users` sont créées.
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

Ouvrir http://localhost:4200 : la page d'accueil s'affiche. Cliquer sur **Créer un compte**, puis se connecter.

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

Cinq pages dynamiques, qui forment le parcours principal : **Accueil › Se connecter › Tableau de bord › Marché et prix › Vendre**.

| Page | Route | Ce qu'on peut faire | Données |
|---|---|---|---|
| Accueil | `/` | Présentation, fonctionnalités, étapes, à propos, formulaire de contact validé | Démonstration |
| Authentification | `/connexion`, `/inscription` | Inscription avec validation en direct, connexion, affichage du mot de passe, erreurs sous les champs | **API + MySQL** |
| Tableau de bord | `/tableau-de-bord` | 4 indicateurs, courbe des prix, alertes (stock bas, meilleur prix, olives à presser), dernières ventes | Démonstration |
| Marché et prix | `/marche` | Filtres région et qualité, tri, meilleure offre mise en avant, écart à la moyenne, bouton « Vendre » | Démonstration |
| Ventes | `/ventes` | Formulaire pré-rempli depuis le marché, total calculé en direct, contrôle du stock, historique filtrable | Démonstration |

Les données « Démonstration » sont gardées en mémoire par `DataService` (`frontend/src/app/core/data.service.ts`) et réinitialisées au rechargement : elles simulent une API, avec un court temps de chargement affiché en squelettes.

### Fonctionnalités du backend (API Express + MySQL)

Deux fonctionnalités sont développées côté serveur, dans `backend/src/routes/auth.js` :

| Fonctionnalité | Route | Fonctionnement |
|---|---|---|
| **Inscription** | `POST /api/auth/register` | Vérifie les champs (nom, prénom, e-mail valide, mot de passe de 8 caractères minimum), refuse un e-mail déjà utilisé (erreur 409), hache le mot de passe avec **bcrypt**, enregistre le compte dans la table `users`, puis renvoie un jeton de connexion **JWT** |
| **Connexion** | `POST /api/auth/login` | Retrouve le compte par son e-mail, compare le mot de passe saisi avec l'empreinte bcrypt, puis renvoie un jeton JWT valable 7 jours (erreur 401 si l'e-mail ou le mot de passe est incorrect) |

Côté frontend, le jeton est gardé dans le navigateur et ajouté automatiquement à chaque requête par un intercepteur (`Authorization: Bearer …`). Les pages de l'espace agriculteur sont protégées par un garde de route : sans connexion, l'utilisateur est renvoyé vers `/connexion`.
Les mots de passe ne sont jamais stockés en clair et les requêtes SQL sont paramétrées (protection contre les injections SQL).

Qualité de l'interface :
- responsive : ordinateur (menu latéral), tablette 768 px (barre d'icônes), mobile 390 px (barre de navigation en bas, tableaux transformés en cartes) ;
- mode sombre et version arabe de droite à gauche (bouton FR / ع et lune dans la barre du haut) ;
- accessibilité : contrastes WCAG AA vérifiés, focus clavier visible, libellés sur tous les champs, badges et alertes avec texte + icône (jamais la couleur seule) ;
- compatibilité navigateurs : application testée sur Microsoft Edge et Opera, toutes les pages fonctionnent correctement.

Pages prévues pour la suite (une branche par page) : Verger, Récoltes, Production d'huile, Stocks, Profil, Mot de passe oublié.

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
  app/core/        services : authentification, données, préférences (langue, thème), traductions
  app/layout/      shell (mise en page), sidebar (menu latéral), topbar (barre du haut)
  app/shared/ui/   composants réutilisables : icon, kpi-card, badge, alert, field, modal, toast,
                   empty-state, charts (courbe, histogramme), brand (logo, illustrations)
  app/pages/       une page par dossier (accueil, auth, dashboard, marche, ventes)
backend/src/       server.js, db.js, routes/auth.js, middleware/auth.js
database/          schema.sql
```

## Routes de l'API

| Méthode | URL | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter (renvoie un jeton JWT) |
| GET | `/api/auth/me` | Utilisateur connecté (jeton requis) |
| PUT | `/api/auth/me` | Modifier ses informations (jeton requis, prévue pour la future page Profil) |
| PUT | `/api/auth/password` | Changer son mot de passe (jeton requis, prévue pour la future page Profil) |
| GET | `/api/health` | État de l'API et de la base |
