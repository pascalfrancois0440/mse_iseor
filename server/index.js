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
    'http://localhost:3001',
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

// Route de debug pour vérifier la base de données
app.get('/api/debug-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'actif', 'createdAt']
    });
    res.json({ 
      success: true, 
      count: users.length,
      users: users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route de test login en GET (pour éviter CORS)
app.get('/api/test-login', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Trouver l'utilisateur test
    const user = await User.findOne({ 
      where: { email: 'test@test.com', actif: true } 
    });
    
    if (!user) {
      return res.json({ success: false, message: 'Utilisateur test non trouvé' });
    }
    
    console.log('DEBUG TEST-LOGIN - User found:', user.email);
    console.log('DEBUG TEST-LOGIN - Password hash exists:', !!user.password);
    console.log('DEBUG TEST-LOGIN - Password hash:', user.password);
    
    // Test manuel avec bcrypt
    const bcrypt = require('bcryptjs');
    const manualTest = await bcrypt.compare('123', user.password);
    console.log('DEBUG TEST-LOGIN - Manual bcrypt.compare:', manualTest);
    
    // Tester la vérification du mot de passe
    const isValidPassword = await user.verifierMotDePasse('123');
    console.log('DEBUG TEST-LOGIN - verifierMotDePasse result:', isValidPassword);
    
    // Test avec le mot de passe original avant hash
    console.log('DEBUG TEST-LOGIN - Testing different passwords...');
    const testPasswords = ['123', 'Admin123!', 'Consultant123!'];
    for (const pwd of testPasswords) {
      const result = await bcrypt.compare(pwd, user.password);
      console.log(`DEBUG TEST-LOGIN - Password "${pwd}":`, result);
    }
    
    res.json({ 
      success: true,
      userFound: true,
      hasPassword: !!user.password,
      passwordValid: isValidPassword
    });
  } catch (error) {
    console.error('DEBUG TEST-LOGIN - Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route de test avec mot de passe simple
app.get('/api/create-test-user', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Supprimer l'utilisateur test s'il existe
    await User.destroy({ where: { email: 'test@test.com' } });
    
    // Créer un utilisateur test avec mot de passe simple (laisser le hook beforeCreate gérer le hash)
    const testUser = await User.create({
      nom: 'Test',
      prenom: 'User',
      email: 'test@test.com',
      password: '123', // Mot de passe en clair - le hook beforeCreate va le hasher
      role: 'administrateur',
      actif: true
    });
    
    res.json({ 
      success: true, 
      message: 'Utilisateur test créé',
      user: { id: testUser.id, email: testUser.email, role: testUser.role }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du test',
      error: error.message 
    });
  }
});

// Route temporaire d'initialisation manuelle
app.get('/api/init-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Supprimer l'admin existant s'il existe
    await User.destroy({ where: { email: 'admin@mse-diagnostic.fr' } });
    
    // Créer le compte administrateur
    const adminUser = await User.create({
      nom: 'Administrateur',
      prenom: 'MSE',
      email: 'admin@mse-diagnostic.fr',
      password: 'Admin123!', // Mot de passe en clair - le hook beforeCreate va le hasher
      role: 'administrateur',
      actif: true
    });
    
    res.json({ 
      success: true, 
      message: 'Compte administrateur créé avec succès',
      admin: { id: adminUser.id, email: adminUser.email, role: adminUser.role }
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
      await User.create({
        nom: 'Administrateur',
        prenom: 'MSE',
        email: 'admin@mse-diagnostic.fr',
        password: 'Admin123!', // Mot de passe en clair - le hook beforeCreate va le hasher
        role: 'administrateur',
        actif: true
      });
      console.log('✅ Compte administrateur créé');
    } else {
      console.log('✅ Compte administrateur vérifié');
    }
    
    // Créer le consultant permanent
    const consultantExists = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });
    if (!consultantExists) {
      await User.create({
        nom: 'Consultant',
        prenom: 'MSE',
        email: 'consultant@mse-diagnostic.fr',
        password: 'Consultant123!', // Mot de passe en clair - le hook beforeCreate va le hasher
        role: 'consultant',
        actif: true
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
