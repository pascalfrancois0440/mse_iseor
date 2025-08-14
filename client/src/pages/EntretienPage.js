import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Save, 
  ArrowLeft, 
  Calculator, 
  Users, 
  Building, 
  Calendar,
  Euro,
  Clock,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useOffline } from '../contexts/OfflineContext';

const EntretienPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { saveOfflineData, isOnline } = useOffline();
  const isEditing = !!id;

  const [prismCalcule, setPrismCalcule] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      titre: '',
      entreprise: '',
      secteur_activite: '',
      date_entretien: new Date().toISOString().split('T')[0],
      duree_prevue: 90,
      ca_perimetre: '',
      marge_brute: '',
      heures_travaillees: '',
      effectif: '',
      participants: [],
      notes_preparation: ''
    }
  });

  // Récupération des données de l'entretien si édition
  const { data: entretien, isLoading } = useQuery(
    ['entretien', id],
    () => axios.get(`/api/entretiens/${id}`).then(res => res.data),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        // Remplir le formulaire avec les données existantes
        Object.keys(data).forEach(key => {
          if (key === 'date_entretien') {
            setValue(key, new Date(data[key]).toISOString().split('T')[0]);
          } else if (data[key] !== null && data[key] !== undefined) {
            setValue(key, data[key]);
          }
        });
        setPrismCalcule(data.prism_calcule || 0);
      }
    }
  );

  // Mutation pour créer/modifier un entretien
  const entretienMutation = useMutation(
    (data) => {
      if (isEditing) {
        return axios.put(`/api/entretiens/${id}`, data);
      } else {
        return axios.post('/api/entretiens', data);
      }
    },
    {
      onSuccess: (response) => {
        const entretienData = response.data.entretien;
        queryClient.invalidateQueries('entretiens');
        toast.success(isEditing ? 'Entretien modifié avec succès' : 'Entretien créé avec succès');
        navigate(`/entretiens/${entretienData.id}`);
      },
      onError: (error) => {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la sauvegarde');
      }
    }
  );

  // Surveiller les changements pour calculer le PRISM
  const watchedFields = watch(['ca_perimetre', 'marge_brute', 'heures_travaillees']);

  useEffect(() => {
    const [ca, marge, heures] = watchedFields;
    if (ca && marge && heures) {
      const caNum = parseFloat(ca);
      const margeNum = parseFloat(marge);
      const heuresNum = parseInt(heures);
      
      if (caNum > 0 && margeNum > 0 && heuresNum > 0) {
        const prism = (caNum * (margeNum / 100)) / heuresNum;
        setPrismCalcule(prism);
      } else {
        setPrismCalcule(0);
      }
    } else {
      setPrismCalcule(0);
    }
  }, [watchedFields]);

  const onSubmit = async (data) => {
    try {
      if (!isOnline) {
        // Sauvegarder hors ligne
        await saveOfflineData('entretien', {
          ...data,
          prism_calcule: prismCalcule,
          action: isEditing ? 'update' : 'create',
          entretien_id: id
        });
        toast.success('Entretien sauvegardé hors ligne');
        navigate('/dashboard');
        return;
      }

      // Nettoyer les données - supprimer les champs vides
      const cleanData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        // Ne pas inclure les champs vides ou null
        if (value !== '' && value !== null && value !== undefined) {
          // Convertir les nombres en entiers si nécessaire
          if (['ca_perimetre', 'marge_brute', 'heures_travaillees', 'effectif'].includes(key)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue > 0) {
              acc[key] = key === 'effectif' || key === 'heures_travaillees' ? parseInt(value) : numValue;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      entretienMutation.mutate({
        ...cleanData,
        prism_calcule: prismCalcule
      });
    } catch (error) {
      console.error('Erreur soumission:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement de l'entretien..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier l\'entretien' : 'Nouvel entretien'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifiez les informations de l\'entretien' : 'Créez un nouveau diagnostic MSE selon la méthodologie ISEOR'}
            </p>
          </div>
        </div>
        
        {!isOnline && (
          <div className="flex items-center space-x-2 text-amber-600">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm">Mode hors ligne</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Informations générales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'entretien *
              </label>
              <input
                {...register('titre', {
                  required: 'Le titre est requis',
                  minLength: {
                    value: 3,
                    message: 'Le titre doit contenir au moins 3 caractères'
                  }
                })}
                type="text"
                className={`input-field ${errors.titre ? 'border-red-500' : ''}`}
                placeholder="Ex: Diagnostic MSE - Service Production"
              />
              {errors.titre && (
                <p className="mt-1 text-sm text-red-600">{errors.titre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise *
              </label>
              <input
                {...register('entreprise', {
                  required: 'Le nom de l\'entreprise est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères'
                  }
                })}
                type="text"
                className={`input-field ${errors.entreprise ? 'border-red-500' : ''}`}
                placeholder="Nom de l'entreprise"
              />
              {errors.entreprise && (
                <p className="mt-1 text-sm text-red-600">{errors.entreprise.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <input
                {...register('secteur_activite')}
                type="text"
                className="input-field"
                placeholder="Ex: Industrie automobile, Services, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'entretien *
              </label>
              <input
                {...register('date_entretien', {
                  required: 'La date est requise'
                })}
                type="date"
                className={`input-field ${errors.date_entretien ? 'border-red-500' : ''}`}
              />
              {errors.date_entretien && (
                <p className="mt-1 text-sm text-red-600">{errors.date_entretien.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée prévue (minutes)
              </label>
              <input
                {...register('duree_prevue', {
                  min: {
                    value: 30,
                    message: 'La durée minimum est de 30 minutes'
                  },
                  max: {
                    value: 300,
                    message: 'La durée maximum est de 5 heures'
                  }
                })}
                type="number"
                className="input-field"
                placeholder="90"
              />
              {errors.duree_prevue && (
                <p className="mt-1 text-sm text-red-600">{errors.duree_prevue.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Données économiques */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Données économiques
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Ces données permettent de calculer automatiquement le PRISM (Produit Intégré Socio-économique par Minute)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CA périmètre (€)
              </label>
              <input
                {...register('ca_perimetre', {
                  min: {
                    value: 0,
                    message: 'Le CA doit être positif'
                  }
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="1000000"
              />
              {errors.ca_perimetre && (
                <p className="mt-1 text-sm text-red-600">{errors.ca_perimetre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marge brute (%)
              </label>
              <input
                {...register('marge_brute', {
                  min: {
                    value: 0,
                    message: 'La marge doit être positive'
                  },
                  max: {
                    value: 100,
                    message: 'La marge ne peut pas dépasser 100%'
                  }
                })}
                type="number"
                step="0.1"
                className="input-field"
                placeholder="25.5"
              />
              {errors.marge_brute && (
                <p className="mt-1 text-sm text-red-600">{errors.marge_brute.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures travaillées/an
              </label>
              <input
                {...register('heures_travaillees', {
                  min: {
                    value: 1,
                    message: 'Le nombre d\'heures doit être positif'
                  }
                })}
                type="number"
                className="input-field"
                placeholder="1600"
              />
              {errors.heures_travaillees && (
                <p className="mt-1 text-sm text-red-600">{errors.heures_travaillees.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effectif
              </label>
              <input
                {...register('effectif', {
                  min: {
                    value: 1,
                    message: 'L\'effectif doit être positif'
                  }
                })}
                type="number"
                className="input-field"
                placeholder="50"
              />
              {errors.effectif && (
                <p className="mt-1 text-sm text-red-600">{errors.effectif.message}</p>
              )}
            </div>
          </div>

          {/* Affichage du PRISM calculé */}
          {prismCalcule > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    PRISM calculé
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {prismCalcule.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 2
                    })}/heure
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes de préparation */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Notes de préparation
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations et préparation
            </label>
            <textarea
              {...register('notes_preparation')}
              rows={4}
              className="input-field"
              placeholder="Notes sur le contexte, les enjeux, les participants attendus..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Annuler
          </button>

          <div className="flex items-center space-x-4">
            {isDirty && (
              <span className="text-sm text-amber-600">
                Modifications non sauvegardées
              </span>
            )}
            
            <button
              type="submit"
              disabled={entretienMutation.isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {entretienMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? 'Modifier' : 'Créer'} l'entretien
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EntretienPage;
