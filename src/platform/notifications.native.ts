import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationPreference } from '@/src/domain/types';

let currentIdentifier: string | undefined;

export async function scheduleDailyReminder(preference: NotificationPreference) {
  if (currentIdentifier) await Notifications.cancelScheduledNotificationAsync(currentIdentifier);
  if (!preference.enabled) return { scheduled: false, message: '通知を停止しました。' };
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { scheduled: false, message: '通知の許可がありません。設定から変更できます。' };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-compass', { name: 'Daily Compass', importance: Notifications.AndroidImportance.DEFAULT });
  }
  currentIdentifier = await Notifications.scheduleNotificationAsync({
    content: { title: 'Life Compass', body: preference.mode === 'study' ? '教材を開くところから始めませんか。' : '今の状態に合う一歩を選びませんか。' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: preference.hour, minute: preference.minute, channelId: 'daily-compass' },
  });
  return { scheduled: true, message: '1日1回の穏やかな通知を設定しました。' };
}
