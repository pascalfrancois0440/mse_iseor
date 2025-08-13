import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Lock, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Formulaire de profil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: profileIsDirty }
  } = useForm({
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      organisation: user?.organisation || '',
      telephone: user?.telephone || ''
    }
  });

  // Formulaire de mot de passe
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }
  } = useForm();

  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const onSubmitProfile = async (data) => {
    setProfileSubmitting(true);
    const result = await updateProfile(data);
    setProfileSubmitting(false);
    
    if (result.success) {
      // Le profil a été mis à jour avec succès
    }
  };

  const onSubmitPassword = async (data) => {
    const result = await changePassword(data.currentPassword, data.newPassword);
    
    if (result.success) {
      resetPassword();
    }
  };

  const watchNewPassword = watchPassword('newPassword');

  const tabs = [
    { id: 'profile', label: 'Informations personnelles', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et paramètres de sécurité
        </p>
      </div>

      {/* Informations utilisateur */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-xl font-medium text-white">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              {user?.prenom} {user?.nom}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className={`badge ${user?.role === 'administrateur' ? 'badge-primary' : 'badge-success'}`}>
              {user?.role === 'administrateur' ? 'Administrateur' : 'Consultant'}
            </span>
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
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Informations personnelles
                </h3>
                <p className="text-sm text-gray-600">
                  Mettez à jour vos informations personnelles et professionnelles
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Prénom *
                  </label>
                  <input
                    {...registerProfile('prenom', {
                      required: 'Le prénom est requis',
                      minLength: {
                        value: 2,
                        message: 'Le prénom doit contenir au moins 2 caractères'
                      }
                    })}
                    type="text"
                    className={`input-field ${profileErrors.prenom ? 'border-red-500' : ''}`}
                    placeholder="Votre prénom"
                  />
                  {profileErrors.prenom && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.prenom.message}</p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Nom *
                  </label>
                  <input
                    {...registerProfile('nom', {
                      required: 'Le nom est requis',
                      minLength: {
                        value: 2,
                        message: 'Le nom doit contenir au moins 2 caractères'
                      }
                    })}
                    type="text"
                    className={`input-field ${profileErrors.nom ? 'border-red-500' : ''}`}
                    placeholder="Votre nom"
                  />
                  {profileErrors.nom && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.nom.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Adresse email *
                  </label>
                  <input
                    {...registerProfile('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Adresse email invalide'
                      }
                    })}
                    type="email"
                    className={`input-field ${profileErrors.email ? 'border-red-500' : ''}`}
                    placeholder="votre.email@exemple.com"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Téléphone
                  </label>
                  <input
                    {...registerProfile('telephone')}
                    type="tel"
                    className="input-field"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                {/* Organisation */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    Organisation
                  </label>
                  <input
                    {...registerProfile('organisation')}
                    type="text"
                    className="input-field"
                    placeholder="Nom de votre organisation"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  {profileIsDirty && (
                    <span className="text-sm text-amber-600">
                      Modifications non sauvegardées
                    </span>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={profileSubmitting || !profileIsDirty}
                  className="btn-primary flex items-center gap-2"
                >
                  {profileSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-600">
                  Assurez-vous d'utiliser un mot de passe fort et unique
                </p>
              </div>

              <div className="space-y-6">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel *
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword('currentPassword', {
                        required: 'Le mot de passe actuel est requis'
                      })}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`input-field pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                      placeholder="Votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      {...registerPassword('newPassword', {
                        required: 'Le nouveau mot de passe est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
                        }
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input-field pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                      placeholder="Votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirmation nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    {...registerPassword('confirmNewPassword', {
                      required: 'La confirmation du mot de passe est requise',
                      validate: value => value === watchNewPassword || 'Les mots de passe ne correspondent pas'
                    })}
                    type="password"
                    className={`input-field ${passwordErrors.confirmNewPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirmer votre nouveau mot de passe"
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmNewPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Conseils de sécurité */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Conseils pour un mot de passe sécurisé :
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Mélange de lettres majuscules et minuscules</li>
                  <li>• Au moins un chiffre</li>
                  <li>• Caractères spéciaux recommandés</li>
                  <li>• Évitez les mots du dictionnaire</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {passwordSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Informations de compte */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Informations de compte
          </h3>
        </div>
        
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Rôle</dt>
            <dd className="text-sm text-gray-900">
              {user?.role === 'administrateur' ? 'Administrateur' : 'Consultant'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
            <dd className="text-sm text-gray-900">
              {user?.derniere_connexion ? 
                new Date(user.derniere_connexion).toLocaleString('fr-FR') : 
                'Jamais'
              }
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Méthode de connexion</dt>
            <dd className="text-sm text-gray-900">
              {user?.provider === 'google' ? 'Google' :
               user?.provider === 'microsoft' ? 'Microsoft' :
               'Email/Mot de passe'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Statut du compte</dt>
            <dd>
              <span className={`badge ${user?.actif ? 'badge-success' : 'badge-error'}`}>
                {user?.actif ? 'Actif' : 'Inactif'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfilePage;
