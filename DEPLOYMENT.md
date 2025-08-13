# Guide de Déploiement - MSE Diagnostic

## 🚀 Déploiement sur GitHub

### 1. Préparation du dépôt

```bash
# Initialiser Git dans le projet
cd "f:\Projets WindSurf\FBO"
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - MSE Diagnostic Application"
```

### 2. Création du dépôt GitHub

1. Aller sur [GitHub.com](https://github.com)
2. Cliquer sur "New repository"
3. Nom suggéré : `mse-diagnostic-iseor`
4. Description : "Application de diagnostic MSE selon la méthodologie ISEOR"
5. Choisir "Private" ou "Public" selon vos besoins
6. Ne pas initialiser avec README (vous en avez déjà un)

### 3. Connexion au dépôt distant

```bash
# Ajouter l'origine GitHub (remplacer USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/USERNAME/mse-diagnostic-iseor.git

# Pousser le code
git branch -M main
git push -u origin main
```

## 🌐 Options de déploiement en production

### Option 1: Netlify (Frontend) + Railway (Backend)

**Frontend sur Netlify :**
```bash
# Build du client
cd client
npm run build
```
- Connecter le dépôt GitHub à Netlify
- Build command: `cd client && npm run build`
- Publish directory: `client/build`

**Backend sur Railway :**
- Connecter le dépôt à Railway
- Variables d'environnement à configurer :
  ```
  NODE_ENV=production
  JWT_SECRET=your-secret-key
  DATABASE_URL=postgresql://...
  FRONTEND_URL=https://your-netlify-app.netlify.app
  ```

### Option 2: Vercel (Fullstack)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Option 3: Heroku

```bash
# Installer Heroku CLI
# Créer une app
heroku create mse-diagnostic-app

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Déployer
git push heroku main
```

## 📋 Variables d'environnement requises

### Backend (.env)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-database-connection-string
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🔧 Configuration pour la production

### 1. Base de données PostgreSQL

Remplacer SQLite par PostgreSQL en production :

```javascript
// server/config/database.js
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  dialect: isProduction ? 'postgres' : 'sqlite',
  storage: isProduction ? undefined : './database.sqlite',
  // Configuration PostgreSQL pour production
  ...(isProduction && {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })
};
```

### 2. Script de déploiement

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "deploy": "npm run build && npm start",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

## 🔐 Sécurité en production

1. **Secrets** : Utiliser des variables d'environnement
2. **HTTPS** : Forcer HTTPS en production
3. **CORS** : Configurer les domaines autorisés
4. **Rate limiting** : Limiter les requêtes par IP
5. **Helmet** : Headers de sécurité (déjà configuré)

## 📊 Monitoring et maintenance

### Logs
- Utiliser un service comme LogRocket ou Sentry
- Configurer les alertes d'erreur

### Base de données
- Sauvegardes automatiques
- Monitoring des performances

### Mises à jour
```bash
# Workflow de mise à jour
git pull origin main
npm install
npm run build
pm2 restart app
```

## 🎯 Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL configurée
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré
- [ ] Monitoring activé
- [ ] Sauvegardes configurées
- [ ] Tests de fonctionnement complets
