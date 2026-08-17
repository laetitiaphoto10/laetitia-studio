# Studio Laetitia Fey

PWA gratuite de gestion pour photographe : agenda de séances, devis, factures et contrats à signer en ligne, avec un espace client sans compte à créer (accès par lien personnel).

## 1. Créer le projet Firebase

1. Va sur https://console.firebase.google.com → **Ajouter un projet** → nomme-le par ex. `laetitia-studio`.
2. Dans le projet : **Build → Authentication → Sign-in method** → active **Email/Password**.
3. Toujours dans Authentication → onglet **Users** → **Ajouter un utilisateur** avec l'email et le mot de passe que Laetitia utilisera pour se connecter (c'est son compte admin).
4. **Build → Firestore Database** → **Créer une base de données** → mode production, région `eur3 (europe-west)` par exemple.
5. Une fois créée, va dans l'onglet **Règles** de Firestore et colle le contenu du fichier `firestore.rules` fourni ici, puis **Publier**.
6. Retourne dans **Paramètres du projet** (roue crantée) → section **Vos applications** → clique l'icône **</>** (Web) → donne un nom → tu obtiens un objet `firebaseConfig` avec `apiKey`, `authDomain`, etc. Garde cette page ouverte, tu en as besoin à l'étape 3.

## 2. Récupérer le code

Télécharge le projet fourni, ou pousse-le sur un repo GitHub (recommandé pour le déploiement continu avec Netlify, comme pour le PWA du club).

```bash
npm install
```

## 3. Configurer les variables d'environnement

Copie `.env.example` en `.env` et remplis les valeurs avec celles du `firebaseConfig` récupéré à l'étape 1.6 :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Teste en local :
```bash
npm run dev
```

## 4. Déployer sur Netlify

1. Connecte le repo GitHub à Netlify (**Add new site → Import an existing project**).
2. Build command : `npm run build` — Publish directory : `dist` (déjà dans `netlify.toml`).
3. Dans **Site settings → Environment variables**, ajoute les 6 mêmes variables que dans ton `.env`.
4. Déploie. Netlify te donne une URL type `laetitia-studio.netlify.app` (tu peux brancher un nom de domaine perso ensuite).

## 5. Utilisation

- **Laetitia** se connecte sur `/login` avec le compte créé à l'étape 1.3, puis gère tout depuis `/admin`.
- **Page de réservation publique** à partager aux clients (site web, Instagram bio...) : `/reserver`.
- Depuis l'admin, chaque devis / facture / contrat a un bouton **"Lien client"** : ce lien unique (`/espace/xxxx`) donne accès au client à son propre devis, contrat à signer et facture — sans compte à créer.

## Évolutions possibles

- Créneaux de dispo publiés par Laetitia avec sélection directe par le client (au lieu d'une simple demande de date).
- Envoi automatique d'email (devis, contrat, facture) via une Cloud Function + service comme Resend ou SendGrid.
- Génération de PDF téléchargeable pour devis/factures.
- Galerie photo à livrer aux clients (Firebase Storage), si besoin plus tard.
