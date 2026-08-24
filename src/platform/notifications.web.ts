import { NotificationPreference } from '@/src/domain/types';

export async function scheduleDailyReminder(_preference: NotificationPreference) {
  return { scheduled: false, message: 'PWAはバックグラウンド通知を送らず、次回起動時に時刻を確認します。' };
}
