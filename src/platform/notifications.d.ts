import type { NotificationPreference } from '@/src/domain/types';

export function scheduleDailyReminder(preference: NotificationPreference): Promise<{ scheduled: boolean; message: string }>;
