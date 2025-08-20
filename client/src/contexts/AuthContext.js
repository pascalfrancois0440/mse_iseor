import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de l'URL de base pour axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5004';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('mse_token'));

  // Configuration axios avec intercepteurs
  useEffect(() => {
    // Intercepteur pour ajouter le token aux requêtes
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs d'authentification
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expirée, veuillez vous reconnecter');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Erreur vérification auth:', error);
          localStorage.removeItem('mse_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    console.log('🔍 FRONTEND LOGIN - Tentative connexion:', email);
    console.log('🔍 FRONTEND LOGIN - URL API:', axios.defaults.baseURL);
    
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('🔍 FRONTEND LOGIN - Réponse reçue:', response.data);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('mse_token', newToken);
      localStorage.setItem('mse_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      toast.success(`Bienvenue ${userData.prenom} !`);
      return { success: true };
    } catch (error) {
      console.log('🔍 FRONTEND LOGIN - Erreur:', error);
      console.log('🔍 FRONTEND LOGIN - Status:', error.response?.status);
      console.log('🔍 FRONTEND LOGIN - Data:', error.response?.data);
      
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('mse_token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Compte créé avec succès !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la création du compte';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('mse_token');
    localStorage.removeItem('mse_user');
    setToken(null);
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profil mis à jour avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Email de réinitialisation envoyé');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      toast.success('Mot de passe réinitialisé avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'administrateur',
    isConsultant: user?.role === 'consultant' || user?.role === 'administrateur'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
