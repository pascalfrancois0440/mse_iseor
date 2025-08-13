const { sequelize } = require('../config/database');
const User = require('./User');
const Entretien = require('./Entretien');
const Dysfonctionnement = require('./Dysfonctionnement');
const ReferentielIseor = require('./ReferentielIseor');

// Définition des associations
User.hasMany(Entretien, { foreignKey: 'user_id', as: 'entretiens' });
Entretien.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Entretien.hasMany(Dysfonctionnement, { foreignKey: 'entretien_id', as: 'dysfonctionnements' });
Dysfonctionnement.belongsTo(Entretien, { foreignKey: 'entretien_id', as: 'entretien' });

Dysfonctionnement.belongsTo(ReferentielIseor, { foreignKey: 'referentiel_id', as: 'referentiel' });
ReferentielIseor.hasMany(Dysfonctionnement, { foreignKey: 'referentiel_id', as: 'dysfonctionnements' });

module.exports = {
  sequelize,
  User,
  Entretien,
  Dysfonctionnement,
  ReferentielIseor
};
