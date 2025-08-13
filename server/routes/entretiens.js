const express = require('express');
const { body, validationResult } = require('express-validator');
const { Entretien, Dysfonctionnement, User } = require('../models');
const { authenticateToken, requireConsultant } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);
router.use(requireConsultant);

// GET /api/entretiens - Liste des entretiens
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, entreprise } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    
    if (statut) {
      whereClause.statut = statut;
    }
    
    if (entreprise) {
      whereClause.entreprise = { [require('sequelize').Op.iLike]: `%${entreprise}%` };
    }

    const { count, rows: entretiens } = await Entretien.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_entretien', 'DESC']],
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements',
        attributes: ['id', 'cout_annuel'],
        required: false
      }]
    });

    // Calculer les statistiques pour chaque entretien
    const entretiensAvecStats = entretiens.map(entretien => {
      const dysfonctionnements = entretien.dysfonctionnements || [];
      const coutTotal = dysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0);
      
      return {
        ...entretien.toJSON(),
        statistiques: {
          nombre_dysfonctionnements: dysfonctionnements.length,
          cout_total_annuel: coutTotal,
          ratio_ca: entretien.ca_perimetre ? (coutTotal / entretien.ca_perimetre * 100) : 0
        }
      };
    });

    res.json({
      entretiens: entretiensAvecStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération entretiens:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des entretiens' });
  }
});

// GET /api/entretiens/:id - Détail d'un entretien
router.get('/:id', async (req, res) => {
  try {
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements',
        include: [{
          model: require('../models').ReferentielIseor,
          as: 'referentiel',
          required: false
        }]
      }]
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Calculer les statistiques détaillées
    const dysfonctionnements = entretien.dysfonctionnements || [];
    const coutTotal = dysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0);
    
    // Répartition par domaine ISEOR
    const repartitionDomaines = {};
    for (let i = 1; i <= 6; i++) {
      repartitionDomaines[i] = {
        nombre: 0,
        cout: 0
      };
    }
    
    dysfonctionnements.forEach(d => {
      if (d.domaine_iseor) {
        repartitionDomaines[d.domaine_iseor].nombre++;
        repartitionDomaines[d.domaine_iseor].cout += parseFloat(d.cout_annuel) || 0;
      }
    });

    // Tableau 5x4 (indicateurs x composants)
    const tableau5x4 = {
      absenteisme: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
      accidents: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
      rotation: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
      defauts: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
      ecarts: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 }
    };

    dysfonctionnements.forEach(d => {
      const cout = parseFloat(d.cout_annuel) || 0;
      
      if (d.indicateur_absenteisme) {
        if (d.composant_surrtemps) tableau5x4.absenteisme.surrtemps += cout;
        if (d.composant_surconsommation) tableau5x4.absenteisme.surconsommation += cout;
        if (d.composant_surproduction) tableau5x4.absenteisme.surproduction += cout;
        if (d.composant_non_production) tableau5x4.absenteisme.non_production += cout;
      }
      // Répéter pour les autres indicateurs...
      if (d.indicateur_accidents) {
        if (d.composant_surrtemps) tableau5x4.accidents.surrtemps += cout;
        if (d.composant_surconsommation) tableau5x4.accidents.surconsommation += cout;
        if (d.composant_surproduction) tableau5x4.accidents.surproduction += cout;
        if (d.composant_non_production) tableau5x4.accidents.non_production += cout;
      }
      if (d.indicateur_rotation) {
        if (d.composant_surrtemps) tableau5x4.rotation.surrtemps += cout;
        if (d.composant_surconsommation) tableau5x4.rotation.surconsommation += cout;
        if (d.composant_surproduction) tableau5x4.rotation.surproduction += cout;
        if (d.composant_non_production) tableau5x4.rotation.non_production += cout;
      }
      if (d.indicateur_defauts) {
        if (d.composant_surrtemps) tableau5x4.defauts.surrtemps += cout;
        if (d.composant_surconsommation) tableau5x4.defauts.surconsommation += cout;
        if (d.composant_surproduction) tableau5x4.defauts.surproduction += cout;
        if (d.composant_non_production) tableau5x4.defauts.non_production += cout;
      }
      if (d.indicateur_ecarts) {
        if (d.composant_surrtemps) tableau5x4.ecarts.surrtemps += cout;
        if (d.composant_surconsommation) tableau5x4.ecarts.surconsommation += cout;
        if (d.composant_surproduction) tableau5x4.ecarts.surproduction += cout;
        if (d.composant_non_production) tableau5x4.ecarts.non_production += cout;
      }
    });

    const entretienComplet = {
      ...entretien.toJSON(),
      statistiques: {
        nombre_dysfonctionnements: dysfonctionnements.length,
        cout_total_annuel: coutTotal,
        ratio_ca: entretien.ca_perimetre ? (coutTotal / entretien.ca_perimetre * 100) : 0,
        repartition_domaines: repartitionDomaines,
        tableau_5x4: tableau5x4
      }
    };

    res.json(entretienComplet);
  } catch (error) {
    console.error('Erreur récupération entretien:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'entretien' });
  }
});

// POST /api/entretiens - Créer un nouvel entretien
router.post('/', [
  body('titre').trim().isLength({ min: 3 }),
  body('entreprise').trim().isLength({ min: 2 }),
  body('date_entretien').optional().isISO8601(),
  body('ca_perimetre').optional().isNumeric(),
  body('marge_brute').optional().isNumeric(),
  body('heures_travaillees').optional().isInt({ min: 1 }),
  body('effectif').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const entretienData = {
      ...req.body,
      user_id: req.user.id
    };

    const entretien = await Entretien.create(entretienData);

    res.status(201).json({
      message: 'Entretien créé avec succès',
      entretien
    });
  } catch (error) {
    console.error('Erreur création entretien:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'entretien' });
  }
});

// PUT /api/entretiens/:id - Modifier un entretien
router.put('/:id', [
  body('titre').optional().trim().isLength({ min: 3 }),
  body('entreprise').optional().trim().isLength({ min: 2 }),
  body('ca_perimetre').optional().isNumeric(),
  body('marge_brute').optional().isNumeric(),
  body('heures_travaillees').optional().isInt({ min: 1 }),
  body('effectif').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    await entretien.update(req.body);

    res.json({
      message: 'Entretien mis à jour avec succès',
      entretien
    });
  } catch (error) {
    console.error('Erreur modification entretien:', error);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'entretien' });
  }
});

// DELETE /api/entretiens/:id - Supprimer un entretien
router.delete('/:id', async (req, res) => {
  try {
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Supprimer les dysfonctionnements associés
    await Dysfonctionnement.destroy({
      where: { entretien_id: entretien.id }
    });

    await entretien.destroy();

    res.json({ message: 'Entretien supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression entretien:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'entretien' });
  }
});

// POST /api/entretiens/:id/duplicate - Dupliquer un entretien
router.post('/:id/duplicate', async (req, res) => {
  try {
    const entretienOriginal = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements'
      }]
    });

    if (!entretienOriginal) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Créer la copie de l'entretien
    const nouvelEntretien = await Entretien.create({
      ...entretienOriginal.toJSON(),
      id: undefined,
      titre: `${entretienOriginal.titre} (Copie)`,
      date_entretien: new Date(),
      statut: 'preparation',
      notes_conclusion: null
    });

    // Copier les dysfonctionnements
    if (entretienOriginal.dysfonctionnements?.length > 0) {
      const dysfonctionnementsCopies = entretienOriginal.dysfonctionnements.map(d => ({
        ...d.toJSON(),
        id: undefined,
        entretien_id: nouvelEntretien.id,
        valide: false
      }));

      await Dysfonctionnement.bulkCreate(dysfonctionnementsCopies);
    }

    res.status(201).json({
      message: 'Entretien dupliqué avec succès',
      entretien: nouvelEntretien
    });
  } catch (error) {
    console.error('Erreur duplication entretien:', error);
    res.status(500).json({ message: 'Erreur lors de la duplication de l\'entretien' });
  }
});

module.exports = router;
