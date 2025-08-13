import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  Plus,
  BarChart3,
  FileText,
  Wifi,
  WifiOff,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { hasPendingData, pendingData, isOnline } = useOffline();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Nouvel entretien',
      href: '/entretiens/nouveau',
      icon: Plus,
      current: location.pathname === '/entretiens/nouveau'
    },
    {
      name: 'Référentiel ISEOR',
      href: '/referentiel',
      icon: BookOpen,
      current: location.pathname === '/referentiel'
    },
    // Lien d'administration (visible seulement pour les administrateurs)
    ...(user?.role === 'administrateur' ? [{
      name: 'Administration',
      href: '/admin',
      icon: Shield,
      current: location.pathname === '/admin'
    }] : [])
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Sidebar pour desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MSE Diagnostic</h1>
                <p className="text-xs text-gray-500">Méthodologie ISEOR</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`sidebar-item ${item.current ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Statut hors ligne */}
              {(!isOnline || hasPendingData) && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Statut
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <li>
                      <div className="flex items-center px-2 py-2 text-sm text-gray-700">
                        {isOnline ? (
                          <Wifi className="h-4 w-4 text-green-500 mr-3" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500 mr-3" />
                        )}
                        {isOnline ? 'En ligne' : 'Hors ligne'}
                      </div>
                    </li>
                    {hasPendingData && (
                      <li>
                        <div className="flex items-center px-2 py-2 text-sm text-amber-700">
                          <FileText className="h-4 w-4 text-amber-500 mr-3" />
                          {pendingData.length} en attente
                        </div>
                      </li>
                    )}
                  </ul>
                </li>
              )}

              {/* Profil utilisateur */}
              <li className="mt-auto">
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Mon compte
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <li>
                    <Link
                      to="/profile"
                      className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Settings className="h-5 w-5 shrink-0" />
                      Profil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="sidebar-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          {/* Informations utilisateur */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      <div className={`lg:hidden ${isOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
            {/* Logo mobile */}
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">MSE Diagnostic</h1>
                  <p className="text-xs text-gray-500">Méthodologie ISEOR</p>
                </div>
              </div>
            </div>

            {/* Navigation mobile */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`sidebar-item ${item.current ? 'active' : ''}`}
                          onClick={onClose}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Statut mobile */}
                {(!isOnline || hasPendingData) && (
                  <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                      Statut
                    </div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      <li>
                        <div className="flex items-center px-2 py-2 text-sm text-gray-700">
                          {isOnline ? (
                            <Wifi className="h-4 w-4 text-green-500 mr-3" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-500 mr-3" />
                          )}
                          {isOnline ? 'En ligne' : 'Hors ligne'}
                        </div>
                      </li>
                      {hasPendingData && (
                        <li>
                          <div className="flex items-center px-2 py-2 text-sm text-amber-700">
                            <FileText className="h-4 w-4 text-amber-500 mr-3" />
                            {pendingData.length} en attente
                          </div>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* Profil mobile */}
                <li className="mt-auto">
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Mon compte
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <li>
                      <Link
                        to="/profile"
                        className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <Settings className="h-5 w-5 shrink-0" />
                        Profil
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="sidebar-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            {/* Informations utilisateur mobile */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
