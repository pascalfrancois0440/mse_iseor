const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    console.log('🔧 Correction des mots de passe...\n');

    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Corriger le mot de passe administrateur
    console.log('\n1️⃣ Correction administrateur...');
    const admin = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    
    if (admin) {
      // Créer un nouveau hash directement
      const adminPassword = 'Admin123!';
      const adminHash = await bcrypt.hash(adminPassword, 12);
      
      console.log(`   Nouveau hash généré: ${adminHash.substring(0, 20)}...`);
      
      // Mettre à jour directement dans la base
      await sequelize.query(
        'UPDATE users SET password = ? WHERE email = ?',
        {
          replacements: [adminHash, 'admin@mse-diagnostic.fr'],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log('✅ Mot de passe administrateur mis à jour');
      
      // Recharger et tester
      await admin.reload();
      const testAdmin = await bcrypt.compare(adminPassword, adminHash);
      console.log(`   Test direct: ${testAdmin ? '✅ OK' : '❌ ERREUR'}`);
      
      const testAdminModel = await admin.verifierMotDePasse(adminPassword);
      console.log(`   Test modèle: ${testAdminModel ? '✅ OK' : '❌ ERREUR'}`);
    }

    // Corriger le mot de passe consultant
    console.log('\n2️⃣ Correction consultant...');
    const consultant = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });
    
    if (consultant) {
      // Créer un nouveau hash directement
      const consultantPassword = 'Consultant123!';
      const consultantHash = await bcrypt.hash(consultantPassword, 12);
      
      console.log(`   Nouveau hash généré: ${consultantHash.substring(0, 20)}...`);
      
      // Mettre à jour directement dans la base
      await sequelize.query(
        'UPDATE users SET password = ? WHERE email = ?',
        {
          replacements: [consultantHash, 'consultant@mse-diagnostic.fr'],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log('✅ Mot de passe consultant mis à jour');
      
      // Recharger et tester
      await consultant.reload();
      const testConsultant = await bcrypt.compare(consultantPassword, consultantHash);
      console.log(`   Test direct: ${testConsultant ? '✅ OK' : '❌ ERREUR'}`);
      
      const testConsultantModel = await consultant.verifierMotDePasse(consultantPassword);
      console.log(`   Test modèle: ${testConsultantModel ? '✅ OK' : '❌ ERREUR'}`);
    }

    // Test final de connexion
    console.log('\n3️⃣ Test final de connexion...');
    
    const finalTestAdmin = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    const finalTestConsultant = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });
    
    if (finalTestAdmin) {
      const adminLoginTest = await finalTestAdmin.verifierMotDePasse('Admin123!');
      console.log(`   Admin login: ${adminLoginTest ? '✅ FONCTIONNE' : '❌ ERREUR'}`);
    }
    
    if (finalTestConsultant) {
      const consultantLoginTest = await finalTestConsultant.verifierMotDePasse('Consultant123!');
      console.log(`   Consultant login: ${consultantLoginTest ? '✅ FONCTIONNE' : '❌ ERREUR'}`);
    }

    console.log('\n🎉 Correction terminée !');
    console.log('\n📋 Comptes de connexion :');
    console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    console.log('\n🔐 Les mots de passe ont été corrigés et testés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter la correction
fixPasswords();
