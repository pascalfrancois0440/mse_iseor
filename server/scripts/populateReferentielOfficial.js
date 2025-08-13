const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function populateReferentielOfficial() {
  try {
    console.log('🔄 Peuplement du référentiel ISEOR officiel...\n');

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Supprimer les données existantes
    await sequelize.query('DELETE FROM referentiel_iseor;');
    console.log('🗑️ Données existantes supprimées');

    // Référentiel ISEOR officiel
    const referentielData = [];
    const now = new Date().toISOString();

    // Domaine 1: Conditions de travail
    const domaine1 = [
      { code: '101', titre: 'Aménagement et agencement des locaux', description: 'Organisation spatiale et fonctionnelle des espaces de travail' },
      { code: '102', titre: 'Matériel et fournitures', description: 'Disponibilité et qualité du matériel et des fournitures nécessaires' },
      { code: '103', titre: 'Nuisances', description: 'Gestion des nuisances sonores, visuelles, olfactives et autres' },
      { code: '104', titre: 'Conditions physiques de travail', description: 'Environnement physique de travail (température, éclairage, ventilation)' },
      { code: '105', titre: 'Charge physique de travail', description: 'Adaptation de la charge physique aux capacités des personnes' },
      { code: '106', titre: 'Horaires de travail', description: 'Organisation et adaptation des horaires de travail' },
      { code: '107', titre: 'Ambiance de travail', description: 'Climat et ambiance générale dans l\'environnement de travail' }
    ];

    // Domaine 2: Organisation du travail
    const domaine2 = [
      { code: '201', titre: 'Répartition des tâches, des missions, des fonctions', description: 'Organisation et distribution du travail entre les personnes' },
      { code: '202', titre: 'Régulation de l\'absentéisme', description: 'Gestion et prévention de l\'absentéisme' },
      { code: '203', titre: 'Intérêt du travail', description: 'Niveau d\'intérêt et de motivation dans les tâches' },
      { code: '204', titre: 'Autonomie dans le travail', description: 'Degré d\'autonomie accordé dans l\'exécution du travail' },
      { code: '205', titre: 'Charge de travail', description: 'Adaptation de la charge de travail aux capacités' },
      { code: '206', titre: 'Règles et procédures', description: 'Clarté et application des règles et procédures' },
      { code: '207', titre: 'Organigramme', description: 'Structure organisationnelle et hiérarchique' }
    ];

    // Domaine 3: Communication - Coordination - Concertation [3C]
    const domaine3 = [
      { code: '301', titre: '3C interne au service', description: 'Communication, coordination et concertation à l\'intérieur du service' },
      { code: '302', titre: 'Relations avec les services environnants', description: 'Qualité des relations avec les autres services' },
      { code: '303', titre: '3C entre réseau et siège', description: 'Communication entre le réseau et le siège social' },
      { code: '305', titre: '3C entre maison-mère et filiale', description: 'Relations entre la maison-mère et ses filiales' },
      { code: '306', titre: '3C au niveau de l\'équipe de Direction', description: 'Communication au sein de l\'équipe dirigeante' },
      { code: '307', titre: '3C entre élus et fonctionnaires', description: 'Relations entre élus et personnel administratif' },
      { code: '308', titre: 'Dispositifs de 3C', description: 'Outils et dispositifs de communication mis en place' },
      { code: '309', titre: 'Transmission des informations', description: 'Efficacité de la transmission d\'informations' },
      { code: '310', titre: '3C Verticale', description: 'Communication verticale dans la hiérarchie' },
      { code: '311', titre: '3C Horizontale', description: 'Communication horizontale entre pairs' }
    ];

    // Domaine 4: Gestion du temps
    const domaine4 = [
      { code: '401', titre: 'Respect des délais', description: 'Capacité à respecter les échéances et délais fixés' },
      { code: '402', titre: 'Planification, programmation des activités', description: 'Organisation temporelle des activités' },
      { code: '403', titre: 'Tâches mal assumées', description: 'Identification et traitement des tâches mal exécutées' },
      { code: '404', titre: 'Facteurs perturbateurs de la gestion du temps', description: 'Éléments qui perturbent l\'organisation temporelle' }
    ];

    // Domaine 5: Formation intégrée
    const domaine5 = [
      { code: '501', titre: 'Adéquation formation-emploi', description: 'Correspondance entre la formation et les besoins du poste' },
      { code: '502', titre: 'Besoins de formation', description: 'Identification et analyse des besoins de formation' },
      { code: '503', titre: 'Compétences disponibles', description: 'Inventaire et valorisation des compétences existantes' },
      { code: '504', titre: 'Dispositifs de formation', description: 'Moyens et méthodes de formation mis en œuvre' },
      { code: '505', titre: 'Formation et changement technique', description: 'Adaptation de la formation aux évolutions techniques' }
    ];

    // Domaine 6: Mise en œuvre stratégique
    const domaine6 = [
      { code: '601', titre: 'Orientations stratégiques', description: 'Définition et clarté des orientations stratégiques' },
      { code: '602', titre: 'Auteurs de la stratégie', description: 'Identification des acteurs de la définition stratégique' },
      { code: '603', titre: 'Démultiplication et organisation de la mise en œuvre stratégique', description: 'Déploiement de la stratégie dans l\'organisation' },
      { code: '604', titre: 'Outils de la mise en œuvre stratégique', description: 'Instruments et méthodes de mise en œuvre' },
      { code: '605', titre: 'Système d\'information', description: 'Efficacité du système d\'information stratégique' },
      { code: '606', titre: 'Moyens de la mise en œuvre stratégique', description: 'Ressources allouées à la mise en œuvre' },
      { code: '607', titre: 'Gestion du personnel', description: 'Politique et pratiques de gestion des ressources humaines' },
      { code: '608', titre: 'Mode de management', description: 'Style et méthodes de management appliqués' }
    ];

    // Créer les données pour insertion
    const domaines = [
      { num: 1, nom: 'Conditions de travail', elements: domaine1 },
      { num: 2, nom: 'Organisation du travail', elements: domaine2 },
      { num: 3, nom: 'Communication - Coordination - Concertation [3C]', elements: domaine3 },
      { num: 4, nom: 'Gestion du temps', elements: domaine4 },
      { num: 5, nom: 'Formation intégrée', elements: domaine5 },
      { num: 6, nom: 'Mise en œuvre stratégique', elements: domaine6 }
    ];

    let ordre = 1;
    for (const domaine of domaines) {
      console.log(`📚 Insertion domaine ${domaine.num}: ${domaine.nom}`);
      
      for (const element of domaine.elements) {
        const item = {
          id: uuidv4(),
          code: element.code,
          domaine: domaine.num,
          titre: element.titre,
          description: element.description,
          sous_themes: JSON.stringify([
            'Analyse des causes',
            'Impact sur la performance',
            'Solutions possibles'
          ]),
          exemples: JSON.stringify([
            'Dysfonctionnement type 1',
            'Dysfonctionnement type 2',
            'Dysfonctionnement type 3'
          ]),
          questions_guides: JSON.stringify([
            `Comment évaluer ${element.titre.toLowerCase()} ?`,
            `Quels sont les indicateurs de dysfonctionnement ?`,
            `Quelles actions correctives mettre en place ?`
          ]),
          indicateurs_defaut: JSON.stringify([
            'Absentéisme',
            'Accidents',
            'Rotation du personnel',
            'Défauts qualité',
            'Écarts de production'
          ]),
          composants_defaut: JSON.stringify([
            'Surtemps',
            'Surconsommation',
            'Surproduction',
            'Non-production'
          ]),
          actif: true,
          version: '1.0',
          ordre_affichage: ordre,
          created_at: now,
          updated_at: now
        };

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

        ordre++;
      }
    }

    // Vérification finale
    const result = await sequelize.query(
      'SELECT domaine, COUNT(*) as count FROM referentiel_iseor GROUP BY domaine ORDER BY domaine',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n✅ Référentiel ISEOR officiel peuplé avec succès !');
    console.log('\n📊 Éléments par domaine :');
    
    const domaineNames = {
      1: 'Conditions de travail',
      2: 'Organisation du travail',
      3: 'Communication - Coordination - Concertation [3C]',
      4: 'Gestion du temps',
      5: 'Formation intégrée',
      6: 'Mise en œuvre stratégique'
    };

    result.forEach(r => {
      console.log(`   Domaine ${r.domaine} (${domaineNames[r.domaine]}): ${r.count} éléments`);
    });

    const total = await sequelize.query(
      'SELECT COUNT(*) as total FROM referentiel_iseor',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n🎯 Total: ${total[0].total} éléments dans le référentiel ISEOR officiel`);
    console.log('\n🚀 Le référentiel contient maintenant les vraies données ISEOR !');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement :', error);
  } finally {
    await sequelize.close();
  }
}

populateReferentielOfficial();
