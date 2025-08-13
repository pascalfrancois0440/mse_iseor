const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Entretien = sequelize.define('Entretien', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entreprise: {
    type: DataTypes.STRING,
    allowNull: false
  },
  secteur_activite: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date_entretien: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  duree_prevue: {
    type: DataTypes.INTEGER, // en minutes
    defaultValue: 90
  },
  statut: {
    type: DataTypes.ENUM('preparation', 'en_cours', 'termine', 'archive'),
    defaultValue: 'preparation'
  },
  // Données pré-entretien
  ca_perimetre: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Chiffre d\'affaires du périmètre étudié'
  },
  marge_brute: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Marge brute en pourcentage'
  },
  heures_travaillees: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre d\'heures travaillées annuellement'
  },
  effectif: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de personnes dans le périmètre'
  },
  prism_calcule: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'PRISM calculé automatiquement'
  },
  // Participants
  participants: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Liste des participants à l\'entretien'
  },
  // Notes et observations
  notes_preparation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes_conclusion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Métadonnées
  mode_utilise: {
    type: DataTypes.ENUM('libre', 'guide', 'mixte'),
    defaultValue: 'libre'
  },
  version_referentiel: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  }
}, {
  tableName: 'entretiens',
  hooks: {
    beforeSave: (entretien) => {
      // Calcul automatique du PRISM
      if (entretien.ca_perimetre && entretien.marge_brute && entretien.heures_travaillees) {
        const ca = parseFloat(entretien.ca_perimetre);
        const marge = parseFloat(entretien.marge_brute) / 100;
        const heures = parseInt(entretien.heures_travaillees);
        
        entretien.prism_calcule = (ca * marge) / heures;
      }
    }
  }
});

module.exports = Entretien;
