const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Dysfonctionnement = sequelize.define('Dysfonctionnement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entretien_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'entretiens',
      key: 'id'
    }
  },
  referentiel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'referentiel_iseor',
      key: 'id'
    }
  },
  // Description du dysfonctionnement
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Fréquence et impact
  frequence: {
    type: DataTypes.ENUM('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel', 'ponctuel'),
    allowNull: false
  },
  temps_par_occurrence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Temps en minutes par occurrence'
  },
  personnes_impactees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Nombre de personnes impactées'
  },
  // Classification ISEOR - 5 indicateurs
  indicateur_absenteisme: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  indicateur_accidents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  indicateur_rotation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  indicateur_defauts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  indicateur_ecarts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Classification ISEOR - 4 composants
  composant_surrtemps: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  composant_surconsommation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  composant_surproduction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  composant_non_production: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Domaine ISEOR (1-6)
  domaine_iseor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 6
    }
  },
  // Coûts directs additionnels
  cout_direct: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Coûts directs en euros'
  },
  // Calculs automatiques
  cout_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Coût unitaire calculé'
  },
  cout_annuel: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Coût annuel calculé'
  },
  // Métadonnées
  mode_saisie: {
    type: DataTypes.ENUM('libre', 'guide', 'referentiel'),
    defaultValue: 'libre'
  },
  priorite: {
    type: DataTypes.ENUM('faible', 'moyenne', 'haute', 'critique'),
    defaultValue: 'moyenne'
  },
  valide: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  commentaires: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dysfonctionnements',
  hooks: {
    beforeSave: async (dysfonctionnement) => {
      // Récupération du PRISM de l'entretien pour les calculs
      const entretien = await sequelize.models.Entretien.findByPk(dysfonctionnement.entretien_id);
      if (entretien && entretien.prism_calcule) {
        const prism = parseFloat(entretien.prism_calcule);
        const tempsHeures = dysfonctionnement.temps_par_occurrence / 60;
        const personnes = dysfonctionnement.personnes_impactees;
        const coutDirect = parseFloat(dysfonctionnement.cout_direct) || 0;
        
        // Calcul du coût unitaire
        dysfonctionnement.cout_unitaire = (tempsHeures * prism * personnes) + coutDirect;
        
        // Calcul du coût annuel selon la fréquence
        const multiplicateurs = {
          'quotidien': 250, // jours ouvrés
          'hebdomadaire': 52,
          'mensuel': 12,
          'trimestriel': 4,
          'annuel': 1,
          'ponctuel': 1
        };
        
        const multiplicateur = multiplicateurs[dysfonctionnement.frequence] || 1;
        dysfonctionnement.cout_annuel = dysfonctionnement.cout_unitaire * multiplicateur;
      }
    }
  }
});

module.exports = Dysfonctionnement;
