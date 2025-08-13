const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');

    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Lister tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'email', 'nom', 'prenom', 'role', 'actif', 'created_at']
    });

    console.log(`\n📊 Nombre d'utilisateurs trouvés: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('🔧 Recréation des utilisateurs...\n');
      
      // Créer l'administrateur
      const adminPassword = await bcrypt.hash('Admin123!', 12);
      const admin = await User.create({
        email: 'admin@mse-diagnostic.fr',
        password: adminPassword,
        nom: 'Administrateur',
        prenom: 'MSE',
        role: 'administrateur',
        organisation: 'MSE Consulting',
        actif: true,
        provider: 'local'
      });
      console.log('✅ Administrateur créé:', admin.email);

      // Créer le consultant
      const consultantPassword = await bcrypt.hash('Consultant123!', 12);
      const consultant = await User.create({
        email: 'consultant@mse-diagnostic.fr',
        password: consultantPassword,
        nom: 'Dupont',
        prenom: 'Jean',
        role: 'consultant',
        organisation: 'MSE Consulting',
        telephone: '+33 1 23 45 67 89',
        actif: true,
        provider: 'local'
      });
      console.log('✅ Consultant créé:', consultant.email);
    } else {
      // Afficher les utilisateurs existants
      users.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.prenom} ${user.nom}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔐 Rôle: ${user.role}`);
        console.log(`   ✅ Actif: ${user.actif ? 'Oui' : 'Non'}`);
        console.log(`   📅 Créé le: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
        console.log('');
      });
    }

    // Tester la connexion de l'administrateur
    console.log('🧪 Test de connexion administrateur...');
    const adminUser = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    
    if (!adminUser) {
      console.log('❌ Utilisateur administrateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur administrateur trouvé');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Rôle: ${adminUser.role}`);
    console.log(`   Actif: ${adminUser.actif}`);

    // Tester le mot de passe
    const isPasswordValid = await adminUser.verifierMotDePasse('Admin123!');
    console.log(`   Mot de passe valide: ${isPasswordValid ? '✅ Oui' : '❌ Non'}`);

    if (!isPasswordValid) {
      console.log('🔧 Réinitialisation du mot de passe administrateur...');
      const newPassword = await bcrypt.hash('Admin123!', 12);
      await adminUser.update({ password: newPassword });
      console.log('✅ Mot de passe administrateur réinitialisé');
    }

    console.log('\n🎉 Vérification terminée !');
    console.log('\n📋 Comptes disponibles :');
    console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la vérification
checkUsers();
