const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Null pour les connexions OAuth
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('administrateur', 'consultant'),
    defaultValue: 'consultant'
  },
  organisation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  provider: {
    type: DataTypes.ENUM('local', 'google', 'microsoft'),
    defaultValue: 'local'
  },
  provider_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        console.log('🔍 HOOK - Hachage du nouveau mot de passe:', user.password);
        user.password = await bcrypt.hash(user.password, 12);
        console.log('🔍 HOOK - Mot de passe haché:', user.password.substring(0, 20) + '...');
      }
    }
  }
});

// Méthode pour vérifier le mot de passe
User.prototype.verifierMotDePasse = async function(motDePasse) {
  console.log('🔍 USER MODEL - Vérification mot de passe');
  console.log('🔍 USER MODEL - Mot de passe fourni:', motDePasse);
  console.log('🔍 USER MODEL - Hash en base:', this.password ? this.password.substring(0, 20) + '...' : 'null');
  
  if (!this.password) {
    console.log('🔍 USER MODEL - Pas de mot de passe en base');
    return false;
  }
  
  const result = await bcrypt.compare(motDePasse, this.password);
  console.log('🔍 USER MODEL - Résultat comparaison:', result);
  return result;
};

// Méthode pour obtenir les informations publiques
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  return values;
};

module.exports = User;
