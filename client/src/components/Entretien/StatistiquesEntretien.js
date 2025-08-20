import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Euro, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';

const StatistiquesEntretien = ({ entretien }) => {
  const statistiques = entretien.statistiques || {};
  const dysfonctionnements = entretien.dysfonctionnements || [];

  // Labels des domaines ISEOR - DOIT être déclaré AVANT utilisation
  const domaineLabels = {
    1: "Conditions de travail",
    2: "Organisation du travail", 
    3: "Communication-coordination-concertation",
    4: "Gestion du temps",
    5: "Formation intégrée",
    6: "Mise en œuvre stratégique"
  };

  // Données pour le graphique des domaines ISEOR (amélioré et sécurisé)
  const domaineData = Object.entries(statistiques.repartition_domaines || {})
    .filter(([domaine, data]) => data && data.nombre > 0) // Filtrer les domaines vides
    .map(([domaine, data]) => ({
      domaine: domaineLabels[domaine] || `Domaine ${domaine}`,
      nombre: data.nombre || 0,
      cout: data.cout || 0
    }));

  // Données pour le tableau 5x4
  const tableau5x4 = statistiques.tableau_5x4 || {};

  // Données pour la répartition par fréquence (amélioré et sécurisé)
  console.log('🔍 FRONTEND DEBUG - Statistiques reçues:', statistiques);
  console.log('🔍 FRONTEND DEBUG - repartition_frequences brut:', statistiques.repartition_frequences);
  console.log('🔍 FRONTEND DEBUG - Type de repartition_frequences:', typeof statistiques.repartition_frequences);
  console.log('🔍 FRONTEND DEBUG - Clés de repartition_frequences:', Object.keys(statistiques.repartition_frequences || {}));
  console.log('🔍 FRONTEND DEBUG - Valeurs de repartition_frequences:', Object.values(statistiques.repartition_frequences || {}));
  console.log('🔍 FRONTEND DEBUG - Entries de repartition_frequences:', Object.entries(statistiques.repartition_frequences || {}));
  
  // Traitement des données de fréquence avec coûts
  console.log('🔍 FRONTEND DEBUG - repartition_frequences reçues:', statistiques.repartition_frequences);
  console.log('🔍 FRONTEND DEBUG - statistiques complètes:', statistiques);
  
  const frequenceData = Object.entries(statistiques.repartition_frequences || {})
    .filter(([freq, data]) => {
      console.log(`🔍 Filtrage fréquence "${freq}":`, data);
      return data; // Garde toutes les fréquences, même avec cout/nombre = 0
    })
    .map(([freq, data]) => ({
      frequence: freq,
      nombre: data.nombre || 0,
      cout: data.cout || 0
    }));
    
  console.log('🔍 FRONTEND DEBUG - frequenceData finale:', frequenceData);
  console.log('🔍 FRONTEND DEBUG - frequenceData avec valeurs:', frequenceData.map(item => `${item.frequence}: nombre=${item.nombre}, cout=${item.cout}`));
  
  // Solution définitive : affiche toujours un graphique même si pas de données
  const frequenceDataFinal = frequenceData.length > 0 ? frequenceData : [
    { frequence: 'Pas de données', nombre: 1, cout: 0 }
  ];
      
  console.log('🔍 FRONTEND DEBUG - frequenceData après traitement:', frequenceData);

  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Formatage des montants
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dysfonctionnements</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistiques.nombre_dysfonctionnements || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coût total annuel</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistiques.cout_total_annuel || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ratio CA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistiques.ratio_ca ? `${statistiques.ratio_ca.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coût moyen</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistiques.cout_moyen_par_dysfonctionnement || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par domaines ISEOR */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Répartition par domaines ISEOR
            </h3>
          </div>
          
          {domaineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domaineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="domaine" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(value),
                    'Coût annuel'
                  ]}
                />
                <Bar dataKey="cout" fill="#3b82f6" name="Coût annuel" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Répartition par fréquence */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Répartition par fréquence
            </h3>
          </div>
          
          {frequenceDataFinal && frequenceDataFinal.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={frequenceDataFinal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ frequence, percent }) => `${frequence} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="nombre"
                >
                  {frequenceDataFinal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    value,
                    'Nombre de dysfonctionnements'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Tableau de synthèse 5x4 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Tableau de synthèse ISEOR (5 indicateurs × 4 composants)
          </h3>
          <p className="text-sm text-gray-600">
            Répartition des coûts cachés selon la grille d'analyse ISEOR
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicateurs / Composants
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surtemps
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surconsommation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surproduction
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Non-production
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(tableau5x4).map(([indicateur, composants]) => {
                const total = Object.values(composants || {}).reduce((sum, val) => sum + (val || 0), 0);
                return (
                  <tr key={indicateur} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {indicateur.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {formatCurrency(composants?.surrtemps || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {formatCurrency(composants?.surconsommation || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {formatCurrency(composants?.surproduction || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {formatCurrency(composants?.non_production || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top dysfonctionnements */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Top 10 des dysfonctionnements les plus coûteux
          </h3>
        </div>

        {dysfonctionnements.length > 0 ? (
          <div className="space-y-3">
            {dysfonctionnements
              .sort((a, b) => (b.cout_annuel || 0) - (a.cout_annuel || 0))
              .slice(0, 10)
              .map((dysfonctionnement, index) => (
                <div key={dysfonctionnement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {dysfonctionnement.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dysfonctionnement.frequence} • {dysfonctionnement.temps_par_occurrence}min • {dysfonctionnement.personnes_impactees} personne{dysfonctionnement.personnes_impactees > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(dysfonctionnement.cout_annuel || 0)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun dysfonctionnement à afficher
          </div>
        )}
      </div>

      {/* Analyse et recommandations */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Analyse et recommandations
          </h3>
        </div>

        <div className="space-y-4">
          {/* Analyse automatique basée sur les données */}
          {statistiques.cout_total_annuel > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Analyse des coûts cachés</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {statistiques.ratio_ca && statistiques.ratio_ca > 5 && (
                  <li>• Le ratio coûts cachés/CA ({statistiques.ratio_ca.toFixed(1)}%) est élevé et mérite une attention particulière</li>
                )}
                {statistiques.nombre_dysfonctionnements > 20 && (
                  <li>• Le nombre important de dysfonctionnements ({statistiques.nombre_dysfonctionnements}) suggère des problèmes systémiques</li>
                )}
                {statistiques.cout_moyen_par_dysfonctionnement > 10000 && (
                  <li>• Le coût moyen par dysfonctionnement ({formatCurrency(statistiques.cout_moyen_par_dysfonctionnement)}) indique des impacts significatifs</li>
                )}
              </ul>
            </div>
          )}

          {/* Recommandations par domaine */}
          {domaineData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Recommandations prioritaires</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {domaineData
                  .sort((a, b) => b.cout - a.cout)
                  .slice(0, 3)
                  .map((domaine, index) => (
                    <li key={index}>
                      • Prioriser les actions sur le {domaine.domaine.toLowerCase()} (coût: {formatCurrency(domaine.cout)})
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatistiquesEntretien;
