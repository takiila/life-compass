import type { HealthImportResult } from './health';

export function importHealthData(since?: Date): Promise<HealthImportResult>;
