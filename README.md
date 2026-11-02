# Zitoun Bank

Plateforme web qui accompagne les agriculteurs oléicoles, du verger à la vente.
Projet Web SUP'COM 2025/2026.

- `frontend/` : application Angular (toutes les pages, données de démonstration)
- `backend/` : API Node.js + Express (inscription et connexion)
- `database/schema.sql` : création de la base MySQL

## 1. Base de données (XAMPP)

1. Ouvrir le panneau XAMPP et cliquer sur **Start** pour **Apache** et **MySQL**.
2. Ouvrir http://localhost/phpmyadmin
3. Onglet **Importer** > choisir `database/schema.sql` > **Exécuter**.
   La base `zitoun_bank` et la table `users` sont créées.

## 2. Backend (API)

```
cd backend
npm install
copy .env.example .env
npm run dev
```

Dans `.env`, remplacer `JWT_SECRET` par une longue chaîne de caractères au hasard.
Avec XAMPP, l'utilisateur MySQL est `root` sans mot de passe (déjà le cas dans `.env.example`).

Vérification : http://localhost:3000/api/health doit afficher `"database":"ok"`.

## 3. Frontend (Angular)

Dans un **deuxième** terminal :

```
cd frontend
npm install
npm start
```

Ouvrir http://localhost:4200, créer un compte, puis se connecter.

## Fonctionnalités

| Module | Données |
|---|---|
| Inscription / connexion | API + MySQL |
| Tableau de bord, verger, récoltes, production d'huile, stocks, marché et comparateur de prix, ventes, profil | Données fictives en mémoire (réinitialisées au rechargement) |

## Routes de l'API

| Méthode | URL | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter (renvoie un jeton JWT) |
| GET | `/api/auth/me` | Utilisateur connecté (jeton requis) |
| GET | `/api/health` | État de l'API et de la base |
