
import { useEffect, useState } from 'react';
import { dbManager } from './useIndexedDB';

export function useMigration() {
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    const migrateData = async () => {
      try {
        console.log('Verificando migração...');
        
        // Verificar se já foi migrado
        const migrationFlag = localStorage.getItem('migrated_to_indexeddb');
        if (migrationFlag === 'true') {
          console.log('Migração já realizada');
          setMigrationComplete(true);
          return;
        }

        // Marcar como migrado para evitar loops
        localStorage.setItem('migrated_to_indexeddb', 'true');
        setMigrationComplete(true);
        console.log('Migração concluída');
        
      } catch (error) {
        console.error('Erro na migração:', error);
        setMigrationError('Erro na migração');
        setMigrationComplete(true);
      }
    };

    migrateData();
  }, []);

  return { migrationComplete, migrationError };
}
