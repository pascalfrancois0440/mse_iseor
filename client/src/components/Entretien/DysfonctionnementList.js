import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  SortAsc,
  SortDesc,
  Euro,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const DysfonctionnementList = ({ entretienId, onEdit }) => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');

  // Récupération des dysfonctionnements
  const { data: dysfonctionnementsData, isLoading, error } = useQuery(
    ['dysfonctionnements', entretienId],
    () => axios.get(`/api/dysfonctionnements/entretien/${entretienId}`).then(res => res.data),
    {
      refetchOnWindowFocus: false
    }
  );

  // Mutation pour supprimer un dysfonctionnement
  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/dysfonctionnements/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dysfonctionnements', entretienId]);
        queryClient.invalidateQueries(['entretien', entretienId]);
        toast.success('Dysfonctionnement supprimé avec succès');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression');
      }
    }
  );

  const dysfonctionnements = dysfonctionnementsData?.dysfonctionnements || [];

  // Filtrage et tri
  const filteredAndSortedDysfonctionnements = dysfonctionnements
    .filter(d => {
      if (filterDomaine && d.domaine_iseor !== parseInt(filterDomaine)) return false;
      if (filterPriorite && d.priorite !== filterPriorite) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'cout_annuel') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (dysfonctionnement) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce dysfonctionnement ?\n\n"${dysfonctionnement.description.substring(0, 100)}..."`)) {
      deleteMutation.mutate(dysfonctionnement.id);
    }
  };

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case 'faible': return 'badge-success';
      case 'moyenne': return 'badge-warning';
      case 'haute': return 'badge-error';
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'badge-primary';
    }
  };

  const getPrioriteLabel = (priorite) => {
    switch (priorite) {
      case 'faible': return 'Faible';
      case 'moyenne': return 'Moyenne';
      case 'haute': return 'Haute';
      case 'critique': return 'Critique';
      default: return priorite;
    }
  };

  const getFrequenceLabel = (frequence) => {
    switch (frequence) {
      case 'quotidien': return 'Quotidien';
      case 'hebdomadaire': return 'Hebdomadaire';
      case 'mensuel': return 'Mensuel';
      case 'trimestriel': return 'Trimestriel';
      case 'annuel': return 'Annuel';
      case 'ponctuel': return 'Ponctuel';
      default: return frequence;
    }
  };

  const domaineOptions = [
    { value: '', label: 'Tous les domaines' },
    { value: '1', label: 'Domaine 1: Conditions de travail' },
    { value: '2', label: 'Domaine 2: Organisation du travail' },
    { value: '3', label: 'Domaine 3: Communication-coordination-concertation' },
    { value: '4', label: 'Domaine 4: Gestion du temps' },
    { value: '5', label: 'Domaine 5: Formation intégrée' },
    { value: '6', label: 'Domaine 6: Mise en œuvre stratégique' }
  ];

  const prioriteOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'faible', label: 'Faible' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'haute', label: 'Haute' },
    { value: 'critique', label: 'Critique' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="lg" text="Chargement des dysfonctionnements..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-gray-500">
          Erreur lors du chargement des dysfonctionnements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres et tri */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filterDomaine}
              onChange={(e) => setFilterDomaine(e.target.value)}
              className="input-field"
            >
              {domaineOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={filterPriorite}
              onChange={(e) => setFilterPriorite(e.target.value)}
              className="input-field"
            >
              {prioriteOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            {filteredAndSortedDysfonctionnements.length} dysfonctionnement{filteredAndSortedDysfonctionnements.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Liste des dysfonctionnements */}
      {filteredAndSortedDysfonctionnements.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun dysfonctionnement
          </h3>
          <p className="text-gray-500">
            {dysfonctionnements.length === 0 
              ? "Commencez par ajouter votre premier dysfonctionnement"
              : "Aucun dysfonctionnement ne correspond aux filtres sélectionnés"
            }
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('domaine_iseor')}
                  >
                    <div className="flex items-center">
                      Domaine
                      {sortBy === 'domaine_iseor' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fréquence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('cout_annuel')}
                  >
                    <div className="flex items-center">
                      Coût annuel
                      {sortBy === 'cout_annuel' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priorite')}
                  >
                    <div className="flex items-center">
                      Priorité
                      {sortBy === 'priorite' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedDysfonctionnements.map((dysfonctionnement) => (
                  <tr key={dysfonctionnement.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {dysfonctionnement.description}
                        </p>
                        {dysfonctionnement.referentiel && (
                          <p className="text-xs text-gray-500">
                            Réf: {dysfonctionnement.referentiel.code} - {dysfonctionnement.referentiel.titre}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dysfonctionnement.domaine_iseor ? (
                        <span className="badge badge-primary">
                          Domaine {dysfonctionnement.domaine_iseor}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Non classé</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFrequenceLabel(dysfonctionnement.frequence)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {dysfonctionnement.temps_par_occurrence}min
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {dysfonctionnement.personnes_impactees}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(dysfonctionnement.cout_annuel || 0).toLocaleString('fr-FR')}€
                      </div>
                      {dysfonctionnement.cout_unitaire && (
                        <div className="text-xs text-gray-500">
                          {(dysfonctionnement.cout_unitaire || 0).toLocaleString('fr-FR')}€/occurrence
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getPrioriteColor(dysfonctionnement.priorite)}`}>
                        {getPrioriteLabel(dysfonctionnement.priorite)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(dysfonctionnement)}
                          className="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dysfonctionnement)}
                          disabled={deleteMutation.isLoading}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          {deleteMutation.isLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Résumé des coûts */}
      {filteredAndSortedDysfonctionnements.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Résumé des coûts
            </h3>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredAndSortedDysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0).toLocaleString('fr-FR')}€
                </div>
                <div className="text-sm text-gray-500">Coût total annuel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(filteredAndSortedDysfonctionnements.reduce((sum, d) => sum + (parseFloat(d.cout_annuel) || 0), 0) / filteredAndSortedDysfonctionnements.length).toLocaleString('fr-FR')}€
                </div>
                <div className="text-sm text-gray-500">Coût moyen</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DysfonctionnementList;
