import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingData, setPendingData] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie');
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connexion perdue - Mode hors ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Charger les données en attente depuis IndexedDB au démarrage
    loadPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarder des données en mode hors ligne
  const saveOfflineData = async (type, data) => {
    const offlineItem = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      // Sauvegarder dans IndexedDB
      await saveToIndexedDB(offlineItem);
      
      // Mettre à jour l'état local
      setPendingData(prev => [...prev, offlineItem]);
      
      toast.success('Données sauvegardées en mode hors ligne');
      return offlineItem.id;
    } catch (error) {
      console.error('Erreur sauvegarde hors ligne:', error);
      toast.error('Erreur lors de la sauvegarde hors ligne');
      return null;
    }
  };

  // Charger les données en attente depuis IndexedDB
  const loadPendingData = async () => {
    try {
      const data = await getFromIndexedDB();
      setPendingData(data.filter(item => !item.synced));
    } catch (error) {
      console.error('Erreur chargement données hors ligne:', error);
    }
  };

  // Synchroniser les données en attente
  const syncPendingData = async () => {
    if (pendingData.length === 0) return;

    toast.loading('Synchronisation des données...', { id: 'sync' });

    try {
      for (const item of pendingData) {
        if (!item.synced) {
          await syncSingleItem(item);
        }
      }
      
      // Marquer toutes les données comme synchronisées
      await markAllAsSynced();
      setPendingData([]);
      
      toast.success('Synchronisation terminée', { id: 'sync' });
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      toast.error('Erreur lors de la synchronisation', { id: 'sync' });
    }
  };

  // Synchroniser un élément individuel
  const syncSingleItem = async (item) => {
    try {
      // Logique de synchronisation selon le type
      switch (item.type) {
        case 'entretien':
          // Synchroniser entretien
          break;
        case 'dysfonctionnement':
          // Synchroniser dysfonctionnement
          break;
        default:
          console.warn('Type de données non supporté:', item.type);
      }
    } catch (error) {
      console.error('Erreur sync item:', error);
      throw error;
    }
  };

  // Fonctions IndexedDB
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MSEOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'id' });
        }
      };
    });
  };

  const saveToIndexedDB = async (data) => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getFromIndexedDB = async () => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  };

  const markAllAsSynced = async () => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    for (const item of pendingData) {
      item.synced = true;
      store.put(item);
    }
  };

  const clearOfflineData = async () => {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        setPendingData([]);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  const value = {
    isOnline,
    pendingData,
    saveOfflineData,
    syncPendingData,
    clearOfflineData,
    hasPendingData: pendingData.length > 0
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
