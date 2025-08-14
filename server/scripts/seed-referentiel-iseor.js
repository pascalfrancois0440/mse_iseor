const { sequelize } = require('../config/database');
const { ReferentielIseor } = require('../models');

// Données du référentiel ISEOR - Partie 1 (Domaines 1-3)
const referentielData1 = [
  // DOMAINE 1 - CONDITIONS DE TRAVAIL
  {
    code: '101', domaine: 1, titre: 'Aménagement et agencement des locaux',
    description: 'Organisation spatiale et fonctionnelle des espaces de travail',
    questions_guides: ['Les locaux sont-ils adaptés aux activités ?', 'L\'agencement favorise-t-il la circulation ?'],
    exemples: ['Espaces trop exigus', 'Mauvaise circulation', 'Absence de zones de pause']
  },
  {
    code: '102', domaine: 1, titre: 'Matériel et fournitures',
    description: 'Disponibilité et qualité des outils, équipements et fournitures',
    questions_guides: ['Le matériel est-il adapté aux tâches ?', 'Les équipements sont-ils entretenus ?'],
    exemples: ['Matériel obsolète', 'Ruptures de stock', 'Outils inadaptés']
  },
  {
    code: '103', domaine: 1, titre: 'Nuisances',
    description: 'Facteurs environnementaux perturbateurs',
    questions_guides: ['Y a-t-il des nuisances sonores ?', 'L\'environnement est-il pollué ?'],
    exemples: ['Bruit excessif', 'Odeurs chimiques', 'Vibrations']
  },
  {
    code: '104', domaine: 1, titre: 'Conditions physiques de travail',
    description: 'Environnement physique : température, éclairage, ventilation',
    questions_guides: ['La température est-elle confortable ?', 'L\'éclairage est-il suffisant ?'],
    exemples: ['Température excessive', 'Éclairage insuffisant', 'Air vicié']
  },
  {
    code: '105', domaine: 1, titre: 'Charge physique de travail',
    description: 'Efforts physiques requis et ergonomie',
    questions_guides: ['Les postes sont-ils ergonomiques ?', 'Y a-t-il des ports de charges lourdes ?'],
    exemples: ['Postures contraignantes', 'Charges lourdes', 'Gestes répétitifs']
  },
  {
    code: '106', domaine: 1, titre: 'Horaires de travail',
    description: 'Organisation temporelle du travail',
    questions_guides: ['Les horaires sont-ils adaptés ?', 'Y a-t-il de la flexibilité ?'],
    exemples: ['Horaires rigides', 'Heures supplémentaires excessives']
  },
  {
    code: '107', domaine: 1, titre: 'Ambiance de travail',
    description: 'Climat social et relationnel',
    questions_guides: ['L\'ambiance est-elle bonne ?', 'Y a-t-il des tensions ?'],
    exemples: ['Tensions entre collègues', 'Manque de solidarité']
  },

  // DOMAINE 2 - ORGANISATION DU TRAVAIL
  {
    code: '201', domaine: 2, titre: 'Répartition des tâches, des missions, des fonctions',
    description: 'Distribution et équilibrage des responsabilités',
    questions_guides: ['La répartition est-elle équitable ?', 'Les missions sont-elles claires ?'],
    exemples: ['Surcharge de certains postes', 'Missions mal définies']
  },
  {
    code: '202', domaine: 2, titre: 'Régulation de l\'absentéisme',
    description: 'Gestion des absences et impacts',
    questions_guides: ['Comment sont gérées les absences ?', 'Y a-t-il des remplacements ?'],
    exemples: ['Absence de remplacements', 'Surcharge lors d\'absences']
  },
  {
    code: '203', domaine: 2, titre: 'Intérêt du travail',
    description: 'Motivation et engagement',
    questions_guides: ['Le travail est-il stimulant ?', 'Y a-t-il des perspectives ?'],
    exemples: ['Tâches monotones', 'Manque de perspectives']
  },
  {
    code: '204', domaine: 2, titre: 'Autonomie dans le travail',
    description: 'Degré d\'indépendance et responsabilisation',
    questions_guides: ['Y a-t-il une marge de manœuvre ?', 'Peut-on prendre des initiatives ?'],
    exemples: ['Contrôle excessif', 'Manque d\'initiative autorisée']
  },
  {
    code: '205', domaine: 2, titre: 'Charge de travail',
    description: 'Volume et intensité des tâches',
    questions_guides: ['La charge est-elle réaliste ?', 'Les délais sont-ils tenables ?'],
    exemples: ['Surcharge chronique', 'Délais impossibles']
  },
  {
    code: '206', domaine: 2, titre: 'Règles et procédures',
    description: 'Clarté et pertinence des règles',
    questions_guides: ['Les procédures sont-elles claires ?', 'Sont-elles adaptées ?'],
    exemples: ['Procédures obsolètes', 'Excès de bureaucratie']
  },
  {
    code: '207', domaine: 2, titre: 'Organigramme',
    description: 'Structure hiérarchique et fonctionnelle',
    questions_guides: ['L\'organigramme est-il clair ?', 'Y a-t-il des conflits de pouvoir ?'],
    exemples: ['Organigramme flou', 'Double hiérarchie']
  }
];

async function seedReferentielIseor() {
  try {
    console.log('🌱 Démarrage de l\'alimentation du référentiel ISEOR...');
    
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    await ReferentielIseor.destroy({ where: {} });
    console.log('🗑️  Table vidée');

    const created1 = await ReferentielIseor.bulkCreate(referentielData1);
    console.log(`✅ ${created1.length} items créés (Domaines 1-2)`);

    console.log('\n🎉 Alimentation terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedReferentielIseor();
}

module.exports = { seedReferentielIseor };
