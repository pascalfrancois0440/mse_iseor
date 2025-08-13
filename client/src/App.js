import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EntretienPage from './pages/EntretienPage';
import EntretienDetailPage from './pages/EntretienDetailPage';
import ReferentielPage from './pages/ReferentielPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import OfflineIndicator from './components/UI/OfflineIndicator';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Route publique (redirige si connecté)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <Router>
          <div className="App">
            <OfflineIndicator />
            <Routes>
              {/* Routes publiques */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />

              
              {/* Routes protégées */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entretiens/nouveau" 
                element={
                  <ProtectedRoute>
                    <EntretienPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entretiens/:id" 
                element={
                  <ProtectedRoute>
                    <EntretienDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entretiens/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EntretienPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/referentiel" 
                element={
                  <ProtectedRoute>
                    <ReferentielPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Page 404 */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page non trouvée</p>
                      <a href="/dashboard" className="btn-primary">
                        Retour au tableau de bord
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </Router>
      </OfflineProvider>
    </AuthProvider>
  );
}

export default App;
