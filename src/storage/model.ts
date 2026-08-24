import { appSchema, Database, Model, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'app_state',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'payload', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

export class AppStateRecord extends Model {
  static table = 'app_state';
}

export type LifeDatabase = Database;

export const modelClasses = [AppStateRecord];
