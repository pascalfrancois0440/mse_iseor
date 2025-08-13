const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function populateReferentielComplete() {
  try {
    console.log('🔄 Peuplement complet du référentiel ISEOR...\n');

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Supprimer les données existantes
    await sequelize.query('DELETE FROM referentiel_iseor;');
    console.log('🗑️ Données existantes supprimées');

    // Données complètes du référentiel ISEOR (48 éléments)
    const referentielData = [];
    const now = new Date().toISOString();

    // Domaine 1: Conditions de travail (101-108)
    const domaine1 = [
      { code: '101', titre: 'Sécurité au travail', description: 'Mesures de prévention des accidents du travail et des maladies professionnelles' },
      { code: '102', titre: 'Ergonomie des postes', description: 'Adaptation des postes de travail aux capacités humaines' },
      { code: '103', titre: 'Hygiène et salubrité', description: 'Conditions d\'hygiène et de salubrité des locaux de travail' },
      { code: '104', titre: 'Équipements de travail', description: 'État et adaptation des équipements et outils de travail' },
      { code: '105', titre: 'Environnement physique', description: 'Qualité de l\'environnement physique de travail' },
      { code: '106', titre: 'Charge physique', description: 'Adaptation de la charge physique aux capacités des salariés' },
      { code: '107', titre: 'Charge mentale', description: 'Gestion de la charge mentale et prévention du stress' },
      { code: '108', titre: 'Horaires et rythmes', description: 'Organisation des horaires et respect des rythmes biologiques' }
    ];

    // Domaine 2: Organisation du travail (201-208)
    const domaine2 = [
      { code: '201', titre: 'Répartition des tâches', description: 'Organisation et répartition équitable des tâches' },
      { code: '202', titre: 'Définition des fonctions', description: 'Clarté et précision des définitions de fonctions' },
      { code: '203', titre: 'Procédures et méthodes', description: 'Existence et application des procédures de travail' },
      { code: '204', titre: 'Planification du travail', description: 'Organisation et planification des activités' },
      { code: '205', titre: 'Contrôle et supervision', description: 'Modalités de contrôle et de supervision du travail' },
      { code: '206', titre: 'Polyvalence et flexibilité', description: 'Développement de la polyvalence et de la flexibilité' },
      { code: '207', titre: 'Innovation et amélioration', description: 'Processus d\'innovation et d\'amélioration continue' },
      { code: '208', titre: 'Gestion des dysfonctionnements', description: 'Traitement et prévention des dysfonctionnements' }
    ];

    // Domaine 3: Communication-coordination-concertation (301-308)
    const domaine3 = [
      { code: '301', titre: 'Communication verticale', description: 'Qualité de la communication hiérarchique ascendante et descendante' },
      { code: '302', titre: 'Communication horizontale', description: 'Qualité de la communication entre collègues et services' },
      { code: '303', titre: 'Réunions et instances', description: 'Organisation et efficacité des réunions et instances' },
      { code: '304', titre: 'Outils de communication', description: 'Disponibilité et utilisation des outils de communication' },
      { code: '305', titre: 'Coordination des activités', description: 'Organisation de la coordination entre les activités' },
      { code: '306', titre: 'Concertation et participation', description: 'Modalités de concertation et de participation des salariés' },
      { code: '307', titre: 'Gestion des conflits', description: 'Prévention et résolution des conflits' },
      { code: '308', titre: 'Information et transparence', description: 'Niveau d\'information et de transparence dans l\'organisation' }
    ];

    // Domaine 4: Gestion du temps (401-408)
    const domaine4 = [
      { code: '401', titre: 'Planification temporelle', description: 'Organisation et planification du temps de travail' },
      { code: '402', titre: 'Gestion des interruptions', description: 'Maîtrise et gestion des interruptions de travail' },
      { code: '403', titre: 'Respect des délais', description: 'Capacité à respecter les délais fixés' },
      { code: '404', titre: 'Optimisation du temps', description: 'Recherche d\'efficacité et d\'optimisation temporelle' },
      { code: '405', titre: 'Temps de formation', description: 'Allocation et gestion du temps de formation' },
      { code: '406', titre: 'Temps de concertation', description: 'Temps consacré à la concertation et aux échanges' },
      { code: '407', titre: 'Urgences et imprévus', description: 'Gestion des urgences et des situations imprévues' },
      { code: '408', titre: 'Équilibre temporel', description: 'Équilibre entre les différentes activités' }
    ];

    // Domaine 5: Formation intégrée (501-508)
    const domaine5 = [
      { code: '501', titre: 'Identification des besoins', description: 'Identification et analyse des besoins de formation' },
      { code: '502', titre: 'Planification de la formation', description: 'Organisation et planification des actions de formation' },
      { code: '503', titre: 'Formation sur le poste', description: 'Formation directement intégrée au poste de travail' },
      { code: '504', titre: 'Transmission des savoirs', description: 'Modalités de transmission des connaissances et compétences' },
      { code: '505', titre: 'Évaluation des formations', description: 'Évaluation de l\'efficacité des formations' },
      { code: '506', titre: 'Formation continue', description: 'Développement de la formation continue' },
      { code: '507', titre: 'Autoformation', description: 'Développement de l\'autoformation et de l\'autonomie d\'apprentissage' },
      { code: '508', titre: 'Capitalisation des acquis', description: 'Capitalisation et valorisation des acquis de formation' }
    ];

    // Domaine 6: Mise en œuvre stratégique (601-608)
    const domaine6 = [
      { code: '601', titre: 'Vision et objectifs', description: 'Clarté de la vision et des objectifs stratégiques' },
      { code: '602', titre: 'Pilotage stratégique', description: 'Modalités de pilotage et de suivi stratégique' },
      { code: '603', titre: 'Allocation des ressources', description: 'Allocation et optimisation des ressources' },
      { code: '604', titre: 'Gestion du changement', description: 'Accompagnement et gestion du changement' },
      { code: '605', titre: 'Innovation stratégique', description: 'Développement de l\'innovation stratégique' },
      { code: '606', titre: 'Partenariats et alliances', description: 'Développement des partenariats et alliances' },
      { code: '607', titre: 'Veille stratégique', description: 'Organisation de la veille stratégique' },
      { code: '608', titre: 'Évaluation stratégique', description: 'Évaluation et ajustement de la stratégie' }
    ];

    // Créer les données pour insertion
    const domaines = [
      { num: 1, elements: domaine1 },
      { num: 2, elements: domaine2 },
      { num: 3, elements: domaine3 },
      { num: 4, elements: domaine4 },
      { num: 5, elements: domaine5 },
      { num: 6, elements: domaine6 }
    ];

    let ordre = 1;
    for (const domaine of domaines) {
      for (const element of domaine.elements) {
        referentielData.push({
          id: uuidv4(),
          code: element.code,
          domaine: domaine.num,
          titre: element.titre,
          description: element.description,
          sous_themes: JSON.stringify(['Thème 1', 'Thème 2', 'Thème 3']),
          exemples: JSON.stringify(['Exemple 1', 'Exemple 2', 'Exemple 3']),
          questions_guides: JSON.stringify(['Question 1 ?', 'Question 2 ?', 'Question 3 ?']),
          indicateurs_defaut: JSON.stringify(['Indicateur 1', 'Indicateur 2']),
          composants_defaut: JSON.stringify(['Surtemps', 'Surconsommation', 'Non-production']),
          actif: true,
          version: '1.0',
          ordre_affichage: ordre,
          created_at: now,
          updated_at: now
        });
        ordre++;
      }
    }

    // Insertion en lot
    console.log(`📚 Insertion de ${referentielData.length} éléments...`);
    
    for (const item of referentielData) {
      await sequelize.query(`
        INSERT INTO referentiel_iseor (
          id, code, domaine, titre, description, sous_themes, exemples, 
          questions_guides, indicateurs_defaut, composants_defaut, 
          actif, version, ordre_affichage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          item.id, item.code, item.domaine, item.titre, item.description,
          item.sous_themes, item.exemples, item.questions_guides,
          item.indicateurs_defaut, item.composants_defaut,
          item.actif, item.version, item.ordre_affichage,
          item.created_at, item.updated_at
        ]
      });
    }

    // Vérification finale
    const result = await sequelize.query(
      'SELECT domaine, COUNT(*) as count FROM referentiel_iseor GROUP BY domaine ORDER BY domaine',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n✅ Référentiel ISEOR peuplé avec succès !');
    console.log('\n📊 Éléments par domaine :');
    result.forEach(r => {
      const domaineNames = {
        1: 'Conditions de travail',
        2: 'Organisation du travail', 
        3: 'Communication-coordination-concertation',
        4: 'Gestion du temps',
        5: 'Formation intégrée',
        6: 'Mise en œuvre stratégique'
      };
      console.log(`   Domaine ${r.domaine} (${domaineNames[r.domaine]}): ${r.count} éléments`);
    });

    const total = await sequelize.query(
      'SELECT COUNT(*) as total FROM referentiel_iseor',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n🎯 Total: ${total[0].total} éléments dans le référentiel ISEOR`);
    console.log('\n🚀 La page référentiel devrait maintenant afficher toutes les données !');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement :', error);
  } finally {
    await sequelize.close();
  }
}

populateReferentielComplete();
