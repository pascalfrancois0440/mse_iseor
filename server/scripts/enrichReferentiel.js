const { sequelize } = require('../config/database');

async function enrichReferentiel() {
  try {
    console.log('🔄 Enrichissement du référentiel ISEOR...\n');

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Exemples concrets par domaine
    const enrichissements = [
      // Domaine 1: Conditions de travail
      { code: '101', exemples: ['Espaces exigus', 'Circulation difficile', 'Zones mal organisées'], questions: ['Les espaces sont-ils suffisants ?', 'La circulation est-elle fluide ?', 'L\'agencement favorise-t-il le travail ?'] },
      { code: '102', exemples: ['Matériel obsolète', 'Fournitures manquantes', 'Outils inadaptés'], questions: ['Le matériel est-il performant ?', 'Les fournitures sont-elles disponibles ?', 'Les outils sont-ils adaptés ?'] },
      { code: '103', exemples: ['Bruit excessif', 'Mauvaise qualité air', 'Éclairage insuffisant'], questions: ['Le niveau sonore est-il acceptable ?', 'La qualité de l\'air est-elle bonne ?', 'L\'éclairage est-il adapté ?'] },
      
      // Domaine 2: Organisation du travail  
      { code: '201', exemples: ['Répartition inéquitable', 'Surcharge ponctuelle', 'Compétences mal utilisées'], questions: ['La répartition est-elle équitable ?', 'Les compétences sont-elles bien utilisées ?', 'Y a-t-il des surcharges ?'] },
      { code: '202', exemples: ['Absentéisme récurrent', 'Manque de suivi', 'Difficultés remplacement'], questions: ['L\'absentéisme est-il suivi ?', 'Y a-t-il une politique de prévention ?', 'Les remplacements sont-ils organisés ?'] },
      
      // Domaine 3: Communication 3C
      { code: '301', exemples: ['Manque communication équipe', 'Informations non partagées', 'Réunions inefficaces'], questions: ['La communication est-elle fluide ?', 'Les informations sont-elles partagées ?', 'Les réunions sont-elles efficaces ?'] },
      { code: '302', exemples: ['Cloisonnement services', 'Manque coopération', 'Conflits inter-services'], questions: ['Les relations inter-services sont-elles bonnes ?', 'Y a-t-il coopération ?', 'Les conflits sont-ils résolus ?'] },
      
      // Domaine 4: Gestion du temps
      { code: '401', exemples: ['Retards fréquents', 'Échéances non respectées', 'Planification irréaliste'], questions: ['Les délais sont-ils respectés ?', 'La planification est-elle réaliste ?', 'Y a-t-il anticipation ?'] },
      { code: '402', exemples: ['Absence planification', 'Manque priorisation', 'Outils inadaptés'], questions: ['Les activités sont-elles planifiées ?', 'Les priorités sont-elles définies ?', 'Les outils sont-ils efficaces ?'] },
      
      // Domaine 5: Formation intégrée
      { code: '501', exemples: ['Formation inadaptée', 'Écart formation/poste', 'Formation trop théorique'], questions: ['La formation correspond-elle au poste ?', 'Y a-t-il adéquation théorie/pratique ?', 'Les compétences sont-elles utilisées ?'] },
      { code: '502', exemples: ['Besoins non identifiés', 'Demandes ignorées', 'Absence entretiens'], questions: ['Les besoins sont-ils identifiés ?', 'Les demandes sont-elles prises en compte ?', 'Y a-t-il entretiens développement ?'] },
      
      // Domaine 6: Mise en œuvre stratégique
      { code: '601', exemples: ['Orientations floues', 'Stratégie non communiquée', 'Vision court terme'], questions: ['Les orientations sont-elles claires ?', 'La stratégie est-elle communiquée ?', 'Y a-t-il vision long terme ?'] },
      { code: '602', exemples: ['Stratégie définie seul', 'Manque implication équipes', 'Décisions vase clos'], questions: ['Qui participe à la définition ?', 'Les équipes sont-elles impliquées ?', 'Y a-t-il concertation ?'] }
    ];

    console.log('📝 Mise à jour des exemples et questions...\n');
    
    for (const item of enrichissements) {
      const exemples = JSON.stringify(item.exemples);
      const questions = JSON.stringify(item.questions);
      
      await sequelize.query(`
        UPDATE referentiel_iseor 
        SET exemples = ?, questions_guides = ?, updated_at = ?
        WHERE code = ?
      `, {
        replacements: [exemples, questions, new Date().toISOString(), item.code]
      });
      
      console.log(`✅ Code ${item.code} enrichi`);
    }

    console.log('\n🎉 Enrichissement terminé !');
    console.log('📚 Le référentiel contient maintenant des exemples concrets et questions guides spécifiques');

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await sequelize.close();
  }
}

enrichReferentiel();
