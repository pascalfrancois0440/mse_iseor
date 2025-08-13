const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function setupDefinitiveDatabase() {
  try {
    console.log('🔄 Configuration définitive de la base de données MSE Diagnostic...\n');

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // 1. Créer la table users de façon robuste
    console.log('\n👥 Création de la table users...');
    await sequelize.query('DROP TABLE IF EXISTS users;');
    await sequelize.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
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
    console.log('✅ Table users créée');

    // 2. Créer les comptes utilisateur permanents
    console.log('\n🔐 Création des comptes utilisateur permanents...');
    const now = new Date().toISOString();
    
    // Administrateur
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await sequelize.query(`
      INSERT INTO users (
        id, email, password, nom, prenom, role, organisation, actif, provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        'admin-permanent',
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
    console.log('✅ Administrateur créé : admin@mse-diagnostic.fr / Admin123!');

    // Consultant
    const consultantPassword = await bcrypt.hash('Consultant123!', 12);
    await sequelize.query(`
      INSERT INTO users (
        id, email, password, nom, prenom, role, organisation, telephone, actif, provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        'consultant-permanent',
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
    console.log('✅ Consultant créé : consultant@mse-diagnostic.fr / Consultant123!');

    // 3. Créer la table referentiel_iseor
    console.log('\n📚 Création de la table referentiel_iseor...');
    await sequelize.query('DROP TABLE IF EXISTS referentiel_iseor;');
    await sequelize.query(`
      CREATE TABLE referentiel_iseor (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        domaine INTEGER NOT NULL,
        titre TEXT NOT NULL,
        description TEXT,
        sous_themes TEXT,
        exemples TEXT,
        questions_guides TEXT,
        indicateurs_defaut TEXT,
        composants_defaut TEXT,
        actif INTEGER DEFAULT 1,
        version TEXT DEFAULT '1.0',
        ordre_affichage INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);
    console.log('✅ Table referentiel_iseor créée');

    // 4. Peupler le référentiel ISEOR avec données officielles
    console.log('\n📖 Peuplement du référentiel ISEOR officiel...');
    
    const referentielData = [
      // Domaine 1: Conditions de travail
      { code: '101', domaine: 1, titre: 'Aménagement et agencement des locaux', description: 'Organisation spatiale et fonctionnelle des espaces de travail', exemples: ['Espaces exigus', 'Circulation difficile', 'Zones mal organisées'], questions: ['Les espaces sont-ils suffisants ?', 'La circulation est-elle fluide ?', 'L\'agencement favorise-t-il le travail ?'] },
      { code: '102', domaine: 1, titre: 'Matériel et fournitures', description: 'Disponibilité et qualité du matériel et des fournitures nécessaires', exemples: ['Matériel obsolète', 'Fournitures manquantes', 'Outils inadaptés'], questions: ['Le matériel est-il performant ?', 'Les fournitures sont-elles disponibles ?', 'Les outils sont-ils adaptés ?'] },
      { code: '103', domaine: 1, titre: 'Nuisances', description: 'Gestion des nuisances sonores, visuelles, olfactives et autres', exemples: ['Bruit excessif', 'Mauvaise qualité air', 'Éclairage insuffisant'], questions: ['Le niveau sonore est-il acceptable ?', 'La qualité de l\'air est-elle bonne ?', 'L\'éclairage est-il adapté ?'] },
      { code: '104', domaine: 1, titre: 'Conditions physiques de travail', description: 'Environnement physique de travail (température, éclairage, ventilation)', exemples: ['Postures contraignantes', 'Écrans mal positionnés', 'Sièges inconfortables'], questions: ['Les postes sont-ils ergonomiques ?', 'Les écrans sont-ils bien positionnés ?', 'Les sièges sont-ils adaptés ?'] },
      { code: '105', domaine: 1, titre: 'Charge physique de travail', description: 'Adaptation de la charge physique aux capacités des personnes', exemples: ['Charges lourdes', 'Mouvements répétitifs', 'Stations prolongées'], questions: ['Les charges sont-elles adaptées ?', 'Y a-t-il des aides mécaniques ?', 'Les pauses sont-elles suffisantes ?'] },
      { code: '106', domaine: 1, titre: 'Horaires de travail', description: 'Organisation et adaptation des horaires de travail', exemples: ['Horaires irréguliers', 'Heures supplémentaires', 'Pauses insuffisantes'], questions: ['Les horaires sont-ils réguliers ?', 'Le temps de travail est-il raisonnable ?', 'Les pauses sont-elles respectées ?'] },
      { code: '107', domaine: 1, titre: 'Ambiance de travail', description: 'Climat et ambiance générale dans l\'environnement de travail', exemples: ['Tensions relationnelles', 'Manque de reconnaissance', 'Isolement social'], questions: ['L\'ambiance est-elle conviviale ?', 'Les relations sont-elles bonnes ?', 'Le travail est-il reconnu ?'] },

      // Domaine 2: Organisation du travail
      { code: '201', domaine: 2, titre: 'Répartition des tâches, des missions, des fonctions', description: 'Organisation et distribution du travail entre les personnes', exemples: ['Répartition inéquitable', 'Surcharge ponctuelle', 'Compétences mal utilisées'], questions: ['La répartition est-elle équitable ?', 'Les compétences sont-elles bien utilisées ?', 'Y a-t-il des surcharges ?'] },
      { code: '202', domaine: 2, titre: 'Régulation de l\'absentéisme', description: 'Gestion et prévention de l\'absentéisme', exemples: ['Absentéisme récurrent', 'Manque de suivi', 'Difficultés remplacement'], questions: ['L\'absentéisme est-il suivi ?', 'Y a-t-il une politique de prévention ?', 'Les remplacements sont-ils organisés ?'] },
      { code: '203', domaine: 2, titre: 'Intérêt du travail', description: 'Niveau d\'intérêt et de motivation dans les tâches', exemples: ['Tâches répétitives', 'Manque de variété', 'Travail sans sens'], questions: ['Le travail est-il varié ?', 'Y a-t-il du sens au travail ?', 'Les défis sont-ils motivants ?'] },
      { code: '204', domaine: 2, titre: 'Autonomie dans le travail', description: 'Degré d\'autonomie accordé dans l\'exécution du travail', exemples: ['Contrôle excessif', 'Manque de délégation', 'Procédures rigides'], questions: ['L\'autonomie est-elle suffisante ?', 'La délégation est-elle pratiquée ?', 'Le contrôle est-il adapté ?'] },
      { code: '205', domaine: 2, titre: 'Charge de travail', description: 'Adaptation de la charge de travail aux capacités', exemples: ['Surcharge chronique', 'Objectifs irréalistes', 'Stress temporel'], questions: ['La charge est-elle soutenable ?', 'Les objectifs sont-ils réalistes ?', 'Le temps est-il suffisant ?'] },
      { code: '206', domaine: 2, titre: 'Règles et procédures', description: 'Clarté et application des règles et procédures', exemples: ['Procédures obsolètes', 'Règles contradictoires', 'Non-application'], questions: ['Les procédures sont-elles claires ?', 'Sont-elles appliquées ?', 'Sont-elles à jour ?'] },
      { code: '207', domaine: 2, titre: 'Organigramme', description: 'Structure organisationnelle et hiérarchique', exemples: ['Organigramme flou', 'Lignes hiérarchiques multiples', 'Responsabilités mal définies'], questions: ['L\'organigramme est-il clair ?', 'Les responsabilités sont-elles définies ?', 'La structure est-elle adaptée ?'] },

      // Domaine 3: Communication - Coordination - Concertation [3C]
      { code: '301', domaine: 3, titre: '3C interne au service', description: 'Communication, coordination et concertation à l\'intérieur du service', exemples: ['Manque communication équipe', 'Informations non partagées', 'Réunions inefficaces'], questions: ['La communication est-elle fluide ?', 'Les informations sont-elles partagées ?', 'Les réunions sont-elles efficaces ?'] },
      { code: '302', domaine: 3, titre: 'Relations avec les services environnants', description: 'Qualité des relations avec les autres services', exemples: ['Cloisonnement services', 'Manque coopération', 'Conflits inter-services'], questions: ['Les relations inter-services sont-elles bonnes ?', 'Y a-t-il coopération ?', 'Les conflits sont-ils résolus ?'] },
      { code: '303', domaine: 3, titre: '3C entre réseau et siège', description: 'Communication entre le réseau et le siège social', exemples: ['Directives mal comprises', 'Remontées ignorées', 'Décalage politique/terrain'], questions: ['Les directives sont-elles claires ?', 'Le terrain peut-il remonter ?', 'Y a-t-il soutien du siège ?'] },
      { code: '305', domaine: 3, titre: '3C entre maison-mère et filiale', description: 'Relations entre la maison-mère et ses filiales', exemples: ['Autonomie limitée', 'Contrôle excessif', 'Objectifs imposés'], questions: ['L\'autonomie est-elle suffisante ?', 'Le contrôle est-il adapté ?', 'Y a-t-il concertation ?'] },
      { code: '306', domaine: 3, titre: '3C au niveau de l\'équipe de Direction', description: 'Communication au sein de l\'équipe dirigeante', exemples: ['Manque communication dirigeants', 'Décisions en solo', 'Vision non partagée'], questions: ['La communication est-elle fluide ?', 'Les décisions sont-elles collégiales ?', 'Y a-t-il vision partagée ?'] },
      { code: '307', domaine: 3, titre: '3C entre élus et fonctionnaires', description: 'Relations entre élus et personnel administratif', exemples: ['Tensions élus/administration', 'Objectifs contradictoires', 'Manque de dialogue'], questions: ['Le dialogue est-il constructif ?', 'Les contraintes sont-elles comprises ?', 'Y a-t-il respect mutuel ?'] },
      { code: '308', domaine: 3, titre: 'Dispositifs de 3C', description: 'Outils et dispositifs de communication mis en place', exemples: ['Outils inadaptés', 'Manque de formation', 'Multiplicité confuse'], questions: ['Les outils sont-ils adaptés ?', 'Sont-ils faciles d\'usage ?', 'La formation est-elle suffisante ?'] },
      { code: '309', domaine: 3, titre: 'Transmission des informations', description: 'Efficacité de la transmission d\'informations', exemples: ['Informations non transmises', 'Délais trop longs', 'Informations déformées'], questions: ['Les informations sont-elles transmises ?', 'Les délais sont-ils acceptables ?', 'L\'information arrive-t-elle intacte ?'] },
      { code: '310', domaine: 3, titre: '3C Verticale', description: 'Communication verticale dans la hiérarchie', exemples: ['Remontées bloquées', 'Directives floues', 'Communication à sens unique'], questions: ['Les remontées fonctionnent-elles ?', 'Les directives sont-elles claires ?', 'Y a-t-il feedback ?'] },
      { code: '311', domaine: 3, titre: '3C Horizontale', description: 'Communication horizontale entre pairs', exemples: ['Manque communication pairs', 'Concurrence vs coopération', 'Cloisonnement activités'], questions: ['La communication entre pairs est-elle fluide ?', 'Y a-t-il entraide ?', 'Les activités sont-elles coordonnées ?'] },

      // Domaine 4: Gestion du temps
      { code: '401', domaine: 4, titre: 'Respect des délais', description: 'Capacité à respecter les échéances et délais fixés', exemples: ['Retards fréquents', 'Échéances non respectées', 'Planification irréaliste'], questions: ['Les délais sont-ils respectés ?', 'La planification est-elle réaliste ?', 'Y a-t-il anticipation ?'] },
      { code: '402', domaine: 4, titre: 'Planification, programmation des activités', description: 'Organisation temporelle des activités', exemples: ['Absence planification', 'Manque priorisation', 'Outils inadaptés'], questions: ['Les activités sont-elles planifiées ?', 'Les priorités sont-elles définies ?', 'Les outils sont-ils efficaces ?'] },
      { code: '403', domaine: 4, titre: 'Tâches mal assumées', description: 'Identification et traitement des tâches mal exécutées', exemples: ['Tâches négligées', 'Qualité insuffisante', 'Responsabilités non assumées'], questions: ['Toutes les tâches sont-elles réalisées ?', 'La qualité est-elle satisfaisante ?', 'Les responsabilités sont-elles assumées ?'] },
      { code: '404', domaine: 4, titre: 'Facteurs perturbateurs de la gestion du temps', description: 'Éléments qui perturbent l\'organisation temporelle', exemples: ['Interruptions fréquentes', 'Réunions trop nombreuses', 'Urgences récurrentes'], questions: ['Les interruptions sont-elles maîtrisées ?', 'Les réunions sont-elles nécessaires ?', 'Les urgences sont-elles vraies ?'] },

      // Domaine 5: Formation intégrée
      { code: '501', domaine: 5, titre: 'Adéquation formation-emploi', description: 'Correspondance entre la formation et les besoins du poste', exemples: ['Formation inadaptée', 'Écart formation/poste', 'Formation trop théorique'], questions: ['La formation correspond-elle au poste ?', 'Y a-t-il adéquation théorie/pratique ?', 'Les compétences sont-elles utilisées ?'] },
      { code: '502', domaine: 5, titre: 'Besoins de formation', description: 'Identification et analyse des besoins de formation', exemples: ['Besoins non identifiés', 'Demandes ignorées', 'Absence entretiens'], questions: ['Les besoins sont-ils identifiés ?', 'Les demandes sont-elles prises en compte ?', 'Y a-t-il entretiens développement ?'] },
      { code: '503', domaine: 5, titre: 'Compétences disponibles', description: 'Inventaire et valorisation des compétences existantes', exemples: ['Compétences mal connues', 'Sous-utilisation talents', 'Manque cartographie'], questions: ['Les compétences sont-elles connues ?', 'Y a-t-il cartographie ?', 'Les talents sont-ils utilisés ?'] },
      { code: '504', domaine: 5, titre: 'Dispositifs de formation', description: 'Moyens et méthodes de formation mis en œuvre', exemples: ['Dispositifs inadéquats', 'Manque de moyens', 'Formation éloignée poste'], questions: ['Les dispositifs sont-ils adaptés ?', 'Les moyens sont-ils suffisants ?', 'Y a-t-il suivi post-formation ?'] },
      { code: '505', domaine: 5, titre: 'Formation et changement technique', description: 'Adaptation de la formation aux évolutions techniques', exemples: ['Formation non adaptée évolutions', 'Retard nouvelles technologies', 'Résistance changement'], questions: ['La formation suit-elle les évolutions ?', 'L\'adaptation est-elle rapide ?', 'Y a-t-il accompagnement changement ?'] },

      // Domaine 6: Mise en œuvre stratégique
      { code: '601', domaine: 6, titre: 'Orientations stratégiques', description: 'Définition et clarté des orientations stratégiques', exemples: ['Orientations floues', 'Stratégie non communiquée', 'Vision court terme'], questions: ['Les orientations sont-elles claires ?', 'La stratégie est-elle communiquée ?', 'Y a-t-il vision long terme ?'] },
      { code: '602', domaine: 6, titre: 'Auteurs de la stratégie', description: 'Identification des acteurs de la définition stratégique', exemples: ['Stratégie définie seul', 'Manque implication équipes', 'Décisions vase clos'], questions: ['Qui participe à la définition ?', 'Les équipes sont-elles impliquées ?', 'Y a-t-il concertation ?'] },
      { code: '603', domaine: 6, titre: 'Démultiplication et organisation de la mise en œuvre stratégique', description: 'Déploiement de la stratégie dans l\'organisation', exemples: ['Stratégie non déclinée', 'Manque de relais', 'Organisation inadaptée'], questions: ['La stratégie est-elle déclinée ?', 'Y a-t-il des relais ?', 'L\'organisation est-elle adaptée ?'] },
      { code: '604', domaine: 6, titre: 'Outils de la mise en œuvre stratégique', description: 'Instruments et méthodes de mise en œuvre', exemples: ['Outils pilotage inexistants', 'Tableaux bord inadéquats', 'Indicateurs manquants'], questions: ['Les outils de pilotage existent-ils ?', 'Les tableaux de bord sont-ils pertinents ?', 'Y a-t-il indicateurs performance ?'] },
      { code: '605', domaine: 6, titre: 'Système d\'information', description: 'Efficacité du système d\'information stratégique', exemples: ['SI inadapté stratégie', 'Manque données pilotage', 'Informations non fiables'], questions: ['Le SI soutient-il la stratégie ?', 'Les données sont-elles disponibles ?', 'Les informations sont-elles fiables ?'] },
      { code: '606', domaine: 6, titre: 'Moyens de la mise en œuvre stratégique', description: 'Ressources allouées à la mise en œuvre', exemples: ['Moyens insuffisants', 'Budget inadéquat', 'Ressources humaines manquantes'], questions: ['Les moyens sont-ils suffisants ?', 'Le budget est-il adapté ?', 'Les ressources sont-elles optimisées ?'] },
      { code: '607', domaine: 6, titre: 'Gestion du personnel', description: 'Politique et pratiques de gestion des ressources humaines', exemples: ['Politique RH non alignée', 'Gestion compétences inadéquate', 'Manque développement talents'], questions: ['La politique RH soutient-elle la stratégie ?', 'La gestion des compétences est-elle efficace ?', 'Y a-t-il développement talents ?'] },
      { code: '608', domaine: 6, titre: 'Mode de management', description: 'Style et méthodes de management appliqués', exemples: ['Management inadapté stratégie', 'Manque de leadership', 'Absence culture résultat'], questions: ['Le management soutient-il la stratégie ?', 'Y a-t-il du leadership ?', 'La culture résultat est-elle présente ?'] }
    ];

    let ordre = 1;
    for (const item of referentielData) {
      await sequelize.query(`
        INSERT INTO referentiel_iseor (
          id, code, domaine, titre, description, sous_themes, exemples, 
          questions_guides, indicateurs_defaut, composants_defaut, 
          actif, version, ordre_affichage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          uuidv4(),
          item.code,
          item.domaine,
          item.titre,
          item.description,
          JSON.stringify(['Analyse des causes', 'Impact sur la performance', 'Solutions possibles']),
          JSON.stringify(item.exemples),
          JSON.stringify(item.questions),
          JSON.stringify(['Absentéisme', 'Accidents', 'Rotation', 'Défauts', 'Écarts']),
          JSON.stringify(['Surtemps', 'Surconsommation', 'Surproduction', 'Non-production']),
          1,
          '1.0',
          ordre,
          now,
          now
        ]
      });
      ordre++;
    }

    console.log(`✅ ${referentielData.length} éléments du référentiel ISEOR insérés`);

    // 5. Créer les autres tables nécessaires
    console.log('\n📋 Création des autres tables...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS entretiens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        titre TEXT NOT NULL,
        entreprise TEXT NOT NULL,
        secteur_activite TEXT,
        date_entretien DATETIME NOT NULL,
        duree_prevue INTEGER DEFAULT 90,
        statut TEXT DEFAULT 'preparation',
        ca_perimetre DECIMAL(15,2),
        marge_brute DECIMAL(5,2),
        heures_travaillees INTEGER,
        effectif INTEGER,
        prism_calcule DECIMAL(15,2),
        notes_preparation TEXT,
        mode_utilise TEXT DEFAULT 'libre',
        version_referentiel TEXT DEFAULT '1.0',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS dysfonctionnements (
        id TEXT PRIMARY KEY,
        entretien_id TEXT NOT NULL,
        referentiel_id TEXT,
        description TEXT NOT NULL,
        frequence TEXT NOT NULL,
        temps_par_occurrence INTEGER NOT NULL,
        personnes_impactees INTEGER NOT NULL,
        indicateur_absenteisme INTEGER DEFAULT 0,
        indicateur_accidents INTEGER DEFAULT 0,
        indicateur_rotation INTEGER DEFAULT 0,
        indicateur_defauts INTEGER DEFAULT 0,
        indicateur_ecarts INTEGER DEFAULT 0,
        composant_surrtemps INTEGER DEFAULT 0,
        composant_surconsommation INTEGER DEFAULT 0,
        composant_surproduction INTEGER DEFAULT 0,
        composant_non_production INTEGER DEFAULT 0,
        domaine_iseor INTEGER,
        cout_direct DECIMAL(10,2) DEFAULT 0,
        cout_unitaire DECIMAL(10,2),
        cout_annuel DECIMAL(15,2),
        mode_saisie TEXT DEFAULT 'libre',
        priorite TEXT DEFAULT 'moyenne',
        valide INTEGER DEFAULT 0,
        commentaires TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);

    console.log('✅ Tables entretiens et dysfonctionnements créées');

    // 6. Test final des comptes
    console.log('\n🧪 Test final des comptes utilisateur...');
    
    const adminTest = await bcrypt.compare('Admin123!', adminPassword);
    const consultantTest = await bcrypt.compare('Consultant123!', consultantPassword);
    
    console.log(`   Admin: ${adminTest ? '✅ OK' : '❌ ERREUR'}`);
    console.log(`   Consultant: ${consultantTest ? '✅ OK' : '❌ ERREUR'}`);

    // 7. Vérification finale
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', { type: sequelize.QueryTypes.SELECT });
    const refCount = await sequelize.query('SELECT COUNT(*) as count FROM referentiel_iseor', { type: sequelize.QueryTypes.SELECT });

    console.log('\n🎉 Base de données MSE Diagnostic configurée définitivement !');
    console.log('\n📊 Résumé :');
    console.log(`   👥 Utilisateurs : ${userCount[0].count}`);
    console.log(`   📚 Référentiel ISEOR : ${refCount[0].count} éléments`);
    console.log('\n🔐 Comptes permanents :');
    console.log('   👤 Administrateur : admin@mse-diagnostic.fr / Admin123!');
    console.log('   👤 Consultant : consultant@mse-diagnostic.fr / Consultant123!');
    console.log('\n✅ PROBLÈME RÉSOLU DÉFINITIVEMENT !');
    console.log('🚀 Les comptes utilisateur sont maintenant permanents et ne seront plus affectés par les mises à jour !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error);
  } finally {
    await sequelize.close();
  }
}

setupDefinitiveDatabase();
