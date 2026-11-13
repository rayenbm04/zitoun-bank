# Zitoun Bank

Plateforme web qui accompagne les agriculteurs oléicoles, du verger à la vente.
Projet Web SUP'COM 2025/2026, réalisé en binôme.

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
