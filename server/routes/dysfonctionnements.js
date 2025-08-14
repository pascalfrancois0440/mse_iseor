const express = require('express');
const { body, validationResult } = require('express-validator');
const { Dysfonctionnement, Entretien, ReferentielIseor } = require('../models');
const { authenticateToken, requireConsultant } = require('../middleware/auth');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);
router.use(requireConsultant);

// GET /api/dysfonctionnements/entretien/:entretienId - Liste des dysfonctionnements d'un entretien
router.get('/entretien/:entretienId', async (req, res) => {
  try {
    // Vérifier que l'entretien appartient à l'utilisateur
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.entretienId, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    const dysfonctionnements = await Dysfonctionnement.findAll({
      where: { entretien_id: req.params.entretienId },
      include: [{
        model: ReferentielIseor,
        as: 'referentiel',
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ dysfonctionnements });
  } catch (error) {
    console.error('Erreur récupération dysfonctionnements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des dysfonctionnements' });
  }
});

// GET /api/dysfonctionnements/:id - Détail d'un dysfonctionnement
router.get('/:id', async (req, res) => {
  try {
    const dysfonctionnement = await Dysfonctionnement.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: ReferentielIseor,
          as: 'referentiel',
          required: false
        },
        {
          model: Entretien,
          as: 'entretien',
          where: { user_id: req.user.id },
          attributes: ['id', 'titre', 'entreprise', 'prism_calcule']
        }
      ]
    });

    if (!dysfonctionnement) {
      return res.status(404).json({ message: 'Dysfonctionnement non trouvé' });
    }

    res.json({ dysfonctionnement });
  } catch (error) {
    console.error('Erreur récupération dysfonctionnement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du dysfonctionnement' });
  }
});

// POST /api/dysfonctionnements - Créer un nouveau dysfonctionnement
router.post('/', [
  body('entretien_id').isUUID(),
  body('description').trim().isLength({ min: 10 }),
  body('frequence').isIn(['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel', 'ponctuel']),
  body('temps_par_occurrence').custom(value => {
    if (value === '' || value === null || value === undefined) return false; // Obligatoire
    const num = parseInt(value);
    return !isNaN(num) && num >= 1;
  }),
  body('personnes_impactees').custom(value => {
    if (value === '' || value === null || value === undefined) return false; // Obligatoire
    const num = parseInt(value);
    return !isNaN(num) && num >= 1;
  }),
  body('cout_direct').optional().custom(value => {
    if (value === '' || value === null || value === undefined) return true;
    return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    // Vérifier que l'entretien appartient à l'utilisateur
    const entretien = await Entretien.findOne({
      where: { 
        id: req.body.entretien_id, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Nettoyer les données avant insertion - supprimer les champs vides et convertir les types
    const cleanedBody = Object.keys(req.body).reduce((acc, key) => {
      const value = req.body[key];
      // Ne pas inclure les champs vides
      if (value !== '' && value !== null && value !== undefined) {
        // Convertir les nombres si nécessaire
        if (['temps_par_occurrence', 'personnes_impactees'].includes(key)) {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > 0) {
            acc[key] = numValue;
          }
        } else if (key === 'cout_direct') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            acc[key] = numValue;
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    const dysfonctionnement = await Dysfonctionnement.create(cleanedBody);

    // Récupérer le dysfonctionnement avec les relations
    const dysfonctionnementComplet = await Dysfonctionnement.findByPk(dysfonctionnement.id, {
      include: [{
        model: ReferentielIseor,
        as: 'referentiel',
        required: false
      }]
    });

    res.status(201).json({
      message: 'Dysfonctionnement créé avec succès',
      dysfonctionnement: dysfonctionnementComplet
    });
  } catch (error) {
    console.error('Erreur création dysfonctionnement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du dysfonctionnement' });
  }
});

// PUT /api/dysfonctionnements/:id - Modifier un dysfonctionnement
router.put('/:id', [
  body('description').optional().trim().isLength({ min: 10 }),
  body('frequence').optional().isIn(['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel', 'ponctuel']),
  body('temps_par_occurrence').optional().custom(value => {
    if (value === '' || value === null || value === undefined) return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1;
  }),
  body('personnes_impactees').optional().custom(value => {
    if (value === '' || value === null || value === undefined) return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1;
  }),
  body('cout_direct').optional().custom(value => {
    if (value === '' || value === null || value === undefined) return true;
    return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const dysfonctionnement = await Dysfonctionnement.findOne({
      where: { id: req.params.id },
      include: [{
        model: Entretien,
        as: 'entretien',
        where: { user_id: req.user.id }
      }]
    });

    if (!dysfonctionnement) {
      return res.status(404).json({ message: 'Dysfonctionnement non trouvé' });
    }

    // Nettoyer les données avant mise à jour - supprimer les champs vides et convertir les types
    const cleanedBody = Object.keys(req.body).reduce((acc, key) => {
      const value = req.body[key];
      // Ne pas inclure les champs vides
      if (value !== '' && value !== null && value !== undefined) {
        // Convertir les nombres si nécessaire
        if (['temps_par_occurrence', 'personnes_impactees'].includes(key)) {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > 0) {
            acc[key] = numValue;
          }
        } else if (key === 'cout_direct') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            acc[key] = numValue;
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    await dysfonctionnement.update(cleanedBody);

    // Récupérer le dysfonctionnement mis à jour avec les relations
    const dysfonctionnementMisAJour = await Dysfonctionnement.findByPk(dysfonctionnement.id, {
      include: [{
        model: ReferentielIseor,
        as: 'referentiel',
        required: false
      }]
    });

    res.json({
      message: 'Dysfonctionnement mis à jour avec succès',
      dysfonctionnement: dysfonctionnementMisAJour
    });
  } catch (error) {
    console.error('Erreur modification dysfonctionnement:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du dysfonctionnement' });
  }
});

// DELETE /api/dysfonctionnements/:id - Supprimer un dysfonctionnement
router.delete('/:id', async (req, res) => {
  try {
    const dysfonctionnement = await Dysfonctionnement.findOne({
      where: { id: req.params.id },
      include: [{
        model: Entretien,
        as: 'entretien',
        where: { user_id: req.user.id }
      }]
    });

    if (!dysfonctionnement) {
      return res.status(404).json({ message: 'Dysfonctionnement non trouvé' });
    }

    await dysfonctionnement.destroy();

    res.json({ message: 'Dysfonctionnement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression dysfonctionnement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du dysfonctionnement' });
  }
});

// POST /api/dysfonctionnements/:id/classify - Classification automatique
router.post('/:id/classify', async (req, res) => {
  try {
    const { indicateurs, composants, domaine_iseor } = req.body;

    const dysfonctionnement = await Dysfonctionnement.findOne({
      where: { id: req.params.id },
      include: [{
        model: Entretien,
        as: 'entretien',
        where: { user_id: req.user.id }
      }]
    });

    if (!dysfonctionnement) {
      return res.status(404).json({ message: 'Dysfonctionnement non trouvé' });
    }

    const updateData = {};

    // Mise à jour des indicateurs
    if (indicateurs) {
      updateData.indicateur_absenteisme = indicateurs.includes('absenteisme');
      updateData.indicateur_accidents = indicateurs.includes('accidents');
      updateData.indicateur_rotation = indicateurs.includes('rotation');
      updateData.indicateur_defauts = indicateurs.includes('defauts');
      updateData.indicateur_ecarts = indicateurs.includes('ecarts');
    }

    // Mise à jour des composants
    if (composants) {
      updateData.composant_surrtemps = composants.includes('surrtemps');
      updateData.composant_surconsommation = composants.includes('surconsommation');
      updateData.composant_surproduction = composants.includes('surproduction');
      updateData.composant_non_production = composants.includes('non_production');
    }

    // Mise à jour du domaine ISEOR
    if (domaine_iseor) {
      updateData.domaine_iseor = domaine_iseor;
    }

    await dysfonctionnement.update(updateData);

    res.json({
      message: 'Classification mise à jour avec succès',
      dysfonctionnement: await Dysfonctionnement.findByPk(dysfonctionnement.id, {
        include: [{
          model: ReferentielIseor,
          as: 'referentiel',
          required: false
        }]
      })
    });
  } catch (error) {
    console.error('Erreur classification dysfonctionnement:', error);
    res.status(500).json({ message: 'Erreur lors de la classification du dysfonctionnement' });
  }
});

// POST /api/dysfonctionnements/bulk-create - Création en masse depuis le référentiel
router.post('/bulk-create', [
  body('entretien_id').isUUID(),
  body('referentiel_ids').isArray({ min: 1 }),
  body('referentiel_ids.*').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { entretien_id, referentiel_ids } = req.body;

    // Vérifier que l'entretien appartient à l'utilisateur
    const entretien = await Entretien.findOne({
      where: { 
        id: entretien_id, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Récupérer les éléments du référentiel
    const elementsReferentiel = await ReferentielIseor.findAll({
      where: { id: referentiel_ids }
    });

    // Créer les dysfonctionnements basés sur le référentiel
    const dysfonctionnements = elementsReferentiel.map(element => ({
      entretien_id,
      referentiel_id: element.id,
      description: element.description || `Dysfonctionnement lié à: ${element.titre}`,
      frequence: 'mensuel', // Valeur par défaut
      temps_par_occurrence: 30, // Valeur par défaut
      personnes_impactees: 1, // Valeur par défaut
      domaine_iseor: element.domaine,
      mode_saisie: 'referentiel',
      // Appliquer les classifications par défaut si disponibles
      ...(element.indicateurs_defaut && {
        indicateur_absenteisme: element.indicateurs_defaut.includes('absenteisme'),
        indicateur_accidents: element.indicateurs_defaut.includes('accidents'),
        indicateur_rotation: element.indicateurs_defaut.includes('rotation'),
        indicateur_defauts: element.indicateurs_defaut.includes('defauts'),
        indicateur_ecarts: element.indicateurs_defaut.includes('ecarts')
      }),
      ...(element.composants_defaut && {
        composant_surrtemps: element.composants_defaut.includes('surrtemps'),
        composant_surconsommation: element.composants_defaut.includes('surconsommation'),
        composant_surproduction: element.composants_defaut.includes('surproduction'),
        composant_non_production: element.composants_defaut.includes('non_production')
      })
    }));

    const dysfonctionnementsCreated = await Dysfonctionnement.bulkCreate(dysfonctionnements);

    res.status(201).json({
      message: `${dysfonctionnementsCreated.length} dysfonctionnements créés avec succès`,
      dysfonctionnements: dysfonctionnementsCreated
    });
  } catch (error) {
    console.error('Erreur création en masse:', error);
    res.status(500).json({ message: 'Erreur lors de la création en masse des dysfonctionnements' });
  }
});

// GET /api/dysfonctionnements/entretien/:entretienId/statistics - Statistiques des dysfonctionnements
router.get('/entretien/:entretienId/statistics', async (req, res) => {
  try {
    // Vérifier que l'entretien appartient à l'utilisateur
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.entretienId, 
        user_id: req.user.id 
      }
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    const dysfonctionnements = await Dysfonctionnement.findAll({
      where: { entretien_id: req.params.entretienId }
    });

    // Calculs statistiques
    const stats = {
      total: dysfonctionnements.length,
      cout_total: dysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0),
      repartition_frequence: {},
      repartition_domaines: {},
      repartition_indicateurs: {
        absenteisme: 0,
        accidents: 0,
        rotation: 0,
        defauts: 0,
        ecarts: 0
      },
      repartition_composants: {
        surrtemps: 0,
        surconsommation: 0,
        surproduction: 0,
        non_production: 0
      }
    };

    dysfonctionnements.forEach(d => {
      // Répartition par fréquence
      stats.repartition_frequence[d.frequence] = (stats.repartition_frequence[d.frequence] || 0) + 1;
      
      // Répartition par domaine
      if (d.domaine_iseor) {
        stats.repartition_domaines[d.domaine_iseor] = (stats.repartition_domaines[d.domaine_iseor] || 0) + 1;
      }
      
      // Répartition par indicateurs
      if (d.indicateur_absenteisme) stats.repartition_indicateurs.absenteisme++;
      if (d.indicateur_accidents) stats.repartition_indicateurs.accidents++;
      if (d.indicateur_rotation) stats.repartition_indicateurs.rotation++;
      if (d.indicateur_defauts) stats.repartition_indicateurs.defauts++;
      if (d.indicateur_ecarts) stats.repartition_indicateurs.ecarts++;
      
      // Répartition par composants
      if (d.composant_surrtemps) stats.repartition_composants.surrtemps++;
      if (d.composant_surconsommation) stats.repartition_composants.surconsommation++;
      if (d.composant_surproduction) stats.repartition_composants.surproduction++;
      if (d.composant_non_production) stats.repartition_composants.non_production++;
    });

    // Calculs de ratios
    if (entretien.ca_perimetre) {
      stats.ratio_ca = (stats.cout_total / entretien.ca_perimetre) * 100;
    }

    res.json({ statistiques: stats });
  } catch (error) {
    console.error('Erreur statistiques dysfonctionnements:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
  }
});

module.exports = router;
