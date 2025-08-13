# Déploiement MSE Diagnostic avec Coolify

## 🚀 Configuration Coolify + VPS Hostinger

### Prérequis
- VPS Hostinger avec Docker installé
- Coolify installé et configuré
- Nom de domaine pointant vers votre VPS
- Dépôt GitHub avec votre code

## 📋 Étapes de déploiement

### 1. Préparation du VPS Hostinger

```bash
# Connexion SSH à votre VPS
ssh root@your-vps-ip

# Mise à jour du système
apt update && apt upgrade -y

# Installation de Docker (si pas déjà fait)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation de Coolify (si pas déjà fait)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2. Configuration dans Coolify

1. **Accéder à Coolify** : `https://your-domain:8000`
2. **Ajouter votre dépôt GitHub** :
   - Sources → Add New → GitHub
   - Connecter votre compte GitHub
   - Sélectionner le dépôt `mse-diagnostic-iseor`

3. **Créer un nouveau projet** :
   - Projects → New Project
   - Nom : "MSE Diagnostic"
   - Description : "Application de diagnostic MSE - Méthodologie ISEOR"

### 3. Configuration des services

#### Service 1: Base de données PostgreSQL
```yaml
Type: Database
Image: postgres:15-alpine
Environment Variables:
  POSTGRES_DB: mse_diagnostic
  POSTGRES_USER: mse_user
  POSTGRES_PASSWORD: [générer un mot de passe fort]
Volume: /var/lib/postgresql/data
```

#### Service 2: Backend API
```yaml
Type: Application
Source: GitHub Repository
Build Pack: Docker
Dockerfile: ./server/Dockerfile
Port: 5000
Environment Variables:
  NODE_ENV: production
  DATABASE_URL: postgresql://mse_user:[password]@database:5432/mse_diagnostic
  JWT_SECRET: [générer une clé secrète forte]
  FRONTEND_URL: https://your-domain.com
  RATE_LIMIT_WINDOW_MS: 900000
  RATE_LIMIT_MAX_REQUESTS: 100
```

#### Service 3: Frontend React
```yaml
Type: Application
Source: GitHub Repository
Build Pack: Docker
Dockerfile: ./client/Dockerfile
Port: 80
Domain: your-domain.com
SSL: Enabled (Let's Encrypt)
Environment Variables:
  REACT_APP_API_URL: https://api.your-domain.com
```

### 4. Variables d'environnement Coolify

Dans Coolify, configurez ces variables d'environnement :

```bash
# Base de données
DB_PASSWORD=your-super-secure-db-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars

# Domaines
DOMAIN=your-domain.com
BACKEND_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 5. Configuration DNS

Chez votre registrar de domaine, configurez :

```
A    @              your-vps-ip
A    api            your-vps-ip
A    www            your-vps-ip
```

### 6. Déploiement automatique

Coolify surveillera automatiquement votre dépôt GitHub :
- Push sur `main` → Déploiement automatique
- Rollback possible en un clic
- Logs en temps réel

## 🔧 Configuration avancée

### Monitoring et alertes
```yaml
# Dans Coolify, activer :
- Health checks
- Resource monitoring
- Email notifications
- Slack/Discord webhooks
```

### Sauvegardes automatiques
```bash
# Configuration des sauvegardes PostgreSQL
Schedule: Daily at 2:00 AM
Retention: 7 days
Storage: Local + S3 (optionnel)
```

### Mise à l'échelle
```yaml
# Configuration des ressources
Backend:
  CPU: 1 core
  RAM: 512MB
  Replicas: 1 (peut être augmenté)

Frontend:
  CPU: 0.5 core
  RAM: 256MB
  Replicas: 1

Database:
  CPU: 1 core
  RAM: 1GB
  Storage: 20GB SSD
```

## 🛡️ Sécurité

### Firewall VPS
```bash
# Configuration UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify (restreindre par IP si possible)
ufw enable
```

### SSL/TLS
- Let's Encrypt automatique via Coolify
- Renouvellement automatique
- Force HTTPS activé

### Authentification
- Comptes admin permanents configurés
- JWT avec expiration
- Rate limiting activé

## 📊 Monitoring

### Métriques disponibles dans Coolify
- CPU/RAM usage
- Disk usage
- Network I/O
- Response times
- Error rates

### Logs
- Application logs centralisés
- Rotation automatique
- Recherche et filtrage

## 🔄 Workflow de développement

```bash
# Développement local
git checkout -b feature/nouvelle-fonctionnalite
# ... développement ...
git commit -m "Ajout nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Merge vers main → Déploiement automatique
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main
# → Coolify détecte et déploie automatiquement
```

## 💰 Coûts estimés

### VPS Hostinger
- VPS 2 cores, 4GB RAM, 80GB SSD : ~15€/mois
- Domaine : ~10€/an
- **Total : ~16€/mois**

### Avantages vs autres solutions
- **Netlify + Railway** : ~20€/mois
- **Vercel Pro** : ~25€/mois
- **Heroku** : ~25€/mois

## 🎯 Checklist de déploiement

- [ ] VPS Hostinger configuré
- [ ] Coolify installé et accessible
- [ ] Dépôt GitHub connecté
- [ ] Variables d'environnement configurées
- [ ] DNS configuré
- [ ] SSL activé
- [ ] Base de données PostgreSQL opérationnelle
- [ ] Backend déployé et accessible
- [ ] Frontend déployé avec domaine
- [ ] Tests de fonctionnement complets
- [ ] Monitoring activé
- [ ] Sauvegardes configurées

## 🚨 Dépannage

### Problèmes courants
1. **Build failed** : Vérifier les Dockerfiles
2. **Database connection** : Vérifier DATABASE_URL
3. **CORS errors** : Vérifier FRONTEND_URL
4. **SSL issues** : Vérifier configuration DNS

### Support
- Documentation Coolify : https://coolify.io/docs
- Community Discord : https://discord.gg/coolify
- GitHub Issues : https://github.com/coollabsio/coolify
