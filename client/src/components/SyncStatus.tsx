import { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { addSyncStatusListener, type SyncStatus } from '@/lib/googleDriveSync';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = addSyncStatusListener((status) => {
      setSyncStatus(status);
      
      if (status.status !== 'idle') {
        setVisible(true);
      }
      
      if (status.status === 'success' || status.status === 'error') {
        // Hide after some time
        const timer = setTimeout(() => {
          setVisible(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    });
    
    return unsubscribe;
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-background border border-border shadow-md rounded-md px-4 py-2 flex items-center z-50 animate-in slide-in-from-bottom-5">
      {syncStatus.status === 'syncing' && (
        <RefreshCw className="text-primary animate-spin mr-2 h-5 w-5" />
      )}
      
      {syncStatus.status === 'success' && (
        <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
      )}
      
      {syncStatus.status === 'error' && (
        <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
      )}
      
      <span>{syncStatus.message || 'Syncing with Google Drive...'}</span>
    </div>
  );
}
