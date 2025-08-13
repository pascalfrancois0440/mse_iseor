const { sequelize } = require('../config/database');
const { User, Entretien, Dysfonctionnement, ReferentielIseor } = require('../models');
const bcrypt = require('bcryptjs');

// Données du référentiel ISEOR
const referentielData = [
  // Domaine 1: Conditions de travail
  {
    code: '101',
    domaine: 1,
    titre: 'Sécurité et hygiène',
    description: 'Conditions de sécurité et d\'hygiène au travail',
    sous_themes: ['Accidents du travail', 'Maladies professionnelles', 'Équipements de protection'],
    exemples: ['Accidents de manutention', 'Troubles musculo-squelettiques', 'Exposition aux produits chimiques'],
    questions_guides: ['Y a-t-il des accidents récurrents ?', 'Les équipements de protection sont-ils utilisés ?'],
    indicateurs_defaut: ['accidents'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '102',
    domaine: 1,
    titre: 'Ergonomie des postes',
    description: 'Adaptation des postes de travail aux utilisateurs',
    sous_themes: ['Postures de travail', 'Éclairage', 'Bruit', 'Température'],
    exemples: ['Postes informatiques mal réglés', 'Éclairage insuffisant', 'Nuisances sonores'],
    questions_guides: ['Les postes sont-ils ergonomiques ?', 'Y a-t-il des plaintes sur l\'environnement ?'],
    indicateurs_defaut: ['absenteisme', 'defauts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 2
  },
  {
    code: '103',
    domaine: 1,
    titre: 'Équipements et outils',
    description: 'État et adaptation des équipements de travail',
    sous_themes: ['Maintenance préventive', 'Vétusté', 'Adaptation aux besoins'],
    exemples: ['Pannes récurrentes', 'Outils inadaptés', 'Maintenance insuffisante'],
    questions_guides: ['Les équipements sont-ils fiables ?', 'La maintenance est-elle régulière ?'],
    indicateurs_defaut: ['defauts', 'ecarts'],
    composants_defaut: ['surrtemps', 'surconsommation'],
    ordre_affichage: 3
  },

  // Domaine 2: Organisation du travail
  {
    code: '201',
    domaine: 2,
    titre: 'Répartition des tâches',
    description: 'Organisation et répartition du travail entre les personnes',
    sous_themes: ['Charge de travail', 'Polyvalence', 'Spécialisation'],
    exemples: ['Surcharge ponctuelle', 'Sous-charge chronique', 'Déséquilibre des équipes'],
    questions_guides: ['La charge est-elle équilibrée ?', 'Y a-t-il de la polyvalence ?'],
    indicateurs_defaut: ['ecarts', 'rotation'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '202',
    domaine: 2,
    titre: 'Méthodes de travail',
    description: 'Procédures et méthodes utilisées',
    sous_themes: ['Procédures', 'Standardisation', 'Amélioration continue'],
    exemples: ['Procédures obsolètes', 'Méthodes non standardisées', 'Résistance au changement'],
    questions_guides: ['Les méthodes sont-elles optimisées ?', 'Y a-t-il des procédures claires ?'],
    indicateurs_defaut: ['defauts', 'ecarts'],
    composants_defaut: ['surrtemps', 'surproduction'],
    ordre_affichage: 2
  },
  {
    code: '203',
    domaine: 2,
    titre: 'Planification',
    description: 'Organisation et planification des activités',
    sous_themes: ['Planning', 'Prévision', 'Urgences'],
    exemples: ['Plannings non respectés', 'Manque d\'anticipation', 'Gestion d\'urgence permanente'],
    questions_guides: ['La planification est-elle efficace ?', 'Y a-t-il beaucoup d\'urgences ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['surrtemps', 'surproduction'],
    ordre_affichage: 3
  },

  // Domaine 3: Communication-coordination-concertation
  {
    code: '301',
    domaine: 3,
    titre: 'Communication verticale',
    description: 'Communication entre les niveaux hiérarchiques',
    sous_themes: ['Remontée d\'information', 'Directives', 'Feedback'],
    exemples: ['Informations non transmises', 'Consignes floues', 'Manque de retour'],
    questions_guides: ['L\'information circule-t-elle bien ?', 'Les directives sont-elles claires ?'],
    indicateurs_defaut: ['defauts', 'ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '302',
    domaine: 3,
    titre: 'Communication horizontale',
    description: 'Communication entre services et équipes',
    sous_themes: ['Coordination', 'Interfaces', 'Collaboration'],
    exemples: ['Manque de coordination', 'Conflits entre services', 'Doublons d\'activité'],
    questions_guides: ['Les services collaborent-ils bien ?', 'Y a-t-il des conflits récurrents ?'],
    indicateurs_defaut: ['ecarts', 'defauts'],
    composants_defaut: ['surrtemps', 'surproduction'],
    ordre_affichage: 2
  },
  {
    code: '303',
    domaine: 3,
    titre: 'Réunions et concertation',
    description: 'Organisation et efficacité des réunions',
    sous_themes: ['Fréquence', 'Efficacité', 'Participation'],
    exemples: ['Réunions trop nombreuses', 'Réunions improductives', 'Manque de participation'],
    questions_guides: ['Les réunions sont-elles efficaces ?', 'Y a-t-il trop de réunions ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 3
  },

  // Domaine 4: Gestion du temps
  {
    code: '401',
    domaine: 4,
    titre: 'Horaires de travail',
    description: 'Organisation et respect des horaires',
    sous_themes: ['Flexibilité', 'Ponctualité', 'Heures supplémentaires'],
    exemples: ['Retards fréquents', 'Heures sup systématiques', 'Rigidité des horaires'],
    questions_guides: ['Les horaires sont-ils respectés ?', 'Y a-t-il beaucoup d\'heures sup ?'],
    indicateurs_defaut: ['absenteisme', 'ecarts'],
    composants_defaut: ['surrtemps'],
    ordre_affichage: 1
  },
  {
    code: '402',
    domaine: 4,
    titre: 'Interruptions',
    description: 'Gestion des interruptions et perturbations',
    sous_themes: ['Téléphone', 'Urgences', 'Sollicitations'],
    exemples: ['Interruptions fréquentes', 'Téléphone envahissant', 'Sollicitations multiples'],
    questions_guides: ['Y a-t-il beaucoup d\'interruptions ?', 'Comment sont gérées les urgences ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 2
  },
  {
    code: '403',
    domaine: 4,
    titre: 'Rythme de travail',
    description: 'Adaptation du rythme aux contraintes',
    sous_themes: ['Cadence', 'Pics d\'activité', 'Saisonnalité'],
    exemples: ['Rythme inadapté', 'Pics non anticipés', 'Variations saisonnières'],
    questions_guides: ['Le rythme est-il adapté ?', 'Comment sont gérés les pics ?'],
    indicateurs_defaut: ['ecarts', 'rotation'],
    composants_defaut: ['surrtemps', 'surproduction'],
    ordre_affichage: 3
  },

  // Domaine 5: Formation intégrée
  {
    code: '501',
    domaine: 5,
    titre: 'Formation initiale',
    description: 'Formation à l\'embauche et intégration',
    sous_themes: ['Accueil', 'Formation métier', 'Tutorat'],
    exemples: ['Accueil insuffisant', 'Formation trop courte', 'Manque de tutorat'],
    questions_guides: ['L\'intégration est-elle efficace ?', 'Y a-t-il un tutorat ?'],
    indicateurs_defaut: ['defauts', 'rotation'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 1
  },
  {
    code: '502',
    domaine: 5,
    titre: 'Formation continue',
    description: 'Développement des compétences en continu',
    sous_themes: ['Mise à jour', 'Évolution', 'Polyvalence'],
    exemples: ['Compétences obsolètes', 'Manque de formation', 'Résistance à l\'évolution'],
    questions_guides: ['Les compétences sont-elles à jour ?', 'Y a-t-il de la formation continue ?'],
    indicateurs_defaut: ['defauts', 'ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 2
  },
  {
    code: '503',
    domaine: 5,
    titre: 'Transmission des savoirs',
    description: 'Partage et capitalisation des connaissances',
    sous_themes: ['Documentation', 'Mentorat', 'Capitalisation'],
    exemples: ['Savoirs non documentés', 'Départs non anticipés', 'Perte de compétences'],
    questions_guides: ['Les savoirs sont-ils capitalisés ?', 'Comment se fait la transmission ?'],
    indicateurs_defaut: ['rotation', 'defauts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 3
  },

  // Domaine 6: Mise en œuvre stratégique
  {
    code: '601',
    domaine: 6,
    titre: 'Objectifs et indicateurs',
    description: 'Définition et suivi des objectifs',
    sous_themes: ['Clarté', 'Mesurabilité', 'Suivi'],
    exemples: ['Objectifs flous', 'Indicateurs inadaptés', 'Manque de suivi'],
    questions_guides: ['Les objectifs sont-ils clairs ?', 'Les indicateurs sont-ils pertinents ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['non_production', 'surproduction'],
    ordre_affichage: 1
  },
  {
    code: '602',
    domaine: 6,
    titre: 'Décisions et arbitrages',
    description: 'Processus de prise de décision',
    sous_themes: ['Rapidité', 'Pertinence', 'Communication'],
    exemples: ['Décisions tardives', 'Arbitrages non communiqués', 'Remises en cause'],
    questions_guides: ['Les décisions sont-elles rapides ?', 'Sont-elles bien communiquées ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['surrtemps', 'non_production'],
    ordre_affichage: 2
  },
  {
    code: '603',
    domaine: 6,
    titre: 'Innovation et amélioration',
    description: 'Capacité d\'innovation et d\'amélioration continue',
    sous_themes: ['Créativité', 'Expérimentation', 'Amélioration'],
    exemples: ['Résistance au changement', 'Manque d\'innovation', 'Amélioration insuffisante'],
    questions_guides: ['Y a-t-il de l\'innovation ?', 'Comment sont gérées les améliorations ?'],
    indicateurs_defaut: ['ecarts'],
    composants_defaut: ['non_production', 'surproduction'],
    ordre_affichage: 3
  }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');

    // Synchroniser les modèles
    await sequelize.sync({ force: true });
    console.log('✅ Tables créées avec succès');

    // Créer un utilisateur administrateur par défaut
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
    console.log('✅ Utilisateur administrateur créé');

    // Créer un utilisateur consultant de démonstration
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
    console.log('✅ Utilisateur consultant créé');

    // Insérer le référentiel ISEOR
    await ReferentielIseor.bulkCreate(referentielData);
    console.log('✅ Référentiel ISEOR initialisé');

    // Créer un entretien de démonstration
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
    const dysfonctionnementsDemo = [
      {
        entretien_id: entretienDemo.id,
        description: 'Pannes récurrentes sur la ligne de production principale causant des arrêts non planifiés',
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
        description: 'Manque de communication entre les équipes de production et de maintenance',
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
      },
      {
        entretien_id: entretienDemo.id,
        description: 'Formation insuffisante des nouveaux opérateurs entraînant des erreurs de qualité',
        frequence: 'mensuel',
        temps_par_occurrence: 240,
        personnes_impactees: 3,
        cout_direct: 1200,
        domaine_iseor: 5,
        indicateur_defauts: true,
        indicateur_rotation: true,
        composant_surrtemps: true,
        composant_surconsommation: true,
        priorite: 'haute',
        mode_saisie: 'referentiel'
      }
    ];

    await Dysfonctionnement.bulkCreate(dysfonctionnementsDemo);
    console.log('✅ Dysfonctionnements de démonstration créés');

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    console.log('\n📊 Données de démonstration :');
    console.log('• Référentiel ISEOR complet (6 domaines)');
    console.log('• 1 entretien de démonstration');
    console.log('• 3 dysfonctionnements exemples');

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
