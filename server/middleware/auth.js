const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await User.findOne({ 
      where: { 
        id: decoded.id, 
        actif: true 
      } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou désactivé' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    console.error('Erreur authentification:', error);
    return res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

// Middleware de vérification des rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Permissions insuffisantes',
        required: userRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware pour les administrateurs uniquement
const requireAdmin = requireRole('administrateur');

// Middleware pour les consultants et administrateurs
const requireConsultant = requireRole(['consultant', 'administrateur']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireConsultant
};
