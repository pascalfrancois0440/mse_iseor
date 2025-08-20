const express = require('express');
const { Entretien, Dysfonctionnement, ReferentielIseor } = require('../models');
const { authenticateToken, requireConsultant } = require('../middleware/auth');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);
router.use(requireConsultant);

// GET /api/exports/entretien/:id/excel - Export Excel
router.get('/entretien/:id/excel', async (req, res) => {
  try {
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements',
        include: [{
          model: ReferentielIseor,
          as: 'referentiel',
          required: false
        }]
      }]
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Créer le workbook Excel
    const wb = XLSX.utils.book_new();

    // Feuille 1: Informations générales
    const infoData = [
      ['Diagnostic MSE - Méthodologie ISEOR', ''],
      ['', ''],
      ['Entreprise', entretien.entreprise],
      ['Secteur d\'activité', entretien.secteur_activite || 'Non renseigné'],
      ['Date d\'entretien', entretien.date_entretien.toLocaleDateString('fr-FR')],
      ['Consultant', `${req.user.prenom} ${req.user.nom}`],
      ['', ''],
      ['Données économiques', ''],
      ['CA périmètre (€)', entretien.ca_perimetre || 'Non renseigné'],
      ['Marge brute (%)', entretien.marge_brute || 'Non renseigné'],
      ['Heures travaillées/an', entretien.heures_travaillees || 'Non renseigné'],
      ['Effectif', entretien.effectif || 'Non renseigné'],
      ['PRISM calculé (€/h)', entretien.prism_calcule || 'Non calculé']
    ];

    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Informations générales');

    // Feuille 2: Liste des dysfonctionnements
    const dysfonctionnements = entretien.dysfonctionnements || [];
    const dysData = [
      [
        'Description',
        'Domaine ISEOR',
        'Fréquence',
        'Temps/occurrence (min)',
        'Personnes impactées',
        'Coût direct (€)',
        'Coût unitaire (€)',
        'Coût annuel (€)',
        'Absentéisme',
        'Accidents',
        'Rotation',
        'Défauts',
        'Écarts',
        'Surtemps',
        'Surconsommation',
        'Surproduction',
        'Non-production'
      ]
    ];

    dysfonctionnements.forEach(d => {
      dysData.push([
        d.description,
        d.domaine_iseor || 'Non classé',
        d.frequence,
        d.temps_par_occurrence,
        d.personnes_impactees,
        d.cout_direct || 0,
        d.cout_unitaire || 0,
        d.cout_annuel || 0,
        d.indicateur_absenteisme ? 'X' : '',
        d.indicateur_accidents ? 'X' : '',
        d.indicateur_rotation ? 'X' : '',
        d.indicateur_defauts ? 'X' : '',
        d.indicateur_ecarts ? 'X' : '',
        d.composant_surrtemps ? 'X' : '',
        d.composant_surconsommation ? 'X' : '',
        d.composant_surproduction ? 'X' : '',
        d.composant_non_production ? 'X' : ''
      ]);
    });

    const wsDys = XLSX.utils.aoa_to_sheet(dysData);
    XLSX.utils.book_append_sheet(wb, wsDys, 'Dysfonctionnements');

    // Feuille 3: Tableau de synthèse 5x4
    const tableau5x4 = calculateTableau5x4(dysfonctionnements);
    const synthData = [
      ['Tableau de synthèse - Indicateurs × Composants', '', '', '', ''],
      ['', 'Surtemps', 'Surconsommation', 'Surproduction', 'Non-production'],
      ['Absentéisme', tableau5x4.absenteisme.surrtemps, tableau5x4.absenteisme.surconsommation, tableau5x4.absenteisme.surproduction, tableau5x4.absenteisme.non_production],
      ['Accidents', tableau5x4.accidents.surrtemps, tableau5x4.accidents.surconsommation, tableau5x4.accidents.surproduction, tableau5x4.accidents.non_production],
      ['Rotation', tableau5x4.rotation.surrtemps, tableau5x4.rotation.surconsommation, tableau5x4.rotation.surproduction, tableau5x4.rotation.non_production],
      ['Défauts', tableau5x4.defauts.surrtemps, tableau5x4.defauts.surconsommation, tableau5x4.defauts.surproduction, tableau5x4.defauts.non_production],
      ['Écarts', tableau5x4.ecarts.surrtemps, tableau5x4.ecarts.surconsommation, tableau5x4.ecarts.surproduction, tableau5x4.ecarts.non_production]
    ];

    const wsSynth = XLSX.utils.aoa_to_sheet(synthData);
    XLSX.utils.book_append_sheet(wb, wsSynth, 'Synthèse 5x4');

    // Générer le buffer Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Diagnostic_MSE_${entretien.entreprise}_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Erreur export Excel:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export Excel' });
  }
});

// GET /api/exports/entretien/:id/pdf - Export PDF
router.get('/entretien/:id/pdf', async (req, res) => {
  try {
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements',
        include: [{
          model: ReferentielIseor,
          as: 'referentiel',
          required: false
        }]
      }]
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    // Créer le PDF avec PDFKit
    const doc = new PDFDocument({ margin: 50 });
    
    // Configuration des headers de réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Diagnostic_MSE_${entretien.entreprise}_${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe le PDF directement vers la réponse
    doc.pipe(res);

    // En-tête du document
    doc.fontSize(20).font('Helvetica-Bold')
       .text('Diagnostic MSE - Méthodologie ISEOR', { align: 'center' });
    
    doc.moveDown(2);

    // Informations générales
    doc.fontSize(14).font('Helvetica-Bold')
       .text('Informations générales', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
       .text(`Entreprise: ${entretien.entreprise}`)
       .text(`Secteur d'activité: ${entretien.secteur_activite || 'Non renseigné'}`)
       .text(`Date d'entretien: ${new Date(entretien.date_entretien).toLocaleDateString('fr-FR')}`)
       .text(`Consultant: ${req.user.prenom} ${req.user.nom}`);

    doc.moveDown(1.5);

    // Données économiques
    doc.fontSize(14).font('Helvetica-Bold')
       .text('Données économiques', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    
    if (entretien.ca_perimetre) {
      doc.text(`CA périmètre: ${parseFloat(entretien.ca_perimetre).toLocaleString('fr-FR')} €`);
    }
    if (entretien.marge_brute) {
      doc.text(`Marge brute: ${entretien.marge_brute}%`);
    }
    if (entretien.heures_travaillees) {
      doc.text(`Heures travaillées/an: ${entretien.heures_travaillees.toLocaleString('fr-FR')}`);
    }
    if (entretien.effectif) {
      doc.text(`Effectif: ${entretien.effectif}`);
    }
    if (entretien.prism_calcule) {
      doc.text(`PRISM calculé: ${parseFloat(entretien.prism_calcule).toLocaleString('fr-FR')} €/h`);
    }

    doc.moveDown(1.5);

    // Synthèse des dysfonctionnements
    const dysfonctionnements = entretien.dysfonctionnements || [];
    const coutTotal = dysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0);

    doc.fontSize(14).font('Helvetica-Bold')
       .text('Synthèse des coûts cachés', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
       .text(`Nombre de dysfonctionnements identifiés: ${dysfonctionnements.length}`)
       .text(`Coût total annuel estimé: ${coutTotal.toLocaleString('fr-FR')} €`);

    if (entretien.ca_perimetre && entretien.ca_perimetre > 0) {
      const ratio = (coutTotal / parseFloat(entretien.ca_perimetre) * 100).toFixed(2);
      doc.text(`Ratio coûts cachés / CA: ${ratio}%`);
    }

    // Nouvelle page pour le détail des dysfonctionnements
    if (dysfonctionnements.length > 0) {
      doc.addPage();
      
      doc.fontSize(16).font('Helvetica-Bold')
         .text('Détail des dysfonctionnements', { align: 'center' });
      
      doc.moveDown(1);

      dysfonctionnements.forEach((d, index) => {
        // Vérifier si on a assez de place sur la page
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(12).font('Helvetica-Bold')
           .text(`${index + 1}. ${d.description}`, { width: 500 });
        
        doc.fontSize(10).font('Helvetica')
           .text(`Fréquence: ${d.frequence}`, { indent: 20 })
           .text(`Temps par occurrence: ${d.temps_par_occurrence} minutes`, { indent: 20 })
           .text(`Personnes impactées: ${d.personnes_impactees}`, { indent: 20 });

        if (d.cout_annuel) {
          doc.text(`Coût annuel estimé: ${parseFloat(d.cout_annuel).toLocaleString('fr-FR')} €`, { indent: 20 });
        }

        if (d.referentiel) {
          doc.text(`Domaine ISEOR: ${d.referentiel.titre}`, { indent: 20 });
        }

        doc.moveDown(0.8);
      });
    }

    // Finaliser le PDF
    doc.end();

  } catch (error) {
    console.error('Erreur export PDF:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export PDF' });
  }
});

// GET /api/exports/entretien/:id/synthesis - Export données de synthèse JSON
router.get('/entretien/:id/synthesis', async (req, res) => {
  try {
    const entretien = await Entretien.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      },
      include: [{
        model: Dysfonctionnement,
        as: 'dysfonctionnements',
        include: [{
          model: ReferentielIseor,
          as: 'referentiel',
          required: false
        }]
      }]
    });

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé' });
    }

    const dysfonctionnements = entretien.dysfonctionnements || [];
    const coutTotal = dysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0);

    // Calculs détaillés pour la synthèse
    const synthesis = {
      entretien: {
        id: entretien.id,
        titre: entretien.titre,
        entreprise: entretien.entreprise,
        date_entretien: entretien.date_entretien,
        consultant: `${req.user.prenom} ${req.user.nom}`
      },
      donnees_economiques: {
        ca_perimetre: entretien.ca_perimetre,
        marge_brute: entretien.marge_brute,
        heures_travaillees: entretien.heures_travaillees,
        effectif: entretien.effectif,
        prism_calcule: entretien.prism_calcule
      },
      statistiques_globales: {
        nombre_dysfonctionnements: dysfonctionnements.length,
        cout_total_annuel: coutTotal,
        ratio_ca: entretien.ca_perimetre ? (coutTotal / entretien.ca_perimetre * 100) : null,
        cout_moyen_par_dysfonctionnement: dysfonctionnements.length > 0 ? coutTotal / dysfonctionnements.length : 0
      },
      repartition_domaines: calculateRepartitionDomaines(dysfonctionnements),
      tableau_5x4: calculateTableau5x4(dysfonctionnements),
      repartition_frequences: calculateRepartitionFrequences(dysfonctionnements),
      top_dysfonctionnements: dysfonctionnements
        .sort((a, b) => (b.cout_annuel || 0) - (a.cout_annuel || 0))
        .slice(0, 10)
        .map(d => ({
          description: d.description,
          cout_annuel: d.cout_annuel,
          frequence: d.frequence,
          domaine_iseor: d.domaine_iseor
        }))
    };

    res.json(synthesis);
  } catch (error) {
    console.error('Erreur export synthèse:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export de synthèse' });
  }
});

// Fonctions utilitaires pour les calculs
function calculateTableau5x4(dysfonctionnements) {
  const tableau = {
    absenteisme: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
    accidents: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
    rotation: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
    defauts: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 },
    ecarts: { surrtemps: 0, surconsommation: 0, surproduction: 0, non_production: 0 }
  };

  dysfonctionnements.forEach(d => {
    const cout = parseFloat(d.cout_annuel) || 0;
    
    if (d.indicateur_absenteisme) {
      if (d.composant_surrtemps) tableau.absenteisme.surrtemps += cout;
      if (d.composant_surconsommation) tableau.absenteisme.surconsommation += cout;
      if (d.composant_surproduction) tableau.absenteisme.surproduction += cout;
      if (d.composant_non_production) tableau.absenteisme.non_production += cout;
    }
    if (d.indicateur_accidents) {
      if (d.composant_surrtemps) tableau.accidents.surrtemps += cout;
      if (d.composant_surconsommation) tableau.accidents.surconsommation += cout;
      if (d.composant_surproduction) tableau.accidents.surproduction += cout;
      if (d.composant_non_production) tableau.accidents.non_production += cout;
    }
    if (d.indicateur_rotation) {
      if (d.composant_surrtemps) tableau.rotation.surrtemps += cout;
      if (d.composant_surconsommation) tableau.rotation.surconsommation += cout;
      if (d.composant_surproduction) tableau.rotation.surproduction += cout;
      if (d.composant_non_production) tableau.rotation.non_production += cout;
    }
    if (d.indicateur_defauts) {
      if (d.composant_surrtemps) tableau.defauts.surrtemps += cout;
      if (d.composant_surconsommation) tableau.defauts.surconsommation += cout;
      if (d.composant_surproduction) tableau.defauts.surproduction += cout;
      if (d.composant_non_production) tableau.defauts.non_production += cout;
    }
    if (d.indicateur_ecarts) {
      if (d.composant_surrtemps) tableau.ecarts.surrtemps += cout;
      if (d.composant_surconsommation) tableau.ecarts.surconsommation += cout;
      if (d.composant_surproduction) tableau.ecarts.surproduction += cout;
      if (d.composant_non_production) tableau.ecarts.non_production += cout;
    }
  });

  return tableau;
}

function calculateRepartitionDomaines(dysfonctionnements) {
  const repartition = {};
  for (let i = 1; i <= 6; i++) {
    repartition[i] = { nombre: 0, cout: 0 };
  }
  
  dysfonctionnements.forEach(d => {
    if (d.domaine_iseor) {
      repartition[d.domaine_iseor].nombre++;
      repartition[d.domaine_iseor].cout += parseFloat(d.cout_annuel) || 0;
    }
  });
  
  return repartition;
}

function calculateRepartitionFrequences(dysfonctionnements) {
  const repartition = {};
  
  dysfonctionnements.forEach(d => {
    if (!repartition[d.frequence]) {
      repartition[d.frequence] = { nombre: 0, cout: 0 };
    }
    repartition[d.frequence].nombre += 1;
    repartition[d.frequence].cout += parseFloat(d.cout_annuel) || 0;
  });
  
  return repartition;
}

module.exports = router;
