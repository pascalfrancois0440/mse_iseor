import React from 'react';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';

const OfflineIndicator = () => {
  const { isOnline, hasPendingData, pendingData } = useOffline();

  if (isOnline && !hasPendingData) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center justify-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Mode hors ligne - Vos données seront synchronisées à la reconnexion
            </span>
          </>
        ) : hasPendingData ? (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">
              {pendingData.length} élément(s) en attente de synchronisation
            </span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Connexion rétablie
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
