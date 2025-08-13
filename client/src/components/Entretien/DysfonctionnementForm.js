import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { 
  X, 
  Save, 
  AlertCircle,
  Clock,
  Users,
  Euro,
  Tag
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const DysfonctionnementForm = ({ entretienId, dysfonctionnement, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEditing = !!dysfonctionnement;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      description: dysfonctionnement?.description || '',
      frequence: dysfonctionnement?.frequence || 'mensuel',
      temps_par_occurrence: dysfonctionnement?.temps_par_occurrence || 30,
      personnes_impactees: dysfonctionnement?.personnes_impactees || 1,
      cout_direct: dysfonctionnement?.cout_direct || 0,
      domaine_iseor: dysfonctionnement?.domaine_iseor || '',
      priorite: dysfonctionnement?.priorite || 'moyenne',
      commentaires: dysfonctionnement?.commentaires || '',
      // Indicateurs ISEOR
      indicateur_absenteisme: dysfonctionnement?.indicateur_absenteisme || false,
      indicateur_accidents: dysfonctionnement?.indicateur_accidents || false,
      indicateur_rotation: dysfonctionnement?.indicateur_rotation || false,
      indicateur_defauts: dysfonctionnement?.indicateur_defauts || false,
      indicateur_ecarts: dysfonctionnement?.indicateur_ecarts || false,
      // Composants ISEOR
      composant_surrtemps: dysfonctionnement?.composant_surrtemps || false,
      composant_surconsommation: dysfonctionnement?.composant_surconsommation || false,
      composant_surproduction: dysfonctionnement?.composant_surproduction || false,
      composant_non_production: dysfonctionnement?.composant_non_production || false
    }
  });

  // Mutation pour créer/modifier un dysfonctionnement
  const dysfonctionnementMutation = useMutation(
    (data) => {
      if (isEditing) {
        return axios.put(`/api/dysfonctionnements/${dysfonctionnement.id}`, data);
      } else {
        return axios.post('/api/dysfonctionnements', { ...data, entretien_id: entretienId });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['entretien', entretienId]);
        queryClient.invalidateQueries(['dysfonctionnements', entretienId]);
        toast.success(isEditing ? 'Dysfonctionnement modifié avec succès' : 'Dysfonctionnement créé avec succès');
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la sauvegarde');
      }
    }
  );

  const onSubmit = (data) => {
    dysfonctionnementMutation.mutate(data);
  };

  const frequenceOptions = [
    { value: 'quotidien', label: 'Quotidien' },
    { value: 'hebdomadaire', label: 'Hebdomadaire' },
    { value: 'mensuel', label: 'Mensuel' },
    { value: 'trimestriel', label: 'Trimestriel' },
    { value: 'annuel', label: 'Annuel' },
    { value: 'ponctuel', label: 'Ponctuel' }
  ];

  const prioriteOptions = [
    { value: 'faible', label: 'Faible', color: 'text-green-600' },
    { value: 'moyenne', label: 'Moyenne', color: 'text-yellow-600' },
    { value: 'haute', label: 'Haute', color: 'text-orange-600' },
    { value: 'critique', label: 'Critique', color: 'text-red-600' }
  ];

  const domaineOptions = [
    { value: 1, label: 'Conditions de travail' },
    { value: 2, label: 'Organisation du travail' },
    { value: 3, label: 'Communication-coordination-concertation' },
    { value: 4, label: 'Gestion du temps' },
    { value: 5, label: 'Formation intégrée' },
    { value: 6, label: 'Mise en œuvre stratégique' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* En-tête */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Modifier le dysfonctionnement' : 'Nouveau dysfonctionnement'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du dysfonctionnement *
                </label>
                <textarea
                  {...register('description', {
                    required: 'La description est requise',
                    minLength: {
                      value: 10,
                      message: 'La description doit contenir au moins 10 caractères'
                    }
                  })}
                  rows={3}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Décrivez précisément le dysfonctionnement observé..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Fréquence et impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Fréquence *
                  </label>
                  <select
                    {...register('frequence', { required: 'La fréquence est requise' })}
                    className={`input-field ${errors.frequence ? 'border-red-500' : ''}`}
                  >
                    {frequenceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.frequence && (
                    <p className="mt-1 text-sm text-red-600">{errors.frequence.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Temps par occurrence (min) *
                  </label>
                  <input
                    {...register('temps_par_occurrence', {
                      required: 'Le temps est requis',
                      min: { value: 1, message: 'Le temps doit être positif' }
                    })}
                    type="number"
                    className={`input-field ${errors.temps_par_occurrence ? 'border-red-500' : ''}`}
                    placeholder="30"
                  />
                  {errors.temps_par_occurrence && (
                    <p className="mt-1 text-sm text-red-600">{errors.temps_par_occurrence.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Personnes impactées *
                  </label>
                  <input
                    {...register('personnes_impactees', {
                      required: 'Le nombre de personnes est requis',
                      min: { value: 1, message: 'Au moins 1 personne' }
                    })}
                    type="number"
                    className={`input-field ${errors.personnes_impactees ? 'border-red-500' : ''}`}
                    placeholder="1"
                  />
                  {errors.personnes_impactees && (
                    <p className="mt-1 text-sm text-red-600">{errors.personnes_impactees.message}</p>
                  )}
                </div>
              </div>

              {/* Coût direct et domaine */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Euro className="h-4 w-4 inline mr-1" />
                    Coût direct (€)
                  </label>
                  <input
                    {...register('cout_direct', {
                      min: { value: 0, message: 'Le coût doit être positif' }
                    })}
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Domaine ISEOR
                  </label>
                  <select
                    {...register('domaine_iseor')}
                    className="input-field"
                  >
                    <option value="">Sélectionner un domaine</option>
                    {domaineOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value}. {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Priorité
                  </label>
                  <select
                    {...register('priorite')}
                    className="input-field"
                  >
                    {prioriteOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Classification ISEOR - Indicateurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Indicateurs ISEOR (5 indicateurs)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('indicateur_absenteisme')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Absentéisme</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('indicateur_accidents')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Accidents du travail</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('indicateur_rotation')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Rotation du personnel</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('indicateur_defauts')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Défauts de qualité</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('indicateur_ecarts')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Écarts de productivité</span>
                  </label>
                </div>
              </div>

              {/* Classification ISEOR - Composants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Composants ISEOR (4 composants)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('composant_surrtemps')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Surtemps</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('composant_surconsommation')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Surconsommation</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('composant_surproduction')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Surproduction</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('composant_non_production')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Non-production</span>
                  </label>
                </div>
              </div>

              {/* Commentaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires additionnels
                </label>
                <textarea
                  {...register('commentaires')}
                  rows={2}
                  className="input-field"
                  placeholder="Observations, contexte, actions envisagées..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
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
                    disabled={dysfonctionnementMutation.isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {dysfonctionnementMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isEditing ? 'Modifier' : 'Créer'} le dysfonctionnement
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DysfonctionnementForm;
