import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { modelClasses, schema } from './model';

let database: Database | undefined;

export function getDatabase() {
  if (!database) {
    const adapter = new LokiJSAdapter({
      schema,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      dbName: 'life-compass',
      onSetUpError: (error) => console.error('Life Compass storage setup failed', error),
      onQuotaExceededError: (error) => console.error('Life Compass storage quota exceeded', error),
    });
    database = new Database({ adapter, modelClasses });
  }
  return database;
}
