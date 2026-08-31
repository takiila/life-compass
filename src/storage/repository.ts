import { Q } from '@nozbe/watermelondb';

import { DEFAULT_STATE } from '@/src/domain/defaults';
import { normalizeStateV3 } from '@/src/domain/backup';
import { AppState } from '@/src/domain/types';

import { getDatabase } from './database';
import { migrateLegacyState } from './legacy';
import { AppStateRecord } from './model';

const ROOT_KEY = 'root';

function normalizeState(value: unknown): AppState {
  return normalizeStateV3(value);
}

export async function loadState(): Promise<AppState> {
  const database = getDatabase();
  const records = await database.get<AppStateRecord>('app_state').query(Q.where('key', ROOT_KEY)).fetch();
  if (records[0]) {
    try { return normalizeState(JSON.parse(String((records[0]._raw as Record<string, unknown>).payload))); } catch { /* use recovery below */ }
  }
  const migrated = await migrateLegacyState();
  const initial = migrated ?? DEFAULT_STATE;
  await saveState(initial);
  return initial;
}

export async function saveState(state: AppState): Promise<void> {
  const database = getDatabase();
  const collection = database.get<AppStateRecord>('app_state');
  const records = await collection.query(Q.where('key', ROOT_KEY)).fetch();
  const payload = JSON.stringify(state);
  await database.write(async () => {
    if (records[0]) {
      await records[0].update((record: AppStateRecord) => {
        (record._raw as Record<string, unknown>).payload = payload;
        (record._raw as Record<string, unknown>).updated_at = Date.now();
      });
    } else {
      await collection.create((record: AppStateRecord) => {
        (record._raw as Record<string, unknown>).key = ROOT_KEY;
        (record._raw as Record<string, unknown>).payload = payload;
        (record._raw as Record<string, unknown>).updated_at = Date.now();
      });
    }
  });
}
