# Daily OS

Ton tableau de bord quotidien : nutrition, focus & devoirs, habitudes.
100 % perso (sans IA), rapide, installable en PWA sur ton téléphone.

## Stack technique

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — design noir/blanc minimaliste, mobile-first
- **SQLite** (via `better-sqlite3`) — base de données fichier, zéro configuration
- **Auth maison** — email + mot de passe, `bcryptjs` + session JWT (cookie httpOnly), aucun service tiers
- **PWA** — installable sur l'écran d'accueil, fonctionne hors-ligne pour l'interface (pas pour les données)

Aucune API IA, aucune clé API requise pour faire tourner l'app.

## Démarrer en local

Prérequis : Node.js 18+ installé.

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env (copie l'exemple)
cp .env.example .env

# 3. Générer une vraie clé secrète pour les sessions, et la mettre dans .env
openssl rand -base64 32
# → colle le résultat dans AUTH_SECRET= dans .env

# 4. Lancer l'app en développement
npm run dev
```

Ouvre http://localhost:3000 — tu seras redirigé vers `/login`. La base de
données SQLite (`dev.db`) est créée automatiquement au premier lancement,
avec toutes les tables nécessaires (aucune commande de migration à lancer).

## Build de production (local)

```bash
npm run build
npm run start
```

## Installer l'app sur ton téléphone (PWA)

Une fois l'app déployée (ou en local sur le même réseau Wi-Fi) :
- **iPhone (Safari)** : ouvre le site → bouton Partager → "Sur l'écran d'accueil".
- **Android (Chrome)** : ouvre le site → menu (⋮) → "Installer l'application".

L'icône Daily OS apparaît alors comme une vraie app, plein écran, sans barre
d'adresse.

## Déploiement

### Option simple : Railway / Render / Fly.io (disque persistant)

Ces plateformes offrent un disque persistant, donc le fichier SQLite
(`dev.db`) survit aux redéploiements. C'est l'option la plus proche de ce
que tu as en local :
1. Pousse le projet sur un repo GitHub.
2. Connecte le repo sur Railway/Render.
3. Ajoute les variables d'environnement `DATABASE_URL` (ex: `file:/data/dev.db`
   si tu montes un volume sur `/data`) et `AUTH_SECRET` (générée avec
   `openssl rand -base64 32`).
4. Build command : `npm run build` — Start command : `npm run start`.

### Option Vercel (attention : pas de disque persistant)

Vercel ne conserve pas de fichiers entre les déploiements/exécutions
serverless : le fichier SQLite serait donc réinitialisé en permanence.
Si tu veux absolument déployer sur Vercel, il faut remplacer SQLite par une
base Postgres externe (gratuite, sans carte bancaire requise) :
- **Neon** (neon.tech) ou **Supabase** (supabase.com), offre gratuite.

Cela demande d'adapter `lib/db.ts` / `lib/repo.ts` (actuellement en SQL
SQLite via `better-sqlite3`) vers un client Postgres (ex: `pg` ou
`@neondatabase/serverless`). Dis-le-moi si tu veux que je fasse cette
adaptation.

## Structure du projet

```
app/
  api/                 → routes API (auth, nutrition, tasks, habits)
  login/, register/    → pages d'authentification
  (app)/               → pages protégées (dashboard, nutrition, focus, habits)
components/            → composants réutilisables (nav, timer, formulaires)
lib/
  db.ts                → connexion SQLite + création des tables
  repo.ts              → toutes les requêtes SQL, typées
  auth.ts              → hashing mot de passe + sessions JWT
  nutrition.ts         → formule de Mifflin-St Jeor
  dates.ts             → utilitaires de dates (jour courant, calendrier)
middleware.ts          → protection des routes authentifiées
public/
  manifest.json, sw.js, icons/ → fichiers PWA
```

## Notes sur les calculs nutritionnels

Le besoin calorique est calculé avec la **formule de Mifflin-St Jeor** :

- Homme : `10 × poids(kg) + 6.25 × taille(cm) − 5 × âge + 5`
- Femme : `10 × poids(kg) + 6.25 × taille(cm) − 5 × âge − 161`

Puis multiplié par un facteur d'activité (1.2 à 1.9 selon le niveau
sélectionné) pour obtenir ton besoin calorique total journalier (TDEE).

## Sécurité

- Mots de passe hashés avec bcrypt (jamais stockés en clair).
- Sessions signées en JWT, cookie `httpOnly` + `secure` en production.
- Chaque requête API vérifie que la ressource appartient bien à
  l'utilisateur connecté avant de la lire/modifier/supprimer.
- Pense à changer `AUTH_SECRET` avant tout déploiement public (ne jamais
  garder la valeur d'exemple).
