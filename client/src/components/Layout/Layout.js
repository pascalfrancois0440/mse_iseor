import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (true) {
      case path === '/dashboard':
        return 'Tableau de bord';
      case path.includes('/entretiens/nouveau'):
        return 'Nouvel entretien';
      case path.includes('/entretiens') && path.includes('/edit'):
        return 'Modifier l\'entretien';
      case path.includes('/entretiens'):
        return 'Détail de l\'entretien';
      case path === '/referentiel':
        return 'Référentiel ISEOR';
      case path === '/profile':
        return 'Mon profil';
      default:
        return 'MSE Diagnostic';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
