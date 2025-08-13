import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Clock, 
  Euro,
  Calendar,
  BarChart3,
  FileText,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DashboardPage = () => {
  // Récupération des entretiens
  const { data: entretiensData, isLoading, error } = useQuery(
    'entretiens',
    () => axios.get('/api/entretiens?limit=5').then(res => res.data),
    {
      refetchOnWindowFocus: false
    }
  );

  // Calcul des statistiques
  const entretiens = entretiensData?.entretiens || [];
  const stats = {
    totalEntretiens: entretiens.length,
    entretiensMois: entretiens.filter(e => {
      const dateEntretien = new Date(e.date_entretien);
      const maintenant = new Date();
      return dateEntretien.getMonth() === maintenant.getMonth() && 
             dateEntretien.getFullYear() === maintenant.getFullYear();
    }).length,
    coutTotalMoyen: entretiens.reduce((sum, e) => sum + (e.statistiques?.cout_total_annuel || 0), 0) / (entretiens.length || 1),
    tempsTotal: entretiens.reduce((sum, e) => sum + (e.duree_prevue || 90), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500">
          Impossible de charger les données du tableau de bord
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec action rapide */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">
            Vue d'ensemble de vos diagnostics MSE
          </p>
        </div>
        <Link
          to="/entretiens/nouveau"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel entretien
        </Link>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total entretiens</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEntretiens}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.entretiensMois}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coût moyen</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(stats.coutTotalMoyen).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(stats.tempsTotal / 60)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/entretiens/nouveau"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                Nouvel entretien
              </h3>
              <p className="text-gray-500 text-sm">
                Démarrer un diagnostic MSE
              </p>
            </div>
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>

        <Link
          to="/referentiel"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                Référentiel ISEOR
              </h3>
              <p className="text-gray-500 text-sm">
                Consulter les 6 domaines
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Guide d'utilisation
              </h3>
              <p className="text-gray-500 text-sm">
                Méthodologie et bonnes pratiques
              </p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Entretiens récents */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Entretiens récents
            </h2>
            <Link
              to="/entretiens"
              className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {entretiens.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun entretien
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre premier entretien de diagnostic MSE
            </p>
            <Link to="/entretiens/nouveau" className="btn-primary flex items-center gap-2 w-fit mx-auto">
              <Plus className="h-4 w-4" />
              Créer un entretien
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dysfonctionnements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coût total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entretiens.map((entretien) => (
                  <tr key={entretien.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entretien.entreprise}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entretien.titre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(entretien.date_entretien), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        entretien.statut === 'termine' ? 'badge-success' :
                        entretien.statut === 'en_cours' ? 'badge-warning' :
                        'badge-primary'
                      }`}>
                        {entretien.statut === 'termine' ? 'Terminé' :
                         entretien.statut === 'en_cours' ? 'En cours' :
                         entretien.statut === 'preparation' ? 'Préparation' :
                         'Archivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entretien.statistiques?.nombre_dysfonctionnements || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(entretien.statistiques?.cout_total_annuel || 0).toLocaleString('fr-FR')}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/entretiens/${entretien.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conseils et astuces */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">
              Conseil du jour
            </h3>
            <p className="mt-1 text-sm text-primary-700">
              Pour un diagnostic efficace, prévoyez 90 minutes par entretien et utilisez le mode guidé 
              pour explorer systématiquement les 6 domaines ISEOR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
