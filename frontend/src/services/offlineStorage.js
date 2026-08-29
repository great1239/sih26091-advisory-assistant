/**
 * IndexedDB Offline Storage & Auto-Sync Engine (offlineStorage.js)
 * Implements persistent browser storage for zero-bandwidth rural network conditions.
 */

const DB_NAME = 'MoSJE_Offline_Advisory_DB';
const DB_VERSION = 1;

class OfflineStorageEngine {
  constructor() {
    this.db = null;
    this._initDB();
    this._setupNetworkListeners();
  }

  _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store 1: Form drafts
        if (!db.objectStoreNames.contains('onboarding_drafts')) {
          db.createObjectStore('onboarding_drafts', { keyPath: 'id' });
        }
        // Store 2: Cached assessments
        if (!db.objectStoreNames.contains('assessments')) {
          db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
        }
        // Store 3: Sync queue for offline submissions
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'queue_id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[IndexedDB] MoSJE Offline DB initialized successfully.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Initialization failed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async _getDB() {
    if (this.db) return this.db;
    return await this._initDB();
  }

  async saveDraft(formData) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('onboarding_drafts', 'readwrite');
      const store = tx.objectStore('onboarding_drafts');
      store.put({ id: 'current_draft', data: formData, timestamp: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async getDraft() {
    const db = await this._getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('onboarding_drafts', 'readonly');
      const store = tx.objectStore('onboarding_drafts');
      const req = store.get('current_draft');
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }

  async cacheAssessment(assessment) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assessments', 'readwrite');
      const store = tx.objectStore('assessments');
      store.put({
        beneficiary_name: assessment.beneficiary_name,
        data: assessment,
        cached_at: new Date().toISOString()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async queueOfflineSubmission(payload) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      store.add({ payload, queued_at: new Date().toISOString() });
      tx.oncomplete = () => {
        console.log('[IndexedDB] Assessment queued for auto-sync on reconnect.');
        resolve(true);
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async processSyncQueue() {
    if (!navigator.onLine) return;
    const db = await this._getDB();
    
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();

    req.onsuccess = async () => {
      const items = req.result || [];
      if (items.length === 0) return;

      console.log(`[Auto-Sync] Syncing ${items.length} queued offline assessments...`);
      for (const item of items) {
        try {
          const response = await fetch('/api/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          if (response.ok) {
            const delTx = db.transaction('sync_queue', 'readwrite');
            delTx.objectStore('sync_queue').delete(item.queue_id);
            console.log(`[Auto-Sync] Synced item ${item.queue_id}`);
          }
        } catch (err) {
          console.warn('[Auto-Sync] Item sync failed, retaining in queue:', err);
        }
      }
    };
  }

  _setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[Network] Internet connection restored. Triggering IndexedDB sync...');
      this.processSyncQueue();
    });
  }
}

export const offlineStorage = new OfflineStorageEngine();
