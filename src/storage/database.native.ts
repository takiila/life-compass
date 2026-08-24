import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { modelClasses, schema } from './model';

let database: Database | undefined;

export function getDatabase() {
  if (!database) {
    const adapter = new SQLiteAdapter({
      schema,
      dbName: 'life_compass',
      jsi: true,
      onSetUpError: (error) => console.error('Life Compass storage setup failed', error),
    });
    database = new Database({ adapter, modelClasses });
  }
  return database;
}
