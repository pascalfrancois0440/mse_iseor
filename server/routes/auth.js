const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configuration email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Génération du token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/register - Inscription (DÉSACTIVÉE - Seuls les administrateurs peuvent créer des comptes)
router.post('/register', async (req, res) => {
  res.status(403).json({ 
    message: 'L\'inscription publique est désactivée. Contactez votre administrateur pour obtenir un compte.' 
  });
});

// POST /api/auth/login - Connexion
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Email ou mot de passe invalide' 
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email, actif: true } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe avec debug
    console.log('DEBUG AUTH - User found:', user.email);
    console.log('DEBUG AUTH - Password provided:', password);
    console.log('DEBUG AUTH - User password hash exists:', !!user.password);
    
    const isValidPassword = await user.verifierMotDePasse(password);
    console.log('DEBUG AUTH - Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await user.update({ derniere_connexion: new Date() });

    const token = generateToken(user);

    res.json({
      message: 'Connexion réussie',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// POST /api/auth/forgot-password - Mot de passe oublié
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email, actif: true } });
    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 heure

    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpires
    });

    // Envoyer l'email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe MSE',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.prenom},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien suivant pour créer un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    });

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
  } catch (error) {
    console.error('Erreur mot de passe oublié:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
  }
});

// POST /api/auth/reset-password - Réinitialiser le mot de passe
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [require('sequelize').Op.gt]: new Date() },
        actif: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    await user.update({
      password,
      reset_password_token: null,
      reset_password_expires: null
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation' });
  }
});

// GET /api/auth/me - Profil utilisateur
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

// PUT /api/auth/profile - Mise à jour du profil
router.put('/profile', authenticateToken, [
  body('nom').optional().trim().isLength({ min: 2 }),
  body('prenom').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { nom, prenom, email, organisation, telephone } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    await user.update({
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      email: email || user.email,
      organisation: organisation || user.organisation,
      telephone: telephone || user.telephone
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await user.verifierMotDePasse(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
  }
});

// POST /api/auth/admin/create-user - Création d'utilisateur par un administrateur
router.post('/admin/create-user', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('nom').trim().isLength({ min: 2 }),
  body('prenom').trim().isLength({ min: 2 }),
  body('role').isIn(['consultant', 'administrateur']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { email, password, nom, prenom, role, organisation, telephone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      role: role || 'consultant',
      organisation,
      telephone,
      provider: 'local',
      actif: true
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Erreur création utilisateur par admin:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// GET /api/auth/admin/users - Liste des utilisateurs (admin seulement)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [require('sequelize').Op.or]: [
        { nom: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { prenom: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { organisation: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'reset_password_token'] }
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// PUT /api/auth/admin/users/:id - Modification d'utilisateur par un administrateur
router.put('/admin/users/:id', authenticateToken, requireAdmin, [
  body('email').optional().isEmail().normalizeEmail(),
  body('nom').optional().trim().isLength({ min: 2 }),
  body('prenom').optional().trim().isLength({ min: 2 }),
  body('role').optional().isIn(['consultant', 'administrateur']),
  body('actif').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { email, nom, prenom, role, organisation, telephone, actif } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher la modification du dernier administrateur
    if (user.role === 'administrateur' && role !== 'administrateur') {
      const adminCount = await User.count({ where: { role: 'administrateur', actif: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de modifier le rôle du dernier administrateur actif' 
        });
      }
    }

    await user.update({
      email: email || user.email,
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      role: role || user.role,
      organisation: organisation !== undefined ? organisation : user.organisation,
      telephone: telephone !== undefined ? telephone : user.telephone,
      actif: actif !== undefined ? actif : user.actif
    });

    res.json({
      message: 'Utilisateur modifié avec succès',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'utilisateur' });
  }
});

// DELETE /api/auth/admin/users/:id - Suppression d'utilisateur par un administrateur
router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression du dernier administrateur
    if (user.role === 'administrateur') {
      const adminCount = await User.count({ where: { role: 'administrateur', actif: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer le dernier administrateur actif' 
        });
      }
    }

    // Empêcher l'auto-suppression
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    await user.destroy();

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;
