import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm();

  // Charger la liste des utilisateurs
  const loadUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/admin/users', {
        params: { page, limit: pagination.limit, search }
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(pagination.page, searchTerm);
  }, [pagination.page]);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        loadUsers(1, searchTerm);
      } else {
        loadUsers(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Créer un utilisateur
  const onCreateUser = async (data) => {
    try {
      await axios.post('/api/auth/admin/create-user', data);
      toast.success('Utilisateur créé avec succès');
      setShowCreateForm(false);
      reset();
      loadUsers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  // Modifier un utilisateur
  const onUpdateUser = async (data) => {
    try {
      await axios.put(`/api/auth/admin/users/${editingUser.id}`, data);
      toast.success('Utilisateur modifié avec succès');
      setEditingUser(null);
      reset();
      loadUsers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Erreur modification utilisateur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await axios.delete(`/api/auth/admin/users/${userId}`);
      toast.success('Utilisateur supprimé avec succès');
      loadUsers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Basculer le statut actif/inactif
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/auth/admin/users/${userId}`, { actif: !currentStatus });
      toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      loadUsers(pagination.page, searchTerm);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  // Initialiser le référentiel ISEOR
  const initReferentielIseor = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir initialiser le référentiel ISEOR ? Cette action ajoutera tous les éléments du référentiel.')) {
      return;
    }

    try {
      const response = await axios.post('/api/admin/init-referentiel');
      toast.success('Référentiel ISEOR initialisé avec succès');
      console.log('Référentiel initialisé:', response.data);
    } catch (error) {
      console.error('Erreur initialisation référentiel:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'initialisation du référentiel');
    }
  };

  const startEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    reset({
      email: userToEdit.email,
      nom: userToEdit.nom,
      prenom: userToEdit.prenom,
      role: userToEdit.role,
      organisation: userToEdit.organisation || '',
      telephone: userToEdit.telephone || '',
      actif: userToEdit.actif
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    reset();
  };

  // Vérifier que l'utilisateur est administrateur
  if (user?.role !== 'administrateur') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary-600" />
            Administration des utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les comptes utilisateurs de l'application MSE Diagnostic
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={initReferentielIseor}
            className="btn-secondary flex items-center"
          >
            <Shield className="h-5 w-5 mr-2" />
            Initialiser Référentiel ISEOR
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou organisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Formulaire de création/modification */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </h3>
          </div>

          <form onSubmit={handleSubmit(editingUser ? onUpdateUser : onCreateUser)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  className="input-field"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: editingUser ? false : 'Mot de passe requis',
                      minLength: {
                        value: 8,
                        message: 'Le mot de passe doit contenir au moins 8 caractères'
                      }
                    })}
                    className="input-field pr-10"
                    placeholder={editingUser ? 'Laisser vide pour conserver le mot de passe actuel' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
                {editingUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    Saisissez un nouveau mot de passe pour le modifier, ou laissez vide pour conserver l'actuel
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register('nom', { 
                    required: 'Nom requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                  className="input-field"
                />
                {errors.nom && (
                  <p className="text-red-600 text-sm mt-1">{errors.nom.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register('prenom', { 
                    required: 'Prénom requis',
                    minLength: {
                      value: 2,
                      message: 'Le prénom doit contenir au moins 2 caractères'
                    }
                  })}
                  className="input-field"
                />
                {errors.prenom && (
                  <p className="text-red-600 text-sm mt-1">{errors.prenom.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  {...register('role', { required: 'Rôle requis' })}
                  className="input-field"
                >
                  <option value="consultant">Consultant</option>
                  <option value="administrateur">Administrateur</option>
                </select>
                {errors.role && (
                  <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation
                </label>
                <input
                  type="text"
                  {...register('organisation')}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  {...register('telephone')}
                  className="input-field"
                />
              </div>

              {editingUser && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('actif')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Compte actif</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingUser ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  editingUser ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Utilisateurs ({pagination.total})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.prenom} {userItem.nom}
                        </div>
                        <div className="text-sm text-gray-500">{userItem.email}</div>
                        {userItem.telephone && (
                          <div className="text-sm text-gray-500">{userItem.telephone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userItem.role === 'administrateur' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {userItem.role === 'administrateur' && <Shield className="h-3 w-3 mr-1" />}
                        {userItem.role === 'administrateur' ? 'Admin' : 'Consultant'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.organisation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userItem.actif 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userItem.actif ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userItem.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEdit(userItem)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(userItem.id, userItem.actif)}
                          className={`${
                            userItem.actif 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={userItem.actif ? 'Désactiver' : 'Activer'}
                        >
                          {userItem.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        {userItem.id !== user.id && (
                          <button
                            onClick={() => deleteUser(userItem.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} sur {pagination.pages} ({pagination.total} utilisateurs)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
