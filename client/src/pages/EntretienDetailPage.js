import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Plus, 
  BarChart3, 
  Euro, 
  Clock,
  Users,
  FileText,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import DysfonctionnementForm from '../components/Entretien/DysfonctionnementForm';
import DysfonctionnementList from '../components/Entretien/DysfonctionnementList';
import StatistiquesEntretien from '../components/Entretien/StatistiquesEntretien';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EntretienDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('dysfonctionnements');
  const [showDysfonctionnementForm, setShowDysfonctionnementForm] = useState(false);
  const [editingDysfonctionnement, setEditingDysfonctionnement] = useState(null);

  // Récupération des données de l'entretien
  const { data: entretien, isLoading, error } = useQuery(
    ['entretien', id],
    () => axios.get(`/api/entretiens/${id}`).then(res => res.data),
    {
      refetchOnWindowFocus: false
    }
  );

  // Mutation pour supprimer l'entretien
  const deleteEntretienMutation = useMutation(
    () => axios.delete(`/api/entretiens/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('entretiens');
        toast.success('Entretien supprimé avec succès');
        navigate('/dashboard');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression');
      }
    }
  );

  // Mutation pour dupliquer l'entretien
  const duplicateEntretienMutation = useMutation(
    () => axios.post(`/api/entretiens/${id}/duplicate`),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('entretiens');
        toast.success('Entretien dupliqué avec succès');
        navigate(`/entretiens/${response.data.entretien.id}`);
      },
      onError: () => {
        toast.error('Erreur lors de la duplication');
      }
    }
  );

  const handleDeleteEntretien = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entretien ? Cette action est irréversible.')) {
      deleteEntretienMutation.mutate();
    }
  };

  const handleDuplicateEntretien = () => {
    duplicateEntretienMutation.mutate();
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/exports/entretien/${id}/excel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostic-mse-${entretien?.entreprise || 'entretien'}-${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export Excel téléchargé avec succès');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/exports/entretien/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostic-mse-${entretien?.entreprise || 'entretien'}-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export PDF téléchargé avec succès');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const handleEditDysfonctionnement = (dysfonctionnement) => {
    setEditingDysfonctionnement(dysfonctionnement);
    setShowDysfonctionnementForm(true);
  };

  const handleCloseForm = () => {
    setShowDysfonctionnementForm(false);
    setEditingDysfonctionnement(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement de l'entretien..." />
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
        <p className="text-gray-500 mb-4">
          Impossible de charger les détails de l'entretien
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dysfonctionnements', label: 'Dysfonctionnements', icon: FileText },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
    { id: 'informations', label: 'Informations', icon: Eye }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {entretien.titre}
            </h1>
            <p className="text-gray-600">
              {entretien.entreprise} • {format(new Date(entretien.date_entretien), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Menu d'actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
            
            <button
              onClick={handleExportPDF}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>

            <button
              onClick={handleDuplicateEntretien}
              disabled={duplicateEntretienMutation.isLoading}
              className="btn-secondary flex items-center gap-2"
            >
              {duplicateEntretienMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Dupliquer
            </button>

            <Link
              to={`/entretiens/${id}/edit`}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Link>

            <button
              onClick={handleDeleteEntretien}
              disabled={deleteEntretienMutation.isLoading}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              {deleteEntretienMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dysfonctionnements</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entretien.statistiques?.nombre_dysfonctionnements || 0}
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
                {(entretien.statistiques?.cout_total_annuel || 0).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ratio CA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entretien.statistiques?.ratio_ca && typeof entretien.statistiques.ratio_ca === 'number' ? 
                  `${entretien.statistiques.ratio_ca.toFixed(1)}%` : 
                  'N/A'
                }
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
              <p className="text-sm font-medium text-gray-500">PRISM</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entretien.prism_calcule && !isNaN(parseFloat(entretien.prism_calcule)) ? 
                  `${parseFloat(entretien.prism_calcule).toFixed(2)}€/h` : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'dysfonctionnements' && (
          <div className="space-y-6">
            {/* Actions pour les dysfonctionnements */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Liste des dysfonctionnements
              </h2>
              <div className="flex items-center space-x-3">
                <Link
                  to="/referentiel"
                  className="btn-outline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Référentiel ISEOR
                </Link>
                <button
                  onClick={() => setShowDysfonctionnementForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un dysfonctionnement
                </button>
              </div>
            </div>

            {/* Liste des dysfonctionnements */}
            <DysfonctionnementList
              entretienId={id}
              onEdit={handleEditDysfonctionnement}
            />

            {/* Formulaire de dysfonctionnement */}
            {showDysfonctionnementForm && (
              <DysfonctionnementForm
                entretienId={id}
                dysfonctionnement={editingDysfonctionnement}
                onClose={handleCloseForm}
                onSuccess={() => {
                  handleCloseForm();
                  queryClient.invalidateQueries(['entretien', id]);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'statistiques' && (
          <StatistiquesEntretien entretien={entretien} />
        )}

        {activeTab === 'informations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Informations générales
                </h3>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Titre</dt>
                  <dd className="text-sm text-gray-900">{entretien.titre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Entreprise</dt>
                  <dd className="text-sm text-gray-900">{entretien.entreprise}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Secteur d'activité</dt>
                  <dd className="text-sm text-gray-900">{entretien.secteur_activite || 'Non renseigné'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date d'entretien</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(entretien.date_entretien), 'dd MMMM yyyy', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Durée prévue</dt>
                  <dd className="text-sm text-gray-900">{entretien.duree_prevue} minutes</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd>
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
                  </dd>
                </div>
              </dl>
            </div>

            {/* Données économiques */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Données économiques
                </h3>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">CA périmètre</dt>
                  <dd className="text-sm text-gray-900">
                    {entretien.ca_perimetre ? 
                      `${entretien.ca_perimetre.toLocaleString('fr-FR')} €` : 
                      'Non renseigné'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marge brute</dt>
                  <dd className="text-sm text-gray-900">
                    {entretien.marge_brute ? `${entretien.marge_brute}%` : 'Non renseigné'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Heures travaillées/an</dt>
                  <dd className="text-sm text-gray-900">
                    {entretien.heures_travaillees || 'Non renseigné'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Effectif</dt>
                  <dd className="text-sm text-gray-900">
                    {entretien.effectif || 'Non renseigné'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">PRISM calculé</dt>
                  <dd className="text-sm text-gray-900 font-medium">
                    {entretien.prism_calcule && !isNaN(parseFloat(entretien.prism_calcule)) ? 
                      `${parseFloat(entretien.prism_calcule).toFixed(2)} €/heure` : 
                      'Non calculé'
                    }
                  </dd>
                </div>
              </dl>
            </div>

            {/* Notes */}
            {entretien.notes_preparation && (
              <div className="card lg:col-span-2">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notes de préparation
                  </h3>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {entretien.notes_preparation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntretienDetailPage;
