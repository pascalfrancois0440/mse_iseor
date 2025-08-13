# Dockerfile pour le backend MSE Diagnostic
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer les permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["npm", "start"]
