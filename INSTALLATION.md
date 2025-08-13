# Guide d'Installation - MSE Diagnostic Application

## Prérequis

Avant d'installer l'application, assurez-vous d'avoir :

- **Node.js** (version 16 ou supérieure) - [Télécharger](https://nodejs.org/)
- **PostgreSQL** (version 12 ou supérieure) - [Télécharger](https://www.postgresql.org/)
- **Git** - [Télécharger](https://git-scm.com/)

## 1. Configuration de la base de données

### Créer la base de données PostgreSQL

```sql
-- Connectez-vous à PostgreSQL en tant qu'administrateur
CREATE DATABASE mse_diagnostic;
CREATE USER mse_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE mse_diagnostic TO mse_user;
```

## 2. Installation du backend

### Naviguer vers le dossier server
```bash
cd server
```

### Installer les dépendances
```bash
npm install
```

### Configuration de l'environnement
```bash
# Copier le fichier d'exemple
copy .env.example .env

# Éditer le fichier .env avec vos paramètres
```

### Variables d'environnement importantes à configurer dans `.env` :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mse_diagnostic
DB_USER=mse_user
DB_PASSWORD=votre_mot_de_passe_securise

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_de_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# Email (optionnel pour les fonctionnalités de récupération de mot de passe)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app

# OAuth2 (optionnel)
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_secret_google
MICROSOFT_CLIENT_ID=votre_client_id_microsoft
MICROSOFT_CLIENT_SECRET=votre_secret_microsoft

# Serveur
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Initialiser la base de données
```bash
node scripts/initDatabase.js
```

### Démarrer le serveur backend
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

## 3. Installation du frontend

### Ouvrir un nouveau terminal et naviguer vers le dossier client
```bash
cd client
```

### Installer les dépendances
```bash
npm install
```

### Démarrer l'application React
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 4. Vérification de l'installation

### Comptes de test créés automatiquement :

1. **Administrateur**
   - Email : `admin@mse-diagnostic.fr`
   - Mot de passe : `Admin123!`

2. **Consultant**
   - Email : `consultant@mse-diagnostic.fr`
   - Mot de passe : `Consultant123!`

### Données de démonstration incluses :
- Référentiel ISEOR complet (6 domaines, 18 éléments)
- 1 entretien de démonstration
- 3 dysfonctionnements exemples avec calculs automatiques

## 5. Utilisation

1. **Connexion** : Utilisez l'un des comptes de test
2. **Dashboard** : Vue d'ensemble des entretiens et statistiques
3. **Nouvel entretien** : Créer un diagnostic MSE
4. **Référentiel ISEOR** : Consulter la base de connaissances
5. **Exports** : Générer des rapports PDF et Excel

## 6. Fonctionnalités principales

### ✅ Authentification sécurisée
- JWT avec expiration
- Hashage bcrypt des mots de passe
- Support OAuth2 (Google, Microsoft)

### ✅ Modes de saisie
- **Mode libre** : Saisie manuelle des dysfonctionnements
- **Mode guidé** : Assistance par le référentiel ISEOR
- **Mode référentiel** : Sélection directe depuis la base

### ✅ Calculs automatiques PRISM
- Coûts cachés selon la méthodologie ISEOR
- Tableau de synthèse 5×4
- Statistiques et analyses

### ✅ Fonctionnalités offline
- Sauvegarde locale avec IndexedDB
- Synchronisation automatique à la reconnexion
- Indicateur de statut en temps réel

### ✅ Exports
- PDF : Rapport complet formaté
- Excel : Données détaillées pour analyse
- JSON : Synthèse pour intégration

## 7. Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Contrôlez les paramètres de connexion dans `.env`
- Assurez-vous que l'utilisateur a les bonnes permissions

### Erreur de port déjà utilisé
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :5000
# Arrêter le processus si nécessaire
taskkill /PID <PID> /F
```

### Problèmes de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 8. Développement

### Structure du projet
```
FBO/
├── server/          # Backend Node.js/Express
│   ├── models/      # Modèles Sequelize
│   ├── routes/      # Routes API
│   ├── middleware/  # Middlewares
│   └── scripts/     # Scripts utilitaires
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── contexts/    # Contextes React
│   │   └── utils/       # Utilitaires
│   └── public/      # Fichiers statiques
└── docs/            # Documentation
```

### Scripts disponibles

**Backend :**
- `npm run dev` : Démarrage en mode développement
- `npm start` : Démarrage en production
- `npm test` : Tests unitaires

**Frontend :**
- `npm start` : Démarrage en mode développement
- `npm run build` : Build de production
- `npm test` : Tests unitaires

## 9. Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
DB_SSL=true
FRONTEND_URL=https://votre-domaine.com
```

### Build de production
```bash
# Frontend
cd client
npm run build

# Backend
cd ../server
npm start
```

## Support

Pour toute question ou problème :
1. Consultez la documentation dans `/docs`
2. Vérifiez les logs du serveur
3. Contactez l'équipe de développement

---

**Version :** 1.0.0  
**Dernière mise à jour :** Décembre 2024
