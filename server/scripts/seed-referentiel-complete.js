const { sequelize } = require('../config/database');
const { ReferentielIseor } = require('../models');

// Référentiel ISEOR complet - 6 domaines avec tous les items
const referentielComplet = [
  // DOMAINE 1 - CONDITIONS DE TRAVAIL
  { code: '101', domaine: 1, titre: 'Aménagement et agencement des locaux', description: 'Organisation spatiale et fonctionnelle des espaces de travail', questions_guides: ['Les locaux sont-ils adaptés aux activités ?', 'L\'agencement favorise-t-il la circulation ?', 'Les espaces sont-ils suffisamment spacieux ?'], exemples: ['Espaces trop exigus', 'Mauvaise circulation', 'Absence de zones de pause'] },
  { code: '102', domaine: 1, titre: 'Matériel et fournitures', description: 'Disponibilité et qualité des outils et équipements', questions_guides: ['Le matériel est-il adapté aux tâches ?', 'Les équipements sont-ils entretenus ?', 'Y a-t-il des ruptures de stock ?'], exemples: ['Matériel obsolète', 'Ruptures de stock', 'Outils inadaptés'] },
  { code: '103', domaine: 1, titre: 'Nuisances', description: 'Facteurs environnementaux perturbateurs', questions_guides: ['Y a-t-il des nuisances sonores ?', 'L\'environnement est-il pollué ?', 'Les nuisances affectent-elles la concentration ?'], exemples: ['Bruit excessif', 'Odeurs chimiques', 'Vibrations'] },
  { code: '104', domaine: 1, titre: 'Conditions physiques de travail', description: 'Environnement physique : température, éclairage, ventilation', questions_guides: ['La température est-elle confortable ?', 'L\'éclairage est-il suffisant ?', 'La ventilation est-elle efficace ?'], exemples: ['Température excessive', 'Éclairage insuffisant', 'Air vicié'] },
  { code: '105', domaine: 1, titre: 'Charge physique de travail', description: 'Efforts physiques requis et ergonomie', questions_guides: ['Les postes sont-ils ergonomiques ?', 'Y a-t-il des ports de charges lourdes ?', 'Les gestes répétitifs sont-ils limités ?'], exemples: ['Postures contraignantes', 'Charges lourdes', 'Gestes répétitifs'] },
  { code: '106', domaine: 1, titre: 'Horaires de travail', description: 'Organisation temporelle du travail', questions_guides: ['Les horaires sont-ils adaptés ?', 'Y a-t-il de la flexibilité ?', 'L\'équilibre vie privée/pro est-il respecté ?'], exemples: ['Horaires rigides', 'Heures supplémentaires excessives'] },
  { code: '107', domaine: 1, titre: 'Ambiance de travail', description: 'Climat social et relationnel', questions_guides: ['L\'ambiance est-elle bonne ?', 'Y a-t-il des tensions ?', 'L\'entraide est-elle présente ?'], exemples: ['Tensions entre collègues', 'Manque de solidarité'] },

  // DOMAINE 2 - ORGANISATION DU TRAVAIL
  { code: '201', domaine: 2, titre: 'Répartition des tâches, des missions, des fonctions', description: 'Distribution et équilibrage des responsabilités', questions_guides: ['La répartition est-elle équitable ?', 'Les missions sont-elles claires ?', 'Y a-t-il des doublons ?'], exemples: ['Surcharge de certains postes', 'Missions mal définies', 'Doublons dans les tâches'] },
  { code: '202', domaine: 2, titre: 'Régulation de l\'absentéisme', description: 'Gestion des absences et impacts', questions_guides: ['Comment sont gérées les absences ?', 'Y a-t-il des remplacements ?', 'L\'absentéisme est-il suivi ?'], exemples: ['Absence de remplacements', 'Surcharge lors d\'absences'] },
  { code: '203', domaine: 2, titre: 'Intérêt du travail', description: 'Motivation et engagement', questions_guides: ['Le travail est-il stimulant ?', 'Y a-t-il des perspectives ?', 'Les tâches ont-elles du sens ?'], exemples: ['Tâches monotones', 'Manque de perspectives'] },
  { code: '204', domaine: 2, titre: 'Autonomie dans le travail', description: 'Degré d\'indépendance et responsabilisation', questions_guides: ['Y a-t-il une marge de manœuvre ?', 'Peut-on prendre des initiatives ?', 'Le contrôle est-il adapté ?'], exemples: ['Contrôle excessif', 'Manque d\'initiative'] },
  { code: '205', domaine: 2, titre: 'Charge de travail', description: 'Volume et intensité des tâches', questions_guides: ['La charge est-elle réaliste ?', 'Les délais sont-ils tenables ?', 'Y a-t-il des pics ingérables ?'], exemples: ['Surcharge chronique', 'Délais impossibles'] },
  { code: '206', domaine: 2, titre: 'Règles et procédures', description: 'Clarté et pertinence des règles', questions_guides: ['Les procédures sont-elles claires ?', 'Sont-elles adaptées ?', 'Y a-t-il trop de règles ?'], exemples: ['Procédures obsolètes', 'Excès de bureaucratie'] },
  { code: '207', domaine: 2, titre: 'Organigramme', description: 'Structure hiérarchique et fonctionnelle', questions_guides: ['L\'organigramme est-il clair ?', 'Y a-t-il des conflits de pouvoir ?', 'La structure est-elle adaptée ?'], exemples: ['Organigramme flou', 'Double hiérarchie'] },

  // DOMAINE 3 - COMMUNICATION-COORDINATION-CONCERTATION [3C]
  { code: '301', domaine: 3, titre: '3C interne au service', description: 'Communication, coordination et concertation au sein du service', questions_guides: ['La communication interne est-elle fluide ?', 'Y a-t-il des réunions régulières ?', 'Les informations circulent-elles ?'], exemples: ['Manque de réunions', 'Informations bloquées', 'Coordination défaillante'] },
  { code: '302', domaine: 3, titre: 'Relations avec les services environnants', description: 'Coordination inter-services', questions_guides: ['Les relations inter-services sont-elles bonnes ?', 'Y a-t-il des conflits ?', 'La coordination fonctionne-t-elle ?'], exemples: ['Conflits entre services', 'Cloisonnement excessif'] },
  { code: '303', domaine: 3, titre: '3C entre réseau et siège', description: 'Communication structures centrales/décentralisées', questions_guides: ['Les échanges réseau/siège sont-ils réguliers ?', 'Les remontées sont-elles écoutées ?', 'Y a-t-il un dialogue équilibré ?'], exemples: ['Manque d\'écoute du siège', 'Communication descendante uniquement'] },
  { code: '305', domaine: 3, titre: '3C entre maison-mère et filiale', description: 'Relations et coordination dans les groupes', questions_guides: ['Les relations groupe sont-elles harmonieuses ?', 'Y a-t-il une autonomie suffisante ?', 'Les objectifs sont-ils alignés ?'], exemples: ['Contrôle excessif du groupe', 'Manque d\'autonomie'] },
  { code: '306', domaine: 3, titre: '3C au niveau de l\'équipe de Direction', description: 'Coordination au sein de la direction', questions_guides: ['L\'équipe dirigeante est-elle soudée ?', 'Les décisions sont-elles collectives ?', 'Y a-t-il des conflits de leadership ?'], exemples: ['Conflits en direction', 'Décisions contradictoires'] },
  { code: '307', domaine: 3, titre: '3C entre élus et fonctionnaires', description: 'Relations élus/administration', questions_guides: ['Les relations élus/fonctionnaires sont-elles saines ?', 'Y a-t-il des interférences politiques ?', 'Les rôles sont-ils définis ?'], exemples: ['Ingérence politique', 'Rôles mal définis'] },
  { code: '308', domaine: 3, titre: 'Dispositifs de 3C', description: 'Outils et méthodes de communication', questions_guides: ['Les outils de communication sont-ils efficaces ?', 'Y a-t-il des instances de concertation ?', 'Les dispositifs sont-ils utilisés ?'], exemples: ['Outils inadaptés', 'Instances non fonctionnelles'] },
  { code: '309', domaine: 3, titre: 'Transmission des informations', description: 'Circulation et partage de l\'information', questions_guides: ['Les informations arrivent-elles à temps ?', 'Sont-elles complètes ?', 'Y a-t-il des pertes ?'], exemples: ['Informations tardives', 'Données incomplètes'] },
  { code: '310', domaine: 3, titre: '3C Verticale', description: 'Communication hiérarchique', questions_guides: ['La communication hiérarchique fonctionne-t-elle ?', 'Y a-t-il un dialogue avec la hiérarchie ?', 'Les remontées sont-elles possibles ?'], exemples: ['Communication à sens unique', 'Hiérarchie inaccessible'] },
  { code: '311', domaine: 3, titre: '3C Horizontale', description: 'Communication entre pairs', questions_guides: ['La collaboration entre collègues est-elle bonne ?', 'Y a-t-il de l\'entraide ?', 'Les échanges sont-ils constructifs ?'], exemples: ['Manque de collaboration', 'Individualisme excessif'] },

  // DOMAINE 4 - GESTION DU TEMPS
  { code: '401', domaine: 4, titre: 'Respect des délais', description: 'Capacité à tenir les échéances', questions_guides: ['Les délais sont-ils respectés ?', 'Y a-t-il des retards récurrents ?', 'Les délais sont-ils réalistes ?'], exemples: ['Retards systématiques', 'Délais irréalistes'] },
  { code: '402', domaine: 4, titre: 'Planification, programmation des activités', description: 'Organisation temporelle des tâches', questions_guides: ['Y a-t-il une planification ?', 'Les priorités sont-elles définies ?', 'La programmation est-elle respectée ?'], exemples: ['Absence de planification', 'Priorités changeantes'] },
  { code: '403', domaine: 4, titre: 'Tâches mal assumées', description: 'Activités négligées ou reportées', questions_guides: ['Certaines tâches sont-elles négligées ?', 'Y a-t-il des reports constants ?', 'Les responsabilités sont-elles assumées ?'], exemples: ['Tâches reportées', 'Responsabilités non assumées'] },
  { code: '404', domaine: 4, titre: 'Facteurs perturbateurs de la gestion du temps', description: 'Éléments désorganisant la planification', questions_guides: ['Quels sont les perturbateurs ?', 'Y a-t-il trop d\'interruptions ?', 'Les urgences sont-elles fréquentes ?'], exemples: ['Interruptions constantes', 'Fausses urgences'] },

  // DOMAINE 5 - FORMATION INTÉGRÉE
  { code: '501', domaine: 5, titre: 'Adéquation formation-emploi', description: 'Correspondance formation/poste', questions_guides: ['La formation correspond-elle au poste ?', 'Y a-t-il des écarts de compétences ?', 'L\'adaptation est-elle nécessaire ?'], exemples: ['Formation inadaptée', 'Écarts de compétences'] },
  { code: '502', domaine: 5, titre: 'Besoins de formation', description: 'Identification des besoins formatifs', questions_guides: ['Les besoins sont-ils identifiés ?', 'Y a-t-il une analyse des écarts ?', 'Les demandes sont-elles écoutées ?'], exemples: ['Besoins non identifiés', 'Demandes ignorées'] },
  { code: '503', domaine: 5, titre: 'Compétences disponibles', description: 'Inventaire et valorisation des compétences', questions_guides: ['Les compétences sont-elles connues ?', 'Y a-t-il un référentiel ?', 'Les talents sont-ils valorisés ?'], exemples: ['Compétences méconnues', 'Talents non valorisés'] },
  { code: '504', domaine: 5, titre: 'Dispositifs de formation', description: 'Organisation et moyens de formation', questions_guides: ['Les dispositifs sont-ils adaptés ?', 'Y a-t-il suffisamment de moyens ?', 'L\'accès est-il équitable ?'], exemples: ['Dispositifs inadaptés', 'Moyens insuffisants'] },
  { code: '505', domaine: 5, titre: 'Formation et changement technique', description: 'Accompagnement des évolutions technologiques', questions_guides: ['Les changements sont-ils accompagnés ?', 'Y a-t-il une formation préalable ?', 'L\'adaptation est-elle suivie ?'], exemples: ['Changements non accompagnés', 'Formation tardive'] },

  // DOMAINE 6 - MISE EN ŒUVRE STRATÉGIQUE
  { code: '601', domaine: 6, titre: 'Orientations stratégiques', description: 'Définition et communication de la stratégie', questions_guides: ['La stratégie est-elle claire ?', 'Les objectifs sont-ils compréhensibles ?', 'Y a-t-il une vision partagée ?'], exemples: ['Stratégie floue', 'Vision non partagée'] },
  { code: '602', domaine: 6, titre: 'Auteurs de la stratégie', description: 'Processus d\'élaboration stratégique', questions_guides: ['Qui participe à l\'élaboration ?', 'Y a-t-il une concertation ?', 'Les parties prenantes sont-elles impliquées ?'], exemples: ['Élaboration en vase clos', 'Manque de concertation'] },
  { code: '603', domaine: 6, titre: 'Démultiplication et organisation de la mise en œuvre stratégique', description: 'Déploiement de la stratégie', questions_guides: ['La stratégie est-elle déclinée ?', 'Y a-t-il un plan de déploiement ?', 'Les responsabilités sont-elles définies ?'], exemples: ['Pas de déclinaison', 'Déploiement anarchique'] },
  { code: '604', domaine: 6, titre: 'Outils de la mise en œuvre stratégique', description: 'Instruments de pilotage stratégique', questions_guides: ['Quels outils de pilotage ?', 'Sont-ils efficaces ?', 'Y a-t-il des tableaux de bord ?'], exemples: ['Outils inadaptés', 'Absence de tableaux de bord'] },
  { code: '605', domaine: 6, titre: 'Système d\'information', description: 'Infrastructure informationnelle', questions_guides: ['Le SI est-il performant ?', 'Les données sont-elles fiables ?', 'Y a-t-il une cohérence ?'], exemples: ['Système obsolète', 'Données non fiables'] },
  { code: '606', domaine: 6, titre: 'Moyens de la mise en œuvre stratégique', description: 'Ressources allouées à la stratégie', questions_guides: ['Les moyens sont-ils suffisants ?', 'Y a-t-il un budget dédié ?', 'Les ressources sont-elles bien allouées ?'], exemples: ['Moyens insuffisants', 'Budget inadéquat'] },
  { code: '607', domaine: 6, titre: 'Gestion du personnel', description: 'Politique RH', questions_guides: ['La GRH est-elle alignée sur la stratégie ?', 'Y a-t-il une politique RH claire ?', 'Les pratiques sont-elles équitables ?'], exemples: ['GRH non alignée', 'Politique RH floue'] },
  { code: '608', domaine: 6, titre: 'Mode de management', description: 'Style et pratiques managériales', questions_guides: ['Le management est-il adapté ?', 'Y a-t-il de la délégation ?', 'Le management est-il participatif ?'], exemples: ['Management autoritaire', 'Absence de délégation'] }
];

async function seedReferentielComplet() {
  try {
    console.log('🌱 Alimentation complète du référentiel ISEOR...');
    
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    // Créer la table si elle n'existe pas
    await ReferentielIseor.sync({ force: true });
    console.log('🔧 Table ReferentielIseor créée/réinitialisée');

    // Insérer toutes les données
    const created = await ReferentielIseor.bulkCreate(referentielComplet);
    console.log(`✅ ${created.length} items créés`);

    // Statistiques
    const stats = {};
    referentielComplet.forEach(item => {
      stats[item.domaine] = (stats[item.domaine] || 0) + 1;
    });

    console.log('\n📊 Statistiques :');
    const domaines = {
      1: 'Conditions de travail',
      2: 'Organisation du travail', 
      3: 'Communication-Coordination-Concertation',
      4: 'Gestion du temps',
      5: 'Formation intégrée',
      6: 'Mise en œuvre stratégique'
    };

    Object.entries(stats).forEach(([d, count]) => {
      console.log(`   Domaine ${d} (${domaines[d]}) : ${count} items`);
    });

    console.log('\n🎉 Référentiel ISEOR complet alimenté !');
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedReferentielComplet();
}

module.exports = { seedReferentielComplet };
