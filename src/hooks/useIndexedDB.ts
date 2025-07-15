
import { useState, useEffect, useCallback } from 'react';

interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: Array<{
    name: string;
    keyPath?: string;
    autoIncrement?: boolean;
    indexes?: Array<{
      name: string;
      keyPath: string;
      unique?: boolean;
    }>;
  }>;
}

const DB_CONFIG: IndexedDBConfig = {
  dbName: 'DriveManagerDB',
  version: 2,
  stores: [
    {
      name: 'trips',
      keyPath: 'id',
      autoIncrement: false,
    },
    {
      name: 'refuels',
      keyPath: 'id',
      autoIncrement: false,
    },
    {
      name: 'transactions',
      keyPath: 'id',
      autoIncrement: false,
    },
    {
      name: 'settings',
      keyPath: 'key',
      autoIncrement: false,
    },
    {
      name: 'users',
      keyPath: 'id',
      autoIncrement: false,
    },
  ],
};

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase>;
  private initializationError: Error | null = null;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log('Inicializando IndexedDB...');
      
      const request = indexedDB.open(DB_CONFIG.dbName, DB_CONFIG.version);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        this.initializationError = request.error || new Error('Erro desconhecido do IndexedDB');
        reject(this.initializationError);
      };
      
      request.onsuccess = () => {
        console.log('IndexedDB inicializado com sucesso');
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        console.log('Atualizando estrutura do IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;
        
        DB_CONFIG.stores.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            console.log(`Criando store: ${storeConfig.name}`);
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement,
            });

            if (storeConfig.indexes) {
              storeConfig.indexes.forEach(index => {
                store.createIndex(index.name, index.keyPath, {
                  unique: index.unique,
                });
              });
            }
          }
        });
        console.log('Estrutura do IndexedDB atualizada');
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // Novo método para buscar dados por userId
  async getAllByUserId<T>(storeName: string, userId: string): Promise<T[]> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        // Filtrar por userId
        const filteredResults = results.filter((item: any) => item.userId === userId);
        resolve(filteredResults);
      };
    });
  }

  async set<T>(storeName: string, data: T): Promise<void> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (this.initializationError) {
      throw this.initializationError;
    }
    
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const dbManager = new IndexedDBManager();

// Sistema de eventos para sincronizar múltiplas instâncias do hook
const eventEmitter = new EventTarget();

export function useIndexedDB<T>(storeName: string, key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`Carregando dados para ${storeName}...`);
        setLoading(true);
        setError(null);
        
        // Timeout de 10 segundos para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar dados')), 10000);
        });
        
        const loadPromise = async () => {
          // Obter o usuário atual
          const currentUserId = localStorage.getItem('currentUserId');
          
          if (storeName === 'settings') {
            const result = await dbManager.get<{ key: string; value: T }>(storeName, key);
            return result?.value || initialValue;
          } else if (currentUserId && storeName !== 'users') {
            // Para trips, refuels e transactions, filtrar por usuário
            const result = await dbManager.getAllByUserId<T>(storeName, currentUserId);
            return result as T || initialValue;
          } else {
            const result = await dbManager.getAll<T>(storeName);
            return result as T || initialValue;
          }
        };
        
        const result = await Promise.race([loadPromise(), timeoutPromise]);
        setData(result as T);
        console.log(`Dados carregados para ${storeName}:`, result);
        
      } catch (err) {
        console.error(`Erro ao carregar dados do ${storeName}:`, err);
        setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setData(initialValue);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Escutar eventos de atualização de dados
    const handleDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.storeName === storeName) {
        setData(customEvent.detail.data);
      }
    };

    // Escutar evento de importação de dados
    const handleDataImported = (event: Event) => {
      console.log('Evento de importação detectado, recarregando dados...');
      loadData();
    };

    eventEmitter.addEventListener('dataUpdate', handleDataUpdate);
    window.addEventListener('dataImported', handleDataImported);
    
    return () => {
      eventEmitter.removeEventListener('dataUpdate', handleDataUpdate);
      window.removeEventListener('dataImported', handleDataImported);
    };
  }, [storeName, key]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      setError(null);
      const newValue = value instanceof Function ? value(data) : value;
      
      // Atualizar o estado imediatamente para refletir na UI
      setData(newValue);
      
      if (storeName === 'settings') {
        await dbManager.set(storeName, { key, value: newValue });
      } else {
        // Para arrays, salvamos cada item individualmente
        if (Array.isArray(newValue)) {
          // Adicionar userId a cada item se não existir
          const currentUserId = localStorage.getItem('currentUserId');
          if (currentUserId && storeName !== 'users') {
            const itemsWithUserId = newValue.map((item: any) => ({
              ...item,
              userId: item.userId || currentUserId
            }));
            
            // Limpar dados antigos do usuário atual
            const allItems = await dbManager.getAll<any>(storeName);
            const otherUsersItems = allItems.filter((item: any) => item.userId !== currentUserId);
            
            // Limpar store e recriar com todos os itens
            await dbManager.clear(storeName);
            
            // Salvar itens de outros usuários
            for (const item of otherUsersItems) {
              await dbManager.set(storeName, item);
            }
            
            // Salvar itens do usuário atual
            for (const item of itemsWithUserId) {
              await dbManager.set(storeName, item);
            }
          } else {
            await dbManager.clear(storeName);
            for (const item of newValue) {
              await dbManager.set(storeName, item);
            }
          }
        } else {
          await dbManager.set(storeName, newValue);
        }
      }
      
      // Notificar outras instâncias do hook sobre a atualização
      eventEmitter.dispatchEvent(new CustomEvent('dataUpdate', {
        detail: { storeName, data: newValue }
      }));
      
      console.log(`Dados salvos para ${storeName}:`, newValue);
    } catch (err) {
      console.error(`Erro ao salvar dados no ${storeName}:`, err);
      setError(`Erro ao salvar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      // Em caso de erro, reverter o estado
      setData(data);
    }
  }, [storeName, key, data]);

  return [data, setValue, { loading, error }] as const;
}

export { dbManager };
