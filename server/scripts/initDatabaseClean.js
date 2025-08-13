const { sequelize } = require('../config/database');
const { User, Entretien, Dysfonctionnement, ReferentielIseor } = require('../models');
const bcrypt = require('bcryptjs');

// Données du référentiel ISEOR (version simplifiée)
const referentielData = [
  // Domaine 1: Conditions de travail
  {
    code: '101',
    domaine: 1,
    titre: 'Sécurité et hygiène',
    description: 'Conditions de sécurité et d\'hygiène au travail',
    sous_themes: ['Accidents du travail', 'Maladies professionnelles'],
    exemples: ['Accidents de manutention', 'Troubles musculo-squelettiques'],
    questions_guides: ['Y a-t-il des accidents récurrents ?'],
    indicateurs_defaut: ['accidents'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '201',
    domaine: 2,
    titre: 'Répartition des tâches',
    description: 'Organisation et répartition du travail entre les personnes',
    sous_themes: ['Charge de travail', 'Polyvalence'],
    exemples: ['Surcharge ponctuelle', 'Sous-charge chronique'],
    questions_guides: ['La charge est-elle équilibrée ?'],
    indicateurs_defaut: ['ecarts', 'rotation'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '301',
    domaine: 3,
    titre: 'Communication verticale',
    description: 'Communication entre les niveaux hiérarchiques',
    sous_themes: ['Remontée d\'information', 'Directives'],
    exemples: ['Informations non transmises', 'Consignes floues'],
    questions_guides: ['L\'information circule-t-elle bien ?'],
    indicateurs_defaut: ['defauts', 'ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation propre de la base de données...');

    // Forcer la recréation complète des tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables créées avec succès');

    // Créer l'utilisateur administrateur
    console.log('👤 Création de l\'administrateur...');
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

    // Vérifier immédiatement le mot de passe
    const passwordCheck = await admin.verifierMotDePasse('Admin123!');
    console.log('🔐 Vérification mot de passe admin:', passwordCheck ? '✅ OK' : '❌ ERREUR');

    // Créer l'utilisateur consultant
    console.log('👤 Création du consultant...');
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

    // Vérifier immédiatement le mot de passe
    const consultantPasswordCheck = await consultant.verifierMotDePasse('Consultant123!');
    console.log('🔐 Vérification mot de passe consultant:', consultantPasswordCheck ? '✅ OK' : '❌ ERREUR');

    // Insérer le référentiel ISEOR
    console.log('📚 Insertion du référentiel ISEOR...');
    await ReferentielIseor.bulkCreate(referentielData);
    console.log('✅ Référentiel ISEOR initialisé');

    // Créer un entretien de démonstration
    console.log('📋 Création de l\'entretien de démonstration...');
    const entretienDemo = await Entretien.create({
      user_id: consultant.id,
      titre: 'Diagnostic MSE - Service Production',
      entreprise: 'Entreprise Exemple SA',
      secteur_activite: 'Industrie automobile',
      date_entretien: new Date(),
      duree_prevue: 90,
      statut: 'en_cours',
      ca_perimetre: 5000000,
      marge_brute: 25,
      heures_travaillees: 1600,
      effectif: 50,
      notes_preparation: 'Entretien de démonstration pour présenter les fonctionnalités de l\'application MSE Diagnostic.'
    });
    console.log('✅ Entretien de démonstration créé');

    // Créer quelques dysfonctionnements de démonstration
    console.log('⚠️ Création des dysfonctionnements de démonstration...');
    const dysfonctionnementsDemo = [
      {
        entretien_id: entretienDemo.id,
        description: 'Pannes récurrentes sur la ligne de production principale',
        frequence: 'hebdomadaire',
        temps_par_occurrence: 120,
        personnes_impactees: 8,
        cout_direct: 500,
        domaine_iseor: 1,
        indicateur_defauts: true,
        indicateur_ecarts: true,
        composant_surrtemps: true,
        composant_non_production: true,
        priorite: 'haute',
        mode_saisie: 'libre'
      },
      {
        entretien_id: entretienDemo.id,
        description: 'Manque de communication entre équipes',
        frequence: 'quotidien',
        temps_par_occurrence: 30,
        personnes_impactees: 5,
        cout_direct: 0,
        domaine_iseor: 3,
        indicateur_ecarts: true,
        composant_surrtemps: true,
        composant_non_production: true,
        priorite: 'moyenne',
        mode_saisie: 'guide'
      }
    ];

    await Dysfonctionnement.bulkCreate(dysfonctionnementsDemo);
    console.log('✅ Dysfonctionnements de démonstration créés');

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const userCount = await User.count();
    const adminUser = await User.findOne({ where: { email: 'admin@mse-diagnostic.fr' } });
    const consultantUser = await User.findOne({ where: { email: 'consultant@mse-diagnostic.fr' } });

    console.log(`📊 Nombre d'utilisateurs: ${userCount}`);
    console.log(`👤 Admin trouvé: ${adminUser ? '✅' : '❌'}`);
    console.log(`👤 Consultant trouvé: ${consultantUser ? '✅' : '❌'}`);

    if (adminUser) {
      const adminPasswordTest = await adminUser.verifierMotDePasse('Admin123!');
      console.log(`🔐 Test mot de passe admin: ${adminPasswordTest ? '✅ OK' : '❌ ERREUR'}`);
    }

    if (consultantUser) {
      const consultantPasswordTest = await consultantUser.verifierMotDePasse('Consultant123!');
      console.log(`🔐 Test mot de passe consultant: ${consultantPasswordTest ? '✅ OK' : '❌ ERREUR'}`);
    }

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    console.log('\n📊 Données de démonstration :');
    console.log('• Référentiel ISEOR (3 éléments de base)');
    console.log('• 1 entretien de démonstration');
    console.log('• 2 dysfonctionnements exemples');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
    throw error;
  }
}

// Exécuter l'initialisation si ce script est appelé directement
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Échec de l\'initialisation :', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
