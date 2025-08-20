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
const initReferentielRoutes = require('./routes/init-referentiel');
const { sequelize } = require('./config/database');

const app = express();
const PORT = 5008; // Changed to 5008 to avoid port conflict

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://e88o0448k88kk84c4ssksgoo.31.97.69.164.sslip.io',
    'http://es8oo448k88kk84c4ssksgoo.31.97.69.164.sslip.io',
    'https://es8oo448k88kk84c4ssksgoo.31.97.69.164.sslip.io',
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

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`🔍 SERVER - ${req.method} ${req.path}`);
  if (req.path.includes('/auth/login')) {
    console.log('🔍 SERVER - Headers:', req.headers);
    console.log('🔍 SERVER - Body:', req.body);
  }
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/entretiens', entretienRoutes);
app.use('/api/dysfonctionnements', dysfonctionnementRoutes);
app.use('/api/referentiel', referentielRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/admin', initReferentielRoutes);

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

// Route de debug temporaire pour tester les fréquences (SANS AUTH)
app.get('/debug-freq/:id', async (req, res) => {
  try {
    const { Dysfonctionnement } = require('./models');
    
    const dysfonctionnements = await Dysfonctionnement.findAll({
      where: { entretien_id: req.params.id }
    });
    
    console.log('🔍 DEBUG PUBLIC - Dysfonctionnements trouvés:', dysfonctionnements.length);
    
    const repartitionFrequences = { 'Très fréquent': 0, 'Fréquent': 0, 'Occasionnel': 0, 'Rare': 0 };
    
    dysfonctionnements.forEach((d, index) => {
      console.log(`🔍 DEBUG PUBLIC - Dysfonctionnement ${index + 1}:`, {
        id: d.id,
        frequence: d.frequence,
        description: d.description?.substring(0, 30) + '...'
      });
      
      if (d && d.frequence && typeof d.frequence === 'string') {
        const freq = d.frequence.toLowerCase().trim();
        console.log(`🔍 DEBUG PUBLIC - Fréquence analysée: "${freq}"`);
        
        if (freq.includes('très') || freq.includes('tres')) {
          repartitionFrequences['Très fréquent']++;
          console.log('✅ Comptabilisé comme "Très fréquent"');
        } else if (freq.includes('fréquent') || freq.includes('frequent')) {
          repartitionFrequences['Fréquent']++;
          console.log('✅ Comptabilisé comme "Fréquent"');
        } else if (freq.includes('occasionnel')) {
          repartitionFrequences['Occasionnel']++;
          console.log('✅ Comptabilisé comme "Occasionnel"');
        } else if (freq.includes('rare')) {
          repartitionFrequences['Rare']++;
          console.log('✅ Comptabilisé comme "Rare"');
        } else {
          console.log('❌ Fréquence non reconnue:', freq);
        }
      } else {
        console.log('❌ Fréquence invalide ou manquante');
      }
    });
    
    console.log('🔍 DEBUG PUBLIC - Répartition finale:', repartitionFrequences);
    
    res.json({
      success: true,
      entretien_id: req.params.id,
      nombre_dysfonctionnements: dysfonctionnements.length,
      dysfonctionnements: dysfonctionnements.map(d => ({
        id: d.id,
        frequence: d.frequence,
        description: d.description?.substring(0, 50)
      })),
      repartition_frequences: repartitionFrequences
    });
  } catch (error) {
    console.error('Erreur debug public:', error);
    res.status(500).json({ error: error.message });
  }
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

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`🔍 SERVER - ${req.method} ${req.path}`);
  if (req.path.includes('/auth/login')) {
    console.log('🔍 SERVER - Headers:', req.headers);
    console.log('🔍 SERVER - Body:', req.body);
  }
  next();
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
    // Ne pas forcer la recréation pour préserver les données
    await sequelize.sync({ 
      force: false,
      alter: process.env.NODE_ENV === 'production' 
    });
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
