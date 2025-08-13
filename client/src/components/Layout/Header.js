import React from 'react';
import { Menu, Bell, Search, Download } from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';

const Header = ({ title, onMenuClick, user }) => {
  const { isOnline, hasPendingData, syncPendingData } = useOffline();

  const handleSync = () => {
    if (isOnline && hasPendingData) {
      syncPendingData();
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Menu button pour mobile */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Séparateur */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Titre de la page */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Barre de recherche (optionnelle) */}
        <div className="flex flex-1 justify-end">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Bouton de synchronisation */}
            {hasPendingData && isOnline && (
              <button
                type="button"
                onClick={handleSync}
                className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <Download className="h-4 w-4" />
                Synchroniser
              </button>
            )}

            {/* Indicateur de statut */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-500">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Voir les notifications</span>
              <Bell className="h-6 w-6" />
              {hasPendingData && (
                <span className="absolute -mt-1 -ml-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Séparateur */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

            {/* Menu profil */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900">
                {user?.prenom} {user?.nom}
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
