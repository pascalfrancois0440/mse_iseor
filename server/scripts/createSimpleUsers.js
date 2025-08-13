const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createSimpleUsers() {
  try {
    console.log('🔄 Création simple des utilisateurs...\n');

    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Supprimer et recréer la table users
    console.log('\n🗑️ Suppression et recréation de la table users...');
    
    await sequelize.query('DROP TABLE IF EXISTS users;');
    
    // Créer la table users manuellement
    await sequelize.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        role TEXT DEFAULT 'consultant',
        organisation TEXT,
        telephone TEXT,
        actif INTEGER DEFAULT 1,
        derniere_connexion DATETIME,
        provider TEXT DEFAULT 'local',
        provider_id TEXT,
        reset_password_token TEXT,
        reset_password_expires DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);
    
    console.log('✅ Table users recréée');

    // Créer les mots de passe hachés
    console.log('\n🔐 Création des mots de passe...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const consultantPassword = await bcrypt.hash('Consultant123!', 12);
    
    console.log('✅ Mots de passe hachés');

    // Insérer l'administrateur
    console.log('\n👤 Insertion administrateur...');
    const adminId = 'admin-' + Date.now();
    const now = new Date().toISOString();
    
    await sequelize.query(`
      INSERT INTO users (
        id, email, password, nom, prenom, role, organisation, actif, provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        adminId,
        'admin@mse-diagnostic.fr',
        adminPassword,
        'Administrateur',
        'MSE',
        'administrateur',
        'MSE Consulting',
        1,
        'local',
        now,
        now
      ]
    });
    
    console.log('✅ Administrateur inséré');

    // Insérer le consultant
    console.log('\n👤 Insertion consultant...');
    const consultantId = 'consultant-' + Date.now();
    
    await sequelize.query(`
      INSERT INTO users (
        id, email, password, nom, prenom, role, organisation, telephone, actif, provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        consultantId,
        'consultant@mse-diagnostic.fr',
        consultantPassword,
        'Dupont',
        'Jean',
        'consultant',
        'MSE Consulting',
        '+33 1 23 45 67 89',
        1,
        'local',
        now,
        now
      ]
    });
    
    console.log('✅ Consultant inséré');

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    const users = await sequelize.query('SELECT email, role, actif FROM users;', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`📊 Utilisateurs créés: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.actif ? 'Actif' : 'Inactif'}`);
    });

    // Test des mots de passe
    console.log('\n🧪 Test des mots de passe...');
    
    const adminUser = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: ['admin@mse-diagnostic.fr'],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (adminUser.length > 0) {
      const adminTest = await bcrypt.compare('Admin123!', adminUser[0].password);
      console.log(`   Admin: ${adminTest ? '✅ OK' : '❌ ERREUR'}`);
    }
    
    const consultantUser = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: ['consultant@mse-diagnostic.fr'],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (consultantUser.length > 0) {
      const consultantTest = await bcrypt.compare('Consultant123!', consultantUser[0].password);
      console.log(`   Consultant: ${consultantTest ? '✅ OK' : '❌ ERREUR'}`);
    }

    console.log('\n🎉 Utilisateurs créés avec succès !');
    console.log('\n📋 Comptes de connexion :');
    console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    console.log('\n✅ Les comptes sont maintenant opérationnels !');

  } catch (error) {
    console.error('❌ Erreur lors de la création :', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la création
createSimpleUsers();
