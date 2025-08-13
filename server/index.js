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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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
    timestamp: new Date().toISOString()
  });
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
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Tables synchronisées');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur MSE Diagnostic démarré sur le port ${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
}

startServer();
