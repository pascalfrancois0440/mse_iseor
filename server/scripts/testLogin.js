const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🧪 Test de connexion des utilisateurs...\n');

    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Test 1: Récupérer l'administrateur
    console.log('\n1️⃣ Test administrateur...');
    const admin = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    
    if (!admin) {
      console.log('❌ Administrateur non trouvé');
      return;
    }

    console.log('✅ Administrateur trouvé');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rôle: ${admin.role}`);
    console.log(`   Hash du mot de passe: ${admin.password ? admin.password.substring(0, 20) + '...' : 'VIDE'}`);

    // Test direct avec bcrypt
    if (admin.password) {
      const directTest = await bcrypt.compare('Admin123!', admin.password);
      console.log(`   Test direct bcrypt: ${directTest ? '✅ OK' : '❌ ERREUR'}`);
      
      // Test avec la méthode du modèle
      const modelTest = await admin.verifierMotDePasse('Admin123!');
      console.log(`   Test méthode modèle: ${modelTest ? '✅ OK' : '❌ ERREUR'}`);
    } else {
      console.log('❌ Mot de passe vide, recréation...');
      const newPassword = await bcrypt.hash('Admin123!', 12);
      await admin.update({ password: newPassword });
      console.log('✅ Mot de passe recréé');
      
      const retestModel = await admin.verifierMotDePasse('Admin123!');
      console.log(`   Nouveau test: ${retestModel ? '✅ OK' : '❌ ERREUR'}`);
    }

    // Test 2: Récupérer le consultant
    console.log('\n2️⃣ Test consultant...');
    const consultant = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });
    
    if (!consultant) {
      console.log('❌ Consultant non trouvé');
      return;
    }

    console.log('✅ Consultant trouvé');
    console.log(`   Email: ${consultant.email}`);
    console.log(`   Rôle: ${consultant.role}`);
    console.log(`   Hash du mot de passe: ${consultant.password ? consultant.password.substring(0, 20) + '...' : 'VIDE'}`);

    // Test direct avec bcrypt
    if (consultant.password) {
      const directTest = await bcrypt.compare('Consultant123!', consultant.password);
      console.log(`   Test direct bcrypt: ${directTest ? '✅ OK' : '❌ ERREUR'}`);
      
      // Test avec la méthode du modèle
      const modelTest = await consultant.verifierMotDePasse('Consultant123!');
      console.log(`   Test méthode modèle: ${modelTest ? '✅ OK' : '❌ ERREUR'}`);
    } else {
      console.log('❌ Mot de passe vide, recréation...');
      const newPassword = await bcrypt.hash('Consultant123!', 12);
      await consultant.update({ password: newPassword });
      console.log('✅ Mot de passe recréé');
      
      const retestModel = await consultant.verifierMotDePasse('Consultant123!');
      console.log(`   Nouveau test: ${retestModel ? '✅ OK' : '❌ ERREUR'}`);
    }

    // Test 3: Simulation de l'API de connexion
    console.log('\n3️⃣ Test simulation API login...');
    
    const testLoginAPI = async (email, password) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return { success: false, message: 'Utilisateur non trouvé' };
        }

        const isValidPassword = await user.verifierMotDePasse(password);
        if (!isValidPassword) {
          return { success: false, message: 'Mot de passe incorrect' };
        }

        return { success: true, user: user.toJSON() };
      } catch (error) {
        return { success: false, message: error.message };
      }
    };

    // Test admin
    const adminLoginTest = await testLoginAPI('admin@mse-diagnostic.fr', 'Admin123!');
    console.log(`   Login admin: ${adminLoginTest.success ? '✅ OK' : '❌ ' + adminLoginTest.message}`);

    // Test consultant
    const consultantLoginTest = await testLoginAPI('consultant@mse-diagnostic.fr', 'Consultant123!');
    console.log(`   Login consultant: ${consultantLoginTest.success ? '✅ OK' : '❌ ' + consultantLoginTest.message}`);

    console.log('\n🎉 Tests terminés !');
    
    if (adminLoginTest.success && consultantLoginTest.success) {
      console.log('\n✅ TOUS LES COMPTES FONCTIONNENT CORRECTEMENT');
      console.log('\n📋 Comptes de connexion :');
      console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
      console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    } else {
      console.log('\n❌ CERTAINS COMPTES NE FONCTIONNENT PAS');
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests :', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter les tests
testLogin();
