import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      email: data.email,
      password: data.password,
      nom: data.nom,
      prenom: data.prenom,
      organisation: data.organisation,
      telephone: data.telephone
    });
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez la communauté des consultants MSE
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  {...register('prenom', {
                    required: 'Le prénom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le prénom doit contenir au moins 2 caractères'
                    }
                  })}
                  type="text"
                  autoComplete="given-name"
                  className={`mt-1 input-field ${errors.prenom ? 'border-red-500' : ''}`}
                  placeholder="Prénom"
                />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  {...register('nom', {
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                  type="text"
                  autoComplete="family-name"
                  className={`mt-1 input-field ${errors.nom ? 'border-red-500' : ''}`}
                  placeholder="Nom"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`mt-1 input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="votre.email@exemple.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Organisation */}
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-gray-700">
                Organisation (optionnel)
              </label>
              <input
                {...register('organisation')}
                type="text"
                autoComplete="organization"
                className="mt-1 input-field"
                placeholder="Nom de votre organisation"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Téléphone (optionnel)
              </label>
              <input
                {...register('telephone')}
                type="tel"
                autoComplete="tel"
                className="mt-1 input-field"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', {
                    required: 'La confirmation du mot de passe est requise',
                    validate: value => value === watchPassword || 'Les mots de passe ne correspondent pas'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirmer votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-center">
            <input
              {...register('acceptTerms', {
                required: 'Vous devez accepter les conditions d\'utilisation'
              })}
              id="accept-terms"
              name="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
              J'accepte les{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                politique de confidentialité
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          {/* Bouton d'inscription */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>

          {/* Lien vers la connexion */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>

        {/* Informations supplémentaires */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              En créant un compte, vous rejoignez la communauté des consultants MSE
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Données sécurisées et conformes RGPD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
