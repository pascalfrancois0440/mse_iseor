const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const entretienRoutes = require('./routes/entretiens');
const dysfonctionnementRoutes = require('./routes/dysfonctionnements');
const referentielRoutes = require('./routes/referentiel');
const exportRoutes = require('./routes/exports');
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://e88o0448k88kk84c4ssksgoo.31.97.69.164.sslip.io',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting pour prévenir les attaques
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/entretiens', entretienRoutes);
app.use('/api/dysfonctionnements', dysfonctionnementRoutes);
app.use('/api/referentiel', referentielRoutes);
app.use('/api/exports', exportRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API MSE Diagnostic fonctionnelle',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Route de test simple
app.get('/test', (req, res) => {
  res.send('<h1>Backend MSE Diagnostic fonctionne !</h1><p>Port: ' + PORT + '</p>');
});

// Page de connexion simple
app.get('/admin', (req, res) => {
  res.send(`
    <html>
    <head><title>MSE Diagnostic - Admin</title></head>
    <body style="font-family: Arial; max-width: 400px; margin: 50px auto; padding: 20px;">
      <h2>🏢 MSE Diagnostic - Administration</h2>
      <form action="/admin-login" method="post">
        <p><label>Email:</label><br><input type="email" name="email" value="admin@mse-diagnostic.fr" style="width: 100%; padding: 8px;"></p>
        <p><label>Mot de passe:</label><br><input type="password" name="password" value="Admin123!" style="width: 100%; padding: 8px;"></p>
        <p><button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none;">Se connecter</button></p>
      </form>
    </body>
    </html>
  `);
});

// Traitement de la connexion
app.post('/admin-login', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.send('<h2>❌ Email ou mot de passe incorrect</h2><a href="/admin">Retour</a>');
    }
    
    res.send(`
      <html>
      <head><title>MSE Diagnostic - Dashboard</title></head>
      <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>🎉 Connexion réussie !</h1>
        <h2>Bienvenue ${user.prenom} ${user.nom}</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Rôle:</strong> ${user.role}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <hr>
        <h3>✅ Votre application MSE Diagnostic est déployée et fonctionnelle !</h3>
        <p>🎯 <strong>Backend:</strong> Opérationnel</p>
        <p>🎯 <strong>Base de données:</strong> Connectée</p>
        <p>🎯 <strong>Authentification:</strong> Fonctionnelle</p>
        <p>🎯 <strong>API:</strong> Accessible</p>
        <hr>
        <p><a href="/admin" style="color: #007bff;">Retour à la connexion</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    res.send('<h2>❌ Erreur: ' + error.message + '</h2><a href="/admin">Retour</a>');
  }
});

// Route temporaire d'initialisation manuelle
app.get('/api/init-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Supprimer l'admin existant s'il existe
    await User.destroy({ where: { email: 'admin@mse-diagnostic.fr' } });
    
    // Créer un nouvel admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      nom: 'Administrateur',
      prenom: 'MSE',
      email: 'admin@mse-diagnostic.fr',
      password: hashedPassword,
      role: 'administrateur'
    });
    
    res.json({ 
      success: true, 
      message: 'Compte administrateur créé avec succès',
      admin: { id: admin.id, email: admin.email, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du compte',
      error: error.message 
    });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Synchroniser les tables (development et production)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Tables synchronisées');
    
    // Initialiser les comptes admin permanents
    await initializeAdminAccounts();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur MSE Diagnostic démarré sur le port ${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
}

// Fonction d'initialisation des comptes admin
async function initializeAdminAccounts() {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Créer l'admin permanent
    const adminExists = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await User.create({
        nom: 'Administrateur',
        prenom: 'MSE',
        email: 'admin@mse-diagnostic.fr',
        password: hashedPassword,
        role: 'administrateur'
      });
      console.log('✅ Compte administrateur créé');
    } else {
      console.log('✅ Compte administrateur vérifié');
    }
    
    // Créer le consultant permanent
    const consultantExists = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });
    if (!consultantExists) {
      const hashedPassword = await bcrypt.hash('Consultant123!', 10);
      await User.create({
        nom: 'Consultant',
        prenom: 'MSE',
        email: 'consultant@mse-diagnostic.fr',
        password: hashedPassword,
        role: 'consultant'
      });
      console.log('✅ Compte consultant créé');
    } else {
      console.log('✅ Compte consultant vérifié');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des comptes:', error);
  }
}

startServer();
