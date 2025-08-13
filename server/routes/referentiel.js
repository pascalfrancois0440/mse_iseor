const express = require('express');
const { ReferentielIseor } = require('../models');
const { authenticateToken, requireConsultant } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);
router.use(requireConsultant);

// GET /api/referentiel - Liste complète du référentiel ISEOR
router.get('/', async (req, res) => {
  try {
    const { domaine, search } = req.query;
    
    const whereClause = { actif: true };
    
    if (domaine) {
      whereClause.domaine = parseInt(domaine);
    }
    
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { titre: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const referentiel = await ReferentielIseor.findAll({
      where: whereClause,
      order: [['domaine', 'ASC'], ['ordre_affichage', 'ASC'], ['code', 'ASC']]
    });

    // Organiser par domaines
    const referentielOrganise = {};
    for (let i = 1; i <= 6; i++) {
      referentielOrganise[i] = {
        domaine: i,
        titre: getDomainTitle(i),
        elements: referentiel.filter(r => r.domaine === i)
      };
    }

    res.json({ referentiel: referentielOrganise });
  } catch (error) {
    console.error('Erreur récupération référentiel:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du référentiel' });
  }
});

// GET /api/referentiel/domaine/:domaine - Éléments d'un domaine spécifique
router.get('/domaine/:domaine', async (req, res) => {
  try {
    const domaine = parseInt(req.params.domaine);
    
    if (domaine < 1 || domaine > 6) {
      return res.status(400).json({ message: 'Domaine invalide (1-6)' });
    }

    const elements = await ReferentielIseor.findAll({
      where: { 
        domaine,
        actif: true 
      },
      order: [['ordre_affichage', 'ASC'], ['code', 'ASC']]
    });

    res.json({
      domaine,
      titre: getDomainTitle(domaine),
      elements
    });
  } catch (error) {
    console.error('Erreur récupération domaine:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du domaine' });
  }
});

// GET /api/referentiel/:id - Détail d'un élément du référentiel
router.get('/:id', async (req, res) => {
  try {
    const element = await ReferentielIseor.findOne({
      where: { 
        id: req.params.id,
        actif: true 
      }
    });

    if (!element) {
      return res.status(404).json({ message: 'Élément du référentiel non trouvé' });
    }

    res.json({ element });
  } catch (error) {
    console.error('Erreur récupération élément référentiel:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'élément' });
  }
});

// GET /api/referentiel/search/:query - Recherche dans le référentiel
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    if (query.length < 3) {
      return res.status(400).json({ message: 'La recherche doit contenir au moins 3 caractères' });
    }

    const elements = await ReferentielIseor.findAll({
      where: {
        actif: true,
        [require('sequelize').Op.or]: [
          { titre: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { description: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { code: { [require('sequelize').Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['domaine', 'ASC'], ['ordre_affichage', 'ASC']]
    });

    res.json({ 
      query,
      resultats: elements.length,
      elements 
    });
  } catch (error) {
    console.error('Erreur recherche référentiel:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// Fonction utilitaire pour obtenir le titre des domaines
function getDomainTitle(domaine) {
  const titres = {
    1: "Conditions de travail",
    2: "Organisation du travail", 
    3: "Communication-coordination-concertation",
    4: "Gestion du temps",
    5: "Formation intégrée",
    6: "Mise en œuvre stratégique"
  };
  return titres[domaine] || `Domaine ${domaine}`;
}

module.exports = router;
