const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReferentielIseor = sequelize.define('ReferentielIseor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Code numérique (ex: 101, 102, etc.)'
  },
  domaine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6
    },
    comment: 'Domaine ISEOR (1-6)'
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sous_themes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Liste des sous-thèmes associés'
  },
  exemples: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Exemples de dysfonctionnements'
  },
  questions_guides: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Questions pour guider l\'entretien'
  },
  // Classification par défaut
  indicateurs_defaut: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Indicateurs ISEOR suggérés par défaut'
  },
  composants_defaut: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Composants ISEOR suggérés par défaut'
  },
  // Métadonnées
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  ordre_affichage: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'referentiel_iseor',
  indexes: [
    {
      fields: ['domaine', 'ordre_affichage']
    },
    {
      fields: ['code']
    }
  ]
});

module.exports = ReferentielIseor;
