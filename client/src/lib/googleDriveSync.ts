import { db, getAllNotes, clearAllNotes } from '@/lib/indexedDB';
import { Note } from '@shared/schema';

// Google Drive API constants - use import.meta.env for Vite
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'notes_data.json';

// Track sync status
let isSyncing = false;
let isInitialized = false;
let syncCallbacks: Array<(status: SyncStatus) => void> = [];

export type SyncStatus = {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
};

let currentSyncStatus: SyncStatus = { status: 'idle' };

export function addSyncStatusListener(callback: (status: SyncStatus) => void) {
  syncCallbacks.push(callback);
  // Immediately call with current status
  callback(currentSyncStatus);
  return () => {
    syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
  };
}

function updateSyncStatus(status: SyncStatus) {
  currentSyncStatus = {
    ...status,
    timestamp: new Date()
  };
  syncCallbacks.forEach(callback => callback(currentSyncStatus));
}

// Load the Google API client library
function loadGoogleApiClient() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window.gapi === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client
            .init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES
            })
            .then(() => {
              isInitialized = true;
              resolve();
            })
            .catch(reject);
        });
      };
      script.onerror = () => reject(new Error('Failed to load Google API client'));
      document.body.appendChild(script);
    } else if (!isInitialized) {
      window.gapi.load('client:auth2', () => {
        window.gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
          })
          .then(() => {
            isInitialized = true;
            resolve();
          })
          .catch(reject);
      });
    } else {
      resolve();
    }
  });
}

// Check if user is signed in
export async function isSignedIn() {
  // If we don't have credentials, don't attempt to authenticate
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided');
    return false;
  }
  
  if (!isInitialized) {
    try {
      await loadGoogleApiClient();
    } catch (error) {
      console.error('Failed to load Google API client:', error);
      return false;
    }
  }
  
  try {
    return window.gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    console.error('Failed to check sign-in status:', error);
    return false;
  }
}

// Sign in the user
export async function signIn() {
  // Don't attempt to sign in if credentials are missing
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided, cannot sign in');
    return false;
  }
  
  try {
    if (!isInitialized) {
      await loadGoogleApiClient();
    }
    return window.gapi.auth2.getAuthInstance().signIn();
  } catch (error) {
    console.error('Failed to sign in:', error);
    return false;
  }
}

// Sign out the user
export async function signOut() {
  // Don't attempt to sign out if credentials are missing
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided, cannot sign out');
    return false;
  }
  
  try {
    if (!isInitialized) {
      await loadGoogleApiClient();
    }
    return window.gapi.auth2.getAuthInstance().signOut();
  } catch (error) {
    console.error('Failed to sign out:', error);
    return false;
  }
}

// Find the app data file
async function findAppDataFile() {
  const response = await window.gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name)',
    q: `name='${FILE_NAME}'`
  });

  const files = response.result.files;
  return files && files.length > 0 ? files[0] : null;
}

// Create a new app data file
async function createAppDataFile(data: Note[]) {
  const metadata = {
    name: FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'application/json'
  };

  const fileContent = JSON.stringify(data);
  const base64Data = btoa(unescape(encodeURIComponent(fileContent)));

  const requestBody = {
    resource: metadata,
    media: {
      mimeType: 'application/json',
      body: fileContent
    },
    uploadType: 'multipart',
    fields: 'id'
  };

  const response = await window.gapi.client.request({
    path: '/upload/drive/v3/files',
    method: 'POST',
    params: {
      uploadType: 'multipart'
    },
    headers: {
      'Content-Type': 'multipart/related; boundary=boundary',
    },
    body: [
      '--boundary',
      'Content-Type: application/json',
      '',
      JSON.stringify(metadata),
      '--boundary',
      'Content-Type: application/json',
      '',
      fileContent,
      '--boundary--'
    ].join('\r\n')
  });

  return response.result.id;
}

// Update an existing app data file
async function updateAppDataFile(fileId: string, data: Note[]) {
  const fileContent = JSON.stringify(data);

  const requestBody = {
    resource: {
      mimeType: 'application/json'
    },
    media: {
      mimeType: 'application/json',
      body: fileContent
    },
    uploadType: 'multipart',
    fields: 'id'
  };

  const response = await window.gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    params: {
      uploadType: 'multipart'
    },
    headers: {
      'Content-Type': 'multipart/related; boundary=boundary',
    },
    body: [
      '--boundary',
      'Content-Type: application/json',
      '',
      JSON.stringify({
        mimeType: 'application/json'
      }),
      '--boundary',
      'Content-Type: application/json',
      '',
      fileContent,
      '--boundary--'
    ].join('\r\n')
  });

  return response.result.id;
}

// Download file content
async function downloadAppDataFile(fileId: string) {
  const response = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  });

  return response.result;
}

// Encrypt data before uploading
function encryptData(data: Note[]): Note[] {
  // In a real app, you would encrypt the data here
  // For this implementation, we'll just return the original data
  return data;
}

// Decrypt data after downloading
function decryptData(data: Note[]): Note[] {
  // In a real app, you would decrypt the data here
  // For this implementation, we'll just return the original data
  return data;
}

// Sync notes to Drive
export async function syncToDrive(): Promise<boolean> {
  // Don't attempt to sync if credentials are missing
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided, cannot sync to Drive');
    return false;
  }
  
  if (isSyncing) return false;
  
  isSyncing = true;
  updateSyncStatus({ status: 'syncing', message: 'Syncing with Google Drive...' });
  
  try {
    if (!await isSignedIn()) {
      const signedIn = await signIn();
      if (!signedIn) {
        updateSyncStatus({ status: 'error', message: 'Failed to sign in to Google' });
        return false;
      }
    }
    
    const notes = await getAllNotes();
    const encryptedNotes = encryptData(notes);
    
    const file = await findAppDataFile();
    
    if (file) {
      await updateAppDataFile(file.id, encryptedNotes);
    } else {
      await createAppDataFile(encryptedNotes);
    }
    
    updateSyncStatus({ status: 'success', message: 'Synced to Google Drive' });
    setTimeout(() => {
      if (currentSyncStatus.status === 'success') {
        updateSyncStatus({ status: 'idle' });
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error('Failed to sync to Drive:', error);
    updateSyncStatus({ status: 'error', message: 'Failed to sync with Google Drive' });
    return false;
  } finally {
    isSyncing = false;
  }
}

// Restore notes from Drive
export async function restoreFromDrive(): Promise<boolean> {
  // Don't attempt to restore if credentials are missing
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided, cannot restore from Drive');
    updateSyncStatus({ status: 'error', message: 'Google API credentials not provided' });
    return false;
  }
  
  if (isSyncing) return false;
  
  isSyncing = true;
  updateSyncStatus({ status: 'syncing', message: 'Syncing from Google Drive...' });
  
  try {
    if (!await isSignedIn()) {
      const signedIn = await signIn();
      if (!signedIn) {
        updateSyncStatus({ status: 'error', message: 'Failed to sign in to Google' });
        return false;
      }
    }
    
    const file = await findAppDataFile();
    
    if (file) {
      const data = await downloadAppDataFile(file.id);
      const notes: Note[] = Array.isArray(data) ? data : [];
      const decryptedNotes = decryptData(notes);
      
      // Replace all local notes with Drive notes
      await clearAllNotes();
      for (const note of decryptedNotes) {
        await db.notes.put(note);
      }
      
      updateSyncStatus({ status: 'success', message: 'Restored from Google Drive' });
      setTimeout(() => {
        if (currentSyncStatus.status === 'success') {
          updateSyncStatus({ status: 'idle' });
        }
      }, 3000);
      
      return true;
    } else {
      updateSyncStatus({ status: 'idle', message: 'No backup found on Google Drive' });
      return false;
    }
  } catch (error) {
    console.error('Failed to restore from Drive:', error);
    updateSyncStatus({ status: 'error', message: 'Failed to sync with Google Drive' });
    return false;
  } finally {
    isSyncing = false;
  }
}

// Initialize auto-sync
export function initAutoSync(intervalMinutes = 5) {
  // Don't attempt to initialize auto-sync if credentials are missing
  if (!API_KEY || !CLIENT_ID) {
    console.log('Google API credentials not provided, auto-sync disabled');
    return () => {}; // Return empty cleanup function
  }
  
  let syncInterval: number | undefined;
  
  const startSync = () => {
    syncInterval = window.setInterval(() => {
      syncToDrive().catch(console.error);
    }, intervalMinutes * 60 * 1000);
  };
  
  const stopSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };
  
  // Check if user is signed in and start auto-sync
  isSignedIn().then((signedIn: boolean) => {
    if (signedIn) {
      startSync();
    }
  });
  
  // Listen for sign in/out events
  if (isInitialized) {
    try {
      window.gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
        if (signedIn) {
          startSync();
        } else {
          stopSync();
        }
      });
    } catch (error) {
      console.error('Failed to listen for auth changes:', error);
    }
  }
  
  // Clean up when needed
  return stopSync;
}

// Define window.gapi type
declare global {
  interface Window {
    gapi: any;
  }
}
