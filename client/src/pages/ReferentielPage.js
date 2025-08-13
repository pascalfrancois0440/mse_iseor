import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  Filter,
  Info
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ReferentielPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('');
  const [expandedDomaines, setExpandedDomaines] = useState(new Set([1, 2, 3, 4, 5, 6]));

  // Récupération du référentiel ISEOR
  const { data: referentielData, isLoading, error } = useQuery(
    ['referentiel', selectedDomaine, searchTerm],
    () => {
      const params = new URLSearchParams();
      if (selectedDomaine) params.append('domaine', selectedDomaine);
      if (searchTerm) params.append('search', searchTerm);
      return axios.get(`/api/referentiel?${params.toString()}`).then(res => res.data);
    },
    {
      refetchOnWindowFocus: false
    }
  );

  const referentiel = referentielData?.referentiel || {};

  const domainesTitles = {
    1: "Conditions de travail",
    2: "Organisation du travail",
    3: "Communication-coordination-concertation",
    4: "Gestion du temps",
    5: "Formation intégrée",
    6: "Mise en œuvre stratégique"
  };

  const domaineColors = {
    1: "bg-red-50 border-red-200 text-red-800",
    2: "bg-blue-50 border-blue-200 text-blue-800",
    3: "bg-green-50 border-green-200 text-green-800",
    4: "bg-yellow-50 border-yellow-200 text-yellow-800",
    5: "bg-purple-50 border-purple-200 text-purple-800",
    6: "bg-indigo-50 border-indigo-200 text-indigo-800"
  };

  const toggleDomaine = (domaineId) => {
    const newExpanded = new Set(expandedDomaines);
    if (newExpanded.has(domaineId)) {
      newExpanded.delete(domaineId);
    } else {
      newExpanded.add(domaineId);
    }
    setExpandedDomaines(newExpanded);
  };

  const handleAddToEntretien = (element) => {
    // Cette fonction sera implémentée pour ajouter un élément à un entretien
    console.log('Ajouter à l\'entretien:', element);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement du référentiel ISEOR..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <BookOpen className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500">
          Impossible de charger le référentiel ISEOR
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Référentiel ISEOR</h1>
        <p className="text-gray-600">
          Explorez les 6 domaines de la méthodologie ISEOR pour identifier les dysfonctionnements
        </p>
      </div>

      {/* Introduction méthodologique */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              À propos de la méthodologie ISEOR
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              La méthodologie ISEOR (Institut de Socio-Économie des Organisations et des Ressources) 
              structure l'analyse des dysfonctionnements en 6 domaines interconnectés. 
              Chaque domaine contient des thèmes spécifiques pour guider votre diagnostic.
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans le référentiel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Filtre par domaine */}
          <div className="sm:w-64">
            <select
              value={selectedDomaine}
              onChange={(e) => setSelectedDomaine(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les domaines</option>
              {Object.entries(domainesTitles).map(([id, title]) => (
                <option key={id} value={id}>
                  Domaine {id}: {title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Référentiel par domaines */}
      <div className="space-y-4">
        {Object.entries(referentiel).map(([domaineId, domaine]) => {
          const isExpanded = expandedDomaines.has(parseInt(domaineId));
          const elements = domaine.elements || [];

          return (
            <div key={domaineId} className="card">
              {/* En-tête du domaine */}
              <button
                onClick={() => toggleDomaine(parseInt(domaineId))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${domaineColors[domaineId]}`}>
                    Domaine {domaineId}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {domainesTitles[domaineId]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {elements.length} élément{elements.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Contenu du domaine */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                  {elements.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucun élément trouvé pour ce domaine
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {elements.map((element) => (
                        <div
                          key={element.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          {/* En-tête de l'élément */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {element.code}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">
                                {element.titre}
                              </h4>
                            </div>
                            <button
                              onClick={() => handleAddToEntretien(element)}
                              className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              title="Ajouter à un entretien"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Description */}
                          {element.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {element.description}
                            </p>
                          )}

                          {/* Sous-thèmes */}
                          {element.sous_themes && element.sous_themes.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Sous-thèmes:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {element.sous_themes.map((theme, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                  >
                                    {theme}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Exemples */}
                          {element.exemples && element.exemples.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Exemples:
                              </h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {element.exemples.slice(0, 3).map((exemple, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-gray-400 mr-2">•</span>
                                    {exemple}
                                  </li>
                                ))}
                                {element.exemples.length > 3 && (
                                  <li className="text-gray-400 italic">
                                    ... et {element.exemples.length - 3} autre{element.exemples.length - 3 > 1 ? 's' : ''}
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Questions guides */}
                          {element.questions_guides && element.questions_guides.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Questions guides:
                              </h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {element.questions_guides.slice(0, 2).map((question, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-gray-400 mr-2">•</span>
                                    {question}
                                  </li>
                                ))}
                                {element.questions_guides.length > 2 && (
                                  <li className="text-gray-400 italic">
                                    ... et {element.questions_guides.length - 2} autre{element.questions_guides.length - 2 > 1 ? 's' : ''}
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Aide à l'utilisation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Comment utiliser le référentiel ISEOR
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mode guidé</h4>
            <p className="text-sm text-gray-600">
              Parcourez systématiquement chaque domaine pour identifier tous les types de dysfonctionnements possibles.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mode recherche</h4>
            <p className="text-sm text-gray-600">
              Utilisez la recherche pour trouver rapidement des thèmes spécifiques ou des mots-clés.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Questions guides</h4>
            <p className="text-sm text-gray-600">
              Chaque élément propose des questions pour faciliter l'entretien avec les managers.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ajout rapide</h4>
            <p className="text-sm text-gray-600">
              Cliquez sur le bouton + pour ajouter directement un élément à votre entretien en cours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferentielPage;
